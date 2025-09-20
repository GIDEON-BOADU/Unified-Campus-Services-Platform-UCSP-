#!/usr/bin/env python
"""
Script to create vendor profiles for existing vendor users
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UCSP_PRJ.settings')
django.setup()

from users.models import User
from services.models import VendorProfile

def create_vendor_profiles():
    """Create vendor profiles for all vendor users without profiles"""
    
    # Get all vendor users
    vendor_users = User.objects.filter(user_type='vendor')
    print(f'Found {vendor_users.count()} vendor users')
    
    created_count = 0
    
    for user in vendor_users:
        try:
            # Check if profile already exists
            profile = user.vendor_profile
            print(f'✓ User {user.username} already has profile: {profile.business_name}')
        except VendorProfile.DoesNotExist:
            # Create profile for this vendor
            profile = VendorProfile.objects.create(
                user=user,
                business_name=f'{user.username}\'s Business',
                description=f'Business description for {user.username}',
                business_hours='Mon-Fri 9AM-6PM',
                address='Campus Location',
                phone=user.phone_number or 'N/A',
                email=user.email,
                is_verified=False,
                is_active=True
            )
            created_count += 1
            print(f'✓ Created profile for {user.username}: {profile.business_name}')
    
    print(f'\n📊 Summary:')
    print(f'  - Vendor users: {vendor_users.count()}')
    print(f'  - Profiles created: {created_count}')
    print(f'  - Total vendor profiles: {VendorProfile.objects.count()}')
    
    return created_count

if __name__ == '__main__':
    create_vendor_profiles()
