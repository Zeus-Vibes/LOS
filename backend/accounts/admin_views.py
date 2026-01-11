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
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    total_users = User.objects.count()
    total_customers = User.objects.filter(user_type='customer').count()
    total_shopkeepers = User.objects.filter(user_type='shopkeeper').count()
    total_shops = Shop.objects.count()
    active_shops = Shop.objects.filter(status='active').count()
    pending_shopkeepers = ShopkeeperProfile.objects.filter(verification_status='pending').count()
    total_products = Product.objects.count()
    available_products = Product.objects.filter(status='available').count()
    out_of_stock = Product.objects.filter(status='out_of_stock').count()
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='pending').count()
    completed_orders = Order.objects.filter(status='delivered').count()
    cancelled_orders = Order.objects.filter(status='cancelled').count()
    total_revenue = Order.objects.filter(payment_status='paid').aggregate(total=Sum('total_amount'))['total'] or 0
    today = timezone.now().date()
    today_revenue = Order.objects.filter(payment_status='paid', created_at__date=today).aggregate(total=Sum('total_amount'))['total'] or 0
    month_start = today.replace(day=1)
    monthly_revenue = Order.objects.filter(payment_status='paid', created_at__date__gte=month_start).aggregate(total=Sum('total_amount'))['total'] or 0
    monthly_orders = Order.objects.filter(created_at__date__gte=month_start).count()
    total_categories = Category.objects.filter(is_active=True).count()
    total_reviews = Review.objects.count()
    avg_rating = Review.objects.aggregate(avg=Avg('rating'))['avg'] or 0
    
    return Response({
        'users': {'total': total_users, 'customers': total_customers, 'shopkeepers': total_shopkeepers},
        'shops': {'total': total_shops, 'active': active_shops, 'pending_verification': pending_shopkeepers},
        'products': {'total': total_products, 'available': available_products, 'out_of_stock': out_of_stock},
        'orders': {'total': total_orders, 'pending': pending_orders, 'completed': completed_orders, 'cancelled': cancelled_orders},
        'revenue': {'total': float(total_revenue), 'today': float(today_revenue), 'monthly': float(monthly_revenue)},
        'categories': total_categories,
        'reviews': {'total': total_reviews, 'average_rating': round(float(avg_rating), 2)},
        'monthly_orders': monthly_orders,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_recent_orders(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    orders = Order.objects.select_related('customer', 'shop').order_by('-created_at')[:10]
    data = [{'id': o.id, 'order_number': o.order_number, 'customer': o.customer.username, 'customer_name': f"{o.customer.first_name} {o.customer.last_name}", 'shop': o.shop.name, 'total_amount': float(o.total_amount), 'status': o.status, 'payment_status': o.payment_status, 'created_at': o.created_at.isoformat()} for o in orders]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_recent_users(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.order_by('-created_at')[:10]
    data = [{'id': u.id, 'username': u.username, 'email': u.email, 'full_name': f"{u.first_name} {u.last_name}", 'user_type': u.user_type, 'is_verified': u.is_verified, 'created_at': u.created_at.isoformat()} for u in users]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_pending_shopkeepers(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    pending = ShopkeeperProfile.objects.filter(verification_status='pending').select_related('user')
    data = [{'id': p.id, 'user_id': p.user.id, 'username': p.user.username, 'email': p.user.email, 'business_name': p.business_name, 'business_phone': p.business_phone, 'business_address': p.business_address, 'business_license': p.business_license, 'created_at': p.user.created_at.isoformat()} for p in pending]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_revenue_chart(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)
    daily_revenue = Order.objects.filter(payment_status='paid', created_at__date__gte=start_date, created_at__date__lte=end_date).annotate(date=TruncDate('created_at')).values('date').annotate(revenue=Sum('total_amount'), orders=Count('id')).order_by('date')
    data = [{'date': item['date'].isoformat(), 'revenue': float(item['revenue'] or 0), 'orders': item['orders']} for item in daily_revenue]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_top_shops(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    shops = Shop.objects.annotate(total_orders=Count('orders'), total_revenue=Sum('orders__total_amount')).order_by('-total_revenue')[:5]
    data = [{'id': s.id, 'name': s.name, 'owner': s.owner.username, 'total_orders': s.total_orders, 'total_revenue': float(s.total_revenue or 0), 'average_rating': float(s.average_rating), 'status': s.status} for s in shops]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_top_products(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    products = Product.objects.annotate(total_sold=Sum('orderitem__quantity'), total_revenue=Sum('orderitem__subtotal')).filter(total_sold__isnull=False).order_by('-total_sold')[:5]
    data = [{'id': p.id, 'name': p.name, 'shop': p.shop.name, 'price': float(p.price), 'total_sold': p.total_sold or 0, 'total_revenue': float(p.total_revenue or 0), 'stock': p.stock_quantity} for p in products]
    return Response(data)


# ============ CRUD OPERATIONS ============

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        user_type = request.GET.get('type', None)
        users = User.objects.all().order_by('-created_at')
        if user_type:
            users = users.filter(user_type=user_type)
        data = [{'id': u.id, 'username': u.username, 'email': u.email, 'first_name': u.first_name, 'last_name': u.last_name, 'full_name': f"{u.first_name} {u.last_name}", 'user_type': u.user_type, 'phone_number': u.phone_number, 'address': u.address, 'is_active': u.is_active, 'is_verified': u.is_verified, 'created_at': u.created_at.isoformat()} for u in users[:100]]
        return Response(data)
    
    elif request.method == 'POST':
        data = request.data
        try:
            user = User.objects.create_user(username=data['username'], email=data['email'], password=data.get('password', 'defaultpass123'), first_name=data.get('first_name', ''), last_name=data.get('last_name', ''), user_type=data.get('user_type', 'customer'), phone_number=data.get('phone_number', ''), address=data.get('address', ''))
            return Response({'message': 'User created successfully', 'id': user.id, 'username': user.username}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_id):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({'id': user.id, 'username': user.username, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name, 'user_type': user.user_type, 'phone_number': user.phone_number, 'address': user.address, 'is_active': user.is_active, 'is_verified': user.is_verified, 'created_at': user.created_at.isoformat()})
    elif request.method == 'PUT':
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.address = data.get('address', user.address)
        user.user_type = data.get('user_type', user.user_type)
        user.is_active = data.get('is_active', user.is_active)
        user.is_verified = data.get('is_verified', user.is_verified)
        user.save()
        return Response({'message': 'User updated successfully'})
    elif request.method == 'DELETE':
        if user.user_type == 'admin':
            return Response({'error': 'Cannot delete admin users'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({'message': 'User deleted successfully'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_shops(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        status_filter = request.GET.get('status', None)
        shops = Shop.objects.select_related('owner').order_by('-created_at')
        if status_filter:
            shops = shops.filter(status=status_filter)
        data = [{'id': s.id, 'name': s.name, 'description': s.description, 'owner': s.owner.username, 'owner_id': s.owner.id, 'owner_email': s.owner.email, 'phone': s.phone, 'email': s.email, 'address': s.address, 'status': s.status, 'average_rating': float(s.average_rating), 'total_reviews': s.total_reviews, 'offers_delivery': s.offers_delivery, 'delivery_fee': float(s.delivery_fee), 'minimum_order_amount': float(s.minimum_order_amount), 'opening_time': str(s.opening_time), 'closing_time': str(s.closing_time), 'created_at': s.created_at.isoformat()} for s in shops[:100]]
        return Response(data)
    
    elif request.method == 'POST':
        data = request.data
        try:
            owner = User.objects.get(id=data['owner_id'])
            shop = Shop.objects.create(owner=owner, name=data['name'], description=data.get('description', ''), address=data.get('address', ''), phone=data.get('phone', ''), email=data.get('email', ''), status=data.get('status', 'active'), opening_time=data.get('opening_time', '09:00'), closing_time=data.get('closing_time', '21:00'))
            return Response({'message': 'Shop created successfully', 'id': shop.id, 'name': shop.name}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_shop_detail(request, shop_id):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        shop = Shop.objects.get(id=shop_id)
    except Shop.DoesNotExist:
        return Response({'error': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({'id': shop.id, 'name': shop.name, 'description': shop.description, 'owner': shop.owner.username, 'owner_id': shop.owner.id, 'phone': shop.phone, 'email': shop.email, 'address': shop.address, 'status': shop.status, 'average_rating': float(shop.average_rating), 'offers_delivery': shop.offers_delivery, 'delivery_fee': float(shop.delivery_fee), 'minimum_order_amount': float(shop.minimum_order_amount)})
    elif request.method == 'PUT':
        data = request.data
        shop.name = data.get('name', shop.name)
        shop.description = data.get('description', shop.description)
        shop.phone = data.get('phone', shop.phone)
        shop.email = data.get('email', shop.email)
        shop.address = data.get('address', shop.address)
        shop.status = data.get('status', shop.status)
        shop.offers_delivery = data.get('offers_delivery', shop.offers_delivery)
        shop.delivery_fee = data.get('delivery_fee', shop.delivery_fee)
        shop.minimum_order_amount = data.get('minimum_order_amount', shop.minimum_order_amount)
        shop.save()
        return Response({'message': 'Shop updated successfully'})
    elif request.method == 'DELETE':
        shop.delete()
        return Response({'message': 'Shop deleted successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    status_filter = request.GET.get('status', None)
    orders = Order.objects.select_related('customer', 'shop').order_by('-created_at')
    if status_filter:
        orders = orders.filter(status=status_filter)
    data = [{'id': o.id, 'order_number': o.order_number, 'customer': o.customer.username, 'customer_id': o.customer.id, 'customer_email': o.customer.email, 'shop': o.shop.name, 'shop_id': o.shop.id, 'total_amount': float(o.total_amount), 'subtotal': float(o.subtotal), 'delivery_fee': float(o.delivery_fee), 'status': o.status, 'payment_status': o.payment_status, 'payment_method': o.payment_method, 'delivery_address': o.delivery_address, 'delivery_phone': o.delivery_phone, 'created_at': o.created_at.isoformat()} for o in orders[:100]]
    return Response(data)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_order_detail(request, order_id):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        items = [{'id': i.id, 'product_name': i.product.name, 'quantity': i.quantity, 'unit_price': float(i.unit_price), 'subtotal': float(i.subtotal)} for i in order.items.all()]
        return Response({'id': order.id, 'order_number': order.order_number, 'customer': order.customer.username, 'shop': order.shop.name, 'total_amount': float(order.total_amount), 'status': order.status, 'payment_status': order.payment_status, 'delivery_address': order.delivery_address, 'items': items})
    elif request.method == 'PUT':
        data = request.data
        order.status = data.get('status', order.status)
        order.payment_status = data.get('payment_status', order.payment_status)
        order.save()
        return Response({'message': 'Order updated successfully'})
    elif request.method == 'DELETE':
        order.delete()
        return Response({'message': 'Order deleted successfully'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_products(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        status_filter = request.GET.get('status', None)
        shop_filter = request.GET.get('shop', None)
        products = Product.objects.select_related('shop', 'category').order_by('-created_at')
        if status_filter:
            products = products.filter(status=status_filter)
        if shop_filter:
            products = products.filter(shop_id=shop_filter)
        data = [{'id': p.id, 'name': p.name, 'description': p.description, 'shop': p.shop.name, 'shop_id': p.shop.id, 'category': p.category.name if p.category else None, 'category_id': p.category.id if p.category else None, 'price': float(p.price), 'discount_price': float(p.discount_price) if p.discount_price else None, 'stock_quantity': p.stock_quantity, 'status': p.status, 'is_featured': p.is_featured, 'average_rating': float(p.average_rating), 'created_at': p.created_at.isoformat()} for p in products[:100]]
        return Response(data)
    
    elif request.method == 'POST':
        import uuid
        data = request.data
        try:
            shop = Shop.objects.get(id=data['shop_id'])
            category = Category.objects.get(id=data['category_id']) if data.get('category_id') else None
            product = Product.objects.create(shop=shop, category=category, name=data['name'], description=data.get('description', ''), price=data['price'], discount_price=data.get('discount_price'), stock_quantity=data.get('stock_quantity', 0), status=data.get('status', 'available'), sku=f"SKU-{uuid.uuid4().hex[:8].upper()}")
            return Response({'message': 'Product created successfully', 'id': product.id, 'name': product.name}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_product_detail(request, product_id):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({'id': product.id, 'name': product.name, 'description': product.description, 'shop': product.shop.name, 'shop_id': product.shop.id, 'category': product.category.name if product.category else None, 'category_id': product.category.id if product.category else None, 'price': float(product.price), 'discount_price': float(product.discount_price) if product.discount_price else None, 'stock_quantity': product.stock_quantity, 'status': product.status, 'is_featured': product.is_featured})
    elif request.method == 'PUT':
        data = request.data
        product.name = data.get('name', product.name)
        product.description = data.get('description', product.description)
        product.price = data.get('price', product.price)
        product.discount_price = data.get('discount_price', product.discount_price)
        product.stock_quantity = data.get('stock_quantity', product.stock_quantity)
        product.status = data.get('status', product.status)
        product.is_featured = data.get('is_featured', product.is_featured)
        if data.get('category_id'):
            product.category = Category.objects.get(id=data['category_id'])
        product.save()
        return Response({'message': 'Product updated successfully'})
    elif request.method == 'DELETE':
        product.delete()
        return Response({'message': 'Product deleted successfully'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_categories(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        categories = Category.objects.all().order_by('name')
        data = [{'id': c.id, 'name': c.name, 'description': c.description, 'is_active': c.is_active, 'created_at': c.created_at.isoformat()} for c in categories]
        return Response(data)
    
    elif request.method == 'POST':
        data = request.data
        try:
            category = Category.objects.create(name=data['name'], description=data.get('description', ''), is_active=data.get('is_active', True))
            return Response({'message': 'Category created successfully', 'id': category.id, 'name': category.name}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_category_detail(request, category_id):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({'id': category.id, 'name': category.name, 'description': category.description, 'is_active': category.is_active})
    elif request.method == 'PUT':
        data = request.data
        category.name = data.get('name', category.name)
        category.description = data.get('description', category.description)
        category.is_active = data.get('is_active', category.is_active)
        category.save()
        return Response({'message': 'Category updated successfully'})
    elif request.method == 'DELETE':
        category.delete()
        return Response({'message': 'Category deleted successfully'})


# ============ REVIEWS CRUD ============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_reviews(request):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    reviews = Review.objects.select_related('customer', 'product', 'shop').order_by('-created_at')
    
    # Filter by rating if provided
    rating = request.GET.get('rating')
    if rating:
        reviews = reviews.filter(rating=int(rating))
    
    # Filter by approval status
    approved = request.GET.get('approved')
    if approved is not None:
        reviews = reviews.filter(is_approved=approved.lower() == 'true')
    
    data = [{
        'id': r.id,
        'customer': r.customer.username,
        'customer_name': f"{r.customer.first_name} {r.customer.last_name}".strip() or r.customer.username,
        'product': r.product.name if r.product else None,
        'product_id': r.product.id if r.product else None,
        'shop': r.shop.name if r.shop else (r.product.shop.name if r.product else None),
        'shop_id': r.shop.id if r.shop else (r.product.shop.id if r.product else None),
        'rating': r.rating,
        'title': r.title,
        'comment': r.comment,
        'is_verified': r.is_verified,
        'is_approved': r.is_approved,
        'created_at': r.created_at.isoformat()
    } for r in reviews[:100]]
    
    return Response(data)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_review_detail(request, review_id):
    if not is_admin(request.user):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({
            'id': review.id,
            'customer': review.customer.username,
            'product': review.product.name if review.product else None,
            'shop': review.shop.name if review.shop else None,
            'rating': review.rating,
            'title': review.title,
            'comment': review.comment,
            'is_verified': review.is_verified,
            'is_approved': review.is_approved,
            'created_at': review.created_at.isoformat()
        })
    
    elif request.method == 'PUT':
        data = request.data
        review.is_approved = data.get('is_approved', review.is_approved)
        review.is_verified = data.get('is_verified', review.is_verified)
        review.save()
        return Response({'message': 'Review updated successfully'})
    
    elif request.method == 'DELETE':
        review.delete()
        return Response({'message': 'Review deleted successfully'})
