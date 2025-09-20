"""
URL configuration for real-time notifications.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationViewSet, 
    NotificationPreferenceViewSet, 
    AdminNotificationViewSet
)

# Create router
router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'preferences', NotificationPreferenceViewSet, basename='notification-preference')
router.register(r'admin/notifications', AdminNotificationViewSet, basename='admin-notification')

urlpatterns = [
    path('', include(router.urls)),
]
