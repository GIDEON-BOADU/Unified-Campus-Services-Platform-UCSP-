# services/models.py
from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal

"""
Service models for the UCSP platform.
Represents services offered by vendors to students with flexible pricing.
"""


class VendorProfile(models.Model):
    """
    Vendor profile model for shop/business information.
    
    This model stores detailed information about vendors/shops
    including business hours, location, contact info, etc.
    
    Attributes:
        user: The vendor user account
        business_name: Official business name
        description: Business description
        business_hours: Operating hours
        address: Physical address
        phone: Business phone number
        email: Business email
        website: Business website
        logo: Business logo
        is_verified: Whether the business is verified
        is_active: Whether the business is active
    """
    
    user = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        related_name="vendor_profile",
        help_text="The vendor user account"
    )
    business_name = models.CharField(
        max_length=200,
        help_text="Official business name"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Business description"
    )
    business_hours = models.TextField(
        blank=True,
        null=True,
        help_text="Operating hours (e.g., Mon-Fri 9AM-6PM)"
    )
    address = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Physical business address"
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Business phone number"
    )
    email = models.EmailField(
        blank=True,
        null=True,
        help_text="Business email address"
    )
    website = models.URLField(
        blank=True,
        null=True,
        help_text="Business website URL"
    )
    logo = models.ImageField(
        upload_to="vendor_logos/",
        blank=True,
        null=True,
        help_text="Business logo"
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether the business is verified by admin"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the business is currently active"
    )
    
    # Mobile Money fields
    mtn_momo_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="MTN Mobile Money number"
    )
    vodafone_cash_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Vodafone Cash number"
    )
    airtel_money_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Airtel Money number"
    )
    telecel_cash_number = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Telecel Cash number"
    )
    preferred_payment_method = models.CharField(
        max_length=20,
        choices=[
            ('mtn_momo', 'MTN Mobile Money'),
            ('vodafone_cash', 'Vodafone Cash'),
            ('airtel_money', 'Airtel Money'),
            ('telecel_cash', 'Telecel Cash'),
            ('bank_transfer', 'Bank Transfer'),
            ('cash', 'Cash Payment'),
        ],
        default='mtn_momo',
        help_text="Preferred payment method"
    )
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when profile was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when profile was last updated"
    )
    
    def __str__(self):
        """
        String representation of the vendor profile.
        
        Returns:
            str: Business name and username
        """
        return f"{self.business_name} ({self.user.username})"
    
    def clean(self):
        """
        Validate vendor profile data.
        
        Raises:
            ValidationError: If validation rules are violated
        """
        # Validate user type
        if getattr(self.user, "user_type", None) != "vendor":
            raise ValidationError("Only users with 'vendor' type can have vendor profiles.")
    
    def save(self, *args, **kwargs):
        """
        Override save method to add validation.
        
        Raises:
            ValidationError: If validation fails
        """
        self.clean()
        super().save(*args, **kwargs)
    
    class Meta:
        """Meta options for the VendorProfile model."""
        
        verbose_name = "Vendor Profile"
        verbose_name_plural = "Vendor Profiles"
        ordering = ["business_name"]


