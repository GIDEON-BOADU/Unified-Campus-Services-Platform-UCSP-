from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register_user, login_user, user_profile, update_profile, delete_user,
    VendorApplicationViewSet, UserViewSet,
    submit_vendor_application, my_vendor_application,
    approve_vendor_application, reject_vendor_application,
    refresh_token_view, test_request
)

router = DefaultRouter()
router.register(r'vendor-applications', VendorApplicationViewSet, basename='vendor-application')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('test/', test_request, name='test_request'),
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('profile/', user_profile, name='user_profile'),
    path('profile/update/', update_profile, name='update_profile'),
    path('delete/', delete_user, name='delete_user'),
    path('vendor-applications/submit/', submit_vendor_application, name='submit_vendor_application'),
    path('vendor-applications/my/', my_vendor_application, name='my_vendor_application'),
    path('vendor-applications/<int:application_id>/approve/', approve_vendor_application, name='approve_vendor_application'),
    path('vendor-applications/<int:application_id>/reject/', reject_vendor_application, name='reject_vendor_application'),
    path('auth/refresh/', refresh_token_view, name='refresh_token'),
    path('', include(router.urls)),
]
