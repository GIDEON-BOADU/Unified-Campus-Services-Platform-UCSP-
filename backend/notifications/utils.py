import json
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from .models import Notification, NotificationTemplate, NotificationPreference, NotificationDeliveryLog

logger = logging.getLogger(__name__)


def send_notification(notification):
    """Send notification through all enabled channels"""
    try:
        # Get user preferences
        try:
            preferences = NotificationPreference.objects.get(user=notification.user)
        except NotificationPreference.DoesNotExist:
            # Use default preferences
            preferences = NotificationPreference.objects.create(user=notification.user)
        
        # Check if user is in quiet hours
        if preferences.quiet_hours_enabled and is_in_quiet_hours(preferences):
            logger.info(f"User {notification.user.email} is in quiet hours, skipping notification")
            return
        
        # Check rate limits
        if not check_rate_limits(notification.user, preferences):
            logger.warning(f"Rate limit exceeded for user {notification.user.email}")
            return
        
        # Send through enabled channels
        if notification.send_email and preferences.email_enabled:
            send_email_notification(notification)
        
        if notification.send_push and preferences.push_enabled:
            send_push_notification(notification)
        
        if notification.send_sms and preferences.sms_enabled:
            send_sms_notification(notification)
        
        # Mark as sent
        notification.mark_as_sent()
        
        # Log delivery
        log_delivery_attempt(notification, 'in_app', 'delivered')
        
    except Exception as e:
        logger.error(f"Error sending notification {notification.id}: {str(e)}")
        log_delivery_attempt(notification, 'in_app', 'failed', error_message=str(e))


def send_email_notification(notification):
    """Send email notification"""
    try:
        subject = f"[UCSP] {notification.title}"
        
        # Create HTML email template
        html_message = render_to_string('notifications/email_notification.html', {
            'notification': notification,
            'user': notification.user,
            'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        })
        
        # Send email
        send_mail(
            subject=subject,
            message=notification.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.user.email],
            html_message=html_message,
            fail_silently=False
        )
        
        # Log delivery
        log_delivery_attempt(notification, 'email', 'delivered')
        logger.info(f"Email notification sent to {notification.user.email}")
        
    except Exception as e:
        logger.error(f"Error sending email notification: {str(e)}")
        log_delivery_attempt(notification, 'email', 'failed', error_message=str(e))


def send_push_notification(notification):
    """Send push notification (WebSocket or service worker)"""
    try:
        # In a real implementation, you would:
        # 1. Send WebSocket message to connected clients
        # 2. Use a push notification service like Firebase Cloud Messaging
        # 3. Use browser push notifications
        
        # For now, we'll just log it
        logger.info(f"Push notification sent to {notification.user.email}: {notification.title}")
        
        # Log delivery
        log_delivery_attempt(notification, 'push', 'delivered')
        
    except Exception as e:
        logger.error(f"Error sending push notification: {str(e)}")
        log_delivery_attempt(notification, 'push', 'failed', error_message=str(e))


def send_sms_notification(notification):
    """Send SMS notification"""
    try:
        # In a real implementation, you would integrate with an SMS service
        # like Twilio, AWS SNS, or a local SMS gateway
        
        # For now, we'll just log it
        logger.info(f"SMS notification sent to {notification.user.email}: {notification.title}")
        
        # Log delivery
        log_delivery_attempt(notification, 'sms', 'delivered')
        
    except Exception as e:
        logger.error(f"Error sending SMS notification: {str(e)}")
        log_delivery_attempt(notification, 'sms', 'failed', error_message=str(e))


def create_notification_from_template(template, user, variables):
    """Create notification from template with variable substitution"""
    try:
        # Substitute variables in title and message
        title = template.title_template.format(**variables)
        message = template.message_template.format(**variables)
        
        # Create notification
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=template.notification_type,
            priority=template.default_priority,
            send_email=template.default_send_email,
            send_push=template.default_send_push,
            send_sms=template.default_send_sms,
            expires_at=timezone.now() + timedelta(hours=template.default_expiry_hours),
            metadata={'template_name': template.name, 'variables': variables}
        )
        
        return notification
        
    except KeyError as e:
        logger.error(f"Missing variable {e} in template {template.name}")
        raise
    except Exception as e:
        logger.error(f"Error creating notification from template: {str(e)}")
        raise


