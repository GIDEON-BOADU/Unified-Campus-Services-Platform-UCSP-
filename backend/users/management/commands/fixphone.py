from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Fix phone numbers for existing users'

    def handle(self, *args, **options):
        # Find users with empty phone numbers
        users_with_empty_phone = User.objects.filter(phone_number='')
        
        if not users_with_empty_phone.exists():
            self.stdout.write(self.style.SUCCESS('No users with empty phone numbers found'))
            return

        self.stdout.write(f'Found {users_with_empty_phone.count()} user(s) with empty phone numbers:')
        
        for user in users_with_empty_phone:
            self.stdout.write(f'- {user.username} ({user.email})')
        
        self.stdout.write('')
        
        # Update phone numbers
        for i, user in enumerate(users_with_empty_phone):
            # Generate a unique phone number
            new_phone = f'999999999{i+1:03d}'  # 999999999001, 999999999002, etc.
            
            # Make sure it's unique
            while User.objects.filter(phone_number=new_phone).exists():
                new_phone = f'999999999{i+1:03d}{hash(new_phone) % 1000:03d}'
            
            user.phone_number = new_phone
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'Updated {user.username}: {new_phone}')
            )
        
        self.stdout.write(self.style.SUCCESS('All phone numbers fixed!')) 