from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Avg
from math import radians, cos, sin, asin, sqrt
from .models import Category, Shop, Product, Review, Wishlist
from .serializers import (
    CategorySerializer, ShopSerializer, ProductSerializer, 
    ReviewSerializer, WishlistSerializer
)

def haversine(lon1, lat1, lon2, lat2):
    """Calculate the great circle distance in km between two points on earth"""
    lon1, lat1, lon2, lat2 = map(radians, [float(lon1), float(lat1), float(lon2), float(lat2)])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.filter(status='active')
    serializer_class = ShopSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Shop.objects.filter(status='active')
        
        # Location-based filtering
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius', 10)  # Default 10km
        
        if lat and lng:
            try:
                lat = float(lat)
                lng = float(lng)
                radius = float(radius)
                
                # Filter shops within radius
                nearby_shops = []
                for shop in queryset:
                    if shop.latitude and shop.longitude:
                        distance = haversine(lng, lat, float(shop.longitude), float(shop.latitude))
                        if distance <= radius:
                            shop.distance = distance
                            nearby_shops.append(shop.id)
                
                queryset = queryset.filter(id__in=nearby_shops)
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        shop = self.get_object()
        products = Product.objects.filter(shop=shop)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Product.objects.filter(status='available')
        category = self.request.query_params.get('category', None)
        shop = self.request.query_params.get('shop', None)
        
        if category:
            queryset = queryset.filter(category__id=category)
        if shop:
            queryset = queryset.filter(shop__id=shop)
            
        return queryset
    
    def perform_create(self, serializer):
        # Get the shop owned by the current user
        shop = Shop.objects.filter(owner=self.request.user).first()
        if not shop:
            raise serializers.ValidationError("You don't have a shop")
        serializer.save(shop=shop)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_approved=True)
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

