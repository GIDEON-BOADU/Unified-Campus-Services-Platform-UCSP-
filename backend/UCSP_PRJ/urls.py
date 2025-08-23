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
from common.views import admin_dashboard
from rest_framework.routers import DefaultRouter
from services.views import ServiceViewSet, OrderViewSet, ReviewViewSet, VendorProfileViewSet
from bookings.views import BookingViewSet
from payments.views import (
    create_payment, payment_list, payment_detail, 
    process_paystack_payment
)
from users.views import (
    register_user, login_user, user_profile, update_profile, delete_user,
    submit_vendor_application, my_vendor_application,
    approve_vendor_application, reject_vendor_application, UserViewSet
)
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
router.register(r'users', UserViewSet, basename='user')
router.register(r'vendor-profiles', VendorProfileViewSet, basename='vendor-profile')


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # User Management (placed BEFORE router include to avoid shadowing)
    path('api/users/register/', register_user, name='register_user'),
    path('api/users/login/', login_user, name='login_user'),
    path('api/users/profile/', user_profile, name='user_profile'),
    path('api/users/profile/update/', update_profile, name='update_profile'),
    path('api/users/delete/', delete_user, name='delete_user'),

    # Vendor Applications
    path('api/users/vendor-applications/submit/', submit_vendor_application, name='submit_vendor_application'),
    path('api/users/vendor-applications/my/', my_vendor_application, name='my_vendor_application'),
    path('api/users/vendor-applications/<int:application_id>/approve/', approve_vendor_application, name='approve_vendor_application'),
    path('api/users/vendor-applications/<int:application_id>/reject/', reject_vendor_application, name='reject_vendor_application'),

    # Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Payments
    path('api/payments/create/', create_payment, name='create_payment'),
    path('api/payments/', payment_list, name='payment_list'),
    path('api/payments/<int:payment_id>/', payment_detail, name='payment_detail'),
    path('api/payments/paystack/', process_paystack_payment, name='process_paystack_payment'),

    # Admin dashboard
    path('api/admin/dashboard/', admin_dashboard, name='admin_dashboard'),

    # Mount users app router to expose vendor-application routes under /api/users/
    path('api/users/', include('users.urls')),

    # API Router (placed last)
    path('api/', include(router.urls)),
]
# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)