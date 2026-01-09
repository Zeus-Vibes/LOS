from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'shops', views.ShopViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'reviews', views.ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('search/', views.search_products, name='search_products'),
    path('featured/', views.featured_products, name='featured_products'),
    path('nearby/', views.nearby_shops, name='nearby_shops'),
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/add/', views.add_to_wishlist, name='add_to_wishlist'),
    path('wishlist/remove/', views.remove_from_wishlist, name='remove_from_wishlist'),
    # Shopkeeper endpoints
    path('my-shop/', views.my_shop, name='my_shop'),
    path('my-shop/create/', views.create_shop, name='create_shop'),
    path('my-shop/update/', views.update_shop, name='update_shop'),
    path('my-products/', views.my_products, name='my_products'),
    path('my-products/add/', views.add_product, name='add_product'),
    path('my-products/<int:product_id>/update/', views.update_product, name='update_product'),
    path('my-products/<int:product_id>/delete/', views.delete_product, name='delete_product'),
    path('my-orders/', views.shopkeeper_orders, name='shopkeeper_orders'),
    path('my-stats/', views.shopkeeper_stats, name='shopkeeper_stats'),
]