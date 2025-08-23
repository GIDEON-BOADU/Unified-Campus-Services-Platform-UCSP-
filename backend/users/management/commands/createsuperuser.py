from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser with proper phone number handling'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username')
        parser.add_argument('--email', type=str, help='Email')
        parser.add_argument('--phone', type=str, help='Phone number')
        parser.add_argument('--password', type=str, help='Password')

    def handle(self, *args, **options):
        try:
            # Get user input
            username = options['username'] or input('Username: ')
            email = options['email'] or input('Email: ')
            phone = options['phone'] or input('Phone number (at least 10 digits): ')
            password = options['password'] or input('Password: ')

            # Validate phone number
            if not phone.isdigit() or len(phone) < 10:
                self.stdout.write(
                    self.style.ERROR('Phone number must contain at least 10 digits')
                )
                return

            # Check if user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.ERROR(f'User with username "{username}" already exists')
                )
                return

            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.ERROR(f'User with email "{email}" already exists')
                )
                return

            if User.objects.filter(phone_number=phone).exists():
                self.stdout.write(
                    self.style.ERROR(f'User with phone number "{phone}" already exists')
                )
                return

            # Create superuser
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                phone_number=phone,
                user_type='admin',
                first_name='Admin',
                last_name='User'
            )

            self.stdout.write(
                self.style.SUCCESS(f'Superuser "{username}" created successfully!')
            )

        except IntegrityError as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Unexpected error: {e}')
            ) 