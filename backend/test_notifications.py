#!/usr/bin/env python
"""
Test script for the notification system.
"""
import os
import django
import asyncio
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UCSP_PRJ.settings')
django.setup()

from django.contrib.auth import get_user_model
from realtime_notifications.services import notification_service
from services.models import Service
from bookings.models import Booking

User = get_user_model()

async def test_notification_system():
    """Test the notification system."""
    print("🧪 Testing Notification System...")
    
    # Get test users
    try:
        vendor = await sync_to_async(User.objects.filter(user_type='vendor').first)()
        student = await sync_to_async(User.objects.filter(user_type='student').first)()
        
        if not vendor or not student:
            print("❌ No vendor or student users found. Please create test users first.")
            return
        
        print(f"✅ Found test users: {vendor.username} (vendor), {student.username} (student)")
        
        # Test 1: Send a simple notification
        print("\n📧 Test 1: Sending simple notification...")
        notification = await sync_to_async(notification_service.send_notification)(
            recipient=vendor,
            title="Test Notification",
            message="This is a test notification from the system.",
            notification_type='system_announcement',
            priority='medium'
        )
        
        if notification:
            print(f"✅ Simple notification sent: {notification.id}")
        else:
            print("❌ Failed to send simple notification")
        
        # Test 2: Send multiple notifications
        print("\n📧 Test 2: Sending multiple notifications...")
        
        # Send notification to student
        student_notification = await sync_to_async(notification_service.send_notification)(
            recipient=student,
            title="Welcome to UCSP!",
            message="Thank you for joining our platform. You can now book services and place orders.",
            notification_type='system_announcement',
            priority='medium'
        )
        
        if student_notification:
            print(f"✅ Student notification sent: {student_notification.id}")
        
        # Send notification to vendor
        vendor_notification = await sync_to_async(notification_service.send_notification)(
            recipient=vendor,
            title="New Student Registered",
            message=f"Student {student.username} has joined the platform and can now book your services.",
            notification_type='system_announcement',
            priority='low'
        )
        
        if vendor_notification:
            print(f"✅ Vendor notification sent: {vendor_notification.id}")
        
        # Test 3: Test WebSocket channel layer
        print("\n🔌 Test 3: Testing WebSocket channel layer...")
        channel_layer = get_channel_layer()
        
        if channel_layer:
            # Send a test message to the vendor's notification group
            await channel_layer.group_send(
                f"vendor_{vendor.id}_notifications",
                {
                    'type': 'vendor_notification',
                    'notification': {
                        'id': 999,
                        'title': 'WebSocket Test',
                        'message': 'This is a test message via WebSocket',
                        'type': 'system_announcement',
                        'priority': 'medium',
                        'is_read': False,
                        'created_at': '2024-01-01T00:00:00Z',
                        'extra_data': {}
                    }
                }
            )
            print("✅ WebSocket test message sent")
        else:
            print("❌ Channel layer not configured properly")
        
        print("\n🎉 Notification system test completed!")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(test_notification_system())
