"""
Admin configuration for payment models.
Provides admin interfaces for payments with enhanced mobile money support.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Admin interface for Payment model.
    
    Features:
    - Payment tracking and management
    - Mobile money provider support
    - Payment method categorization
    - Status management and filtering
    """
    list_display = (
        'id', 'booking', 'amount_display', 'payment_method_display', 
        'mobile_money_provider', 'status_display', 'created_at'
    )
    list_filter = (
        'status', 'payment_method', 'mobile_money_provider', 
        'booking__service__category', 'created_at'
    )
    search_fields = (
        'booking__service__name', 'booking__student__username', 
        'transaction_id', 'reference_number', 'phone_number'
    )
    readonly_fields = ('created_at', 'updated_at', 'transaction_id')
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('booking', 'order', 'amount', 'payment_method', 'status')
        }),
        ('Mobile Money Details', {
            'fields': ('mobile_money_provider', 'phone_number', 'reference_number'),
            'classes': ('collapse',)
        }),
        ('Transaction Details', {
            'fields': ('transaction_id', 'payment_notes'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def amount_display(self, obj):
        """
        Display amount with currency formatting.
        
        Args:
            obj: Payment instance
            
        Returns:
            str: Formatted amount display
        """
        if obj.amount:
            return format_html('<span style="color: green; font-weight: bold;">GHS {}</span>', obj.amount)
        return "N/A"
    
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'
    
    def payment_method_display(self, obj):
        """
        Display payment method with color coding.
        
        Args:
            obj: Payment instance
            
        Returns:
            str: Formatted payment method display
        """
        if obj.payment_method == 'mobile_money':
            return format_html(
                '<span style="color: blue; font-weight: bold;">Mobile Money</span>'
            )
        elif obj.payment_method == 'cash':
            return format_html(
                '<span style="color: green; font-weight: bold;">Cash</span>'
            )
        elif obj.payment_method == 'card':
            return format_html(
                '<span style="color: purple; font-weight: bold;">Card</span>'
            )
        elif obj.payment_method == 'bank_transfer':
            return format_html(
                '<span style="color: orange; font-weight: bold;">Bank Transfer</span>'
            )
        else:
            return format_html(
                '<span style="color: gray;">{}</span>', 
                obj.get_payment_method_display()
            )
    
    payment_method_display.short_description = 'Payment Method'
    payment_method_display.admin_order_field = 'payment_method'
    
    def status_display(self, obj):
        """
        Display payment status with color coding.
        
        Args:
            obj: Payment instance
            
        Returns:
            str: Formatted status display
        """
        if obj.status == 'pending':
            return format_html(
                '<span style="color: orange; font-weight: bold;">Pending</span>'
            )
        elif obj.status == 'processing':
            return format_html(
                '<span style="color: blue; font-weight: bold;">Processing</span>'
            )
        elif obj.status == 'successful':
            return format_html(
                '<span style="color: green; font-weight: bold;">Successful</span>'
            )
        elif obj.status == 'failed':
            return format_html(
                '<span style="color: red; font-weight: bold;">Failed</span>'
            )
        elif obj.status == 'cancelled':
            return format_html(
                '<span style="color: gray; font-weight: bold;">Cancelled</span>'
            )
        elif obj.status == 'refunded':
            return format_html(
                '<span style="color: purple; font-weight: bold;">Refunded</span>'
            )
        else:
            return format_html(
                '<span style="color: gray;">{}</span>', 
                obj.get_status_display()
            )
    
    status_display.short_description = 'Status'
    status_display.admin_order_field = 'status'
    
    def get_queryset(self, request):
        """
        Optimize queryset with related fields.
        
        Args:
            request: HTTP request
            
        Returns:
            QuerySet: Optimized queryset
        """
        return super().get_queryset(request).select_related(
            'booking__service', 'booking__student'
        )
    
    def get_readonly_fields(self, request, obj=None):
        """
        Make transaction_id readonly for existing payments.
        
        Args:
            request: HTTP request
            obj: Payment instance (None for new payments)
            
        Returns:
            tuple: Readonly fields
        """
        if obj:  # Editing existing payment
            return self.readonly_fields + ('transaction_id',)
        return self.readonly_fields