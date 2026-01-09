from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, CustomerProfile, ShopkeeperProfile
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    CustomerProfileSerializer, ShopkeeperProfileSerializer,
    ShopkeeperRegistrationSerializer
)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new customer or admin user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_shopkeeper(request):
    """Register a new shopkeeper"""
    serializer = ShopkeeperRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Shopkeeper registered successfully. Verification pending.'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login user and return JWT tokens"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user by blacklisting refresh token"""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class CustomerProfileView(generics.RetrieveUpdateAPIView):
    """Get and update customer profile"""
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        customer_profile, created = CustomerProfile.objects.get_or_create(
            user=self.request.user
        )
        return customer_profile

class ShopkeeperProfileView(generics.RetrieveUpdateAPIView):
    """Get and update shopkeeper profile"""
    serializer_class = ShopkeeperProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        try:
            return ShopkeeperProfile.objects.get(user=self.request.user)
        except ShopkeeperProfile.DoesNotExist:
            return Response(
                {'error': 'Shopkeeper profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ShopkeeperListView(generics.ListAPIView):
    """List all shopkeepers (Admin only)"""
    serializer_class = ShopkeeperProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'admin':
            return ShopkeeperProfile.objects.all()
        return ShopkeeperProfile.objects.none()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_shopkeeper(request, shopkeeper_id):
    """Approve shopkeeper verification (Admin only)"""
    if request.user.user_type != 'admin':
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from django.utils import timezone
        shopkeeper = ShopkeeperProfile.objects.get(id=shopkeeper_id)
        shopkeeper.verification_status = 'approved'
        shopkeeper.approved_at = timezone.now()
        shopkeeper.save()
        
        # Also update the user's is_verified status
        shopkeeper.user.is_verified = True
        shopkeeper.user.save()
        
        return Response({
            'message': 'Shopkeeper approved successfully',
            'shopkeeper': ShopkeeperProfileSerializer(shopkeeper).data
        }, status=status.HTTP_200_OK)
    except ShopkeeperProfile.DoesNotExist:
        return Response(
            {'error': 'Shopkeeper not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_shopkeeper(request, shopkeeper_id):
    """Reject shopkeeper verification (Admin only)"""
    if request.user.user_type != 'admin':
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        shopkeeper = ShopkeeperProfile.objects.get(id=shopkeeper_id)
        shopkeeper.verification_status = 'rejected'
        shopkeeper.save()
        
        return Response({
            'message': 'Shopkeeper rejected',
            'shopkeeper': ShopkeeperProfileSerializer(shopkeeper).data
        }, status=status.HTTP_200_OK)
    except ShopkeeperProfile.DoesNotExist:
        return Response(
            {'error': 'Shopkeeper not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    """Get user dashboard data based on user type"""
    user = request.user
    
    if user.user_type == 'customer':
        try:
            profile = CustomerProfile.objects.get(user=user)
            return Response({
                'user_type': 'customer',
                'profile': CustomerProfileSerializer(profile).data
            })
        except CustomerProfile.DoesNotExist:
            CustomerProfile.objects.create(user=user)
            profile = CustomerProfile.objects.get(user=user)
            return Response({
                'user_type': 'customer',
                'profile': CustomerProfileSerializer(profile).data
            })
    
    elif user.user_type == 'shopkeeper':
        try:
            profile = ShopkeeperProfile.objects.get(user=user)
            return Response({
                'user_type': 'shopkeeper',
                'profile': ShopkeeperProfileSerializer(profile).data
            })
        except ShopkeeperProfile.DoesNotExist:
            return Response(
                {'error': 'Shopkeeper profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    elif user.user_type == 'admin':
        return Response({
            'user_type': 'admin',
            'profile': UserSerializer(user).data
        })
    
    return Response(
        {'error': 'Invalid user type'}, 
        status=status.HTTP_400_BAD_REQUEST
    )