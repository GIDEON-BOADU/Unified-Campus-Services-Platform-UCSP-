from django.urls import path
from . import views

urlpatterns = [
    # Notifications
    path('', views.get_notifications, name='notifications_list'),
    path('stats/', views.get_notification_stats, name='notifications_stats'),
    path('unread-count/', views.get_unread_count, name='notifications_unread_count'),
    path('preferences/', views.notification_preferences, name='notifications_preferences'),
    path('test/', views.test_notification, name='notifications_test'),
    
    # Individual notification actions
    path('<int:notification_id>/read/', views.mark_notification_read, name='notification_mark_read'),
    path('<int:notification_id>/unread/', views.mark_notification_unread, name='notification_mark_unread'),
    path('<int:notification_id>/delete/', views.delete_notification, name='notification_delete'),
    
    # Bulk actions
    path('mark-all-read/', views.mark_all_read, name='notifications_mark_all_read'),
    path('bulk-action/', views.bulk_notification_action, name='notifications_bulk_action'),
    
    # Admin actions
    path('create/', views.create_notification, name='notifications_create'),
    path('create-from-template/', views.create_notification_from_template, name='notifications_create_from_template'),
    path('analytics/', views.get_analytics, name='notifications_analytics'),
]
