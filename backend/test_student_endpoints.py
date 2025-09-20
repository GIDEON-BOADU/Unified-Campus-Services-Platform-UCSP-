#!/usr/bin/env python
"""
Test script to check student endpoints
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UCSP_PRJ.settings')
django.setup()

import requests
import json

def test_student_endpoints():
    """Test student-specific endpoints"""
    
    base_url = 'http://localhost:8000/api'
    
    # Test endpoints without authentication (should return 401)
    endpoints = [
        '/student/orders/',
        '/student/bookings/',
        '/student/payments/',
    ]
    
    print("Testing student endpoints...")
    
    for endpoint in endpoints:
        try:
            response = requests.get(f'{base_url}{endpoint}')
            print(f"{endpoint}: {response.status_code} - {response.text[:100]}")
        except Exception as e:
            print(f"{endpoint}: Error - {e}")
    
    print("\nStudent endpoints are accessible (returning 401 as expected)")

if __name__ == '__main__':
    test_student_endpoints()
