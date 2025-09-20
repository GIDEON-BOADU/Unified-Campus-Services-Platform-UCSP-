# common/serializers.py
from rest_framework import serializers
from .models import Complaint
from services.models import Service, Order
from bookings.models import Booking


class ComplaintSerializer(serializers.ModelSerializer):
    """
    Serializer for Complaint model.
    
    Features:
    - Role-based field visibility
    - Validation for complaint types
    - Admin response handling
    """
    
    # Read-only fields for display
    complainant_name = serializers.CharField(source='complainant.username', read_only=True)
    assigned_admin_name = serializers.CharField(source='assigned_admin.username', read_only=True)
    related_service_name = serializers.CharField(source='related_service.service_name', read_only=True)
    related_order_id = serializers.IntegerField(source='related_order.id', read_only=True)
    related_booking_id = serializers.IntegerField(source='related_booking.id', read_only=True)
    
    # Computed fields
    is_resolved = serializers.BooleanField(read_only=True)
    is_urgent = serializers.BooleanField(read_only=True)
    days_since_created = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'complainant', 'complainant_name', 'complaint_type', 'subject', 'description',
            'status', 'priority', 'assigned_admin', 'assigned_admin_name', 'admin_response',
            'related_service', 'related_service_name', 'related_order', 'related_order_id',
            'related_booking', 'related_booking_id', 'resolved_at', 'created_at', 'updated_at',
            'is_resolved', 'is_urgent', 'days_since_created'
        ]
        read_only_fields = ['complainant', 'created_at', 'updated_at', 'resolved_at']
    
    def validate(self, attrs):
        """Validate complaint data based on type and user role."""
        request = self.context.get('request')
        user = request.user if request else None
        
        # For students creating complaints
        if user and user.user_type == 'student':
            # Students can only create complaints, not modify admin fields
            if 'status' in attrs or 'assigned_admin' in attrs or 'admin_response' in attrs:
                raise serializers.ValidationError(
                    "Students cannot modify complaint status or admin fields."
                )
            
            # Validate related entities for specific complaint types
            complaint_type = attrs.get('complaint_type')
            if complaint_type in ['service', 'order', 'booking']:
                related_service = attrs.get('related_service')
                related_order = attrs.get('related_order')
                related_booking = attrs.get('related_booking')
                
                if not any([related_service, related_order, related_booking]):
                    raise serializers.ValidationError(
                        f"For {complaint_type} complaints, you must specify a related service, order, or booking."
                    )
        
        # For admins updating complaints
        elif user and user.user_type == 'admin':
            # Admins can modify all fields
            pass
        
        return attrs
    
    def create(self, validated_data):
        """Create a new complaint with complainant set to current user."""
        request = self.context.get('request')
        if request and request.user:
            validated_data['complainant'] = request.user
        return super().create(validated_data)


class ComplaintListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing complaints.
    
    Features:
    - Basic complaint information
    - Status indicators
    - Priority levels
    """
    
    complainant_name = serializers.CharField(source='complainant.username', read_only=True)
    assigned_admin_name = serializers.CharField(source='assigned_admin.username', read_only=True)
    related_service_name = serializers.CharField(source='related_service.service_name', read_only=True)
    is_resolved = serializers.BooleanField(read_only=True)
    is_urgent = serializers.BooleanField(read_only=True)
    days_since_created = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'complainant_name', 'complaint_type', 'subject', 'status', 'priority',
            'assigned_admin_name', 'related_service_name', 'resolved_at', 'created_at',
            'is_resolved', 'is_urgent', 'days_since_created'
        ]


class ComplaintCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating complaints (student-only).
    
    Features:
    - Simplified fields for students
    - Validation for required fields
    - Auto-assignment of complainant
    """
    
    class Meta:
        model = Complaint
        fields = [
            'complaint_type', 'subject', 'description', 'priority',
            'related_service', 'related_order', 'related_booking'
        ]
    
    def validate(self, attrs):
        """Validate complaint creation data."""
        complaint_type = attrs.get('complaint_type')
        
        # Validate related entities for specific complaint types
        if complaint_type in ['service', 'order', 'booking']:
            related_service = attrs.get('related_service')
            related_order = attrs.get('related_order')
            related_booking = attrs.get('related_booking')
            
            if not any([related_service, related_order, related_booking]):
                raise serializers.ValidationError(
                    f"For {complaint_type} complaints, you must specify a related service, order, or booking."
                )
        
        return attrs
    
    def create(self, validated_data):
        """Create complaint with complainant set to current user."""
        request = self.context.get('request')
        if request and request.user:
            validated_data['complainant'] = request.user
        return super().create(validated_data)


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating complaints (admin-only).
    
    Features:
    - Admin response handling
    - Status updates
    - Assignment management
    """
    
    class Meta:
        model = Complaint
        fields = [
            'status', 'priority', 'assigned_admin', 'admin_response'
        ]
    
    def validate(self, attrs):
        """Validate admin update data."""
        request = self.context.get('request')
        user = request.user if request else None
        
        # Only admins can update complaints
        if not user or user.user_type != 'admin':
            raise serializers.ValidationError("Only admins can update complaints.")
        
        # Validate assigned admin
        assigned_admin = attrs.get('assigned_admin')
        if assigned_admin and assigned_admin.user_type != 'admin':
            raise serializers.ValidationError("Assigned user must be an admin.")
        
        return attrs
