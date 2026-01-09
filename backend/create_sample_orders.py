import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neighborly_backend.settings')
django.setup()

from accounts.models import User
from shops.models import Shop, Product
from orders.models import Order, OrderItem, OrderTracking

def create_sample_orders():
    # Get customer user
    try:
        customer = User.objects.get(username='customer1')
    except User.DoesNotExist:
        print("Customer user 'customer1' not found!")
        return
    
    # Get a shop
    shop = Shop.objects.first()
    if not shop:
        print("No shops found!")
        return
    
    # Get some products
    products = Product.objects.filter(shop=shop)[:3]
    if not products:
        print("No products found!")
        return
    
    print(f"Creating orders for customer: {customer.username}")
    print(f"Shop: {shop.name}")
    print(f"Products: {[p.name for p in products]}")
    
    # Create sample orders
    statuses = ['pending', 'confirmed', 'preparing', 'delivered', 'delivered']
    
    for i, status in enumerate(statuses):
        order = Order.objects.create(
            customer=customer,
            shop=shop,
            status=status,
            payment_status='paid' if status == 'delivered' else 'pending',
            payment_method='cash_on_delivery',
            subtotal=0,
            delivery_fee=shop.delivery_fee,
            total_amount=0,
            delivery_address=customer.address or '123 Main Street, City',
            delivery_phone=customer.phone_number or '1234567890',
        )
        
        # Add items to order
        subtotal = 0
        for product in products[:2]:
            quantity = (i % 3) + 1
            item_subtotal = product.final_price * quantity
            subtotal += item_subtotal
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=product.final_price,
                subtotal=item_subtotal
            )
        
        # Update order totals
        order.subtotal = subtotal
        order.total_amount = subtotal + order.delivery_fee
        order.save()
        
        # Create tracking
        OrderTracking.objects.create(
            order=order,
            status=status,
            message=f'Order {status}',
            created_by=customer
        )
        
        print(f"Created order #{order.id} - Status: {status} - Total: ₹{order.total_amount}")
    
    print(f"\nTotal orders created: {Order.objects.filter(customer=customer).count()}")

if __name__ == '__main__':
    create_sample_orders()
