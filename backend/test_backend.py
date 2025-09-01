#!/usr/bin/env python
"""
Simple test script to verify backend imports are working correctly.
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UCSP_PRJ.settings')
django.setup()

def test_imports():
    """Test that all critical imports are working."""
    try:
        # Test service imports
        from services.models import Service, Order, Review, VendorProfile
        print("✅ Service models imported successfully")
        
        from services.serializers import (
            ServiceSerializer, ServiceListSerializer, ServiceAvailabilitySerializer,
            OrderSerializer, OrderStatusUpdateSerializer, ServiceContactSerializer,
            ReviewSerializer, VendorProfileSerializer
        )
        print("✅ Service serializers imported successfully")
        
        from services.views import (
            ServiceViewSet, OrderViewSet, ReviewViewSet, VendorProfileViewSet
        )
        print("✅ Service views imported successfully")
        
        # Test user imports
        from users.models import User
        print("✅ User models imported successfully")
        
        # Test common imports
        from common.models import Timestamped
        print("✅ Common models imported successfully")
        
        print("\n🎉 All imports successful! Backend should be working correctly.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("Testing backend imports...")
    success = test_imports()
    sys.exit(0 if success else 1)
