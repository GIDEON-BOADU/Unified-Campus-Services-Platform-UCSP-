#!/usr/bin/env python
"""
Simple test script to check if analytics endpoint is working
"""
import requests
import json

# Test the analytics endpoint
try:
    # Test the test endpoint first
    response = requests.get('http://localhost:8000/api/analytics/test/')
    print(f"Test endpoint status: {response.status_code}")
    print(f"Test endpoint response: {response.text}")
    
    # Test the vendor analytics endpoint (will fail due to auth, but should show proper error)
    response = requests.get('http://localhost:8000/api/analytics/vendor/current?range=30d')
    print(f"Vendor analytics status: {response.status_code}")
    print(f"Vendor analytics response: {response.text}")
    
except Exception as e:
    print(f"Error testing endpoints: {e}")
