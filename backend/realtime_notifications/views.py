"""
API views for real-time notifications.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from django.utils import timezone
from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer, NotificationListSerializer, NotificationCreateSerializer,
    NotificationUpdateSerializer, NotificationPreferenceSerializer, NotificationStatsSerializer
)
from .services import notification_service


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notifications.
    
    Features:
    - Users can view their own notifications
    - Mark notifications as read
    - Filter by type, priority, read status
    - Get notification statistics
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'priority', 'is_read', 'is_sent']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter notifications for the current user."""
        return Notification.objects.filter(recipient=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return NotificationListSerializer
        elif self.action == 'create':
            return NotificationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return NotificationUpdateSerializer
        return NotificationSerializer
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read."""
        notification = self.get_object()
        notification.mark_as_read()
        
        return Response({
            'message': 'Notification marked as read',
            'notification': NotificationSerializer(notification).data
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read."""
        updated_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        
        return Response({
            'message': f'{updated_count} notifications marked as read'
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get notification statistics for the user."""
        user = request.user
        
        # Basic counts
        total_notifications = Notification.objects.filter(recipient=user).count()
        unread_notifications = Notification.objects.filter(recipient=user, is_read=False).count()
        
        # Notifications by type
        notifications_by_type = dict(
            Notification.objects.filter(recipient=user)
            .values('notification_type')
            .annotate(count=Count('id'))
            .values_list('notification_type', 'count')
        )
        
        # Notifications by priority
        notifications_by_priority = dict(
            Notification.objects.filter(recipient=user)
            .values('priority')
            .annotate(count=Count('id'))
            .values_list('priority', 'count')
        )
        
        # Recent notifications
        recent_notifications = Notification.objects.filter(recipient=user)[:10]
        
        stats_data = {
            'total_notifications': total_notifications,
            'unread_notifications': unread_notifications,
            'notifications_by_type': notifications_by_type,
            'notifications_by_priority': notifications_by_priority,
            'recent_notifications': NotificationListSerializer(recent_notifications, many=True).data
        }
        
        serializer = NotificationStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread notification count."""
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return Response({'unread_count': count})


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notification preferences.
    
    Features:
    - Users can view and update their notification preferences
    - Create default preferences if they don't exist
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationPreferenceSerializer
    
    def get_queryset(self):
        """Filter preferences for the current user."""
        return NotificationPreference.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Get or create user's notification preferences."""
        try:
            return NotificationPreference.objects.get(user=self.request.user)
        except NotificationPreference.DoesNotExist:
            return NotificationPreference.objects.create(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """Get user's notification preferences."""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Update user's notification preferences."""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminNotificationViewSet(viewsets.ModelViewSet):
    """
    Admin-only ViewSet for managing all notifications.
    
    Features:
    - Admins can view all notifications
    - Send system announcements
    - Manage notification preferences for users
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['recipient', 'notification_type', 'priority', 'is_read', 'is_sent']
    search_fields = ['title', 'message', 'recipient__username']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get all notifications for admin users."""
        if self.request.user.user_type == 'admin':
            return Notification.objects.all()
        return Notification.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer
    
    @action(detail=False, methods=['post'])
    def send_announcement(self, request):
        """Send system announcement to users."""
        title = request.data.get('title')
        message = request.data.get('message')
        user_type = request.data.get('user_type')  # Optional: target specific user type
        priority = request.data.get('priority', 'medium')
        
        if not title or not message:
            return Response({
                'error': 'Title and message are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Send announcement
        notification_service.send_system_announcement(
            title=title,
            message=message,
            user_type=user_type,
            priority=priority
        )
        
        return Response({
            'message': 'System announcement sent successfully'
        })
    
    @action(detail=False, methods=['get'])
    def global_stats(self, request):
        """Get global notification statistics."""
        # Basic counts
        total_notifications = Notification.objects.count()
        unread_notifications = Notification.objects.filter(is_read=False).count()
        
        # Notifications by type
        notifications_by_type = dict(
            Notification.objects.values('notification_type')
            .annotate(count=Count('id'))
            .values_list('notification_type', 'count')
        )
        
        # Notifications by priority
        notifications_by_priority = dict(
            Notification.objects.values('priority')
            .annotate(count=Count('id'))
            .values_list('priority', 'count')
        )
        
        # Recent notifications
        recent_notifications = Notification.objects.select_related('recipient')[:20]
        
        stats_data = {
            'total_notifications': total_notifications,
            'unread_notifications': unread_notifications,
            'notifications_by_type': notifications_by_type,
            'notifications_by_priority': notifications_by_priority,
            'recent_notifications': NotificationListSerializer(recent_notifications, many=True).data
        }
        
        serializer = NotificationStatsSerializer(stats_data)
        return Response(serializer.data)