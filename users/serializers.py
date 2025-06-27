# users/serializers.py
"""
Serializers for user management.
Handles user registration, profile updates, and data validation.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

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
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'user_type', 'phone_number', 
            'profile_picture', 'first_name', 'last_name'
        ]
        read_only_fields = ['id', 'username', 'user_type']  # These can't be changed after creation
    
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
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError(
                "Phone number must contain at least 10 digits."
            )
        return value


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    
    Features:
    - Username/email login support
    - Password validation
    """
    username = serializers.CharField(
        help_text="Username or email address"
    )
    password = serializers.CharField(
        write_only=True,
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