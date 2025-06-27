"""
User model for the UCSP platform.
Extends Django's AbstractUser to provide custom user functionality.
Supports three user types: student, vendor, and admin.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
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