class Service(models.Model):
    """
    Service model representing offerings by vendors.

    This model supports different service types with varying interaction models:
    - Booking services (barbering, appointments)
    - Ordering services (food delivery, takeaway)
    - Contact services (printing, consultations)

    Attributes:
        vendor: The vendor offering the service
        name: Service name
        description: Detailed service description
        category: Service category (food, beauty, printing, etc.)
        service_type: How students interact with the service
        base_price: Base service price (for simple services)
        is_available: Whether the service is currently available
        contact_info: Additional contact information (WhatsApp, etc.)
        location: Service location or delivery area
        images: Service images
        created_at: Timestamp when service was created
    """

    # Service categories for organization
    CATEGORY_CHOICES = (
        ("food", "Food & Beverages"),  # Restaurants, cafes, food delivery
        ("beauty", "Beauty & Grooming"),  # Barbering, salons, spas
        ("printing", "Printing & Copying"),  # Print shops, photocopying
        ("laundry", "Laundry Services"),  # Laundry, dry cleaning
        ("academic", "Academic Services"),  # Tutoring, assignment help
        ("transport", "Transportation"),  # Taxi, delivery services
        ("health", "Health & Wellness"),  # Medical, fitness services
        ("entertainment", "Entertainment"),  # Gaming, events, recreation
        ("gym", "Gym & Fitness"),  # Personal training, gym services
        ("other", "Other Services"),  # Miscellaneous services
    )

    # Service interaction types
    SERVICE_TYPE_CHOICES = (
        ("booking", "Booking Required"),  # Appointments, reservations (barbering)
        ("ordering", "Ordering System"),  # Food orders, product orders
        ("contact", "Contact Directly"),  # WhatsApp, phone, in-person
        ("walk_in", "Walk-in Service"),  # No booking needed, just show up
    )

    # Availability status
    AVAILABILITY_CHOICES = (
        ("available", "Available"),  # Service is currently available
        ("busy", "Busy/High Demand"),  # Available but with delays
        ("unavailable", "Unavailable"),  # Temporarily unavailable
        ("closed", "Closed"),  # Not operating (time/date)
    )

    # Relationships
    vendor = models.ForeignKey(
        "users.User",
        on_delete=models.PROTECT,
        related_name="services",
        help_text="The vendor offering this service",
    )

    # Basic service information
    service_name = models.CharField(max_length=200, help_text="Name of the service")
    description = models.TextField(help_text="Detailed description of the service")
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        help_text="Service category for organization",
    )
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_TYPE_CHOICES,
        default="contact",
        help_text="How students interact with this service",
    )

    # Pricing and availability
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Base service price in GHS (for simple services)",
    )
    has_flexible_pricing = models.BooleanField(
        default=False, help_text="Whether this service has multiple pricing options"
    )
    is_available = models.BooleanField(
        default=True, help_text="Whether the service is currently available"
    )
    availability_status = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default="available",
        help_text="Current availability status",
    )

    # Contact and location information
    contact_info = models.TextField(
        blank=True,
        null=True,
        help_text="Additional contact information (WhatsApp, phone, etc.)",
    )
    location = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Service location or delivery area",
    )

    # Media
    images = models.ImageField(
        upload_to="service_images/", blank=True, null=True, help_text="Service images"
    )

    # Rating and feedback
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Average rating of the service (1.00-5.00)"
    )
    total_ratings = models.PositiveIntegerField(
        default=0,
        help_text="Total number of ratings received"
    )

    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Timestamp when service was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True, help_text="Timestamp when service was last updated"
    )

    # Multiple service types support
    supports_booking = models.BooleanField(
        default=False,
        help_text="Whether this service supports booking/appointments"
    )
    supports_ordering = models.BooleanField(
        default=False,
        help_text="Whether this service supports ordering"
    )
    supports_walk_in = models.BooleanField(
        default=False,
        help_text="Whether this service supports walk-ins"
    )
    requires_contact = models.BooleanField(
        default=False,
        help_text="Whether this service requires direct contact"
    )

    def __str__(self):
        vendor_name = self.vendor.username if self.vendor else 'Unknown Vendor'
        service_type_display = self.get_service_type_display() if hasattr(self, 'get_service_type_display') else self.service_type
        return f"{self.service_name} by {vendor_name} ({service_type_display})"

    def clean(self):
        """
        Validate service data.

        Raises:
            ValidationError: If validation rules are violated
        """
        # Validate base price if provided
        if self.base_price is not None and self.base_price <= 0:
            raise ValidationError("Base price must be greater than zero.")

        # Validate vendor type
        if getattr(self.vendor, "user_type", None) != "vendor":
            raise ValidationError("Only users with 'vendor' type can create services.")

        # Validate contact info for contact-type services
        if self.service_type == "contact" and not self.contact_info:
            raise ValidationError(
                "Contact information is required for contact-type services."
            )

    def save(self, *args, **kwargs):
        """
        Override save method to add validation and set support flags.

        Raises:
            ValidationError: If validation fails
        """
        # Set support flags based on service_type
        self.supports_booking = self.service_type == 'booking'
        self.supports_ordering = self.service_type == 'ordering'
        self.supports_walk_in = self.service_type == 'walk_in'
        self.requires_contact = self.service_type == 'contact'
        
        self.clean()
        super().save(*args, **kwargs)

    @property
    def can_book(self):
        """
        Check if this service can be booked.

        Returns:
            bool: True if service supports booking
        """
        return self.supports_booking and self.is_available

    @property
    def can_order(self):
        """
        Check if this service can be ordered.

        Returns:
            bool: True if service supports ordering
        """
        return self.supports_ordering and self.is_available

    @property
    def can_walk_in(self):
        """
        Check if this service supports walk-ins.

        Returns:
            bool: True if service supports walk-ins
        """
        return self.supports_walk_in and self.is_available

    @property
    def needs_contact(self):
        """
        Check if this service requires direct contact.

        Returns:
            bool: True if service requires direct contact
        """
        return self.requires_contact

    @property
    def supported_service_types(self):
        """
        Get all service types that this service supports.

        Returns:
            list: List of supported service types
        """
        supported_types = []
        if self.supports_booking:
            supported_types.append('booking')
        if self.supports_ordering:
            supported_types.append('ordering')
        if self.supports_walk_in:
            supported_types.append('walk_in')
        if self.requires_contact:
            supported_types.append('contact')
        return supported_types

    @property
    def min_price(self):
        """
        Get minimum price for this service.

        Returns:
            Decimal: Minimum price available
        """
        if self.has_flexible_pricing:
            items = self.service_items.all()
            if items.exists():
                return min(item.price for item in items)
        return self.base_price or Decimal("0.00")

    @property
    def max_price(self):
        """
        Get maximum price for this service.

        Returns:
            Decimal: Maximum price available
        """
        if self.has_flexible_pricing:
            items = self.service_items.all()
            if items.exists():
                return max(item.price for item in items)
        return self.base_price or Decimal("0.00")

    class Meta:
        """Meta options for the Service model."""

        verbose_name = "Service"
        verbose_name_plural = "Services"
        ordering = ["-created_at"]  # Most recent first

        # Database constraints
        constraints = [
            models.UniqueConstraint(
                fields=["vendor", "service_name"],
                name="unique_vendor_service",
                violation_error_message="You already have a service with this name.",
            )
        ]


