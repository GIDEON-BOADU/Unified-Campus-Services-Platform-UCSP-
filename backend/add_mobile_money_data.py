#!/usr/bin/env python
"""
Script to add sample mobile money data to existing vendor profiles for testing.
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UCSP_PRJ.settings')
django.setup()

from services.models import VendorProfile

def add_mobile_money_data():
    """Add sample mobile money data to vendor profiles."""
    print("Adding mobile money data to vendor profiles...")
    
    # Get all vendor profiles
    vendor_profiles = VendorProfile.objects.all()
    
    if not vendor_profiles.exists():
        print("No vendor profiles found. Please create some vendors first.")
        return
    
    # Sample mobile money numbers
    sample_data = [
        {
            'mtn_momo_number': '0241234567',
            'airtel_money_number': '0261234567',
            'telecel_cash_number': '0271234567',
            'preferred_payment_method': 'mtn_momo'
        },
        {
            'mtn_momo_number': '0247654321',
            'airtel_money_number': '0267654321',
            'telecel_cash_number': '0277654321',
        },
        {
            'mtn_momo_number': '0249876543',
            'airtel_money_number': '0269876543',
            'telecel_cash_number': '0279876543',
            'preferred_payment_method': 'airtel_money'
        }
    ]
    
    updated_count = 0
    
    for i, profile in enumerate(vendor_profiles):
        # Use sample data in rotation
        sample = sample_data[i % len(sample_data)]
        
        # Only update if mobile money fields are empty
        if not profile.mtn_momo_number and not profile.vodafone_cash_number:
            profile.mtn_momo_number = sample['mtn_momo_number']
            profile.vodafone_cash_number = sample['vodafone_cash_number']
            profile.airtel_money_number = sample['airtel_money_number']
            profile.telecel_cash_number = sample['telecel_cash_number']
            profile.preferred_payment_method = sample['preferred_payment_method']
            profile.save()
            
            updated_count += 1
            print(f"Updated {profile.business_name} with mobile money data")
    
    print(f"Successfully updated {updated_count} vendor profiles with mobile money data.")

if __name__ == '__main__':
    add_mobile_money_data()
