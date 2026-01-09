from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from . import admin_views

urlpatterns = [
    # Authentication
    path('register/', views.register_user, name='register_user'),
    path('register/shopkeeper/', views.register_shopkeeper, name='register_shopkeeper'),
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile Management
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile/customer/', views.CustomerProfileView.as_view(), name='customer_profile'),
    path('profile/shopkeeper/', views.ShopkeeperProfileView.as_view(), name='shopkeeper_profile'),
    
    # Dashboard
    path('dashboard/', views.user_dashboard, name='user_dashboard'),
    
    # Admin Functions
    path('shopkeepers/', views.ShopkeeperListView.as_view(), name='shopkeeper_list'),
    path('shopkeepers/<int:shopkeeper_id>/approve/', views.approve_shopkeeper, name='approve_shopkeeper'),
    path('shopkeepers/<int:shopkeeper_id>/reject/', views.reject_shopkeeper, name='reject_shopkeeper'),
    
    # Admin Dashboard API
    path('admin/stats/', admin_views.admin_dashboard_stats, name='admin_stats'),
    path('admin/recent-orders/', admin_views.admin_recent_orders, name='admin_recent_orders'),
    path('admin/recent-users/', admin_views.admin_recent_users, name='admin_recent_users'),
    path('admin/pending-shopkeepers/', admin_views.admin_pending_shopkeepers, name='admin_pending_shopkeepers'),
    path('admin/revenue-chart/', admin_views.admin_revenue_chart, name='admin_revenue_chart'),
    path('admin/top-shops/', admin_views.admin_top_shops, name='admin_top_shops'),
    path('admin/top-products/', admin_views.admin_top_products, name='admin_top_products'),
    path('admin/users/', admin_views.admin_all_users, name='admin_all_users'),
    path('admin/shops/', admin_views.admin_all_shops, name='admin_all_shops'),
    path('admin/orders/', admin_views.admin_all_orders, name='admin_all_orders'),
]