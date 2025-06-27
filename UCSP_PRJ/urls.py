"""
URL configuration for UCSP_PRJ project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from services.views import ServiceViewSet, OrderViewSet, ReviewViewSet, VendorProfileViewSet
from bookings.views import BookingViewSet
from payments.views import (
    create_payment, payment_list, payment_detail, 
    process_paystack_payment
)
from users.views import register_user, login_user, user_profile, update_profile, delete_user
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# API Router
router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'vendor-profiles', VendorProfileViewSet, basename='vendor-profile')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Routes
    path('api/', include(router.urls)),
    
    # Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Management
    path('api/users/register/', register_user, name='register_user'),
    path('api/users/login/', login_user, name='login_user'),
    path('api/users/profile/', user_profile, name='user_profile'),
    path('api/users/profile/update/', update_profile, name='update_profile'),
    path('api/users/delete/', delete_user, name='delete_user'),
    
    # Payments
    path('api/payments/create/', create_payment, name='create_payment'),
    path('api/payments/', payment_list, name='payment_list'),
    path('api/payments/<int:payment_id>/', payment_detail, name='payment_detail'),
    path('api/payments/paystack/', process_paystack_payment, name='process_paystack_payment'),
]
# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)