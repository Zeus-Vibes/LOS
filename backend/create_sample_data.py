import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neighborly_backend.settings')
django.setup()

from accounts.models import User, CustomerProfile, ShopkeeperProfile
from shops.models import Category, Shop, Product
from django.utils import timezone

# Create sample categories
categories_data = [
    {'name': 'Groceries', 'description': 'Fresh groceries and daily essentials'},
    {'name': 'Electronics', 'description': 'Electronic gadgets and accessories'},
    {'name': 'Clothing', 'description': 'Fashion and apparel'},
    {'name': 'Books', 'description': 'Books and stationery'},
    {'name': 'Home & Garden', 'description': 'Home improvement and garden supplies'},
]

for cat_data in categories_data:
    category, created = Category.objects.get_or_create(
        name=cat_data['name'],
        defaults={'description': cat_data['description']}
    )
    if created:
        print(f"Created category: {category.name}")

# Create sample customer
customer_user, created = User.objects.get_or_create(
    username='customer1',
    defaults={
        'email': 'customer@example.com',
        'first_name': 'John',
        'last_name': 'Doe',
        'user_type': 'customer',
        'phone_number': '+1234567890',
        'address': '123 Main St, City, State'
    }
)
if created:
    customer_user.set_password('customer123')
    customer_user.save()
    CustomerProfile.objects.create(user=customer_user)
    print(f"Created customer: {customer_user.username}")

# Create sample shopkeepers
shopkeepers_data = [
    {
        'username': 'shopkeeper1',
        'email': 'shop1@example.com',
        'first_name': 'Alice',
        'last_name': 'Smith',
        'business_name': 'Fresh Mart Grocery',
        'business_address': '456 Commerce St, City, State',
        'business_phone': '+1234567891',
        'categories': ['Groceries']
    },
    {
        'username': 'shopkeeper2',
        'email': 'shop2@example.com',
        'first_name': 'Bob',
        'last_name': 'Johnson',
        'business_name': 'Tech World Electronics',
        'business_address': '789 Tech Ave, City, State',
        'business_phone': '+1234567892',
        'categories': ['Electronics']
    }
]

for shop_data in shopkeepers_data:
    shopkeeper_user, created = User.objects.get_or_create(
        username=shop_data['username'],
        defaults={
            'email': shop_data['email'],
            'first_name': shop_data['first_name'],
            'last_name': shop_data['last_name'],
            'user_type': 'shopkeeper',
            'phone_number': shop_data['business_phone'],
            'address': shop_data['business_address']
        }
    )
    
    if created:
        shopkeeper_user.set_password('shopkeeper123')
        shopkeeper_user.save()
        
        # Create shopkeeper profile
        shopkeeper_profile = ShopkeeperProfile.objects.create(
            user=shopkeeper_user,
            business_name=shop_data['business_name'],
            business_address=shop_data['business_address'],
            business_phone=shop_data['business_phone'],
            verification_status='approved',
            approved_at=timezone.now()
        )
        
        # Create shop
        shop = Shop.objects.create(
            owner=shopkeeper_user,
            name=shop_data['business_name'],
            description=f"Welcome to {shop_data['business_name']}! We offer quality products at great prices.",
            address=shop_data['business_address'],
            phone=shop_data['business_phone'],
            email=shop_data['email'],
            opening_time='09:00',
            closing_time='21:00',
            offers_delivery=True,
            delivery_radius=10.00,
            minimum_order_amount=25.00,
            delivery_fee=5.00
        )
        
        # Add categories to shop
        for cat_name in shop_data['categories']:
            category = Category.objects.get(name=cat_name)
            shop.categories.add(category)
        
        print(f"Created shopkeeper and shop: {shopkeeper_user.username} - {shop.name}")

# Create sample products
products_data = [
    {
        'shop_owner': 'shopkeeper1',
        'category': 'Groceries',
        'products': [
            {'name': 'Fresh Apples', 'description': 'Crisp and sweet red apples', 'price': 3.99, 'stock': 100, 'sku': 'APPLE001'},
            {'name': 'Organic Bananas', 'description': 'Fresh organic bananas', 'price': 2.49, 'stock': 80, 'sku': 'BANANA001'},
            {'name': 'Whole Milk', 'description': 'Fresh whole milk 1 gallon', 'price': 4.29, 'stock': 50, 'sku': 'MILK001'},
            {'name': 'Bread Loaf', 'description': 'Freshly baked white bread', 'price': 2.99, 'stock': 30, 'sku': 'BREAD001'},
        ]
    },
    {
        'shop_owner': 'shopkeeper2',
        'category': 'Electronics',
        'products': [
            {'name': 'Wireless Headphones', 'description': 'High-quality wireless headphones', 'price': 79.99, 'stock': 25, 'sku': 'HEAD001'},
            {'name': 'Smartphone Charger', 'description': 'Fast charging USB-C cable', 'price': 19.99, 'stock': 100, 'sku': 'CHAR001'},
            {'name': 'Bluetooth Speaker', 'description': 'Portable Bluetooth speaker', 'price': 49.99, 'stock': 40, 'sku': 'SPEAK001'},
            {'name': 'Phone Case', 'description': 'Protective phone case', 'price': 14.99, 'stock': 75, 'sku': 'CASE001'},
        ]
    }
]

for shop_data in products_data:
    shop_owner = User.objects.get(username=shop_data['shop_owner'])
    shop = Shop.objects.get(owner=shop_owner)
    category = Category.objects.get(name=shop_data['category'])
    
    for product_data in shop_data['products']:
        product, created = Product.objects.get_or_create(
            sku=product_data['sku'],
            defaults={
                'shop': shop,
                'category': category,
                'name': product_data['name'],
                'description': product_data['description'],
                'price': product_data['price'],
                'stock_quantity': product_data['stock'],
                'status': 'available'
            }
        )
        if created:
            print(f"Created product: {product.name} in {shop.name}")

print("\nSample data created successfully!")
print("\nLogin credentials:")
print("Admin: username=admin, password=admin123")
print("Customer: username=customer1, password=customer123")
print("Shopkeeper 1: username=shopkeeper1, password=shopkeeper123")
print("Shopkeeper 2: username=shopkeeper2, password=shopkeeper123")