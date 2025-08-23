# users/admin.py
"""
Admin interface for user management.
Provides admin interface for user accounts and vendor applications.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, VendorApplication


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin interface for User model.
    
    Features:
    - Enhanced user management
    - User type filtering
    - Profile information display
    """
    
    list_display = [
        'username', 'email', 'user_type', 'phone_number', 
        'first_name', 'last_name', 'is_active', 'date_joined'
    ]
    list_filter = ['user_type', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'email', 'phone_number', 'profile_picture')
        }),
        ('User Type', {'fields': ('user_type',)}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'user_type', 'phone_number'),
        }),
    )


@admin.register(VendorApplication)
class VendorApplicationAdmin(admin.ModelAdmin):
    """
    Admin interface for vendor applications.
    
    Features:
    - Application status management
    - Admin approval workflow
    - Detailed application information
    """
    
    list_display = [
        'business_name', 'applicant_name', 'category_display', 
        'status_display', 'submitted_at', 'reviewed_at', 'reviewer_name'
    ]
    list_filter = ['status', 'category', 'submitted_at', 'reviewed_at']
    search_fields = [
        'business_name', 'applicant__username', 'applicant__email',
        'applicant__first_name', 'applicant__last_name'
    ]
    ordering = ['-submitted_at']
    readonly_fields = [
        'applicant_name', 'applicant_email', 'applicant_phone',
        'submitted_at', 'reviewed_at', 'reviewer_name'
    ]
    
    fieldsets = (
        ('Application Information', {
            'fields': (
                'business_name', 'business_description', 'category', 'address'
            )
        }),
        ('Applicant Information', {
            'fields': (
                'applicant', 'applicant_name', 'applicant_email', 'applicant_phone'
            ),
            'classes': ('collapse',)
        }),
        ('Review Information', {
            'fields': (
                'status', 'notes', 'reviewed_by', 'reviewer_name',
                'submitted_at', 'reviewed_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    def applicant_name(self, obj):
        """Display applicant's full name."""
        if obj.applicant:
            return f"{obj.applicant.first_name} {obj.applicant.last_name}".strip() or obj.applicant.username
        return "N/A"
    applicant_name.short_description = "Applicant Name"
    
    def applicant_email(self, obj):
        """Display applicant's email."""
        return obj.applicant.email if obj.applicant else "N/A"
    applicant_email.short_description = "Applicant Email"
    
    def applicant_phone(self, obj):
        """Display applicant's phone number."""
        return obj.applicant.phone_number if obj.applicant else "N/A"
    applicant_phone.short_description = "Applicant Phone"
    
    def category_display(self, obj):
        """Display category with color coding."""
        colors = {
            'food': '#FF6B6B',
            'beauty': '#4ECDC4',
            'printing': '#45B7D1',
            'laundry': '#96CEB4',
            'academic': '#FFEAA7',
            'transport': '#DDA0DD',
            'health': '#98D8C8',
            'entertainment': '#F7DC6F',
            'other': '#BB8FCE'
        }
        color = colors.get(obj.category, '#95A5A6')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_category_display()
        )
    category_display.short_description = "Category"
    
    def status_display(self, obj):
        """Display status with color coding."""
        colors = {
            'pending': '#F39C12',
            'approved': '#27AE60',
            'rejected': '#E74C3C'
        }
        color = colors.get(obj.status, '#95A5A6')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = "Status"
    
    def reviewer_name(self, obj):
        """Display reviewer's name."""
        if obj.reviewed_by:
            return f"{obj.reviewed_by.first_name} {obj.reviewed_by.last_name}".strip() or obj.reviewed_by.username
        return "Not reviewed"
    reviewer_name.short_description = "Reviewed By"
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related('applicant', 'reviewed_by')
    
    def save_model(self, request, obj, form, change):
        """Handle approval workflow."""
        if change and 'status' in form.changed_data:
            # If status is being changed to approved, update user type
            if obj.status == 'approved':
                applicant = obj.applicant
                applicant.user_type = 'vendor'
                applicant.save()
        
        super().save_model(request, obj, form, change)
    
    actions = ['approve_applications', 'reject_applications']
    
    def approve_applications(self, request, queryset):
        """Bulk approve applications."""
        count = 0
        for application in queryset.filter(status='pending'):
            application.status = 'approved'
            application.reviewed_by = request.user
            application.save()
            
            # Update user type
            applicant = application.applicant
            applicant.user_type = 'vendor'
            applicant.save()
            count += 1
        
        self.message_user(
            request,
            f"Successfully approved {count} vendor application(s)."
        )
    approve_applications.short_description = "Approve selected applications"
    
    def reject_applications(self, request, queryset):
        """Bulk reject applications."""
        count = queryset.filter(status='pending').update(
            status='rejected',
            reviewed_by=request.user
        )
        self.message_user(
            request,
            f"Successfully rejected {count} vendor application(s)."
        )
    reject_applications.short_description = "Reject selected applications"