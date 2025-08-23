from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test student user for vendor application testing'

    def handle(self, *args, **options):
        # Create test student user
        try:
            student, created = User.objects.get_or_create(
                username='student',
                defaults={
                    'email': 'student@ucsp.com',
                    'first_name': 'Test',
                    'last_name': 'Student',
                    'user_type': 'student',
                    'phone_number': '1111111111',
                    'is_active': True,
                }
            )
            
            if created:
                student.set_password('testpass123')
                student.save()
                self.stdout.write(
                    self.style.SUCCESS('Successfully created test student user')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('Test student user already exists')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating student user: {e}')
            )
        
        # Create test vendor user
        try:
            vendor, created = User.objects.get_or_create(
                username='vendor',
                defaults={
                    'email': 'vendor@ucsp.com',
                    'first_name': 'Test',
                    'last_name': 'Vendor',
                    'user_type': 'vendor',
                    'phone_number': '2222222222',
                    'is_active': True,
                }
            )
            
            if created:
                vendor.set_password('testpass123')
                vendor.save()
                self.stdout.write(
                    self.style.SUCCESS('Successfully created test vendor user')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('Test vendor user already exists')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating vendor user: {e}')
            )
        
        # Update admin user type
        try:
            admin_user = User.objects.filter(username='admin').first()
            if admin_user:
                admin_user.user_type = 'admin'
                admin_user.save()
                self.stdout.write(
                    self.style.SUCCESS('Updated admin user type')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error updating admin user: {e}')
            )
        
        self.stdout.write(
            self.style.SUCCESS('Test users created/updated successfully!')
        )
        self.stdout.write('Student: username=student, password=testpass123')
        self.stdout.write('Vendor: username=vendor, password=testpass123')
        self.stdout.write('Admin: username=admin, password=<your_admin_password>') 