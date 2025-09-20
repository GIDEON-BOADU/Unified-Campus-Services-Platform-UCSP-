"""
WebSocket consumers for real-time notifications.
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import Notification, NotificationPreference

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications.
    
    Handles:
    - User authentication via JWT tokens
    - Joining user-specific notification groups
    - Sending notifications to connected users
    - Managing notification read status
    """
    
    async def connect(self):
        """Handle WebSocket connection."""
        # Get user from query parameters or headers
        self.user = await self.get_user_from_token()
        
        if self.user and not isinstance(self.user, AnonymousUser):
            # Create user-specific group name
            self.group_name = f"user_{self.user.id}"
            
            # Join user-specific group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # Accept the connection
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to notifications',
                'user_id': self.user.id,
                'username': self.user.username
            }))
            
            logger.info(f"User {self.user.username} connected to notifications")
        else:
            # Reject connection for unauthenticated users
            await self.close(code=4001)
            logger.warning("Unauthenticated user attempted to connect to notifications")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'group_name'):
            # Leave user-specific group
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            logger.info(f"User {self.user.username if self.user else 'Unknown'} disconnected from notifications")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_as_read':
                # Mark notification as read
                notification_id = data.get('notification_id')
                if notification_id:
                    await self.mark_notification_as_read(notification_id)
            
            elif message_type == 'get_unread_count':
                # Send unread notification count
                count = await self.get_unread_count()
                await self.send(text_data=json.dumps({
                    'type': 'unread_count',
                    'count': count
                }))
            
            elif message_type == 'get_recent_notifications':
                # Send recent notifications
                limit = data.get('limit', 10)
                notifications = await self.get_recent_notifications(limit)
                await self.send(text_data=json.dumps({
                    'type': 'recent_notifications',
                    'notifications': notifications
                }))
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received from WebSocket")
        except Exception as e:
            logger.error(f"Error processing WebSocket message: {e}")
    
    async def notification_message(self, event):
        """Handle notification messages from the group."""
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))
    
    async def notification_count_update(self, event):
        """Handle notification count updates."""
        await self.send(text_data=json.dumps({
            'type': 'notification_count_update',
            'count': event['count']
        }))
    
    @database_sync_to_async
    def get_user_from_token(self):
        """Get user from JWT token in query parameters or headers."""
        try:
            # Try to get token from query parameters
            token = self.scope['query_string'].decode().split('token=')[-1].split('&')[0]
            
            if not token:
                # Try to get token from headers
                headers = dict(self.scope['headers'])
                auth_header = headers.get(b'authorization', b'').decode()
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
            
            if token:
                # Validate JWT token
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                return User.objects.get(id=user_id)
            
        except (TokenError, User.DoesNotExist, IndexError, KeyError) as e:
            logger.error(f"Token validation failed: {e}")
        
        return AnonymousUser()
    
    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        """Mark a notification as read."""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=self.user
            )
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            logger.error(f"Notification {notification_id} not found for user {self.user.id}")
            return False
    
    @database_sync_to_async
    def get_unread_count(self):
        """Get unread notification count for the user."""
        return Notification.objects.filter(
            recipient=self.user,
            is_read=False
        ).count()
    
    @database_sync_to_async
    def get_recent_notifications(self, limit=10):
        """Get recent notifications for the user."""
        notifications = Notification.objects.filter(
            recipient=self.user
        ).order_by('-created_at')[:limit]
        
        return [
            {
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
            for notification in notifications
        ]


class VendorNotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer specifically for vendor notifications.
    
    This consumer is optimized for vendors who need to receive
    real-time notifications about their services, bookings, and orders.
    """
    
    async def connect(self):
        """Handle WebSocket connection for vendors."""
        self.user = await self.get_user_from_token()
        
        if (self.user and 
            not isinstance(self.user, AnonymousUser) and 
            self.user.user_type == 'vendor'):
            
            # Create vendor-specific group name
            self.group_name = f"vendor_{self.user.id}"
            
            # Join vendor-specific group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # Also join general vendor notifications group
            await self.channel_layer.group_add(
                "vendor_notifications",
                self.channel_name
            )
            
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'vendor_connection_established',
                'message': 'Connected to vendor notifications',
                'vendor_id': self.user.id,
                'business_name': getattr(self.user.vendorprofile, 'business_name', 'Unknown Business')
            }))
            
            logger.info(f"Vendor {self.user.username} connected to notifications")
        else:
            await self.close(code=4001)
            logger.warning("Non-vendor user attempted to connect to vendor notifications")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            await self.channel_layer.group_discard(
                "vendor_notifications",
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'get_vendor_stats':
                # Send vendor-specific statistics
                stats = await self.get_vendor_stats()
                await self.send(text_data=json.dumps({
                    'type': 'vendor_stats',
                    'stats': stats
                }))
            
            elif message_type == 'get_service_notifications':
                # Send notifications for specific service
                service_id = data.get('service_id')
                if service_id:
                    notifications = await self.get_service_notifications(service_id)
                    await self.send(text_data=json.dumps({
                        'type': 'service_notifications',
                        'service_id': service_id,
                        'notifications': notifications
                    }))
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received from vendor WebSocket")
        except Exception as e:
            logger.error(f"Error processing vendor WebSocket message: {e}")
    
    async def vendor_notification(self, event):
        """Handle vendor-specific notifications."""
        await self.send(text_data=json.dumps({
            'type': 'vendor_notification',
            'notification': event['notification']
        }))
    
    @database_sync_to_async
    def get_user_from_token(self):
        """Get user from JWT token."""
        try:
            token = self.scope['query_string'].decode().split('token=')[-1].split('&')[0]
            
            if not token:
                headers = dict(self.scope['headers'])
                auth_header = headers.get(b'authorization', b'').decode()
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
            
            if token:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                return User.objects.get(id=user_id)
            
        except (TokenError, User.DoesNotExist, IndexError, KeyError):
            pass
        
        return AnonymousUser()
    
    @database_sync_to_async
    def get_vendor_stats(self):
        """Get vendor-specific statistics."""
        from services.models import Service, Order
        from bookings.models import Booking
        
        return {
            'total_services': Service.objects.filter(vendor=self.user).count(),
            'active_services': Service.objects.filter(vendor=self.user, is_available=True).count(),
            'total_orders': Order.objects.filter(service__vendor=self.user).count(),
            'pending_orders': Order.objects.filter(service__vendor=self.user, status='pending').count(),
            'total_bookings': Booking.objects.filter(service__vendor=self.user).count(),
            'pending_bookings': Booking.objects.filter(service__vendor=self.user, booking_status='pending').count(),
            'unread_notifications': Notification.objects.filter(
                recipient=self.user,
                is_read=False
            ).count(),
        }
    
    @database_sync_to_async
    def get_service_notifications(self, service_id):
        """Get notifications for a specific service."""
        notifications = Notification.objects.filter(
            recipient=self.user,
            related_service_id=service_id
        ).order_by('-created_at')[:20]
        
        return [
            {
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'type': notification.notification_type,
                'priority': notification.priority,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat(),
                'extra_data': notification.extra_data,
            }
            for notification in notifications
        ]