def is_in_quiet_hours(preferences):
    """Check if current time is within user's quiet hours"""
    if not preferences.quiet_hours_enabled:
        return False
    
    if not preferences.quiet_hours_start or not preferences.quiet_hours_end:
        return False
    
    now = timezone.now().time()
    start = preferences.quiet_hours_start
    end = preferences.quiet_hours_end
    
    # Handle quiet hours that cross midnight
    if start <= end:
        return start <= now <= end
    else:
        return now >= start or now <= end


def check_rate_limits(user, preferences):
    """Check if user has exceeded notification rate limits"""
    now = timezone.now()
    
    # Check hourly limit
    hour_ago = now - timedelta(hours=1)
    hourly_count = Notification.objects.filter(
        user=user,
        created_at__gte=hour_ago
    ).count()
    
    if hourly_count >= preferences.max_notifications_per_hour:
        return False
    
    # Check daily limit
    day_ago = now - timedelta(days=1)
    daily_count = Notification.objects.filter(
        user=user,
        created_at__gte=day_ago
    ).count()
    
    if daily_count >= preferences.max_notifications_per_day:
        return False
    
    return True


def log_delivery_attempt(notification, channel, status, error_message=''):
    """Log notification delivery attempt"""
    try:
        NotificationDeliveryLog.objects.create(
            notification=notification,
            channel=channel,
            status=status,
            error_message=error_message,
            delivered_at=timezone.now() if status == 'delivered' else None
        )
    except Exception as e:
        logger.error(f"Error logging delivery attempt: {str(e)}")


def cleanup_expired_notifications():
    """Clean up expired notifications (run as periodic task)"""
    try:
        expired_count = Notification.objects.filter(
            expires_at__lt=timezone.now(),
            is_read=True
        ).delete()[0]
        
        logger.info(f"Cleaned up {expired_count} expired notifications")
        return expired_count
        
    except Exception as e:
        logger.error(f"Error cleaning up expired notifications: {str(e)}")
        return 0


def generate_notification_analytics():
    """Generate daily notification analytics (run as periodic task)"""
    try:
        today = timezone.now().date()
        
        # Get notifications for today
        notifications = Notification.objects.filter(created_at__date=today)
        
        # Group by type
        for notification_type, _ in Notification.NOTIFICATION_TYPES:
            type_notifications = notifications.filter(notification_type=notification_type)
            
            if type_notifications.exists():
                total_sent = type_notifications.count()
                total_delivered = type_notifications.filter(is_delivered=True).count()
                total_read = type_notifications.filter(is_read=True).count()
                
                # Calculate rates
                delivery_rate = (total_delivered / total_sent * 100) if total_sent > 0 else 0
                read_rate = (total_read / total_delivered * 100) if total_delivered > 0 else 0
                
                # Channel breakdown
                email_sent = type_notifications.filter(send_email=True).count()
                push_sent = type_notifications.filter(send_push=True).count()
                sms_sent = type_notifications.filter(send_sms=True).count()
                
                # Create or update analytics record
                analytics, created = NotificationAnalytics.objects.get_or_create(
                    date=today,
                    notification_type=notification_type,
                    defaults={
                        'total_sent': total_sent,
                        'total_delivered': total_delivered,
                        'total_read': total_read,
                        'delivery_rate': delivery_rate,
                        'read_rate': read_rate,
                        'email_sent': email_sent,
                        'push_sent': push_sent,
                        'sms_sent': sms_sent
                    }
                )
                
                if not created:
                    analytics.total_sent = total_sent
                    analytics.total_delivered = total_delivered
                    analytics.total_read = total_read
                    analytics.delivery_rate = delivery_rate
                    analytics.read_rate = read_rate
                    analytics.email_sent = email_sent
                    analytics.push_sent = push_sent
                    analytics.sms_sent = sms_sent
                    analytics.save()
        
        logger.info(f"Generated notification analytics for {today}")
        return True
        
    except Exception as e:
        logger.error(f"Error generating notification analytics: {str(e)}")
        return False