class ServiceItem(models.Model):
    """
    Service item model for flexible pricing.

    This model handles individual items within a service that have different prices.
    For example, laundry service might have different prices for shirts, pants, blankets.

    Attributes:
        service: The parent service
        name: Item name
        description: Item description
        price: Item price
        image:image of the service
        is_available: Whether this item is available
    """

    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name="service_items",
        help_text="The parent service",
    )
    name = models.CharField(max_length=200, help_text="Name of the service item")
    description = models.TextField(
        blank=True, null=True, help_text="Description of the service item"
    )
    price = models.DecimalField(
        max_digits=10, decimal_places=2, help_text="Price of this item in GHS"
    )
    image = models.ImageField(
        upload_to="service_item_images/",
        blank=True,
        null=True,
        help_text="image of the service item",
    )
    # Availability status
    is_available = models.BooleanField(
        default=True, help_text="Whether this item is currently available"
    )

    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Timestamp when item was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True, help_text="Timestamp when item was last updated"
    )

    def __str__(self):
        """
        String representation of the service item.

        Returns:
            str: Item name and price in readable format
        """
        return f"{self.name} - GHS {self.price}"

    def clean(self):
        """
        Validate service item data.

        Raises:
            ValidationError: If validation rules are violated
        """
        if self.price <= 0:
            raise ValidationError("Item price must be greater than zero.")

    def save(self, *args, **kwargs):
        """
        Override save method to add validation.

        Raises:
            ValidationError: If validation fails
        """
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        """Meta options for the ServiceItem model."""

        verbose_name = "Service Item"
        verbose_name_plural = "Service Items"
        ordering = ["name"]

        # Database constraints
        constraints = [
            models.UniqueConstraint(
                fields=["service", "name"],
                name="unique_service_item",
                violation_error_message="This service already has an item with this name.",
            )
        ]


