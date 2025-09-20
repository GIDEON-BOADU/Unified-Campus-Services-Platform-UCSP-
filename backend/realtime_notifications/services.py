"""
Notification service for sending real-time notifications.
"""
import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Notification, NotificationPreference

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service class for managing and sending real-time notifications.
    """
    
    def __init__(self):
        self.channel_layer = get_channel_layer()
    
    def send_notification(self, recipient, title, message, notification_type, 
                         priority='medium', related_service=None, related_booking=None, 
                         related_order=None, extra_data=None):
        """
        Send a notification to a user.
        
        Args:
            recipient: User object or user ID
            title (str): Notification title
            message (str): Notification message
            notification_type (str): Type of notification
            priority (str): Priority level (low, medium, high, urgent)
            related_service: Related service object
            related_booking: Related booking object
            related_order: Related order object
            extra_data (dict): Additional data
        """
        try:
            # Get user object if ID was passed
            if isinstance(recipient, int):
                recipient = User.objects.get(id=recipient)
            
            # Check user notification preferences
            if not self._should_send_notification(recipient, notification_type):
                logger.info(f"Skipping notification for {recipient.username} due to preferences")
                return None
            
            # Create notification in database
            notification = Notification.objects.create(
                recipient=recipient,
                title=title,
                message=message,
                notification_type=notification_type,
                priority=priority,
                related_service=related_service,
                related_booking=related_booking,
                related_order=related_order,
                extra_data=extra_data or {}
            )
            
            # Send via WebSocket
            self._send_websocket_notification(recipient, notification)
            
            logger.info(f"Notification sent to {recipient.username}: {title}")
            return notification
            
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            return None
    
    def send_booking_notification(self, booking):
        """
        Send notification when a new booking is created.
        
        Args:
            booking: Booking object
        """
        vendor = booking.service.vendor
        student = booking.student
        
        # Notification for vendor
        vendor_title = f"New Booking for {booking.service.service_name}"
        vendor_message = (
            f"Student {student.username} has booked your service "
            f"'{booking.service.service_name}' for {booking.booking_date.strftime('%Y-%m-%d at %H:%M')}. "
            f"Notes: {booking.notes or 'No special requests'}"
        )
        
        self.send_notification(
            recipient=vendor,
            title=vendor_title,
            message=vendor_message,
            notification_type='booking_created',
            priority='high',
            related_service=booking.service,
            related_booking=booking,
            extra_data={
                'student_name': student.username,
                'student_email': student.email,
                'booking_date': booking.booking_date.isoformat(),
                'special_requests': booking.notes or ''
            }
        )
        
        # Notification for student (confirmation)
        student_title = f"Booking Confirmed: {booking.service.service_name}"
        student_message = (
            f"Your booking for '{booking.service.service_name}' has been confirmed "
            f"for {booking.booking_date.strftime('%Y-%m-%d at %H:%M')}. "
            f"Vendor: {vendor.username}"
        )
        
        self.send_notification(
            recipient=student,
            title=student_title,
            message=student_message,
            notification_type='booking_confirmed',
            priority='medium',
            related_service=booking.service,
            related_booking=booking,
            extra_data={
                'vendor_name': vendor.username,
                'vendor_business': getattr(vendor, 'vendorprofile', {}).get('business_name', 'Unknown Business') if hasattr(vendor, 'vendorprofile') else 'Unknown Business',
                'booking_date': booking.booking_date.isoformat()
            }
        )
    
    def send_order_notification(self, order):
        """
        Send notification when a new order is created.
        
        Args:
            order: Order object
        """
        vendor = order.service.vendor
        customer = order.customer
        
        # Notification for vendor
        vendor_title = f"New Order for {order.service.service_name}"
        vendor_message = (
            f"Customer {customer.username} has placed an order for "
            f"'{order.service.service_name}' (Quantity: {order.quantity}). "
            f"Total: GHS {order.total_amount:.2f}"
        )
        
        self.send_notification(
            recipient=vendor,
            title=vendor_title,
            message=vendor_message,
            notification_type='order_created',
            priority='high',
            related_service=order.service,
            related_order=order,
            extra_data={
                'customer_name': customer.username,
                'customer_email': customer.email,
                'quantity': order.quantity,
                'total_amount': float(order.total_amount),
                'order_date': order.created_at.isoformat()
            }
        )
        
        # Notification for customer (confirmation)
        customer_title = f"Order Placed: {order.service.service_name}"
        customer_message = (
            f"Your order for '{order.service.service_name}' has been placed successfully. "
            f"Total: GHS {order.total_amount:.2f}. Vendor: {vendor.username}"
        )
        
        self.send_notification(
            recipient=customer,
            title=customer_title,
            message=customer_message,
            notification_type='order_confirmed',
            priority='medium',
            related_service=order.service,
            related_order=order,
            extra_data={
                'vendor_name': vendor.username,
                'vendor_business': getattr(vendor, 'vendorprofile', {}).get('business_name', 'Unknown Business') if hasattr(vendor, 'vendorprofile') else 'Unknown Business',
                'quantity': order.quantity,
                'total_amount': float(order.total_amount)
            }
        )
    
    def send_payment_notification(self, payment):
        """
        Send notification when a payment is received.
        
        Args:
            payment: Payment object
        """
        vendor = payment.booking.service.vendor if payment.booking else None
        customer = payment.booking.student if payment.booking else None
        
        if vendor:
            vendor_title = f"Payment Received: GHS {payment.amount:.2f}"
            vendor_message = (
                f"Payment of GHS {payment.amount:.2f} has been received for "
                f"'{payment.booking.service.service_name}' from {customer.username if customer else 'Customer'}"
            )
            
            self.send_notification(
                recipient=vendor,
                title=vendor_title,
                message=vendor_message,
                notification_type='payment_received',
                priority='high',
                related_service=payment.booking.service if payment.booking else None,
                related_booking=payment.booking,
                extra_data={
                    'amount': float(payment.amount),
                    'payment_method': payment.payment_method,
                    'customer_name': customer.username if customer else 'Unknown',
                    'transaction_id': payment.transaction_id
                }
            )
    
    def send_review_notification(self, review):
        """
        Send notification when a new review is received.
        
        Args:
            review: Review object
        """
        vendor = review.service.vendor
        reviewer = review.user
        
        vendor_title = f"New Review for {review.service.service_name}"
        vendor_message = (
            f"User {reviewer.username} has left a {review.rating}-star review for "
            f"'{review.service.service_name}': {review.comment[:100]}{'...' if len(review.comment) > 100 else ''}"
        )
        
        self.send_notification(
            recipient=vendor,
            title=vendor_title,
            message=vendor_message,
            notification_type='review_received',
            priority='medium',
            related_service=review.service,
            extra_data={
                'reviewer_name': reviewer.username,
                'rating': review.rating,
                'comment': review.comment,
                'review_date': review.created_at.isoformat()
            }
        )
    
    def send_system_announcement(self, title, message, user_type=None, priority='medium'):
        """
        Send system announcement to users.
        
        Args:
            title (str): Announcement title
            message (str): Announcement message
            user_type (str): Target user type (None for all users)
            priority (str): Priority level
        """
        users = User.objects.all()
        if user_type:
            users = users.filter(user_type=user_type)
        
        for user in users:
            self.send_notification(
                recipient=user,
                title=title,
                message=message,
                notification_type='system_announcement',
                priority=priority,
                extra_data={'announcement_type': 'system'}
            )
    
    def _should_send_notification(self, user, notification_type):
        """
        Check if user should receive notification based on preferences.
        
        Args:
            user: User object
            notification_type (str): Type of notification
            
        Returns:
            bool: True if user should receive notification
        """
        try:
            preferences = user.notification_preferences
            return preferences.should_receive_notification(notification_type)
        except NotificationPreference.DoesNotExist:
            # Create default preferences if they don't exist
            NotificationPreference.objects.create(user=user)
            return True
    
    def _send_websocket_notification(self, user, notification):
        """
        Send notification via WebSocket.
        
        Args:
            user: User object
            notification: Notification object
        """
        try:
            # Prepare notification data
            notification_data = {
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'type': notification.notification_type,
                'priority': notification.priority,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat(),
                'related_service_id': notification.related_service_id,
                'related_booking_id': notification.related_booking_id,
                'related_order_id': notification.related_order_id,
                'extra_data': notification.extra_data,
            }
            
            # Send to user-specific group
            group_name = f"user_{user.id}"
            async_to_sync(self.channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_message',
                    'notification': notification_data
                }
            )
            
            # Send to vendor-specific group if user is a vendor
            if user.user_type == 'vendor':
                vendor_group_name = f"vendor_{user.id}"
                async_to_sync(self.channel_layer.group_send)(
                    vendor_group_name,
                    {
                        'type': 'vendor_notification',
                        'notification': notification_data
                    }
                )
            
            # Mark notification as sent
            notification.mark_as_sent()
            
            # Send notification count update
            unread_count = Notification.objects.filter(
                recipient=user,
                is_read=False
            ).count()
            
            async_to_sync(self.channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_count_update',
                    'count': unread_count
                }
            )
            
        except Exception as e:
            logger.error(f"Error sending WebSocket notification: {e}")


# Global notification service instance
notification_service = NotificationService()
