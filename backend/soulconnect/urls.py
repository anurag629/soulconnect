"""
URL configuration for SoulConnect project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API v1 endpoints
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/profiles/', include('profiles.urls')),
    path('api/v1/matching/', include('matching.urls')),
    path('api/v1/chat/', include('chat.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/reports/', include('reports.urls')),
    path('api/v1/admin-panel/', include('admin_panel.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
