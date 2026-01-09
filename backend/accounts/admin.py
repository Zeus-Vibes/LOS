from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, CustomerProfile, ShopkeeperProfile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_verified', 'is_active', 'created_at')
    list_filter = ('user_type', 'is_verified', 'is_active', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone_number', 'address', 'profile_picture', 'is_verified')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('user_type', 'phone_number', 'address')
        }),
    )

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'date_of_birth', 'loyalty_points')
    search_fields = ('user__username', 'user__email')
    list_filter = ('user__created_at',)

@admin.register(ShopkeeperProfile)
class ShopkeeperProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'business_name', 'verification_status', 'approved_at')
    list_filter = ('verification_status', 'approved_at')
    search_fields = ('user__username', 'business_name', 'business_license')
    actions = ['approve_shopkeepers']
    
    def approve_shopkeepers(self, request, queryset):
        from django.utils import timezone
        queryset.update(verification_status='approved', approved_at=timezone.now())
        self.message_user(request, f'{queryset.count()} shopkeepers approved successfully.')
    approve_shopkeepers.short_description = "Approve selected shopkeepers"