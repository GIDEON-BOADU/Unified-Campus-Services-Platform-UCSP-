from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.
class Timestamped(models.Model):
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    class meta:
        abstract=True


class Complaint(Timestamped):
    """
    Complaint model for handling user complaints and issues.
    
    This model allows students to report issues with services, orders, bookings,
    or other platform-related problems. Admins can review and resolve complaints.
    
    Attributes:
        complainant: The user filing the complaint (must be student)
        complaint_type: Type of complaint (service, order, booking, platform, other)
        related_service: Service being complained about (optional)
        related_order: Order being complained about (optional)
        related_booking: Booking being complained about (optional)
        subject: Brief subject/title of the complaint
        description: Detailed description of the complaint
        status: Current status of the complaint
        priority: Priority level of the complaint
        admin_response: Admin's response to the complaint
        resolved_at: Timestamp when complaint was resolved
        assigned_admin: Admin user assigned to handle the complaint
    """
    
    # Complaint types
    COMPLAINT_TYPE_CHOICES = (
        ('service', 'Service Issue'),
        ('order', 'Order Problem'),
        ('booking', 'Booking Issue'),
        ('payment', 'Payment Problem'),
        ('vendor', 'Vendor Behavior'),
        ('platform', 'Platform Issue'),
        ('other', 'Other'),
    )
    
    # Complaint status
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
        ('rejected', 'Rejected'),
    )
    
    # Priority levels
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    # Relationships
    complainant = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="complaints_filed",
        help_text="The user filing the complaint"
    )
    
    # Related entities (optional)
    related_service = models.ForeignKey(
        "services.Service",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints",
        help_text="Service being complained about"
    )
    related_order = models.ForeignKey(
        "services.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints",
        help_text="Order being complained about"
    )
    related_booking = models.ForeignKey(
        "bookings.Booking",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints",
        help_text="Booking being complained about"
    )
    
    # Complaint details
    complaint_type = models.CharField(
        max_length=20,
        choices=COMPLAINT_TYPE_CHOICES,
        help_text="Type of complaint"
    )
    subject = models.CharField(
        max_length=200,
        help_text="Brief subject/title of the complaint"
    )
    description = models.TextField(
        help_text="Detailed description of the complaint"
    )
    
    # Status and priority
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Current status of the complaint"
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium',
        help_text="Priority level of the complaint"
    )
    
    # Admin handling
    assigned_admin = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints_assigned",
        help_text="Admin user assigned to handle the complaint"
    )
    admin_response = models.TextField(
        blank=True,
        null=True,
        help_text="Admin's response to the complaint"
    )
    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when complaint was resolved"
    )
    
    def __str__(self):
        """String representation of the complaint."""
        return f"Complaint #{self.id}: {self.subject} ({self.status})"
    
    def clean(self):
        """Validate complaint data."""
        # Ensure complainant is a student
        if self.complainant.user_type != 'student':
            raise ValidationError("Only students can file complaints.")
        
        # Ensure at least one related entity is specified for specific complaint types
        if self.complaint_type in ['service', 'order', 'booking']:
            if not any([self.related_service, self.related_order, self.related_booking]):
                raise ValidationError(f"For {self.complaint_type} complaints, a related entity must be specified.")
        
        # Ensure assigned admin is actually an admin
        if self.assigned_admin and self.assigned_admin.user_type != 'admin':
            raise ValidationError("Assigned user must be an admin.")
    
    def save(self, *args, **kwargs):
        """Override save to include validation and auto-update resolved_at."""
        self.full_clean()
        
        # Auto-set resolved_at when status changes to resolved
        if self.status == 'resolved' and not self.resolved_at:
            from django.utils import timezone
            self.resolved_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    @property
    def is_resolved(self):
        """Check if complaint is resolved."""
        return self.status in ['resolved', 'closed']
    
    @property
    def is_urgent(self):
        """Check if complaint is urgent priority."""
        return self.priority == 'urgent'
    
    @property
    def days_since_created(self):
        """Get number of days since complaint was created."""
        from django.utils import timezone
        return (timezone.now() - self.created_at).days
    
    class Meta:
        """Meta options for the Complaint model."""
        
        verbose_name = "Complaint"
        verbose_name_plural = "Complaints"
        ordering = ["-created_at"]  # Most recent first
        
        # Database constraints
        constraints = [
            models.CheckConstraint(
                check=models.Q(complaint_type__in=['service', 'order', 'booking', 'payment', 'vendor', 'platform', 'other']),
                name='valid_complaint_type'
            ),
            models.CheckConstraint(
                check=models.Q(status__in=['pending', 'in_progress', 'resolved', 'closed', 'rejected']),
                name='valid_complaint_status'
            ),
            models.CheckConstraint(
                check=models.Q(priority__in=['low', 'medium', 'high', 'urgent']),
                name='valid_complaint_priority'
            ),
        ]
