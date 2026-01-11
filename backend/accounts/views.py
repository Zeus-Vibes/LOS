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
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Handle profile picture if it's a base64 string
        data = request.data.copy()
        if 'profile_picture' in data and data['profile_picture']:
            profile_pic = data['profile_picture']
            if isinstance(profile_pic, str) and profile_pic.startswith('data:'):
                # It's a base64 image, save it
                import base64
                from django.core.files.base import ContentFile
                import uuid
                
                try:
                    format, imgstr = profile_pic.split(';base64,')
                    ext = format.split('/')[-1]
                    filename = f"{uuid.uuid4()}.{ext}"
                    data['profile_picture'] = ContentFile(base64.b64decode(imgstr), name=filename)
                except Exception as e:
                    # If base64 processing fails, remove the field
                    del data['profile_picture']
        
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

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
        # Try to find by user_id first, then by profile id
        try:
            shopkeeper = ShopkeeperProfile.objects.get(user_id=shopkeeper_id)
        except ShopkeeperProfile.DoesNotExist:
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
        # Try to find by user_id first, then by profile id
        try:
            shopkeeper = ShopkeeperProfile.objects.get(user_id=shopkeeper_id)
        except ShopkeeperProfile.DoesNotExist:
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


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notification_preferences(request):
    """Get or save notification preferences"""
    user = request.user
    
    # Get or create customer profile for preferences storage
    if user.user_type == 'customer':
        profile, _ = CustomerProfile.objects.get_or_create(user=user)
    else:
        profile = None
    
    if request.method == 'GET':
        # Return default preferences (can be stored in profile later)
        return Response({
            'email_orders': True,
            'email_promotions': False,
            'push_orders': True,
            'push_promotions': False,
        })
    
    elif request.method == 'POST':
        # Save preferences (for now just return success, can store in DB later)
        return Response({'message': 'Notification preferences saved successfully'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({'error': 'Both current and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.check_password(current_password):
        return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password changed successfully'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Delete user account (requires password confirmation)"""
    user = request.user
    password = request.data.get('password')
    
    if not password:
        return Response({'error': 'Password is required to delete account'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.check_password(password):
        return Response({'error': 'Incorrect password'}, status=status.HTTP_400_BAD_REQUEST)
    
    if user.user_type == 'admin':
        return Response({'error': 'Admin accounts cannot be deleted this way'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.delete()
    return Response({'message': 'Account deleted successfully'})