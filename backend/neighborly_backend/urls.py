from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'Welcome to Neighborly Hoods API',
        'version': '1.0',
        'endpoints': {
            'auth': '/api/auth/',
            'shops': '/api/shops/',
            'orders': '/api/orders/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('api/', api_root, name='api_index'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/shops/', include('shops.urls')),
    path('api/orders/', include('orders.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)