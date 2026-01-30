from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'Admin'),
        ('customer', 'Customer'),
        ('shopkeeper', 'Shopkeeper'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='customer')
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.user_type})"

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    date_of_birth = models.DateField(blank=True, null=True)
    preferred_delivery_address = models.TextField(blank=True)
    loyalty_points = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Customer: {self.user.username}"

class ShopkeeperProfile(models.Model):
    VERIFICATION_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='shopkeeper_profile')
    business_name = models.CharField(max_length=200)
    business_license = models.CharField(max_length=100, blank=True)
    business_address = models.TextField()
    business_phone = models.CharField(max_length=17)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='pending')
    verification_documents = models.ImageField(upload_to='verification_docs/', blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Shopkeeper: {self.business_name} ({self.user.username})"


class Notification(models.Model):
    """Notifications for all user types"""
    NOTIFICATION_TYPES = (
        ('order_placed', 'New Order'),
        ('order_status', 'Order Status Update'),
        ('shop_approved', 'Shop Approved'),
        ('shop_rejected', 'Shop Rejected'),
        ('new_review', 'New Review'),
        ('system', 'System Notification'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_order_id = models.IntegerField(blank=True, null=True)
    related_shop_id = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"