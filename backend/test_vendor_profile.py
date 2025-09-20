#!/usr/bin/env python
"""
Test script to check vendor profile endpoint
"""
import requests
import json

# Test the vendor profile endpoint
try:
    # Test without authentication (should return 401)
    response = requests.get('http://localhost:8000/api/vendor-profiles/my_profile/')
    print(f"Vendor profile endpoint status (no auth): {response.status_code}")
    print(f"Response: {response.text}")
    
    # Test the list endpoint
    response = requests.get('http://localhost:8000/api/vendor-profiles/')
    print(f"Vendor profiles list status: {response.status_code}")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"Error testing endpoints: {e}")
