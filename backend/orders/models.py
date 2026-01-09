from django.db import models
from django.conf import settings
from shops.models import Product, Shop
import uuid

class Cart(models.Model):
    customer = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart for {self.customer.username}"
    
    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())
    
    @property
    def total_amount(self):
        return sum(item.subtotal for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['cart', 'product']
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
    
    @property
    def subtotal(self):
        return self.quantity * self.product.final_price

class Order(models.Model):
    ORDER_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready_for_pickup', 'Ready for Pickup'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('cash_on_delivery', 'Cash on Delivery'),
        ('online_payment', 'Online Payment'),
        ('wallet', 'Wallet'),
    )
    
    # Order identification
    order_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    order_number = models.CharField(max_length=20, unique=True)
    
    # Relationships
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='orders')
    
    # Order details
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash_on_delivery')
    
    # Amounts
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Delivery information
    delivery_address = models.TextField()
    delivery_phone = models.CharField(max_length=17)
    delivery_instructions = models.TextField(blank=True)
    estimated_delivery_time = models.DateTimeField(blank=True, null=True)
    actual_delivery_time = models.DateTimeField(blank=True, null=True)
    
    # Special instructions
    special_instructions = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number} - {self.customer.username}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate order number
            import random
            import string
            self.order_number = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of order
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name} (Order: {self.order.order_number})"

class OrderTracking(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='tracking')
    status = models.CharField(max_length=20, choices=Order.ORDER_STATUS_CHOICES)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order.order_number} - {self.status}"

class DeliveryAgent(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='delivery_agent')
    vehicle_type = models.CharField(max_length=50)
    vehicle_number = models.CharField(max_length=20)
    license_number = models.CharField(max_length=50)
    is_available = models.BooleanField(default=True)
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    def __str__(self):
        return f"Delivery Agent: {self.user.username}"

class Delivery(models.Model):
    DELIVERY_STATUS_CHOICES = (
        ('assigned', 'Assigned'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    )
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    delivery_agent = models.ForeignKey(DeliveryAgent, on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')
    status = models.CharField(max_length=20, choices=DELIVERY_STATUS_CHOICES, default='assigned')
    
    pickup_time = models.DateTimeField(blank=True, null=True)
    delivery_time = models.DateTimeField(blank=True, null=True)
    
    # Delivery proof
    delivery_photo = models.ImageField(upload_to='delivery_proofs/', blank=True, null=True)
    customer_signature = models.ImageField(upload_to='signatures/', blank=True, null=True)
    delivery_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Delivery for Order {self.order.order_number}"

class Coupon(models.Model):
    COUPON_TYPE_CHOICES = (
        ('percentage', 'Percentage'),
        ('fixed_amount', 'Fixed Amount'),
        ('free_delivery', 'Free Delivery'),
    )
    
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    coupon_type = models.CharField(max_length=20, choices=COUPON_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Usage limits
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    maximum_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    usage_limit = models.IntegerField(blank=True, null=True)  # Total usage limit
    usage_limit_per_customer = models.IntegerField(default=1)
    
    # Validity
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    # Applicable shops (empty means all shops)
    applicable_shops = models.ManyToManyField(Shop, blank=True, related_name='coupons')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Coupon: {self.code}"

class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usage_records')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coupon_usage')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='coupon_usage')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['coupon', 'order']
    
    def __str__(self):
        return f"Coupon {self.coupon.code} used by {self.customer.username}"