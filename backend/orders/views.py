from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from .models import Cart, CartItem, Order, OrderItem, OrderTracking, Coupon
from shops.models import Product
from .serializers import (
    CartSerializer, CartItemSerializer, OrderSerializer, 
    CouponSerializer, CheckoutSerializer, OrderTrackingSerializer
)

class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(customer=self.request.user)
        return cart

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))
    
    try:
        product = Product.objects.get(id=product_id, status='available')
        cart, created = Cart.objects.get_or_create(customer=request.user)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return Response({
            'message': 'Product added to cart',
            'cart_item': CartItemSerializer(cart_item).data
        }, status=status.HTTP_201_CREATED)
        
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request):
    cart_item_id = request.data.get('cart_item_id')
    quantity = int(request.data.get('quantity', 1))
    
    try:
        cart_item = CartItem.objects.get(id=cart_item_id, cart__customer=request.user)
        cart_item.quantity = quantity
        cart_item.save()
        
        return Response({
            'message': 'Cart item updated',
            'cart_item': CartItemSerializer(cart_item).data
        }, status=status.HTTP_200_OK)
        
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):
    cart_item_id = request.data.get('cart_item_id')
    
    try:
        cart_item = CartItem.objects.get(id=cart_item_id, cart__customer=request.user)
        cart_item.delete()
        
        return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)
        
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    try:
        cart = Cart.objects.get(customer=request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)
    except Cart.DoesNotExist:
        return Response({'message': 'Cart is already empty'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    serializer = CheckoutSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        cart = Cart.objects.get(customer=request.user)
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Group cart items by shop
            shops_orders = {}
            for item in cart.items.all():
                shop_id = item.product.shop.id
                if shop_id not in shops_orders:
                    shops_orders[shop_id] = {
                        'shop': item.product.shop,
                        'items': []
                    }
                shops_orders[shop_id]['items'].append(item)
            
            created_orders = []
            
            # Create separate orders for each shop
            for shop_data in shops_orders.values():
                shop = shop_data['shop']
                items = shop_data['items']
                
                # Calculate totals
                subtotal = sum(item.subtotal for item in items)
                delivery_fee = shop.delivery_fee
                total_amount = subtotal + delivery_fee
                
                # Create order
                order = Order.objects.create(
                    customer=request.user,
                    shop=shop,
                    subtotal=subtotal,
                    delivery_fee=delivery_fee,
                    total_amount=total_amount,
                    delivery_address=serializer.validated_data['delivery_address'],
                    delivery_phone=serializer.validated_data['delivery_phone'],
                    delivery_instructions=serializer.validated_data.get('delivery_instructions', ''),
                    payment_method=serializer.validated_data['payment_method'],
                    special_instructions=serializer.validated_data.get('special_instructions', ''),
                )
                
                # Create order items
                for cart_item in items:
                    OrderItem.objects.create(
                        order=order,
                        product=cart_item.product,
                        quantity=cart_item.quantity,
                        unit_price=cart_item.product.final_price,
                        subtotal=cart_item.subtotal
                    )
                
                # Create initial tracking
                OrderTracking.objects.create(
                    order=order,
                    status='pending',
                    message='Order placed successfully',
                    created_by=request.user
                )
                
                created_orders.append(order)
            
            # Clear cart
            cart.items.all().delete()
            
            return Response({
                'message': f'{len(created_orders)} order(s) created successfully',
                'orders': OrderSerializer(created_orders, many=True).data
            }, status=status.HTTP_201_CREATED)
            
    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'customer':
            return Order.objects.filter(customer=user).order_by('-created_at')
        elif user.user_type == 'shopkeeper':
            return Order.objects.filter(shop__owner=user).order_by('-created_at')
        elif user.user_type == 'admin':
            return Order.objects.all().order_by('-created_at')
        return Order.objects.none()
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        message = request.data.get('message', '')
        
        if new_status not in dict(Order.ORDER_STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        if new_status == 'confirmed':
            order.confirmed_at = timezone.now()
        elif new_status == 'delivered':
            order.actual_delivery_time = timezone.now()
        
        order.save()
        
        # Create tracking entry
        OrderTracking.objects.create(
            order=order,
            status=new_status,
            message=message,
            created_by=request.user
        )
        
        return Response({
            'message': 'Order status updated',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def track_order(request, order_id):
    try:
        order = Order.objects.get(order_id=order_id)
        
        # Check permissions
        if (request.user != order.customer and 
            request.user != order.shop.owner and 
            request.user.user_type != 'admin'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        tracking = OrderTracking.objects.filter(order=order)
        return Response({
            'order': OrderSerializer(order).data,
            'tracking': OrderTrackingSerializer(tracking, many=True).data
        }, status=status.HTTP_200_OK)
        
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

class CouponViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Coupon.objects.filter(is_active=True)
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticated]