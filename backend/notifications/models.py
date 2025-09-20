from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Notification(models.Model):
    """User notification model"""
    NOTIFICATION_TYPES = [
        ('order_update', 'Order Update'),
        ('booking_update', 'Booking Update'),
        ('payment_update', 'Payment Update'),
        ('service_recommendation', 'Service Recommendation'),
        ('system_announcement', 'System Announcement'),
        ('vendor_application', 'Vendor Application'),
        ('admin_alert', 'Admin Alert'),
        ('general', 'General'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, default='medium')
    
    # Related object references
    related_object_type = models.CharField(max_length=50, blank=True)  # 'order', 'booking', 'payment', etc.
    related_object_id = models.IntegerField(null=True, blank=True)
    
    # Notification state
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    is_delivered = models.BooleanField(default=False)
    
    # Delivery channels
    send_email = models.BooleanField(default=False)
    send_push = models.BooleanField(default=True)
    send_sms = models.BooleanField(default=False)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    action_url = models.URLField(blank=True)
    action_text = models.CharField(max_length=100, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_sent(self):
        """Mark notification as sent"""
        self.is_sent = True
        self.sent_at = timezone.now()
        self.save(update_fields=['is_sent', 'sent_at'])
    
    def mark_as_delivered(self):
        """Mark notification as delivered"""
        self.is_delivered = True
        self.delivered_at = timezone.now()
        self.save(update_fields=['is_delivered', 'delivered_at'])
    
    def is_expired(self):
        """Check if notification has expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False


class NotificationTemplate(models.Model):
    """Template for different types of notifications"""
    name = models.CharField(max_length=100, unique=True)
    notification_type = models.CharField(max_length=50, choices=Notification.NOTIFICATION_TYPES)
    title_template = models.CharField(max_length=255)
    message_template = models.TextField()
    
    # Default settings
    default_priority = models.CharField(max_length=20, choices=Notification.PRIORITY_LEVELS, default='medium')
    default_send_email = models.BooleanField(default=False)
    default_send_push = models.BooleanField(default=True)
    default_send_sms = models.BooleanField(default=False)
    default_expiry_hours = models.IntegerField(default=24)
    
    # Template variables
    variables = models.JSONField(default=list, blank=True)  # List of required variables
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Notification Template'
        verbose_name_plural = 'Notification Templates'
    
    def __str__(self):
        return self.name


class NotificationPreference(models.Model):
    """User notification preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email preferences
    email_enabled = models.BooleanField(default=True)
    email_order_updates = models.BooleanField(default=True)
    email_booking_updates = models.BooleanField(default=True)
    email_payment_updates = models.BooleanField(default=True)
    email_recommendations = models.BooleanField(default=True)
    email_announcements = models.BooleanField(default=True)
    
    # Push notification preferences
    push_enabled = models.BooleanField(default=True)
    push_order_updates = models.BooleanField(default=True)
    push_booking_updates = models.BooleanField(default=True)
    push_payment_updates = models.BooleanField(default=True)
    push_recommendations = models.BooleanField(default=True)
    push_announcements = models.BooleanField(default=True)
    
    # SMS preferences
    sms_enabled = models.BooleanField(default=False)
    sms_order_updates = models.BooleanField(default=False)
    sms_booking_updates = models.BooleanField(default=False)
    sms_payment_updates = models.BooleanField(default=False)
    
    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    
    # Frequency limits
    max_notifications_per_hour = models.IntegerField(default=10)
    max_notifications_per_day = models.IntegerField(default=50)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.email}"


class NotificationDeliveryLog(models.Model):
    """Log of notification delivery attempts"""
    DELIVERY_CHANNELS = [
        ('email', 'Email'),
        ('push', 'Push Notification'),
        ('sms', 'SMS'),
        ('in_app', 'In-App'),
    ]
    
    DELIVERY_STATUS = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('bounced', 'Bounced'),
    ]
    
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='delivery_logs')
    channel = models.CharField(max_length=20, choices=DELIVERY_CHANNELS)
    status = models.CharField(max_length=20, choices=DELIVERY_STATUS, default='pending')
    
    # Delivery details
    provider = models.CharField(max_length=100, blank=True)  # Email provider, push service, etc.
    external_id = models.CharField(max_length=255, blank=True)  # External service ID
    error_message = models.TextField(blank=True)
    
    # Timestamps
    attempted_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-attempted_at']
        verbose_name = 'Notification Delivery Log'
        verbose_name_plural = 'Notification Delivery Logs'
    
    def __str__(self):
        return f"{self.notification.title} - {self.channel} - {self.status}"


class NotificationAnalytics(models.Model):
    """Analytics for notification performance"""
    date = models.DateField()
    notification_type = models.CharField(max_length=50, choices=Notification.NOTIFICATION_TYPES)
    
    # Counts
    total_sent = models.IntegerField(default=0)
    total_delivered = models.IntegerField(default=0)
    total_read = models.IntegerField(default=0)
    total_clicked = models.IntegerField(default=0)
    
    # Rates
    delivery_rate = models.FloatField(default=0.0)
    read_rate = models.FloatField(default=0.0)
    click_rate = models.FloatField(default=0.0)
    
    # Channels
    email_sent = models.IntegerField(default=0)
    push_sent = models.IntegerField(default=0)
    sms_sent = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['date', 'notification_type']
        ordering = ['-date']
        verbose_name = 'Notification Analytics'
        verbose_name_plural = 'Notification Analytics'
    
    def __str__(self):
        return f"{self.date} - {self.notification_type}"
