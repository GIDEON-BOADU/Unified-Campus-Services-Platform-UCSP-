# users/serializers.py
"""
Serializers for user management.
Handles user registration, profile updates, and data validation.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import VendorApplication

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    Handles user creation and updates with proper password validation.
    
    Features:
    - Password confirmation validation
    - Django password validation
    - Proper user creation with encrypted passwords
    """
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        help_text="User password (must meet Django's password requirements)"
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        help_text="Password confirmation (must match password)"
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'password_confirm',
            'user_type', 'phone_number', 'profile_picture', 'first_name', 'last_name'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
            'email': {'required': True},
            'phone_number': {'required': True},
            'user_type': {'required': True}
        }
    
    def validate(self, attrs):
        """
        Validate that passwords match and user data is valid.
        
        Args:
            attrs: Dictionary of field values
            
        Returns:
            dict: Validated attributes
            
        Raises:
            serializers.ValidationError: If validation fails
        """
        # Check if passwords match
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': "Passwords don't match."
            })
        
        # Validate user type
        user_type = attrs.get('user_type')
        if user_type not in ['student', 'vendor', 'admin']:
            raise serializers.ValidationError({
                'user_type': "User type must be 'student', 'vendor', or 'admin'."
            })
        
        # Validate phone number format (basic validation)
        phone_number = attrs.get('phone_number', '')
        if not phone_number.isdigit() or len(phone_number) < 10:
            raise serializers.ValidationError({
                'phone_number': "Phone number must contain at least 10 digits."
            })
        
        return attrs
    
    def create(self, validated_data):
        """
        Create a new user with encrypted password.
        
        Args:
            validated_data: Validated user data
            
        Returns:
            User: Created user instance
        """
        # Remove password_confirm from validated_data
        validated_data.pop('password_confirm', None)
        
        # Create user with encrypted password
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile updates (without password).
    
    Features:
    - Read-only fields for sensitive data
    - Partial updates support
    - No password handling
    - Includes all necessary fields for frontend
    """
    # Add computed fields for frontend compatibility
    isActive = serializers.BooleanField(source='is_active', read_only=True)
    createdAt = serializers.DateTimeField(source='date_joined', read_only=True)
    lastLogin = serializers.DateTimeField(source='last_login', read_only=True)
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'user_type', 'phone_number', 
            'profile_picture', 'first_name', 'last_name',
            'isActive', 'createdAt', 'lastLogin', 'status'
        ]
        read_only_fields = ['id', 'username', 'user_type', 'isActive', 'createdAt', 'lastLogin', 'status']
    
    def to_representation(self, instance):
        """Add camelCase fields for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Add camelCase versions of key fields
        data['userType'] = data.get('user_type')
        data['phoneNumber'] = data.get('phone_number')
        data['profilePicture'] = data.get('profile_picture')
        data['firstName'] = data.get('first_name')
        data['lastName'] = data.get('last_name')
        
        return data
    
    def get_status(self, obj):
        """Get user status based on is_active field."""
        if obj.is_active:
            return 'active'
        return 'inactive'
    
    def validate_phone_number(self, value):
        """
        Validate phone number format.
        
        Args:
            value: Phone number to validate
            
        Returns:
            str: Validated phone number
            
        Raises:
            serializers.ValidationError: If phone number is invalid
        """
        if not value:
            raise serializers.ValidationError(
                "Phone number is required."
            )
        
        # Remove all non-digit characters
        digits_only = ''.join(filter(str.isdigit, str(value)))
        
        if len(digits_only) < 10:
            raise serializers.ValidationError(
                "Phone number must contain at least 10 digits."
            )
        return digits_only


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    
    Features:
    - Username/email login support
    - Password validation
    """
    username = serializers.CharField(
        required=True,
        allow_blank=False,
        help_text="Username or email address"
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        allow_blank=False,
        help_text="User password"
    )
    
    def validate(self, attrs):
        """
        Validate login credentials.
        
        Args:
            attrs: Dictionary of field values
            
        Returns:
            dict: Validated attributes
            
        Raises:
            serializers.ValidationError: If credentials are invalid
        """
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            # Try to authenticate user
            user = User.objects.filter(username=username).first()
            if not user:
                user = User.objects.filter(email=username).first()
            
            if user and user.check_password(password):
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError(
                    "Invalid username/email or password."
                )
        else:
            raise serializers.ValidationError(
                "Must include 'username' and 'password'."
            )


class VendorApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for vendor applications.
    
    Features:
    - Full CRUD operations for vendor applications
    - Validation of application data
    - Read-only fields for sensitive data
    """
    
    # Read-only fields for display
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    applicant_email = serializers.CharField(source='applicant.email', read_only=True)
    applicant_phone = serializers.CharField(source='applicant.phone_number', read_only=True)
    reviewer_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = VendorApplication
        fields = [
            'id', 'applicant', 'applicant_name', 'applicant_email', 'applicant_phone',
            'business_name', 'business_description', 'category', 'category_display',
            'address', 'phone', 'email', 'website', 'experience', 'reason',
            'status', 'status_display', 'notes', 'submitted_at',
            'reviewed_at', 'reviewed_by', 'reviewer_name'
        ]
        read_only_fields = [
            'id', 'applicant', 'applicant_name', 'applicant_email', 'applicant_phone',
            'status', 'status_display', 'submitted_at', 'reviewed_at', 
            'reviewed_by', 'reviewer_name'
        ]
    
    def validate(self, attrs):
        """
        Validate vendor application data.
        
        Args:
            attrs: Dictionary of field values
            
        Returns:
            dict: Validated attributes
            
        Raises:
            serializers.ValidationError: If validation fails
        """
        # Validate business name
        business_name = attrs.get('business_name', '')
        if len(business_name.strip()) < 3:
            raise serializers.ValidationError({
                'business_name': "Business name must be at least 3 characters long."
            })
        
        # Validate business description
        business_description = attrs.get('business_description', '')
        if len(business_description.strip()) < 10:
            raise serializers.ValidationError({
                'business_description': "Business description must be at least 10 characters long."
            })
        
        # Validate address
        address = attrs.get('address', '')
        if len(address.strip()) < 5:
            raise serializers.ValidationError({
                'address': "Address must be at least 5 characters long."
            })
        
        return attrs
    
    def create(self, validated_data):
        """
        Create a new vendor application.
        
        Args:
            validated_data: Validated application data
            
        Returns:
            VendorApplication: Created application instance
        """
        # Set the applicant to the current user
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)


class VendorApplicationUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating vendor application status (admin only).
    
    Features:
    - Admin-only status updates
    - Validation of admin permissions
    - Automatic timestamp updates
    """
    
    # Read-only fields for display
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    applicant_email = serializers.CharField(source='applicant.email', read_only=True)
    applicant_phone = serializers.CharField(source='applicant.phone_number', read_only=True)
    business_name = serializers.CharField(read_only=True)
    business_description = serializers.CharField(read_only=True)
    category = serializers.CharField(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    address = serializers.CharField(read_only=True)
    submitted_at = serializers.DateTimeField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = VendorApplication
        fields = [
            'id', 'applicant_name', 'applicant_email', 'applicant_phone',
            'business_name', 'business_description', 'category', 'category_display',
            'address', 'status', 'status_display', 'notes', 'submitted_at',
            'reviewed_at', 'reviewed_by'
        ]
        read_only_fields = [
            'id', 'applicant_name', 'applicant_email', 'applicant_phone',
            'business_name', 'business_description', 'category', 'category_display',
            'address', 'submitted_at', 'status_display'
        ]
    
    def validate(self, attrs):
        """
        Validate admin update permissions and data.
        
        Args:
            attrs: Dictionary of field values
            
        Returns:
            dict: Validated attributes
            
        Raises:
            serializers.ValidationError: If validation fails
        """
        request = self.context.get('request')
        if not request or request.user.user_type != 'admin':
            raise serializers.ValidationError(
                "Only admins can update vendor applications."
            )
        
        # Validate status transition
        instance = self.instance
        if instance and 'status' in attrs:
            current_status = instance.status
            new_status = attrs['status']
            
            if current_status != 'pending' and new_status in ['approved', 'rejected']:
                raise serializers.ValidationError({
                    'status': "Can only approve or reject pending applications."
                })
        
        return attrs
    
    def update(self, instance, validated_data):
        """
        Update vendor application with admin review.
        
        Args:
            instance: Existing application instance
            validated_data: Validated update data
            
        Returns:
            VendorApplication: Updated application instance
        """
        # Set the reviewer to the current admin user
        validated_data['reviewed_by'] = self.context['request'].user
        
        # Update reviewed_at timestamp if status is changing
        if 'status' in validated_data and validated_data['status'] in ['approved', 'rejected']:
            from django.utils import timezone
            validated_data['reviewed_at'] = timezone.now()
        
        return super().update(instance, validated_data)


class VendorApplicationListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing vendor applications (admin view).
    
    Features:
    - Compact representation for list views
    - Essential fields only
    """
    
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    applicant_email = serializers.CharField(source='applicant.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = VendorApplication
        fields = [
            'id', 'applicant_name', 'applicant_email', 'business_name',
            'category', 'category_display', 'status', 'status_display',
            'submitted_at', 'reviewed_at'
        ]