"""
Serializers for real-time notifications.
"""
from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model.
    """
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'priority',
            'is_read', 'is_sent', 'created_at', 'read_at',
            'related_service', 'related_booking', 'related_order',
            'extra_data'
        ]
        read_only_fields = ['id', 'created_at', 'is_sent']
    
    def to_representation(self, instance):
        """Customize the representation."""
        data = super().to_representation(instance)
        
        # Add related object details
        if instance.related_service:
            data['related_service'] = {
                'id': instance.related_service.id,
                'name': instance.related_service.service_name,
                'category': instance.related_service.category
            }
        
        if instance.related_booking:
            data['related_booking'] = {
                'id': instance.related_booking.id,
                'booking_date': instance.related_booking.booking_date.isoformat(),
                'status': instance.related_booking.booking_status
            }
        
        if instance.related_order:
            data['related_order'] = {
                'id': instance.related_order.id,
                'quantity': instance.related_order.quantity,
                'total_amount': float(instance.related_order.total_amount),
                'status': instance.related_order.status
            }
        
        return data


class NotificationListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for notification lists.
    """
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'priority',
            'is_read', 'created_at', 'extra_data'
        ]


class NotificationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating notifications (admin only).
    """
    
    class Meta:
        model = Notification
        fields = [
            'recipient', 'title', 'message', 'notification_type', 'priority',
            'related_service', 'related_booking', 'related_order', 'extra_data'
        ]
    
    def validate_notification_type(self, value):
        """Validate notification type."""
        valid_types = [choice[0] for choice in Notification.NOTIFICATION_TYPES]
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid notification type. Must be one of: {valid_types}")
        return value
    
    def validate_priority(self, value):
        """Validate priority level."""
        valid_priorities = [choice[0] for choice in Notification.PRIORITY_LEVELS]
        if value not in valid_priorities:
            raise serializers.ValidationError(f"Invalid priority. Must be one of: {valid_priorities}")
        return value


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating notifications (mark as read, etc.).
    """
    
    class Meta:
        model = Notification
        fields = ['is_read']
    
    def update(self, instance, validated_data):
        """Update notification and set read timestamp."""
        if validated_data.get('is_read') and not instance.is_read:
            instance.mark_as_read()
        return instance


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for notification preferences.
    """
    
    class Meta:
        model = NotificationPreference
        fields = [
            'booking_notifications', 'order_notifications', 'payment_notifications',
            'review_notifications', 'complaint_notifications', 'system_notifications',
            'preferred_delivery_method', 'quiet_hours_start', 'quiet_hours_end'
        ]
    
    def validate_quiet_hours(self, data):
        """Validate quiet hours."""
        start = data.get('quiet_hours_start')
        end = data.get('quiet_hours_end')
        
        if start and end and start >= end:
            raise serializers.ValidationError("Quiet hours start must be before end time.")
        
        return data


class NotificationStatsSerializer(serializers.Serializer):
    """
    Serializer for notification statistics.
    """
    total_notifications = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    notifications_by_type = serializers.DictField()
    notifications_by_priority = serializers.DictField()
    recent_notifications = NotificationListSerializer(many=True)
