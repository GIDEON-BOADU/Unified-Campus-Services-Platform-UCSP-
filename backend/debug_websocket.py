#!/usr/bin/env python3
"""
Debug WebSocket connection and notification flow.
"""
import os
import django
import asyncio
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UCSP_PRJ.settings')
django.setup()

from django.contrib.auth import get_user_model
from realtime_notifications.services import notification_service

User = get_user_model()

def test_websocket_flow():
    """Test the complete WebSocket notification flow."""
    print("🔍 Debugging WebSocket Notification Flow...")
    
    try:
        # Get test users
        vendor = User.objects.filter(user_type='vendor').first()
        student = User.objects.filter(user_type='student').first()
        
        if not vendor or not student:
            print("❌ No test users found. Please create test users first.")
            return
        
        print(f"✅ Found users: {vendor.username} (vendor), {student.username} (student)")
        
        # Test 1: Send notification to student
        print("\n📧 Test 1: Sending notification to student...")
        notification = notification_service.send_notification(
            recipient=student,
            title="Test Notification for Student",
            message="This is a test notification to verify WebSocket flow.",
            notification_type='system_announcement',
            priority='medium'
        )
        
        if notification:
            print(f"✅ Student notification created: {notification.id}")
        else:
            print("❌ Failed to create student notification")
        
        # Test 2: Send notification to vendor
        print("\n📧 Test 2: Sending notification to vendor...")
        vendor_notification = notification_service.send_notification(
            recipient=vendor,
            title="Test Notification for Vendor",
            message="This is a test notification to verify vendor WebSocket flow.",
            notification_type='system_announcement',
            priority='high'
        )
        
        if vendor_notification:
            print(f"✅ Vendor notification created: {vendor_notification.id}")
        else:
            print("❌ Failed to create vendor notification")
        
        # Test 3: Test channel layer directly
        print("\n🔌 Test 3: Testing channel layer directly...")
        channel_layer = get_channel_layer()
        
        # Test message for student
        student_message = {
            'type': 'notification_message',
            'notification': {
                'id': 999,
                'title': 'Direct Channel Test',
                'message': 'This is a direct channel layer test message.',
                'type': 'test',
                'priority': 'medium',
                'is_read': False,
                'created_at': '2024-01-01T00:00:00Z'
            }
        }
        
        # Send to student group
        async_to_sync(channel_layer.group_send)(
            f"user_{student.id}",
            student_message
        )
        print("✅ Direct message sent to student group")
        
        # Test message for vendor
        vendor_message = {
            'type': 'vendor_notification',
            'notification': {
                'id': 998,
                'title': 'Direct Vendor Test',
                'message': 'This is a direct vendor channel test message.',
                'type': 'test',
                'priority': 'high',
                'is_read': False,
                'created_at': '2024-01-01T00:00:00Z'
            }
        }
        
        # Send to vendor group
        async_to_sync(channel_layer.group_send)(
            f"vendor_{vendor.id}",
            vendor_message
        )
        print("✅ Direct message sent to vendor group")
        
        print("\n🎉 WebSocket flow test completed!")
        print("\n📋 Next steps:")
        print("1. Check browser console for WebSocket connection logs")
        print("2. Look for 'WebSocket connected to:' messages")
        print("3. Check for 'WebSocket message received:' messages")
        print("4. Verify notification bell shows unread count")
        
    except Exception as e:
        print(f"❌ Error during WebSocket flow test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_websocket_flow()
