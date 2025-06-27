from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'user_type', 'phone_number', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_active')
    search_fields = ('username', 'email', 'phone_number')