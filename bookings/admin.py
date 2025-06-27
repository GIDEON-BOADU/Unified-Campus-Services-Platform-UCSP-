# Django admin configuration for the Booking model
# Register your models here.
from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """
    Admin interface for Booking model.
    """
    list_display = ('service', 'student', 'booking_date', 'booking_status', 'created_at')
    list_filter = ('booking_status', 'booking_date')
    search_fields = ('service__name', 'student__username')