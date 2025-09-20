"""
Notification models for real-time notifications.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Notification(models.Model):
    """
    Model for storing real-time notifications.
    
    This model stores notifications that are sent to users via WebSocket
    and can also be stored in the database for persistence.
    """
    
    # Notification types
    NOTIFICATION_TYPES = [
        ('booking_created', 'New Booking'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_completed', 'Booking Completed'),
        ('order_created', 'New Order'),
        ('order_cancelled', 'Order Cancelled'),
        ('order_confirmed', 'Order Confirmed'),
        ('payment_received', 'Payment Received'),
        ('review_received', 'New Review'),
        ('complaint_received', 'New Complaint'),
        ('system_announcement', 'System Announcement'),
    ]
    
    # Priority levels
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Relationships
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="User who will receive the notification"
    )
    
    # Notification content
    title = models.CharField(
        max_length=200,
        help_text="Notification title"
    )
    message = models.TextField(
        help_text="Notification message content"
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        help_text="Type of notification"
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_LEVELS,
        default='medium',
        help_text="Notification priority level"
    )
    
    # Related objects (optional)
    related_service = models.ForeignKey(
        'services.Service',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        help_text="Related service (if applicable)"
    )
    related_booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        help_text="Related booking (if applicable)"
    )
    related_order = models.ForeignKey(
        'services.Order',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        help_text="Related order (if applicable)"
    )
    
    # Status and metadata
    is_read = models.BooleanField(
        default=False,
        help_text="Whether the notification has been read"
    )
    is_sent = models.BooleanField(
        default=False,
        help_text="Whether the notification has been sent via WebSocket"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the notification was created"
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the notification was read"
    )
    
    # Additional data (JSON field for flexibility)
    extra_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional data for the notification"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
    
    def mark_as_read(self):
        """Mark the notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_sent(self):
        """Mark the notification as sent."""
        self.is_sent = True
        self.save(update_fields=['is_sent'])


class NotificationPreference(models.Model):
    """
    Model for storing user notification preferences.
    
    This allows users to customize which types of notifications
    they want to receive and how they want to receive them.
    """
    
    # Delivery methods
    DELIVERY_METHODS = [
        ('websocket', 'WebSocket (Real-time)'),
        ('email', 'Email'),
        ('push', 'Push Notification'),
        ('sms', 'SMS'),
    ]
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
        help_text="User these preferences belong to"
    )
    
    # Notification type preferences
    booking_notifications = models.BooleanField(
        default=True,
        help_text="Receive booking-related notifications"
    )
    order_notifications = models.BooleanField(
        default=True,
        help_text="Receive order-related notifications"
    )
    payment_notifications = models.BooleanField(
        default=True,
        help_text="Receive payment-related notifications"
    )
    review_notifications = models.BooleanField(
        default=True,
        help_text="Receive review-related notifications"
    )
    complaint_notifications = models.BooleanField(
        default=True,
        help_text="Receive complaint-related notifications"
    )
    system_notifications = models.BooleanField(
        default=True,
        help_text="Receive system announcements"
    )
    
    # Delivery method preferences
    preferred_delivery_method = models.CharField(
        max_length=20,
        choices=DELIVERY_METHODS,
        default='websocket',
        help_text="Preferred notification delivery method"
    )
    
    # Timing preferences
    quiet_hours_start = models.TimeField(
        null=True,
        blank=True,
        help_text="Start of quiet hours (no notifications)"
    )
    quiet_hours_end = models.TimeField(
        null=True,
        blank=True,
        help_text="End of quiet hours (no notifications)"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Notification Preference"
        verbose_name_plural = "Notification Preferences"
    
    def __str__(self):
        return f"Notification preferences for {self.user.username}"
    
    def should_receive_notification(self, notification_type):
        """
        Check if user should receive a notification of the given type.
        
        Args:
            notification_type (str): Type of notification
            
        Returns:
            bool: True if user should receive the notification
        """
        type_mapping = {
            'booking_created': self.booking_notifications,
            'booking_cancelled': self.booking_notifications,
            'booking_confirmed': self.booking_notifications,
            'booking_completed': self.booking_notifications,
            'order_created': self.order_notifications,
            'order_cancelled': self.order_notifications,
            'order_confirmed': self.order_notifications,
            'payment_received': self.payment_notifications,
            'review_received': self.review_notifications,
            'complaint_received': self.complaint_notifications,
            'system_announcement': self.system_notifications,
        }
        
        return type_mapping.get(notification_type, True)