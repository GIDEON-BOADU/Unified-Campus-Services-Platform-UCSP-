from django.db import models
from django.core.exceptions import ValidationError
import uuid
# Create your models here.

class Payment(models.Model):
    """
    Payment model representing financial transactions for bookings and orders.
    
    This model tracks payment information including amount, method,
    transaction details, and payment status with real-world mobile money support.
    
    Attributes:
        booking: The booking this payment is for (optional)
        order: The order this payment is for (optional)
        amount: Payment amount in decimal format
        payment_method: Method used for payment
        mobile_money_provider: Mobile money provider (if applicable)
        transaction_id: Unique identifier for the payment transaction
        status: Current status of the payment
        created_at: Timestamp when payment was created
    """
    
    # Payment method choices for different payment options
    PAYMENT_METHODS = (
        ('cash', 'Cash'),                    # Cash payment
        ('mobile_money', 'Mobile Money'),    # Mobile money payment
        ('card', 'Card Payment'),            # Credit/debit card
        ('bank_transfer', 'Bank Transfer'),  # Bank transfer
    )

    # Mobile money provider choices
    MOBILE_MONEY_PROVIDERS = (
        ('mtn', 'MTN Mobile Money'),         # MTN Mobile Money
        ('vodafone', 'Vodafone Cash'),       # Vodafone Cash
        ('airtel', 'AirtelTigo Money'),      # AirtelTigo Money
        ('telecel', 'Telecel Cash'),         # Telecel Cash
    )

    # Payment status choices for tracking payment lifecycle
    PAYMENT_STATUSES = (
        ('pending', 'Pending'),      # Payment initiated, awaiting completion
        ('processing', 'Processing'), # Payment is being processed
        ('successful', 'Successful'), # Payment completed successfully
        ('failed', 'Failed'),        # Payment failed or was declined
        ('cancelled', 'Cancelled'),   # Payment was cancelled
        ('refunded', 'Refunded'),     # Payment was refunded
    )

    # Relationships (one of these must be provided)
    booking = models.ForeignKey(
        'bookings.Booking', 
        on_delete=models.PROTECT, 
        related_name='payments',
        null=True,
        blank=True,
        help_text="The booking this payment is for"
    )
    order = models.ForeignKey(
        'services.Order',
        on_delete=models.PROTECT,
        related_name='payments',
        null=True,
        blank=True,
        help_text="The order this payment is for"
    )
    
    # Payment details
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Payment amount"
    )
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHODS,
        help_text="Method used for payment"
    )
    mobile_money_provider = models.CharField(
        max_length=20,
        choices=MOBILE_MONEY_PROVIDERS,
        null=True,
        blank=True,
        help_text="Mobile money provider (if mobile money payment)"
    )
    transaction_id = models.CharField(
        max_length=100, 
        unique=True,
        help_text="Unique identifier for the payment transaction"
    )
    status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUSES, 
        default='pending',
        help_text="Current status of the payment"
    )
    
    # Additional payment details
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Phone number used for mobile money payment"
    )
    reference_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="External reference number from payment provider"
    )
    payment_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Additional notes about the payment"
    )
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when payment was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when payment was last updated"
    )

    def __str__(self):
        """
        String representation of the payment.
        
        Returns:
            str: Payment amount, method, and status in readable format
        """
        method_display = self.get_payment_method_display()
        if self.payment_method == 'mobile_money' and self.mobile_money_provider:
            method_display = f"{self.get_mobile_money_provider_display()}"
        
        return f"Payment of GHS {self.amount} via {method_display} ({self.status})"

    def clean(self):
        """
        Validate payment data.
        
        Raises:
            ValidationError: If validation rules are violated
        """
        # Validate amount
        if self.amount <= 0:
            raise ValidationError("Payment amount must be greater than zero.")
        
        # Validate that either booking or order is provided
        if not self.booking and not self.order:
            raise ValidationError("Payment must be associated with either a booking or order.")
        
        # Validate mobile money provider for mobile money payments
        if self.payment_method == 'mobile_money' and not self.mobile_money_provider:
            raise ValidationError("Mobile money provider is required for mobile money payments.")
        
        # Validate phone number for mobile money payments
        if self.payment_method == 'mobile_money' and not self.phone_number:
            raise ValidationError("Phone number is required for mobile money payments.")

    def save(self, *args, **kwargs):
        """
        Override save method to add validation and generate transaction ID.
        
        Args:
            *args: Variable length argument list
            **kwargs: Arbitrary keyword arguments
        """
        # Generate transaction ID if not provided
        if not self.transaction_id:
            self.transaction_id = f"TXN_{uuid.uuid4().hex[:16].upper()}"
        
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_mobile_money(self):
        """
        Check if this is a mobile money payment.
        
        Returns:
            bool: True if payment method is mobile money
        """
        return self.payment_method == 'mobile_money'

    @property
    def is_cash(self):
        """
        Check if this is a cash payment.
        
        Returns:
            bool: True if payment method is cash
        """
        return self.payment_method == 'cash'

    @property
    def payment_summary(self):
        """
        Get payment summary for display.
        
        Returns:
            dict: Payment summary information
        """
        summary = {
            'amount': self.amount,
            'method': self.get_payment_method_display(),
            'status': self.get_status_display(),
            'transaction_id': self.transaction_id,
        }
        
        if self.is_mobile_money:
            summary['provider'] = self.get_mobile_money_provider_display()
            summary['phone_number'] = self.phone_number
        
        return summary

    class Meta:
        """Meta options for the Payment model."""
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ['-created_at']  # Most recent first
        
        # Database constraints
        constraints = [
            models.CheckConstraint(
                check=models.Q(booking__isnull=False) | models.Q(order__isnull=False),
                name='payment_has_booking_or_order',
                violation_error_message="Payment must be associated with either a booking or order."
            )
        ]