class Order(models.Model):
    """
    Order model for food and product ordering services.

    This model handles orders for services that support ordering
    (like food delivery, takeaway, etc.).

    Attributes:
        service: The service being ordered
        customer: The student making the order
        order_items: Items in the order
        special_instructions: Custom instructions for the order
        delivery_address: Where to deliver the order
        order_status: Current status of the order
        total_amount: Total cost of the order
        created_at: Timestamp when order was created
    """

    # Order status choices
    STATUS_CHOICES = (
        ("pending", "Pending"),  # Order placed, awaiting confirmation
        ("confirmed", "Confirmed"),  # Vendor confirmed the order
        ("preparing", "Preparing"),  # Order is being prepared
        ("ready", "Ready"),  # Order is ready for pickup/delivery
        ("delivering", "Delivering"),  # Order is being delivered
        ("completed", "Completed"),  # Order delivered/picked up
        ("cancelled", "Cancelled"),  # Order was cancelled
    )

    # Relationships
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name="orders",
        help_text="The service being ordered",
    )
    customer = models.ForeignKey(
        "users.User",
        on_delete=models.PROTECT,
        related_name="orders",
        help_text="The student making the order",
    )

    # Order details
    special_instructions = models.TextField(
        blank=True, null=True, help_text="Special instructions for the order"
    )
    delivery_address = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Delivery address (if applicable)",
    )

    # Order status and pricing
    order_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        help_text="Current status of the order",
    )
    total_amount = models.DecimalField(
        max_digits=10, decimal_places=2, help_text="Total cost of the order"
    )

    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Timestamp when order was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True, help_text="Timestamp when order was last updated"
    )

    def __str__(self):
        """
        String representation of the order.

        Returns:
            str: Order details in readable format
        """
        customer_name = getattr(self.customer, "username", "Unknown Customer")
        service_name = getattr(self.service, "service_name", "Unknown Service")
        return f"Order by {customer_name} for {service_name} ({self.order_status})"

    def clean(self):
        """
        Validate order data.

        Raises:
            ValidationError: If validation rules are violated
        """
        # Validate customer type
        if getattr(self.customer, "user_type", None) != "student":
            raise ValidationError("Only students can place orders.")

        # Validate service type
        if self.service.service_type != "ordering":
            raise ValidationError(
                "Orders can only be placed for ordering-type services."
            )

        # Validate service availability
        service_instance = self.service if isinstance(self.service, Service) else Service.objects.get(pk=self.service_id)
        if not service_instance.is_available:
            raise ValidationError("Cannot place order for unavailable service.")

    def save(self, *args, **kwargs):
        """
        Override save method to add validation and calculate total.

        Raises:
            ValidationError: If validation fails
        """
        # Calculate total amount if not set
        if not self.total_amount:
            self.total_amount = self.calculate_total()

        self.clean()
        super().save(*args, **kwargs)

    def calculate_total(self):
        """
        Calculate total amount based on order items.

        Returns:
            Decimal: Total amount
        """
        total = Decimal("0.00")
        for item in self.order_items.all():
            total += item.total_price
        return total

    class Meta:
        """Meta options for the Order model."""

        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ["-created_at"]  # Most recent first


