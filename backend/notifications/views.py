import json
from datetime import datetime, timedelta
from django.db.models import Q, Count, F
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import (
    Notification, NotificationTemplate, NotificationPreference,
    NotificationDeliveryLog, NotificationAnalytics
)
from .serializers import (
    NotificationSerializer, NotificationTemplateSerializer,
    NotificationPreferenceSerializer, NotificationDeliveryLogSerializer,
    NotificationAnalyticsSerializer, NotificationCreateSerializer,
    NotificationBulkActionSerializer, NotificationStatsSerializer
)
from .utils import send_notification, create_notification_from_template

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get user's notifications with filtering and pagination"""
    # Get query parameters
    notification_type = request.GET.get('type')
    priority = request.GET.get('priority')
    is_read = request.GET.get('is_read')
    limit = int(request.GET.get('limit', 20))
    offset = int(request.GET.get('offset', 0))
    
    # Build query
    queryset = Notification.objects.filter(user=request.user)
    
    if notification_type:
        queryset = queryset.filter(notification_type=notification_type)
    
    if priority:
        queryset = queryset.filter(priority=priority)
    
    if is_read is not None:
        queryset = queryset.filter(is_read=is_read.lower() == 'true')
    
    # Order by created_at desc
    queryset = queryset.order_by('-created_at')
    
    # Pagination
    total_count = queryset.count()
    notifications = queryset[offset:offset + limit]
    
    serializer = NotificationSerializer(notifications, many=True)
    
    return Response({
        'notifications': serializer.data,
        'total_count': total_count,
        'has_more': offset + limit < total_count
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_stats(request):
    """Get notification statistics for user"""
    user = request.user
    
    # Basic counts
    total_notifications = Notification.objects.filter(user=user).count()
    unread_count = Notification.objects.filter(user=user, is_read=False).count()
    read_count = total_notifications - unread_count
    
    # Notifications by type
    notifications_by_type = dict(
        Notification.objects.filter(user=user)
        .values('notification_type')
        .annotate(count=Count('id'))
        .values_list('notification_type', 'count')
    )
    
    # Notifications by priority
    notifications_by_priority = dict(
        Notification.objects.filter(user=user)
        .values('priority')
        .annotate(count=Count('id'))
        .values_list('priority', 'count')
    )
    
    # Recent notifications
    recent_notifications = Notification.objects.filter(user=user)[:5]
    recent_serializer = NotificationSerializer(recent_notifications, many=True)
    
    stats = {
        'total_notifications': total_notifications,
        'unread_count': unread_count,
        'read_count': read_count,
        'notifications_by_type': notifications_by_type,
        'notifications_by_priority': notifications_by_priority,
        'recent_notifications': recent_serializer.data
    }
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a notification as read"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.mark_as_read()
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_unread(request, notification_id):
    """Mark a notification as unread"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.is_read = False
        notification.read_at = None
        notification.save(update_fields=['is_read', 'read_at'])
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """Mark all notifications as read"""
    updated_count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({
        'message': f'Marked {updated_count} notifications as read'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_notification_action(request):
    """Perform bulk actions on notifications"""
    serializer = NotificationBulkActionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    notification_ids = serializer.validated_data['notification_ids']
    action = serializer.validated_data['action']
    
    # Get notifications belonging to user
    notifications = Notification.objects.filter(
        id__in=notification_ids,
        user=request.user
    )
    
    if action == 'mark_read':
        updated_count = notifications.update(
            is_read=True,
            read_at=timezone.now()
        )
        message = f'Marked {updated_count} notifications as read'
    
    elif action == 'mark_unread':
        updated_count = notifications.update(
            is_read=False,
            read_at=None
        )
        message = f'Marked {updated_count} notifications as unread'
    
    elif action == 'delete':
        updated_count = notifications.count()
        notifications.delete()
        message = f'Deleted {updated_count} notifications'
    
    return Response({'message': message})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """Delete a notification"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.delete()
        
        return Response({'message': 'Notification deleted successfully'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def notification_preferences(request):
    """Get or update user's notification preferences"""
    if request.method == 'GET':
        try:
            preferences = NotificationPreference.objects.get(user=request.user)
            serializer = NotificationPreferenceSerializer(preferences)
            return Response(serializer.data)
        except NotificationPreference.DoesNotExist:
            # Create default preferences
            preferences = NotificationPreference.objects.create(user=request.user)
            serializer = NotificationPreferenceSerializer(preferences)
            return Response(serializer.data)
    
    elif request.method == 'PUT':
        try:
            preferences = NotificationPreference.objects.get(user=request.user)
            serializer = NotificationPreferenceSerializer(preferences, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except NotificationPreference.DoesNotExist:
            serializer = NotificationPreferenceSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification(request):
    """Create a new notification (admin only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = NotificationCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Get user from request data
    user_id = request.data.get('user_id')
    if not user_id:
        return Response(
            {'error': 'user_id is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Create notification
    notification_data = serializer.validated_data.copy()
    notification_data['user'] = user
    
    # Set expiry time
    if 'expires_in_hours' in notification_data:
        expires_in_hours = notification_data.pop('expires_in_hours')
        notification_data['expires_at'] = timezone.now() + timedelta(hours=expires_in_hours)
    
    notification = Notification.objects.create(**notification_data)
    
    # Send notification
    send_notification(notification)
    
    serializer = NotificationSerializer(notification)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification_from_template(request):
    """Create notification from template (admin only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    template_name = request.data.get('template_name')
    user_id = request.data.get('user_id')
    variables = request.data.get('variables', {})
    
    if not template_name or not user_id:
        return Response(
            {'error': 'template_name and user_id are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        template = NotificationTemplate.objects.get(name=template_name, is_active=True)
        user = User.objects.get(id=user_id)
    except NotificationTemplate.DoesNotExist:
        return Response(
            {'error': 'Template not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Create notification from template
    notification = create_notification_from_template(template, user, variables)
    
    # Send notification
    send_notification(notification)
    
    serializer = NotificationSerializer(notification)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analytics(request):
    """Get notification analytics (admin only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get date range
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if not start_date:
        start_date = (timezone.now() - timedelta(days=30)).date()
    else:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    
    if not end_date:
        end_date = timezone.now().date()
    else:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    # Get analytics data
    analytics = NotificationAnalytics.objects.filter(
        date__range=[start_date, end_date]
    ).order_by('date')
    
    serializer = NotificationAnalyticsSerializer(analytics, many=True)
    
    # Calculate summary stats
    total_sent = sum(a.total_sent for a in analytics)
    total_delivered = sum(a.total_delivered for a in analytics)
    total_read = sum(a.total_read for a in analytics)
    
    summary = {
        'total_sent': total_sent,
        'total_delivered': total_delivered,
        'total_read': total_read,
        'delivery_rate': (total_delivered / total_sent * 100) if total_sent > 0 else 0,
        'read_rate': (total_read / total_delivered * 100) if total_delivered > 0 else 0,
    }
    
    return Response({
        'analytics': serializer.data,
        'summary': summary,
        'date_range': {
            'start_date': start_date,
            'end_date': end_date
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    """Get unread notification count"""
    count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()
    
    return Response({'unread_count': count})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_notification(request):
    """Send a test notification to the current user"""
    notification = Notification.objects.create(
        user=request.user,
        title="Test Notification",
        message="This is a test notification to verify your notification settings.",
        notification_type='general',
        priority='low',
        send_push=True,
        send_email=False,
        send_sms=False
    )
    
    # Send notification
    send_notification(notification)
    
    serializer = NotificationSerializer(notification)
    return Response(serializer.data)
