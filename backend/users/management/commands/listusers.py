from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'List all users in the database'

    def handle(self, *args, **options):
        users = User.objects.all()
        
        if not users.exists():
            self.stdout.write(self.style.WARNING('No users found in database'))
            return

        self.stdout.write(self.style.SUCCESS(f'Found {users.count()} user(s):'))
        self.stdout.write('')
        
        for user in users:
            self.stdout.write(
                f'ID: {user.id} | '
                f'Username: {user.username} | '
                f'Email: {user.email} | '
                f'Phone: {user.phone_number} | '
                f'Type: {user.user_type} | '
                f'Active: {user.is_active} | '
                f'Staff: {user.is_staff} | '
                f'Superuser: {user.is_superuser}'
            ) 