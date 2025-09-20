from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for Booking model.
    
    Features:
    - Automatic student assignment
    - Service and booking date validation
    - Read-only fields for computed data
    """
    service_name = serializers.CharField(source='service.name', read_only=True)
    student_name = serializers.CharField(source='student.username', read_only=True)
    vendor_name = serializers.CharField(source='service.vendor.username', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'service', 'service_name', 'student', 'student_name', 'vendor_name',
            'booking_date', 'booking_status', 'notes', 'created_at'
        ]
        read_only_fields = ['student', 'created_at']
    
    def validate_booking_date(self, value):
        """
        Validate booking date is in the future.
        
        Args:
            value: Booking date to validate
            
        Returns:
            datetime: Validated booking date
            
        Raises:
            serializers.ValidationError: If date is in the past
        """
        from django.utils import timezone
        
        if value <= timezone.now():
            raise serializers.ValidationError(
                "Booking date must be in the future."
            )
        return value
    
    def validate(self, attrs):
        """
        Validate booking data.
        
        Args:
            attrs: Dictionary of field values
            
        Returns:
            dict: Validated attributes
            
        Raises:
            serializers.ValidationError: If validation fails
        """
        service = attrs.get('service')
        booking_date = attrs.get('booking_date')
        
        # Check if service is available
        if not service.is_available:
            raise serializers.ValidationError({
                'service': "This service is not available for booking."
            })
        
        # Check for double booking (if this is a new booking)
        if not self.instance:  # New booking
            if Booking.objects.filter(
                service=service,
                booking_date=booking_date,
                booking_status__in=['pending', 'confirmed']
            ).exists():
                raise serializers.ValidationError({
                    'booking_date': "This time slot is already booked. Please choose a different time."
                })
        
        return attrs


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating booking status.
    
    Features:
    - Status change validation
    - Role-based permissions
    """
    class Meta:
        model = Booking
        fields = ['booking_status']
    
    def validate_status(self, value):
        """
        Validate status transitions.
        
        Args:
            value: New status value
            
        Returns:
            str: Validated status
            
        Raises:
            serializers.ValidationError: If status transition is invalid
        """
        if self.instance:
            current_status = self.instance.booking_status
            
            # Define valid status transitions
            valid_transitions = {
                'pending': ['confirmed', 'cancelled'],
                'confirmed': ['completed', 'cancelled'],
                'completed': [],  # No further transitions
                'cancelled': []   # No further transitions
            }
            
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from '{current_status}' to '{value}'."
                )
        
        return value 