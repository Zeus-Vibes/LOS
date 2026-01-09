from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, CustomerProfile, ShopkeeperProfile
from shops.models import Shop, Product, Category, Review
from orders.models import Order, OrderItem

def is_admin(user):
    return user.user_type == 'admin'

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """Get overall dashboard statistics for admin"""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    # User statistics
    total_users = User.objects.count()
    total_customers = User.objects.filter(user_type='customer').count()
    total_shopkeepers = User.objects.filter(user_type='shopkeeper').count()
    
    # Shop statistics
    total_shops = Shop.objects.count()
    active_shops = Shop.objects.filter(status='active').count()
    pending_shopkeepers = ShopkeeperProfile.objects.filter(verification_status='pending').count()
    
    # Product statistics
    total_products = Product.objects.count()
    available_products = Product.objects.filter(status='available').count()
    out_of_stock = Product.objects.filter(status='out_of_stock').count()
    
    # Order statistics
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='pending').count()
    completed_orders = Order.objects.filter(status='delivered').count()
    cancelled_orders = Order.objects.filter(status='cancelled').count()
    
    # Revenue
    total_revenue = Order.objects.filter(
        payment_status='paid'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    today = timezone.now().date()
    today_revenue = Order.objects.filter(
        payment_status='paid',
        created_at__date=today
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # This month
    month_start = today.replace(day=1)
    monthly_revenue = Order.objects.filter(
        payment_status='paid',
        created_at__date__gte=month_start
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    monthly_orders = Order.objects.filter(created_at__date__gte=month_start).count()
    
    # Category statistics
    total_categories = Category.objects.filter(is_active=True).count()
    
    # Review statistics
    total_reviews = Review.objects.count()
    avg_rating = Review.objects.aggregate(avg=Avg('rating'))['avg'] or 0
    
    return Response({
        'users': {
            'total': total_users,
            'customers': total_customers,
            'shopkeepers': total_shopkeepers,
        },
        'shops': {
            'total': total_shops,
            'active': active_shops,
            'pending_verification': pending_shopkeepers,
        },
        'products': {
            'total': total_products,
            'available': available_products,
            'out_of_stock': out_of_stock,
        },
        'orders': {
            'total': total_orders,
            'pending': pending_orders,
            'completed': completed_orders,
            'cancelled': cancelled_orders,
        },
        'revenue': {
            'total': float(total_revenue),
            'today': float(today_revenue),
            'monthly': float(monthly_revenue),
        },
        'categories': total_categories,
        'reviews': {
            'total': total_reviews,
            'average_rating': round(float(avg_rating), 2),
        },
        'monthly_orders': monthly_orders,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_recent_orders(request):
    """Get recent orders for admin dashboard"""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.select_related('customer', 'shop').order_by('-created_at')[:10]
    
    data = [{
        'id': order.id,
        'order_number': order.order_number,
        'customer': order.customer.username,
        'customer_name': f"{order.customer.first_name} {order.customer.last_name}",
        'shop': order.shop.name,
        'total_amount': float(order.total_amount),
        'status': order.status,
        'payment_status': order.payment_status,
        'created_at': order.created_at.isoformat(),
    } for order in orders]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_recent_users(request):
    """Get recently registered users"""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.order_by('-created_at')[:10]
    
    data = [{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': f"{user.first_name} {user.last_name}",
        'user_type': user.user_type,
        'is_verified': user.is_verified,
        'created_at': user.created_at.isoformat(),
    } for user in users]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_pending_shopkeepers(request):
    """Get pending shopkeeper verifications"""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    pending = ShopkeeperProfile.objects.filter(
        verification_status='pending'
    ).select_related('user')
    
    data = [{
        'id': profile.id,
        'user_id': profile.user.id,
        'username': profile.user.username,
        'email': profile.user.email,
        'business_name': profile.business_name,
        'business_phone': profile.business_phone,
        'business_address': profile.business_address,
        'business_license': profile.business_license,
        'created_at': profile.user.created_at.isoformat(),
    } for profile in pending]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_revenue_chart(request):
    """Get revenue data for charts (last 30 days)"""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)
    
    daily_revenue = Order.objects.filter(
        payment_status='paid',
        created_at__date__gte=start_date,
        created_at__date__lte=end_date
    ).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        revenue=Sum('total_amount'),
        orders=Count('id')
    ).order_by('date')
    
    data = [{
        'date': item['date'].isoformat(),
        'revenue': float(item['revenue'] or 0),
        'orders': item['orders'],
    } for item in daily_revenue]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_top_shops(request):
    """Get top performing shops"""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    shops = Shop.objects.annotate(
        total_orders=Count('orders'),
        total_revenue=Sum('orders__total_amount'),
    ).order_by('-total_revenue')[:5]
    
    data = [{
        'id': shop.id,
        'name': shop.name,
        'owner': shop.owner.username,
        'total_orders': shop.total_orders,
        'total_revenue': float(shop.total_revenue or 0),
        'average_rating': float(shop.average_rating),
        'status': shop.status,
    } for shop in shops]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_top_products(request):
    """Get top selling products"""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    products = Product.objects.annotate(
        total_sold=Sum('orderitem__quantity'),
        total_revenue=Sum('orderitem__subtotal'),
    ).filter(total_sold__isnull=False).order_by('-total_sold')[:5]
    
    data = [{
        'id': product.id,
        'name': product.name,
        'shop': product.shop.name,
        'price': float(product.price),
        'total_sold': product.total_sold or 0,
        'total_revenue': float(product.total_revenue or 0),
        'stock': product.stock_quantity,
    } for product in products]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_all_users(request):
    """Get all users with pagination"""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    user_type = request.GET.get('type', None)
    users = User.objects.all().order_by('-created_at')
    
    if user_type:
        users = users.filter(user_type=user_type)
    
    data = [{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': f"{user.first_name} {user.last_name}",
        'user_type': user.user_type,
        'phone_number': user.phone_number,
        'is_active': user.is_active,
        'is_verified': user.is_verified,
        'created_at': user.created_at.isoformat(),
    } for user in users[:50]]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_all_shops(request):
    """Get all shops"""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    status_filter = request.GET.get('status', None)
    shops = Shop.objects.select_related('owner').order_by('-created_at')
    
    if status_filter:
        shops = shops.filter(status=status_filter)
    
    data = [{
        'id': shop.id,
        'name': shop.name,
        'owner': shop.owner.username,
        'owner_email': shop.owner.email,
        'phone': shop.phone,
        'address': shop.address,
        'status': shop.status,
        'average_rating': float(shop.average_rating),
        'total_reviews': shop.total_reviews,
        'offers_delivery': shop.offers_delivery,
        'created_at': shop.created_at.isoformat(),
    } for shop in shops[:50]]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_all_orders(request):
    """Get all orders"""
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    status_filter = request.GET.get('status', None)
    orders = Order.objects.select_related('customer', 'shop').order_by('-created_at')
    
    if status_filter:
        orders = orders.filter(status=status_filter)
    
    data = [{
        'id': order.id,
        'order_number': order.order_number,
        'customer': order.customer.username,
        'customer_email': order.customer.email,
        'shop': order.shop.name,
        'total_amount': float(order.total_amount),
        'status': order.status,
        'payment_status': order.payment_status,
        'payment_method': order.payment_method,
        'delivery_address': order.delivery_address,
        'created_at': order.created_at.isoformat(),
    } for order in orders[:50]]
    
    return Response(data)