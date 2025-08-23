from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from services.models import Service

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample services for testing'

    def handle(self, *args, **options):
        # Get or create a vendor user
        vendor, created = User.objects.get_or_create(
            username='sample_vendor',
            defaults={
                'email': 'vendor@example.com',
                'user_type': 'vendor',
                'phone_number': '1234567890',
                'first_name': 'Sample',
                'last_name': 'Vendor',
                'is_active': True
            }
        )
        
        if created:
            vendor.set_password('vendor123')
            vendor.save()
            self.stdout.write(self.style.SUCCESS(f'Created vendor user: {vendor.username}'))
        else:
            self.stdout.write(f'Using existing vendor: {vendor.username}')

        # Sample services data
        sample_services = [
            {
                'service_name': 'Campus Food Delivery',
                'description': 'Delicious meals delivered to your dorm room. Fresh ingredients, quick delivery!',
                'category': 'food',
                'service_type': 'ordering',
                'base_price': 15.00,
                'location': 'Campus Block A',
                'contact_info': 'WhatsApp: +233 20 123 4567',
                'is_available': True,
                'availability_status': 'available'
            },
            {
                'service_name': 'Printing & Copying',
                'description': 'High-quality printing and copying services. Color and black & white available.',
                'category': 'printing',
                'service_type': 'contact',
                'base_price': 5.00,
                'location': 'Campus Library',
                'contact_info': 'Phone: +233 20 123 4568',
                'is_available': True,
                'availability_status': 'available'
            },
            {
                'service_name': 'Laundry Service',
                'description': 'Professional laundry and dry cleaning. Pickup and delivery available.',
                'category': 'laundry',
                'service_type': 'booking',
                'base_price': 20.00,
                'location': 'Campus Block B',
                'contact_info': 'WhatsApp: +233 20 123 4569',
                'is_available': True,
                'availability_status': 'available'
            },
            {
                'service_name': 'Academic Tutoring',
                'description': 'One-on-one tutoring in various subjects. Experienced tutors available.',
                'category': 'academic',
                'service_type': 'contact',
                'base_price': 25.00,
                'location': 'Campus Study Center',
                'contact_info': 'Email: tutoring@campus.edu',
                'is_available': True,
                'availability_status': 'available'
            },
            {
                'service_name': 'Campus Transportation',
                'description': 'Reliable transportation around campus and to nearby areas.',
                'category': 'transport',
                'service_type': 'contact',
                'base_price': 10.00,
                'location': 'Main Campus Gate',
                'contact_info': 'Phone: +233 20 123 4570',
                'is_available': True,
                'availability_status': 'available'
            }
        ]

        created_count = 0
        for service_data in sample_services:
            service, created = Service.objects.get_or_create(
                service_name=service_data['service_name'],
                vendor=vendor,
                defaults=service_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created service: {service.service_name}')
                )
            else:
                self.stdout.write(f'Service already exists: {service.service_name}')

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new services!')
        ) 