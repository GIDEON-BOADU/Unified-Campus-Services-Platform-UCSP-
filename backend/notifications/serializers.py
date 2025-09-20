from rest_framework import serializers
from .models import (
    Notification, 
    NotificationTemplate, 
    NotificationPreference, 
    NotificationDeliveryLog,
    NotificationAnalytics
)


class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'priority',
            'related_object_type', 'related_object_id', 'is_read', 'is_sent', 'is_delivered',
            'action_url', 'action_text', 'metadata', 'created_at', 'read_at',
            'time_ago', 'is_expired'
        ]
        read_only_fields = [
            'id', 'created_at', 'read_at', 'sent_at', 'delivered_at',
            'is_sent', 'is_delivered'
        ]
    
    def get_time_ago(self, obj):
        """Get human-readable time ago"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
    
    def get_is_expired(self, obj):
        """Check if notification is expired"""
        return obj.is_expired()


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'name', 'notification_type', 'title_template', 'message_template',
            'default_priority', 'default_send_email', 'default_send_push', 
            'default_send_sms', 'default_expiry_hours', 'variables', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'email_enabled', 'email_order_updates', 'email_booking_updates',
            'email_payment_updates', 'email_recommendations', 'email_announcements',
            'push_enabled', 'push_order_updates', 'push_booking_updates',
            'push_payment_updates', 'push_recommendations', 'push_announcements',
            'sms_enabled', 'sms_order_updates', 'sms_booking_updates', 'sms_payment_updates',
            'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end',
            'max_notifications_per_hour', 'max_notifications_per_day',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationDeliveryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationDeliveryLog
        fields = [
            'id', 'notification', 'channel', 'status', 'provider', 'external_id',
            'error_message', 'attempted_at', 'delivered_at', 'metadata'
        ]
        read_only_fields = ['id', 'attempted_at']


class NotificationAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationAnalytics
        fields = [
            'id', 'date', 'notification_type', 'total_sent', 'total_delivered',
            'total_read', 'total_clicked', 'delivery_rate', 'read_rate', 'click_rate',
            'email_sent', 'push_sent', 'sms_sent', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationCreateSerializer(serializers.Serializer):
    """Serializer for creating notifications"""
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
    notification_type = serializers.ChoiceField(choices=Notification.NOTIFICATION_TYPES)
    priority = serializers.ChoiceField(choices=Notification.PRIORITY_LEVELS, default='medium')
    related_object_type = serializers.CharField(max_length=50, required=False, allow_blank=True)
    related_object_id = serializers.IntegerField(required=False, allow_null=True)
    action_url = serializers.URLField(required=False, allow_blank=True)
    action_text = serializers.CharField(max_length=100, required=False, allow_blank=True)
    metadata = serializers.JSONField(default=dict, required=False)
    send_email = serializers.BooleanField(default=False)
    send_push = serializers.BooleanField(default=True)
    send_sms = serializers.BooleanField(default=False)
    expires_in_hours = serializers.IntegerField(default=24, required=False)


class NotificationBulkActionSerializer(serializers.Serializer):
    """Serializer for bulk notification actions"""
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )
    action = serializers.ChoiceField(choices=[
        ('mark_read', 'Mark as Read'),
        ('mark_unread', 'Mark as Unread'),
        ('delete', 'Delete'),
    ])


class NotificationStatsSerializer(serializers.Serializer):
    """Serializer for notification statistics"""
    total_notifications = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    read_count = serializers.IntegerField()
    notifications_by_type = serializers.DictField()
    notifications_by_priority = serializers.DictField()
    recent_notifications = NotificationSerializer(many=True)
