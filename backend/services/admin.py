"""
Admin configuration for service models.
Provides admin interfaces for services, service items, and orders.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Min, Max
from .models import Service, ServiceItem, Order, OrderItem, Review, VendorProfile


class ServiceItemInline(admin.TabularInline):
    """
    Inline admin for service items.
    Allows adding/editing service items directly in the service admin.
    """
    model = ServiceItem
    extra = 1
    fields = ('name', 'description', 'price', 'image', 'is_available')
    list_display = ('name', 'price', 'is_available')


class OrderItemInline(admin.TabularInline):
    """
    Inline admin for order items.
    Allows viewing order items directly in the order admin.
    """
    model = OrderItem
    extra = 0
    readonly_fields = ('service_item', 'quantity', 'unit_price', 'total_price')
    fields = ('service_item', 'quantity', 'unit_price', 'total_price')
    can_delete = False


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """
    Admin interface for Service model.
    - Cleaned up for best practices and error safety
    """
    list_display = (
        'service_name', 'vendor', 'price_display', 'service_type', 'category', 
        'rating_display', 'total_ratings', 'availability_status', 'is_available', 'created_at'
    )
    list_filter = (
        'is_available', 'availability_status', 'category', 'service_type', 
        'has_flexible_pricing', 'created_at'
    )
    search_fields = ('service_name', 'description', 'vendor__username', 'location')
    readonly_fields = ('created_at', 'updated_at', 'min_price', 'max_price')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('vendor', 'service_name', 'description', 'category', 'service_type')
        }),
        ('Pricing', {
            'fields': ('has_flexible_pricing', 'base_price', 'min_price', 'max_price'),
            'classes': ('collapse',)
        }),
        ('Availability', {
            'fields': ('is_available', 'availability_status')
        }),
        ('Contact & Location', {
            'fields': ('contact_info', 'location'),
            'classes': ('collapse',)
        }),
        ('Media', {
            'fields': ('images',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ServiceItemInline]
    
    def price_display(self, obj):
        """
        Display price information based on pricing type.
        Handles None values gracefully.
        """
        if getattr(obj, 'has_flexible_pricing', False):
            if hasattr(obj, 'service_items') and obj.service_items.exists():
                min_price = obj.service_items.aggregate(Min('price'))['price__min']
                max_price = obj.service_items.aggregate(Max('price'))['price__max']
                if min_price == max_price:
                    return format_html('<span style="color: green;">GHS {}</span>', min_price)
                else:
                    return format_html(
                        '<span style="color: blue;">GHS {} - GHS {}</span>', 
                        min_price, max_price
                    )
            else:
                return format_html('<span style="color: orange;">No items set</span>')
        else:
            if getattr(obj, 'base_price', None) is not None:
                return format_html('<span style="color: green;">GHS {}</span>', obj.base_price)
            else:
                return format_html('<span style="color: red;">No price set</span>')
    
    price_display.short_description = 'Price'
    price_display.admin_order_field = 'base_price'
    
    def min_price(self, obj):
        """
        Display minimum price for the service.
        
        Args:
            obj: Service instance
            
        Returns:
            str: Minimum price or N/A
        """
        if getattr(obj, 'has_flexible_pricing', False) and hasattr(obj, 'service_items') and obj.service_items.exists():
            return f"GHS {obj.service_items.aggregate(Min('price'))['price__min']}"
        elif getattr(obj, 'base_price', None) is not None:
            return f"GHS {obj.base_price}"
        return "N/A"
    
    min_price.short_description = 'Minimum Price'
    
    def max_price(self, obj):
        """
        Display maximum price for the service.
        
        Args:
            obj: Service instance
            
        Returns:
            str: Maximum price or N/A
        """
        if getattr(obj, 'has_flexible_pricing', False) and hasattr(obj, 'service_items') and obj.service_items.exists():
            return f"GHS {obj.service_items.aggregate(Max('price'))['price__max']}"
        elif getattr(obj, 'base_price', None) is not None:
            return f"GHS {obj.base_price}"
        return "N/A"
    
    max_price.short_description = 'Maximum Price'
    
    def rating_display(self, obj):
        """
        Display rating with stars. Handles None values gracefully.
        """
        rating = getattr(obj, 'rating', None)
        if rating is not None:
            try:
                stars = "★" * int(round(float(rating))) + "☆" * (5 - int(round(float(rating))))
                return format_html(
                    '<span style="color: gold;">{} ({})</span>', 
                    stars, rating
                )
            except Exception:
                return format_html('<span style="color: gray;">Invalid rating</span>')
        return format_html('<span style="color: gray;">No ratings</span>')
    
    rating_display.short_description = 'Rating'
    rating_display.admin_order_field = 'rating'
    
    def get_queryset(self, request):
        """
        Optimize queryset with related fields.
        
        Args:
            request: HTTP request
            
        Returns:
            QuerySet: Optimized queryset
        """
        return super().get_queryset(request).select_related('vendor')


@admin.register(ServiceItem)
class ServiceItemAdmin(admin.ModelAdmin):
    """
    Admin interface for ServiceItem model.
    
    Features:
    - Service item management
    - Price and availability tracking
    - Filtering by service and availability
    """
    list_display = ('name', 'service', 'image_display', 'price', 'is_available', 'created_at')
    list_filter = ('is_available', 'service__category', 'service__service_type', 'created_at')
    search_fields = ('name', 'description', 'service__service_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('service', 'name', 'description', 'image')
        }),
        ('Pricing & Availability', {
            'fields': ('price', 'is_available')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_display(self, obj):
        """
        Display image thumbnail in admin list.
        
        Args:
            obj: ServiceItem instance
            
        Returns:
            str: HTML for image display
        """
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px;" />',
                obj.image.url
            )
        return "No Image"
    
    image_display.short_description = 'Image'
    
    def get_queryset(self, request):
        """
        Optimize queryset with related fields.
        
        Args:
            request: HTTP request
            
        Returns:
            QuerySet: Optimized queryset
        """
        return super().get_queryset(request).select_related('service')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Admin interface for Order model.
    
    Features:
    - Order management and tracking
    - Order items display
    - Status management
    - Customer and vendor information
    """
    list_display = (
        'id', 'customer', 'service', 'order_status', 'total_amount', 
        'created_at'
    )
    list_filter = (
        'order_status', 'service__category', 'service__service_type', 
        'created_at'
    )
    search_fields = (
        'customer__username', 'customer__email', 'service__service_name', 
        'special_instructions', 'delivery_address'
    )
    readonly_fields = ('created_at', 'updated_at', 'total_amount')
    
    fieldsets = (
        ('Order Information', {
            'fields': ('service', 'customer', 'order_status', 'total_amount')
        }),
        ('Order Details', {
            'fields': ('special_instructions', 'delivery_address')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [OrderItemInline]
    
    def get_queryset(self, request):
        """
        Optimize queryset with related fields.
        
        Args:
            request: HTTP request
            
        Returns:
            QuerySet: Optimized queryset
        """
        return super().get_queryset(request).select_related('service', 'customer')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """
    Admin interface for OrderItem model.
    
    Features:
    - Order item details
    - Price calculations
    - Service item relationships
    """
    list_display = ('id', 'order', 'service_item', 'quantity', 'unit_price', 'total_price')
    list_filter = ('service_item__service__category', 'created_at')
    search_fields = ('order__id', 'service_item__name', 'service_item__service__service_name')
    readonly_fields = ('created_at', 'total_price')
    
    fieldsets = (
        ('Order Item Information', {
            'fields': ('order', 'service_item', 'quantity', 'unit_price', 'total_price')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimize queryset with related fields.
        
        Args:
            request: HTTP request
            
        Returns:
            QuerySet: Optimized queryset
        """
        return super().get_queryset(request).select_related('order', 'service_item')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """
    Admin interface for Review model.
    
    Features:
    - Review management and moderation
    - Rating display with stars
    - User and service information
    - Comment moderation
    """
    list_display = (
        'id', 'user', 'service', 'rating_display', 'comment_preview', 'created_at'
    )
    list_filter = (
        'rating', 'service__category', 'service__service_type', 'created_at'
    )
    search_fields = (
        'user__username', 'user__email', 'service__service_name', 'comment'
    )
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Review Information', {
            'fields': ('service', 'user', 'rating', 'comment')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def rating_display(self, obj):
        """
        Display rating with stars.
        
        Args:
            obj: Review instance
            
        Returns:
            str: Formatted rating display
        """
        stars = "★" * obj.rating + "☆" * (5 - obj.rating)
        return format_html(
            '<span style="color: gold;">{} ({})</span>', 
            stars, obj.rating
        )
    
    rating_display.short_description = 'Rating'
    rating_display.admin_order_field = 'rating'
    
    def comment_preview(self, obj):
        """
        Display a preview of the comment.
        
        Args:
            obj: Review instance
            
        Returns:
            str: Comment preview
        """
        if obj.comment:
            return obj.comment[:100] + "..." if len(obj.comment) > 100 else obj.comment
        return "No comment"
    
    comment_preview.short_description = 'Comment Preview'
    
    def get_queryset(self, request):
        """
        Optimize queryset with related fields.
        
        Args:
            request: HTTP request
            
        Returns:
            QuerySet: Optimized queryset
        """
        return super().get_queryset(request).select_related('service', 'user')


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for VendorProfile model.
    
    Features:
    - Vendor profile management
    - Verification status management
    - Business information display
    """
    list_display = (
        'business_name', 'user', 'is_verified', 'is_active', 
        'phone', 'email', 'created_at'
    )
    list_filter = (
        'is_verified', 'is_active', 'created_at'
    )
    search_fields = (
        'business_name', 'user__username', 'user__email', 
        'phone', 'email', 'address'
    )
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Business Information', {
            'fields': ('user', 'business_name', 'description', 'logo')
        }),
        ('Contact Information', {
            'fields': ('phone', 'email', 'website', 'address')
        }),
        ('Business Hours', {
            'fields': ('business_hours',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_verified', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimize queryset with related fields.
        
        Args:
            request: HTTP request
            
        Returns:
            QuerySet: Optimized queryset
        """
        return super().get_queryset(request).select_related('user') 