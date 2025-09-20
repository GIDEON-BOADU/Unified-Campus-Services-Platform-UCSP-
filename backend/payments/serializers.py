"""
Serializers for payment models.
Handles payment creation, validation, and data processing.
"""
from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model.
    
    Features:
    - Transaction ID generation
    - Payment method validation
    - Amount validation
    - Read-only fields for computed data
    """
    booking_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'booking_details', 'amount', 'payment_method',
            'transaction_id', 'status', 'created_at'
        ]
        read_only_fields = ['transaction_id', 'created_at']
    
    def get_booking_details(self, obj):
        """
        Get booking details for the payment.
        
        Args:
            obj: Payment instance
            
        Returns:
            dict: Booking information
        """
        if obj.booking:
            return {
                'id': obj.booking.id,
                'service_name': obj.booking.service.name if obj.booking.service else None,
                'booking_date': obj.booking.booking_date,
                'student_name': obj.booking.student.username if obj.booking.student else None
            }
        return None
    
    def validate_amount(self, value):
        """
        Validate payment amount.
        
        Args:
            value: Payment amount to validate
            
        Returns:
            decimal: Validated amount
            
        Raises:
            serializers.ValidationError: If amount is invalid
        """
        if value <= 0:
            raise serializers.ValidationError(
                "Payment amount must be greater than zero."
            )
        return value
    
    def validate_booking(self, value):
        """
        Validate booking for payment.
        
        Args:
            value: Booking instance to validate
            
        Returns:
            Booking: Validated booking
            
        Raises:
            serializers.ValidationError: If booking is invalid
        """
        # Check if booking exists and is confirmed
        if not value:
            raise serializers.ValidationError(
                "Booking is required for payment."
            )
        
        if value.booking_status not in ['confirmed', 'pending']:
            raise serializers.ValidationError(
                "Payment can only be made for confirmed or pending bookings."
            )
        
        # Check if payment already exists for this booking
        if Payment.objects.filter(booking=value, status='successful').exists():
            raise serializers.ValidationError(
                "Payment has already been made for this booking."
            )
        
        return value
    
    def validate(self, attrs):
        """
        Validate payment data.
        
        Args:
            attrs: Dictionary of field values
            
        Returns:
            dict: Validated attributes
            
        Raises:
            serializers.ValidationError: If validation fails
        """
        booking = attrs.get('booking')
        amount = attrs.get('amount')
        
        # Validate amount matches booking service price
        if booking and booking.service and amount != booking.service.price:
            raise serializers.ValidationError({
                'amount': f"Payment amount must match service price (GHS {booking.service.price})."
            })
        
        return attrs


class PaymentStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating payment status.
    
    Features:
    - Status change validation
    - Transaction ID validation
    """
    class Meta:
        model = Payment
        fields = ['status', 'transaction_id']
    
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
            current_status = self.instance.status
            
            # Define valid status transitions
            valid_transitions = {
                'pending': ['successful', 'failed'],
                'successful': [],  # No further transitions
                'failed': ['pending']  # Can retry failed payments
            }
            
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from '{current_status}' to '{value}'."
                )
        
        return value 