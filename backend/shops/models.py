from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Shop(models.Model):
    SHOP_STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    )
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shops')
    name = models.CharField(max_length=200)
    description = models.TextField()
    address = models.TextField()
    phone = models.CharField(max_length=17)
    email = models.EmailField(blank=True)
    categories = models.ManyToManyField(Category, related_name='shops')
    
    # Business hours
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    is_open_24_7 = models.BooleanField(default=False)
    
    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    # Images
    logo = models.ImageField(upload_to='shop_logos/', blank=True, null=True)
    banner_image = models.ImageField(upload_to='shop_banners/', blank=True, null=True)
    
    # Status and ratings
    status = models.CharField(max_length=20, choices=SHOP_STATUS_CHOICES, default='active')
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.IntegerField(default=0)
    
    # Delivery options
    offers_delivery = models.BooleanField(default=True)
    delivery_radius = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)  # in km
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    PRODUCT_STATUS_CHOICES = (
        ('available', 'Available'),
        ('out_of_stock', 'Out of Stock'),
        ('discontinued', 'Discontinued'),
    )
    
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Inventory
    stock_quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=10)
    
    # Product details
    sku = models.CharField(max_length=100, unique=True)
    brand = models.CharField(max_length=100, blank=True)
    weight = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)  # in kg
    dimensions = models.CharField(max_length=100, blank=True)  # LxWxH
    
    # Images
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    
    # Status and ratings
    status = models.CharField(max_length=20, choices=PRODUCT_STATUS_CHOICES, default='available')
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.IntegerField(default=0)
    
    # SEO and search
    tags = models.CharField(max_length=500, blank=True)  # comma-separated tags
    is_featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.shop.name}"
    
    @property
    def is_on_sale(self):
        return self.discount_price is not None and self.discount_price < self.price
    
    @property
    def final_price(self):
        return self.discount_price if self.is_on_sale else self.price
    
    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.low_stock_threshold

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.product.name}"

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', blank=True, null=True)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='reviews', blank=True, null=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200, blank=True)
    comment = models.TextField()
    
    # Review status
    is_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['customer', 'product']  # One review per customer per product
    
    def __str__(self):
        target = self.product.name if self.product else self.shop.name
        return f"Review by {self.customer.username} for {target}"

class Wishlist(models.Model):
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['customer', 'product']
    
    def __str__(self):
        return f"{self.customer.username}'s wishlist - {self.product.name}"