# services/serializers.py
from rest_framework import serializers
from .models import Service, Order, Review, VendorProfile, ServiceItem, PrintRequest


class ServiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceItem
        fields = ['id', 'name', 'description', 'price', 'image', 'is_available', 'created_at', 'updated_at']


class ServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for Service model.
    
    Features:
    - Service type validation
    - Availability status management
    - Role-based access control
    - Contact information handling
    """
    vendor_name = serializers.CharField(source='vendor.username', read_only=True)
    can_book = serializers.BooleanField(read_only=True)
    can_order = serializers.BooleanField(read_only=True)
    requires_contact = serializers.BooleanField(read_only=True)
    can_walk_in = serializers.BooleanField(read_only=True)
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'vendor', 'vendor_name', 'service_name', 'description', 'category',
            'service_type', 'base_price', 'is_available', 'availability_status',
            'contact_info', 'location', 'images', 'created_at', 'updated_at',
            'can_book', 'can_order', 'requires_contact', 'can_walk_in'
        ]
        read_only_fields = ['vendor', 'created_at', 'updated_at']
    
    def get_images(self, obj):
        """
        Return full URL for service images.
        """
        if obj.images:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.images.url)
            return obj.images.url
        return None
    
    def validate(self, attrs):
        """
        Validate service data based on service type.
        
        Args:
            attrs: Dictionary of field values
            
        Returns:
            dict: Validated attributes
            
        Raises:
            serializers.ValidationError: If validation fails
        """
        service_type = attrs.get('service_type')
        contact_info = attrs.get('contact_info', '')
        
        # Validate contact info for contact-type services
        if service_type == 'contact' and not contact_info:
            raise serializers.ValidationError({
                'contact_info': 'Contact information is required for contact-type services.'
            })
        
        # Validate location for delivery services
        if service_type == 'ordering' and not attrs.get('location'):
            raise serializers.ValidationError({
                'location': 'Location/delivery area is required for ordering services.'
            })
        
        return attrs
    
    def create(self, validated_data):
        """
        Create a new service with vendor assignment.
        
        Args:
            validated_data: Validated service data
            
        Returns:
            Service: Created service instance
        """
        # Set the vendor to the current user
        validated_data['vendor'] = self.context['request'].user
        return super().create(validated_data)


class ServiceListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing services.
    
    Features:
    - Basic service information
    - Service type indicators
    - Availability status
    """
    vendor = serializers.IntegerField(source='vendor.id', read_only=True)
    vendor_name = serializers.CharField(source='vendor.username', read_only=True)
    can_book = serializers.BooleanField(read_only=True)
    can_order = serializers.BooleanField(read_only=True)
    requires_contact = serializers.BooleanField(read_only=True)
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'vendor', 'vendor_name', 'service_name', 'description', 'category',
            'service_type', 'base_price', 'is_available', 'availability_status',
            'location', 'images', 'can_book', 'can_order', 'requires_contact',
            'created_at', 'updated_at'
        ]
    
    def get_images(self, obj):
        """
        Return full URL for service images.
        """
        if obj.images:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.images.url)
            return obj.images.url
        return None