class OrderItem(models.Model):
    """
    Order item model for tracking individual items in orders.

    This model handles individual items within an order with their quantities
    and prices.

    Attributes:
        order: The parent order
        service_item: The service item being ordered
        quantity: Number of items
        unit_price: Price per unit
        total_price: Total price for this item
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="order_items",
        help_text="The parent order",
    )
    service_item = models.ForeignKey(
        ServiceItem,
        on_delete=models.CASCADE,
        help_text="The service item being ordered",
    )
    quantity = models.PositiveIntegerField(default=1, help_text="Number of items")
    unit_price = models.DecimalField(
        max_digits=10, decimal_places=2, help_text="Price per unit"
    )
    total_price = models.DecimalField(
        max_digits=10, decimal_places=2, help_text="Total price for this item"
    )

    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Timestamp when order item was created"
    )

    def __str__(self):
        """
        String representation of the order item.

        Returns:
            str: Item details in readable format
        """
        return f"{self.service_item.name} x{self.quantity} - GHS {self.total_price}"

    def save(self, *args, **kwargs):
        """
        Override save method to calculate total price.

        Args:
            *args: Variable length argument list
            **kwargs: Arbitrary keyword arguments
        """
        # Set unit price from service item if not set
        if not self.unit_price:
            self.unit_price = self.service_item.price

        # Calculate total price
        self.total_price = self.unit_price * self.quantity

        super().save(*args, **kwargs)

    class Meta:
        """Meta options for the OrderItem model."""

        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"
        ordering = ["created_at"]


class Review(models.Model):
    """
    Review model for user feedback on services.
    
    This model allows students to provide detailed feedback and ratings
    for services they have used.
    
    Attributes:
        service: The service being reviewed
        user: The user writing the review (must be student)
        rating: Rating given (1-5)
        comment: Detailed review comment
        created_at: Timestamp when review was created
    """
    
    # Relationships
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name="reviews",
        help_text="The service being reviewed"
    )
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="reviews",
        help_text="The user writing the review"
    )
    
    # Review details
    rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        help_text="Rating from 1 to 5 stars"
    )
    comment = models.TextField(
        blank=True,
        null=True,
        help_text="Detailed review comment"
    )
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when review was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when review was last updated"
    )
    
    def __str__(self):
        """
        String representation of the review.
        
        Returns:
            str: Review details in readable format
        """
        user_name = getattr(self.user, "username", "Unknown User")
        service_name = getattr(self.service, "service_name", "Unknown Service")
        return f"{user_name}'s {self.rating}-star review of {service_name}"
    
    def clean(self):
        """
        Validate review data.
        
        Raises:
            ValidationError: If validation rules are violated
        """
        # Validate user type
        if getattr(self.user, "user_type", None) != "student":
            raise ValidationError("Only students can write reviews.")
        
        # Validate rating range
        if self.rating < 1 or self.rating > 5:
            raise ValidationError("Rating must be between 1 and 5.")
        
        # Check if user has already reviewed this service
        existing_review = Review.objects.filter(
            service=self.service,
            user=self.user
        ).exclude(id=self.id)
        
        if existing_review.exists():
            raise ValidationError("You have already reviewed this service.")
    
    def save(self, *args, **kwargs):
        """
        Override save method to add validation and update service rating.
        
        Args:
            *args: Variable length argument list
            **kwargs: Arbitrary keyword arguments
        """
        self.clean()
        super().save(*args, **kwargs)
        
        # Update service rating after saving
        self.update_service_rating()
    
    def update_service_rating(self):
        """
        Update the service's average rating and total ratings count.
        """
        service = self.service
        reviews = service.reviews.all()
        
        if reviews.exists():
            total_rating = sum(review.rating for review in reviews)
            avg_rating = total_rating / reviews.count()
            
            service.rating = round(avg_rating, 2)
            service.total_ratings = reviews.count()
        else:
            service.rating = None
            service.total_ratings = 0
        
        service.save(update_fields=['rating', 'total_ratings'])
    
    class Meta:
        """Meta options for the Review model."""
        
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        ordering = ["-created_at"]  # Most recent first
        
        # Database constraints
        constraints = [
            models.UniqueConstraint(
                fields=["service", "user"],
                name="unique_user_service_review",
                violation_error_message="You can only review a service once.",
            )
        ]


class PrintRequest(models.Model):
    """
    Print request model for printing services.
    
    This model handles print requests submitted by students for printing services.
    It stores the file to be printed along with printing specifications.
    
    Attributes:
        service: The printing service
        student: The student making the request
        file: The document to print
        copies: Number of copies requested
        paper_size: Size of paper (A4, A3, etc.)
        color_mode: Color or black & white
        special_instructions: Any special requirements
        contact_phone: Student's contact phone
        pickup_location: Where to pick up the printed documents
        status: Current status of the print request
        created_at: Timestamp when request was created
    """
    
    # Status choices
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('ready', 'Ready for Pickup'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Paper size choices
    PAPER_SIZE_CHOICES = [
        ('A4', 'A4'),
        ('A3', 'A3'),
        ('Letter', 'Letter'),
        ('Legal', 'Legal'),
    ]
    
    # Color mode choices
    COLOR_MODE_CHOICES = [
        ('black_white', 'Black & White'),
        ('color', 'Color'),
    ]
    
    # Relationships
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='print_requests',
        help_text="The printing service"
    )
    student = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='print_requests',
        help_text="The student making the request"
    )
    
    # File and printing details
    file = models.FileField(
        upload_to='print_requests/%Y/%m/%d/',
        help_text="The document to print"
    )
    copies = models.PositiveIntegerField(
        default=1,
        help_text="Number of copies requested"
    )
    paper_size = models.CharField(
        max_length=10,
        choices=PAPER_SIZE_CHOICES,
        default='A4',
        help_text="Size of paper"
    )
    color_mode = models.CharField(
        max_length=20,
        choices=COLOR_MODE_CHOICES,
        default='black_white',
        help_text="Color or black & white printing"
    )
    special_instructions = models.TextField(
        blank=True,
        help_text="Any special printing requirements"
    )
    contact_phone = models.CharField(
        max_length=15,
        blank=True,
        help_text="Student's contact phone number"
    )
    pickup_location = models.CharField(
        max_length=200,
        blank=True,
        help_text="Where to pick up the printed documents"
    )
    
    # Status and metadata
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Current status of the print request"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when request was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when request was last updated"
    )
    
    def __str__(self):
        """
        String representation of the print request.
        
        Returns:
            str: Print request details in readable format
        """
        student_name = getattr(self.student, "username", "Unknown Student")
        service_name = getattr(self.service, "service_name", "Unknown Service")
        return f"Print request by {student_name} for {service_name} ({self.status})"
    
    def clean(self):
        """
        Validate print request data.
        
        Raises:
            ValidationError: If validation rules are violated
        """
        # Validate student type
        if getattr(self.student, "user_type", None) != "student":
            raise ValidationError("Only students can make print requests.")
        
        # Validate service type
        if self.service.category != "printing":
            raise ValidationError("Print requests can only be made for printing services.")
        
        # Validate copies
        if self.copies <= 0:
            raise ValidationError("Number of copies must be greater than zero.")
        
        # Validate file size (max 10MB)
        if hasattr(self.file, 'size') and self.file.size > 10 * 1024 * 1024:
            raise ValidationError("File size must be less than 10MB.")
    
    def save(self, *args, **kwargs):
        """
        Override save method to add validation.
        
        Raises:
            ValidationError: If validation fails
        """
        self.clean()
        super().save(*args, **kwargs)
    
    class Meta:
        """Meta options for the PrintRequest model."""
        
        verbose_name = "Print Request"
        verbose_name_plural = "Print Requests"
        ordering = ["-created_at"]  # Most recent first
