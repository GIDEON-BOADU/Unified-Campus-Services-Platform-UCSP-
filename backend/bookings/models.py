from django.db import models
from django.core.exceptions import ValidationError
from common.models import Timestamped
# Create your models here.


class Booking(Timestamped):
    """
        This model tracks the relationship between students and services,
        including the booking time, booking times, status, and validation rules


        Attributes:
            student:The user making the booking (must be student type)
            service:The service being booked
            booking_date:Date and time of the booking
            status:Current status of the booking
            notes:Optional notes about the booking
            created_at: timestamp of creation
    """
   
    # Booking status choices for tracking booking lifecycle
    choice_status = [
        ('pending', 'pending'),
        ('confirmed', 'confirmed'),
        ('cancelled', 'cancelled'),
        ('completed', 'completed'),
    ]
     # Primary key field for Booking
    service = models.ForeignKey(
        'services.Service', on_delete=models.PROTECT, help_text="The service being booked")
    student = models.ForeignKey(
        'users.User', on_delete=models.PROTECT, help_text="The student booking the service")
    booking_date = models.DateTimeField(
        help_text="Date and time of the booking")
    booking_status = models.CharField(
        max_length=30, choices=choice_status, default='pending', help_text="Current status of the booking")
    notes = models.TextField(
        blank=True, help_text="Optional notes about the booking")

    # Add the default manager
    objects = models.Manager()

    
    def __str__(self):
        """
        String representation of the booking.

        Returns:
            str: Student, service, and booking date in readable format
        """
        student_username = getattr(self.student, 'username', 'unknown student')
        service_name = getattr(self.service, 'service_name', 'unknown service')
        booking_date_str = self.booking_date.strftime('%Y-%m-%d %H:%M') if self.booking_date else 'unknown date'
        return f"{student_username} booked {service_name} on {booking_date_str}"
    
    def clean(self, *args, **kwargs):
        """
        Override save method to add validation rules.
        
        Validates that:
        1. Only students can make bookings
        2. No double-booking for the same service and time
        
        Raises:
            ValidationError: If validation rules are violated
        """
        if getattr(self.student, 'user_type', None) != 'student':
            raise ValidationError("Only users with 'student' type can make bookings.")
       
        
          # Prevent double-booking for the same service and time
          # Rule 2: Prevent double-booking
        existing = Booking.objects.filter(
            service=self.service,
            booking_date=self.booking_date
        ).exclude(id=self.id)
        if existing.exists():
            service_name = getattr(self.service, 'service_name', 'this service')
            booking_time = self.booking_date.strftime('%Y-%m-%d at %H:%M')
            raise ValidationError(
                f"Sorry, {service_name} is already booked for {booking_time}. "
                "Please choose a different time slot."
            )
    def save(self, *args, **kwargs):
        """
        Override save method to include validation before saving the booking.
        
        Args:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        
        Raises:
            ValidationError: If validation rules are violated.
        """
        self.full_clean()  # Call clean method to validate before saving
        super().save(*args, **kwargs)
        
    class Meta:
        verbose_name = "Booking"
        verbose_name_plural = "bookings"
        ordering = ['-booking_date']
         # Database constraints
        constraints = [
            models.UniqueConstraint(
                fields=['service', 'booking_date'],
                name='unique_service_booking',
                violation_error_message="This time slot is already booked. Please choose a different time."
            )
        ]
        