class ServiceAvailabilitySerializer(serializers.ModelSerializer):
    """
    Serializer for updating service availability.
    
    Features:
    - Availability status updates
    - Vendor-only access
    """
    class Meta:
        model = Service
        fields = ['is_available', 'availability_status']
    
    def validate_availability_status(self, value):
        """
        Validate availability status changes.
        
        Args:
            value: New availability status
            
        Returns:
            str: Validated status
            
        Raises:
            serializers.ValidationError: If status is invalid
        """
        current_status = self.instance.availability_status if self.instance else None
        
        # Define valid status transitions
        valid_transitions = {
            'available': ['busy', 'unavailable', 'closed'],
            'busy': ['available', 'unavailable', 'closed'],
            'unavailable': ['available', 'busy'],
            'closed': ['available', 'busy']
        }
        
        if current_status and value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from '{current_status}' to '{value}'."
            )
        
        return value


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order model.
    
    Features:
    - Order creation and management
    - Automatic total calculation
    - Status validation
    """
    service_name = serializers.CharField(source='service.service_name', read_only=True)
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    vendor_name = serializers.CharField(source='service.vendor.username', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'service', 'service_name', 'customer', 'customer_name',
            'vendor_name', 'quantity', 'special_instructions', 'delivery_address',
            'order_status', 'total_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['customer', 'total_amount', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """
        Validate order data.
        
        Args:
            attrs: Dictionary of field values
            
        Returns:
            dict: Validated attributes
            
        Raises:
            serializers.ValidationError: If validation fails
        """
        service = attrs.get('service')
        quantity = attrs.get('quantity', 1)
        
        # Validate service type
        if service and service.service_type != 'ordering':
            raise serializers.ValidationError({
                'service': 'Orders can only be placed for ordering-type services.'
            })
        
        # Validate service availability
        if service and not service.is_available:
            raise serializers.ValidationError({
                'service': 'Cannot place order for unavailable service.'
            })
        
        # Validate quantity
        if quantity <= 0:
            raise serializers.ValidationError({
                'quantity': 'Order quantity must be greater than zero.'
            })
        
        return attrs
    
    def create(self, validated_data):
        """
        Create a new order with customer assignment and total calculation.
        
        Args:
            validated_data: Validated order data
            
        Returns:
            Order: Created order instance
        """
        # Set the customer to the current user
        validated_data['customer'] = self.context['request'].user
        
        # Calculate total amount
        service = validated_data['service']
        quantity = validated_data.get('quantity', 1)
        validated_data['total_amount'] = service.price * quantity
        
        return super().create(validated_data)


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating order status.
    
    Features:
    - Status transition validation
    - Vendor-only access for status updates
    """
    class Meta:
        model = Order
        fields = ['order_status']
    
    def validate_order_status(self, value):
        """
        Validate order status transitions.
        
        Args:
            value: New order status
            
        Returns:
            str: Validated status
            
        Raises:
            serializers.ValidationError: If status transition is invalid
        """
        if self.instance:
            current_status = self.instance.order_status
            
            # Define valid status transitions
            valid_transitions = {
                'pending': ['confirmed', 'cancelled'],
                'confirmed': ['preparing', 'cancelled'],
                'preparing': ['ready', 'cancelled'],
                'ready': ['delivering', 'completed', 'cancelled'],
                'delivering': ['completed', 'cancelled'],
                'completed': [],  # No further transitions
                'cancelled': []   # No further transitions
            }
            
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from '{current_status}' to '{value}'."
                )
        
        return value


class ServiceContactSerializer(serializers.Serializer):
    """
    Serializer for contact-type services.
    
    Features:
    - Contact information display
    - Service details for contact
    """
    service_id = serializers.IntegerField()
    service_name = serializers.CharField()
    vendor_name = serializers.CharField()
    contact_info = serializers.CharField()
    location = serializers.CharField()
    description = serializers.CharField()
    
    def to_representation(self, instance):
        """
        Convert service instance to contact representation.
        
        Args:
            instance: Service instance
            
        Returns:
            dict: Contact information
        """
        return {
            'service_id': instance.id,
            'service_name': instance.service_name,
            'vendor_name': instance.vendor.username,
            'contact_info': instance.contact_info,
            'location': instance.location,
            'description': instance.description
        }


class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for Review model.
    
    Features:
    - Review display with user information
    - Rating validation
    - Read-only fields for security
    """
    user_name = serializers.CharField(source='user.username', read_only=True)
    service_name = serializers.CharField(source='service.service_name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'service', 'service_name', 'user', 'user_name', 
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['service', 'user', 'created_at', 'updated_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating reviews.
    
    Features:
    - Rating validation (1-5)
    - Comment validation
    - User permission validation
    """
    
    class Meta:
        model = Review
        fields = ['rating', 'comment']
    
    def validate_rating(self, value):
        """
        Validate rating value.
        
        Args:
            value: Rating value
            
        Returns:
            int: Validated rating
            
        Raises:
            serializers.ValidationError: If rating is invalid
        """
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                'Rating must be between 1 and 5.'
            )
        return value
    
    def validate_comment(self, value):
        """
        Validate comment length.
        
        Args:
            value: Comment text
            
        Returns:
            str: Validated comment
            
        Raises:
            serializers.ValidationError: If comment is too long
        """
        if value and len(value) > 1000:
            raise serializers.ValidationError(
                'Comment cannot exceed 1000 characters.'
            )
        return value


class VendorProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for VendorProfile model.
    
    Features:
    - Business information display
    - Verification status
    - Contact information
    - User name information
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorProfile
        fields = [
            'id', 'user', 'user_username', 'user_email', 'user_first_name', 
            'user_last_name', 'user_full_name', 'business_name',
            'description', 'business_hours', 'address', 'phone', 'email',
            'website', 'logo', 'is_verified', 'is_active', 
            'mtn_momo_number', 'vodafone_cash_number', 'airtel_money_number', 
            'telecel_cash_number', 'preferred_payment_method',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'is_verified', 'created_at', 'updated_at']
    
    def get_user_full_name(self, obj):
        """
        Get the full name of the user.
        
        Args:
            obj: VendorProfile instance
            
        Returns:
            str: Full name of the user
        """
        first_name = obj.user.first_name or ''
        last_name = obj.user.last_name or ''
        return f"{first_name} {last_name}".strip() or obj.user.username
    
    def validate(self, attrs):
        """
        Validate vendor profile data.
        
        Args:
            attrs: Dictionary of field values
            
        Returns:
            dict: Validated attributes
            
        Raises:
            serializers.ValidationError: If validation fails
        """
        try:
            # Validate business name is required
            business_name = attrs.get('business_name')
            if not business_name or not business_name.strip():
                raise serializers.ValidationError({
                    'business_name': 'This field is required.'
                })
            
            # Validate business name uniqueness
            if business_name:
                # Get the current user from context
                user = self.context.get('request').user
                if user:
                    existing = VendorProfile.objects.filter(
                        business_name=business_name
                    ).exclude(user=user)
                    
                    if existing.exists():
                        raise serializers.ValidationError({
                            'business_name': 'A business with this name already exists.'
                        })
            
            # Validate email format if provided
            email = attrs.get('email')
            if email and not email.strip():
                attrs['email'] = None  # Convert empty string to None
            
            # Validate website format if provided
            website = attrs.get('website')
            if website and not website.strip():
                attrs['website'] = None  # Convert empty string to None
                
            return attrs
        except Exception as e:
            print(f"Validation error: {e}")
            print(f"Attributes: {attrs}")
            print(f"Context: {self.context}")
            raise serializers.ValidationError({
                'detail': f'Validation error: {str(e)}'
            })
    
    def create(self, validated_data):
        """
        Create a new vendor profile with user assignment.
        
        Args:
            validated_data: Validated profile data
            
        Returns:
            VendorProfile: Created profile instance
        """
        # Set the user to the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PrintRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for PrintRequest model.
    
    Features:
    - Print request display with service and student information
    - File URL generation
    - Status validation
    """
    service_name = serializers.CharField(source='service.service_name', read_only=True)
    vendor_name = serializers.CharField(source='service.vendor.username', read_only=True)
    student_name = serializers.CharField(source='student.username', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PrintRequest
        fields = [
            'id', 'service', 'service_name', 'vendor_name', 'student', 'student_name',
            'file', 'file_url', 'copies', 'paper_size', 'color_mode', 
            'special_instructions', 'contact_phone', 'pickup_location', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['service', 'student', 'created_at', 'updated_at']
    
    def get_file_url(self, obj):
        """
        Return full URL for the uploaded file.
        
        Args:
            obj: PrintRequest instance
            
        Returns:
            str: Full URL to the file or None
        """
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class PrintRequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating print requests.
    
    Features:
    - File validation
    - Print specifications validation
    - Student assignment
    """
    
    class Meta:
        model = PrintRequest
        fields = [
            'file', 'copies', 'paper_size', 'color_mode', 
            'special_instructions', 'contact_phone', 'pickup_location'
        ]
    
    def validate_file(self, value):
        """
        Validate uploaded file.
        
        Args:
            value: Uploaded file
            
        Returns:
            File: Validated file
            
        Raises:
            serializers.ValidationError: If file is invalid
        """
        if not value:
            raise serializers.ValidationError('File is required.')
        
        # Validate file type
        allowed_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png'
        ]
        
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                'Only PDF, DOC, DOCX, TXT, JPG, PNG files are allowed.'
            )
        
        # Validate file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError(
                'File size must be less than 10MB.'
            )
        
        return value
    
    def validate_copies(self, value):
        """
        Validate number of copies.
        
        Args:
            value: Number of copies
            
        Returns:
            int: Validated copies
            
        Raises:
            serializers.ValidationError: If copies is invalid
        """
        if value <= 0:
            raise serializers.ValidationError(
                'Number of copies must be greater than zero.'
            )
        if value > 100:
            raise serializers.ValidationError(
                'Number of copies cannot exceed 100.'
            )
        return value
    
    def create(self, validated_data):
        """
        Create a new print request with student assignment.
        
        Args:
            validated_data: Validated print request data
            
        Returns:
            PrintRequest: Created print request instance
        """
        # Set the student to the current user
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)