# Shopkeeper endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_shop(request):
    """Get the current shopkeeper's shop"""
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can access this'}, status=status.HTTP_403_FORBIDDEN)
    
    shop = Shop.objects.filter(owner=request.user).first()
    if not shop:
        return Response({'error': 'No shop found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ShopSerializer(shop)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_shop(request):
    """Create a shop for the shopkeeper"""
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can create shops'}, status=status.HTTP_403_FORBIDDEN)
    
    # Check if user already has a shop
    if Shop.objects.filter(owner=request.user).exists():
        return Response({'error': 'You already have a shop'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = ShopSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_shop(request):
    """Update the shopkeeper's shop"""
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can update shops'}, status=status.HTTP_403_FORBIDDEN)
    
    shop = Shop.objects.filter(owner=request.user).first()
    if not shop:
        return Response({'error': 'No shop found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ShopSerializer(shop, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_products(request):
    """Get all products for the shopkeeper's shop"""
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can access this'}, status=status.HTTP_403_FORBIDDEN)
    
    shop = Shop.objects.filter(owner=request.user).first()
    if not shop:
        return Response({'error': 'No shop found'}, status=status.HTTP_404_NOT_FOUND)
    
    products = Product.objects.filter(shop=shop)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_product(request):
    """Add a product to the shopkeeper's shop"""
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can add products'}, status=status.HTTP_403_FORBIDDEN)
    
    shop = Shop.objects.filter(owner=request.user).first()
    if not shop:
        return Response({'error': 'No shop found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check verification status
    try:
        profile = request.user.shopkeeper_profile
        if profile.verification_status != 'approved':
            return Response({'error': 'Your shop must be approved before adding products'}, status=status.HTTP_403_FORBIDDEN)
    except:
        return Response({'error': 'Shopkeeper profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()
    data['shop'] = shop.id
    
    # Generate SKU if not provided
    if not data.get('sku'):
        import uuid
        data['sku'] = f"SKU-{uuid.uuid4().hex[:8].upper()}"
    
    serializer = ProductSerializer(data=data)
    if serializer.is_valid():
        serializer.save(shop=shop)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_product(request, product_id):
    """Update a product"""
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can update products'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = Product.objects.get(id=product_id, shop__owner=request.user)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product(request, product_id):
    """Delete a product"""
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can delete products'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = Product.objects.get(id=product_id, shop__owner=request.user)
        product.delete()
        return Response({'message': 'Product deleted'}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shopkeeper_orders(request):
    """Get orders for the shopkeeper's shop"""
    from orders.models import Order
    from orders.serializers import OrderSerializer
    
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can access this'}, status=status.HTTP_403_FORBIDDEN)
    
    shop = Shop.objects.filter(owner=request.user).first()
    if not shop:
        return Response({'error': 'No shop found'}, status=status.HTTP_404_NOT_FOUND)
    
    orders = Order.objects.filter(shop=shop).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shopkeeper_stats(request):
    """Get statistics for the shopkeeper's shop"""
    from orders.models import Order
    from django.db.models import Sum, Count
    
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can access this'}, status=status.HTTP_403_FORBIDDEN)
    
    shop = Shop.objects.filter(owner=request.user).first()
    if not shop:
        return Response({'error': 'No shop found'}, status=status.HTTP_404_NOT_FOUND)
    
    orders = Order.objects.filter(shop=shop)
    
    stats = {
        'total_orders': orders.count(),
        'pending_orders': orders.filter(status='pending').count(),
        'total_revenue': float(orders.filter(status='delivered').aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
        'total_products': Product.objects.filter(shop=shop).count(),
        'average_rating': float(shop.average_rating),
        'total_reviews': shop.total_reviews,
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_products(request):
    query = request.GET.get('q', '')
    if not query:
        return Response({'results': []})
    
    products = Product.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query) |
        Q(tags__icontains=query) |
        Q(shop__name__icontains=query),
        status='available'
    ).distinct()
    
    serializer = ProductSerializer(products, many=True)
    return Response({'results': serializer.data})

@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    products = Product.objects.filter(is_featured=True, status='available')[:10]
    serializer = ProductSerializer(products, many=True)
    return Response({'results': serializer.data})

@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_shops(request):
    """Get shops near a location"""
    lat = request.GET.get('lat')
    lng = request.GET.get('lng')
    radius = float(request.GET.get('radius', 10))  # Default 10km
    
    if not lat or not lng:
        return Response({'error': 'lat and lng are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        lat = float(lat)
        lng = float(lng)
    except ValueError:
        return Response({'error': 'Invalid coordinates'}, status=status.HTTP_400_BAD_REQUEST)
    
    shops = Shop.objects.filter(status='active')
    nearby = []
    
    for shop in shops:
        if shop.latitude and shop.longitude:
            distance = haversine(lng, lat, float(shop.longitude), float(shop.latitude))
            if distance <= radius:
                shop_data = ShopSerializer(shop).data
                shop_data['distance'] = round(distance, 2)
                nearby.append(shop_data)
    
    # Sort by distance
    nearby.sort(key=lambda x: x['distance'])
    
    return Response(nearby)

class WishlistView(generics.ListAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Wishlist.objects.filter(customer=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    product_id = request.data.get('product_id')
    try:
        product = Product.objects.get(id=product_id)
        wishlist_item, created = Wishlist.objects.get_or_create(
            customer=request.user,
            product=product
        )
        if created:
            return Response({'message': 'Product added to wishlist'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Product already in wishlist'}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request):
    product_id = request.data.get('product_id')
    try:
        wishlist_item = Wishlist.objects.get(customer=request.user, product_id=product_id)
        wishlist_item.delete()
        return Response({'message': 'Product removed from wishlist'}, status=status.HTTP_200_OK)
    except Wishlist.DoesNotExist:
        return Response({'error': 'Product not in wishlist'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shopkeeper_reviews(request):
    """Get reviews for the shopkeeper's shop and products"""
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can access this'}, status=status.HTTP_403_FORBIDDEN)
    
    shop = Shop.objects.filter(owner=request.user).first()
    if not shop:
        return Response({'error': 'No shop found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get reviews for the shop and its products
    shop_reviews = Review.objects.filter(shop=shop)
    product_reviews = Review.objects.filter(product__shop=shop)
    
    all_reviews = (shop_reviews | product_reviews).distinct().order_by('-created_at')
    serializer = ReviewSerializer(all_reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shopkeeper_analytics(request):
    """Get analytics data for the shopkeeper's shop"""
    from orders.models import Order, OrderItem
    from django.db.models import Sum, Count, F
    from django.db.models.functions import TruncDate, TruncMonth
    from datetime import datetime, timedelta
    
    if request.user.user_type != 'shopkeeper':
        return Response({'error': 'Only shopkeepers can access this'}, status=status.HTTP_403_FORBIDDEN)
    
    shop = Shop.objects.filter(owner=request.user).first()
    if not shop:
        return Response({'error': 'No shop found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get date range (last 30 days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    orders = Order.objects.filter(shop=shop)
    recent_orders = orders.filter(created_at__gte=start_date)
    
    # Daily revenue for last 30 days
    daily_revenue = recent_orders.filter(status='delivered').annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        revenue=Sum('total_amount'),
        count=Count('id')
    ).order_by('date')
    
    # Orders by status
    orders_by_status = orders.values('status').annotate(count=Count('id'))
    
    # Top selling products
    top_products = OrderItem.objects.filter(
        order__shop=shop,
        order__status='delivered'
    ).values(
        'product__name'
    ).annotate(
        total_sold=Sum('quantity'),
        revenue=Sum('subtotal')
    ).order_by('-total_sold')[:5]
    
    # Monthly revenue (last 6 months)
    six_months_ago = end_date - timedelta(days=180)
    monthly_revenue = orders.filter(
        created_at__gte=six_months_ago,
        status='delivered'
    ).annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        revenue=Sum('total_amount'),
        count=Count('id')
    ).order_by('month')
    
    return Response({
        'daily_revenue': list(daily_revenue),
        'orders_by_status': list(orders_by_status),
        'top_products': list(top_products),
        'monthly_revenue': list(monthly_revenue),
        'total_orders': orders.count(),
        'total_revenue': float(orders.filter(status='delivered').aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
        'average_order_value': float(orders.filter(status='delivered').aggregate(avg=Sum('total_amount') / Count('id'))['avg'] or 0),
    })