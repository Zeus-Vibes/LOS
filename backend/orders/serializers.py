from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, OrderTracking, Coupon, CouponUsage
from shops.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = Cart
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTracking
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    tracking = OrderTrackingSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('order_id', 'order_number', 'customer')

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

class CheckoutSerializer(serializers.Serializer):
    delivery_address = serializers.CharField()
    delivery_phone = serializers.CharField()
    delivery_instructions = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD_CHOICES)
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    special_instructions = serializers.CharField(required=False, allow_blank=True)