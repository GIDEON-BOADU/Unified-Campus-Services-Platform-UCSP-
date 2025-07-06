from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser with custom fields including phone_number'

    def handle(self, *args, **options):
        self.stdout.write('Creating superuser with custom fields...')
        
        # Get user input
        username = input('Username: ')
        email = input('Email address: ')
        phone_number = input('Phone number: ')
        password = input('Password: ')
        password_confirm = input('Password (again): ')
        
        # Validate password
        if password != password_confirm:
            self.stdout.write(self.style.ERROR('Error: Passwords do not match.'))
            return
        
        if len(password) < 9:
            self.stdout.write(self.style.ERROR('Error: Password must be at least 9 characters long.'))
            return
        
        try:
            # Create superuser
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                phone_number=phone_number,
                user_type='admin'
            )
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created successfully!'))
            
        except IntegrityError as e:
            if 'phone_number' in str(e):
                self.stdout.write(self.style.ERROR('Error: Phone number already exists. Please use a different phone number.'))
            elif 'username' in str(e):
                self.stdout.write(self.style.ERROR('Error: Username already exists. Please use a different username.'))
            else:
                self.stdout.write(self.style.ERROR(f'Error: {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating superuser: {e}')) 