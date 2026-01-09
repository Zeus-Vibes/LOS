from django.contrib import admin
from .models import (
    Cart, CartItem, Order, OrderItem, OrderTracking, 
    DeliveryAgent, Delivery, Coupon, CouponUsage
)

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('customer', 'total_items', 'total_amount', 'created_at')
    search_fields = ('customer__username',)
    inlines = [CartItemInline]

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderTrackingInline(admin.TabularInline):
    model = OrderTracking
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer', 'shop', 'status', 'payment_status', 'total_amount', 'created_at')
    list_filter = ('status', 'payment_status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'customer__username', 'shop__name')
    inlines = [OrderItemInline, OrderTrackingInline]
    readonly_fields = ('order_id', 'order_number')

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'coupon_type', 'discount_value', 'valid_from', 'valid_until', 'is_active')
    list_filter = ('coupon_type', 'is_active', 'valid_from', 'valid_until')
    search_fields = ('code', 'name')
    filter_horizontal = ('applicable_shops',)

@admin.register(DeliveryAgent)
class DeliveryAgentAdmin(admin.ModelAdmin):
    list_display = ('user', 'vehicle_type', 'vehicle_number', 'is_available')
    list_filter = ('is_available', 'vehicle_type')
    search_fields = ('user__username', 'vehicle_number', 'license_number')

@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ('order', 'delivery_agent', 'status', 'pickup_time', 'delivery_time')
    list_filter = ('status', 'pickup_time', 'delivery_time')
    search_fields = ('order__order_number', 'delivery_agent__user__username')