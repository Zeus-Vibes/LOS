from django.contrib import admin
from .models import Category, Shop, Product, ProductImage, Review, Wishlist

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'status', 'average_rating', 'created_at')
    list_filter = ('status', 'offers_delivery', 'created_at')
    search_fields = ('name', 'owner__username', 'address')
    filter_horizontal = ('categories',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'shop', 'category', 'price', 'stock_quantity', 'status', 'is_featured')
    list_filter = ('status', 'is_featured', 'category', 'created_at')
    search_fields = ('name', 'description', 'sku', 'shop__name')
    inlines = [ProductImageInline]

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('customer', 'product', 'shop', 'rating', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_approved', 'is_verified', 'created_at')
    search_fields = ('customer__username', 'product__name', 'shop__name')

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('customer', 'product', 'created_at')
    search_fields = ('customer__username', 'product__name')