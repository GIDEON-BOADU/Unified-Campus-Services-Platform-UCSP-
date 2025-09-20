#!/usr/bin/env python3
"""
Test WebSocket connection directly to identify the issue.
"""
import asyncio
import websockets
import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UCSP_PRJ.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

def test_websocket_connection():
    """Test WebSocket connection with real authentication."""
    print("🔍 Testing WebSocket Connection...")
    
    # Get a real user and create a token
    user = User.objects.filter(user_type='student').first()
    if not user:
        print("❌ No student user found")
        return
    
    # Create a real JWT token
    token = AccessToken.for_user(user)
    print(f"✅ Created token for user: {user.username}")
    print(f"Token: {str(token)[:50]}...")
    
    # Test user notifications endpoint
    uri = f"ws://localhost:8000/ws/notifications/?token={token}"
    print(f"🔌 Connecting to: {uri}")
    
    async def connect_and_test():
        try:
            async with websockets.connect(uri) as websocket:
                print("✅ WebSocket connected successfully!")
                
                # Wait for connection message
                message = await websocket.recv()
                print(f"📨 Received message: {message}")
                
                # Send a test message
                await websocket.send(json.dumps({
                    "type": "get_unread_count"
                }))
                
                # Wait for response
                response = await websocket.recv()
                print(f"📨 Response: {response}")
                
                print("✅ WebSocket test completed successfully!")
                
        except Exception as e:
            print(f"❌ WebSocket connection failed: {e}")
            print(f"Error type: {type(e).__name__}")
    
    asyncio.run(connect_and_test())

if __name__ == '__main__':
    test_websocket_connection()
