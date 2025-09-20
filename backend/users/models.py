"""
User model for the UCSP platform.
Extends Django's AbstractUser to provide custom user functionality.
Supports three user types: student, vendor, and admin.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
# Create your models here.

# users/models.py
class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    
    This model adds user type classification and additional fields
    needed for the UCSP platform functionality.
    
    Attributes:
        user_type: Classification of user (student, vendor, admin)
        phone_number: Unique phone number for user identification
        profile_picture: Optional profile image for user
    """
    
    # User type choices for role-based access control
    USER_TYPE_CHOICES = (
        ('student', 'Student'),      # Can book services
        ('vendor', 'Vendor'),        # Can create and manage services
        ('admin', 'Admin'),          # Platform administrator
    )
    
    # Custom fields
    user_type = models.CharField(
        max_length=10, 
        choices=USER_TYPE_CHOICES, 
        default='student',
        help_text="User role in the platform"
    )
    phone_number = models.CharField(
        max_length=15, 
        unique=True,
        null=True,
        blank=True,
        help_text="Unique phone number for user identification"
    )
    profile_picture = models.ImageField(
        upload_to='profiles/', 
        null=True, 
        blank=True,
        help_text="User profile picture"
    )
    
    # Override ManyToMany fields to avoid reverse accessor clashes
    # This is necessary when extending AbstractUser
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    
    def __str__(self):
        """
        String representation of the user.
        
        Returns:
            str: Username and user type in format "username (user_type)"
        """
        return f"{self.username} ({self.user_type})"
    
    class Meta:
        """Meta options for the User model."""
        verbose_name = "User"
        verbose_name_plural = "Users"


class VendorApplication(models.Model):
    """
    Vendor application model for handling vendor registration requests.
    
    This model stores applications from users who want to become vendors
    on the platform. Admins can review and approve/reject these applications.
    
    Attributes:
        applicant: The user applying to become a vendor
        business_name: Name of the business
        business_description: Description of the business
        category: Business category
        address: Business address
        status: Application status (pending, approved, rejected)
        submitted_at: When the application was submitted
        reviewed_at: When the application was reviewed
        reviewed_by: Admin who reviewed the application
        notes: Admin notes on the application
    """
    
    # Application status choices
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    # Business category choices (matching frontend)
    CATEGORY_CHOICES = (
        ('food', 'Food & Beverages'),
        ('beauty', 'Beauty & Grooming'),
        ('printing', 'Printing & Copying'),
        ('laundry', 'Laundry Services'),
        ('academic', 'Academic Services'),
        ('transport', 'Transportation'),
        ('health', 'Health & Wellness'),
        ('entertainment', 'Entertainment'),
        ('gym', 'Gym & Fitness'),
        ('other', 'Other Services'),
    )
    
    # Relationships
    applicant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='vendor_applications',
        help_text="The user applying to become a vendor"
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications',
        help_text="Admin who reviewed this application"
    )
    
    # Application details
    business_name = models.CharField(
        max_length=200,
        help_text="Name of the business"
    )
    business_description = models.TextField(
        help_text="Description of the business"
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        help_text="Business category"
    )
    address = models.CharField(
        max_length=500,
        help_text="Business address"
    )
    
    # Additional contact and business information
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Business phone number"
    )
    email = models.EmailField(
        blank=True,
        null=True,
        help_text="Business email address"
    )
    website = models.URLField(
        blank=True,
        null=True,
        help_text="Business website URL"
    )
    experience = models.TextField(
        blank=True,
        null=True,
        help_text="Business experience and background"
    )
    reason = models.TextField(
        blank=True,
        null=True,
        help_text="Reason for wanting to join the platform"
    )
    
    # Application status and metadata
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Current status of the application"
    )
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Admin notes on the application"
    )
    
    # Timestamps
    submitted_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the application was submitted"
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the application was reviewed"
    )
    
    def __str__(self):
        """
        String representation of the vendor application.
        
        Returns:
            str: Business name and status
        """
        return f"{self.business_name} - {self.get_status_display()}"
    
    def clean(self):
        """
        Validate vendor application data.
        
        Raises:
            ValidationError: If validation rules are violated
        """
        # Validate applicant type
        if self.applicant.user_type != 'student':
            raise ValidationError("Only students can apply to become vendors.")
        
        # Validate reviewer type
        if self.reviewed_by and self.reviewed_by.user_type != 'admin':
            raise ValidationError("Only admins can review applications.")
    
    def save(self, *args, **kwargs):
        """
        Override save method to add validation and update timestamps.
        
        Args:
            *args: Variable length argument list
            **kwargs: Arbitrary keyword arguments
        """
        from django.core.exceptions import ValidationError
        
        self.clean()
        
        # Update reviewed_at timestamp when status changes
        if self.pk:  # Only for existing instances
            old_instance = VendorApplication.objects.get(pk=self.pk)
            if old_instance.status != self.status and self.status in ['approved', 'rejected']:
                from django.utils import timezone
                self.reviewed_at = timezone.now()
        
        super().save(*args, **kwargs)
    
    class Meta:
        """Meta options for the VendorApplication model."""
        
        verbose_name = "Vendor Application"
        verbose_name_plural = "Vendor Applications"
        ordering = ['-submitted_at']  # Most recent first
        
        # Database constraints
        constraints = [
            models.UniqueConstraint(
                fields=['applicant'],
                name='unique_vendor_application_per_user',
                violation_error_message="You have already submitted a vendor application.",
            )
        ]


class BlacklistedToken(models.Model):
    """Track blacklisted refresh tokens to prevent reuse attacks"""
    token = models.CharField(max_length=500, unique=True)
    blacklisted_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blacklisted_tokens')
    
    class Meta:
        db_table = 'blacklisted_tokens'
        verbose_name = 'Blacklisted Token'
        verbose_name_plural = 'Blacklisted Tokens'
    
    def __str__(self):
        return f"Blacklisted token for {self.user.email} at {self.blacklisted_at}"