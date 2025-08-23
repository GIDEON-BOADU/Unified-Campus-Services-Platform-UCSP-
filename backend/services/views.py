"""
Service views for managing services and orders.
Provides endpoints for service management and different service types.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.db.models import Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta
from .models import Service, Order, Review, VendorProfile
from .serializers import (
    ServiceSerializer, ServiceListSerializer, ServiceAvailabilitySerializer,
    OrderSerializer, OrderStatusUpdateSerializer, ServiceContactSerializer,
    ReviewSerializer, ReviewCreateSerializer, VendorProfileSerializer
)


class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing services.
    
    Features:
    - Role-based access control
    - Service type filtering
    - Availability management
    - Contact information handling
    """
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter services based on user type and permissions.
        
        Returns:
            QuerySet: Filtered services for the current user
        """
        user = self.request.user

        if not getattr(user, 'is_authenticated', False):
            # Anonymous users should see public/available services
            return Service.objects.filter(is_available=True)

        if user.user_type == 'vendor':
            # Vendors can see their own services
            return Service.objects.filter(vendor=user)
        elif user.user_type == 'student':
            # Students can see all available services
            return Service.objects.filter(is_available=True)
        elif user.user_type == 'admin':
            # Admins can see all services
            return Service.objects.all()
        else:
            # Unknown user type - return empty queryset
            return Service.objects.none()

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        
        Returns:
            Serializer: Appropriate serializer class
        """
        if self.action == 'list':
            return ServiceListSerializer
        elif self.action in ['update_availability']:
            return ServiceAvailabilitySerializer
        return ServiceSerializer

    def perform_create(self, serializer):
        """
        Set the vendor when creating a service.
        
        Args:
            serializer: Service serializer instance
        """
        serializer.save(vendor=self.request.user)

    def perform_update(self, serializer):
        """
        Validate permissions before updating service.
        
        Args:
            serializer: Service serializer instance
        """
        service = serializer.instance
        
        # Check if user is the vendor for this service
        if self.request.user.user_type != 'vendor' or service.vendor != self.request.user:
            raise PermissionError("You can only update your own services.")
        
        serializer.save()

    @action(detail=True, methods=['post'])
    def update_availability(self, request, pk=None):
        """
        Update service availability status.
        
        Endpoint: POST /api/services/{id}/update_availability/
        
        Authentication: Required (JWT token)
        Permissions: Vendor can update their own services
        
        Returns:
        - 200: Availability updated successfully
        - 403: Permission denied
        - 400: Invalid status transition
        """
        try:
            service = self.get_object()
            
            # Check if user is the vendor for this service
            if request.user.user_type != 'vendor' or service.vendor != request.user:
                return Response({
                    'message': 'Permission denied',
                    'errors': {'detail': 'You can only update your own services.'}
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ServiceAvailabilitySerializer(
                service, 
                data=request.data, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Service availability updated successfully',
                    'service': ServiceSerializer(service).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Failed to update availability',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'message': 'Failed to update availability',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Get services filtered by service type.
        
        Endpoint: GET /api/services/by_type/?service_type=booking
        
        Query Parameters:
        - service_type: booking, ordering, contact, walk_in
        
        Returns:
        - 200: List of services filtered by type
        """
        try:
            service_type = request.query_params.get('service_type')
            if not service_type:
                return Response({
                    'message': 'Service type parameter is required',
                    'errors': {'service_type': 'Please specify a service type.'}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate service type
            valid_types = ['booking', 'ordering', 'contact', 'walk_in']
            if service_type not in valid_types:
                return Response({
                    'message': 'Invalid service type',
                    'errors': {'service_type': f'Must be one of: {", ".join(valid_types)}'}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Filter services by type
            services = self.get_queryset().filter(service_type=service_type)
            serializer = ServiceListSerializer(services, many=True)
            
            return Response({
                'message': f'Services filtered by type: {service_type}',
                'services': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to filter services',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Get services filtered by category.
        
        Endpoint: GET /api/services/by_category/?category=food
        
        Query Parameters:
        - category: food, beauty, printing, academic, etc.
        
        Returns:
        - 200: List of services filtered by category
        """
        try:
            category = request.query_params.get('category')
            if not category:
                return Response({
                    'message': 'Category parameter is required',
                    'errors': {'category': 'Please specify a category.'}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Filter services by category
            services = self.get_queryset().filter(category=category)
            serializer = ServiceListSerializer(services, many=True)
            
            return Response({
                'message': f'Services filtered by category: {category}',
                'services': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to filter services',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='categories')
    def categories(self, request):
        """
        List available service categories and their labels.

        Endpoint: GET /api/services/categories/
        Authentication: Not required
        """
        categories = [
            {"key": key, "label": label}
            for key, label in Service.CATEGORY_CHOICES
        ]
        return Response({
            'message': 'Service categories',
            'categories': categories
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def contact_info(self, request, pk=None):
        """
        Get contact information for contact-type services.
        
        Endpoint: GET /api/services/{id}/contact_info/
        
        Returns:
        - 200: Contact information for the service
        - 400: Service is not contact type
        """
        try:
            service = self.get_object()
            
            # Check if service is contact type
            if service.service_type != 'contact':
                return Response({
                    'message': 'Service is not contact type',
                    'errors': {'detail': 'This service does not require direct contact.'}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = ServiceContactSerializer(service)
            return Response({
                'message': 'Contact information retrieved successfully',
                'contact_info': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve contact information',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """
        Get reviews for a specific service.
        
        Endpoint: GET /api/services/{id}/reviews/
        
        Authentication: Not required
        
        Returns:
        - 200: List of reviews for the service
        """
        try:
            service = self.get_object()
            reviews = Review.objects.filter(service=service).order_by('-created_at')
            serializer = ReviewSerializer(reviews, many=True)
            
            return Response({
                'message': 'Reviews retrieved successfully',
                'reviews': serializer.data,
                'average_rating': service.rating,
                'total_reviews': service.total_ratings
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve reviews',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        """
        Add a review to a service.
        
        Endpoint: POST /api/services/{id}/add_review/
        
        Authentication: Required (JWT token)
        Permissions: Only students can add reviews
        
        Request Body:
        {
            "rating": 5,
            "comment": "Great service!"
        }
        
        Returns:
        - 201: Review added successfully
        - 403: Permission denied (not a student or already reviewed)
        - 400: Invalid data
        """
        try:
            service = self.get_object()
            user = request.user
            
            # Check if user is a student
            if user.user_type != 'student':
                return Response({
                    'message': 'Permission denied',
                    'errors': {'detail': 'Only students can add reviews.'}
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if user has already reviewed this service
            existing_review = Review.objects.filter(service=service, user=user).first()
            if existing_review:
                return Response({
                    'message': 'Already reviewed',
                    'errors': {'detail': 'You have already reviewed this service.'}
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Create the review
            serializer = ReviewCreateSerializer(data=request.data)
            if serializer.is_valid():
                review = serializer.save(service=service, user=user)
                
                return Response({
                    'message': 'Review added successfully',
                    'review': ReviewSerializer(review).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'message': 'Failed to add review',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'message': 'Failed to add review',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['put', 'patch'])
    def update_review(self, request, pk=None):
        """
        Update user's review for a service.
        
        Endpoint: PUT/PATCH /api/services/{id}/update_review/
        
        Authentication: Required (JWT token)
        Permissions: Only the review author can update
        
        Request Body:
        {
            "rating": 4,
            "comment": "Updated comment"
        }
        
        Returns:
        - 200: Review updated successfully
        - 403: Permission denied
        - 404: Review not found
        - 400: Invalid data
        """
        try:
            service = self.get_object()
            user = request.user
            
            # Find the user's review for this service
            review = Review.objects.filter(service=service, user=user).first()
            if not review:
                return Response({
                    'message': 'Review not found',
                    'errors': {'detail': 'You have not reviewed this service yet.'}
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Update the review
            serializer = ReviewCreateSerializer(review, data=request.data, partial=True)
            if serializer.is_valid():
                updated_review = serializer.save()
                
                return Response({
                    'message': 'Review updated successfully',
                    'review': ReviewSerializer(updated_review).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Failed to update review',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'message': 'Failed to update review',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['delete'])
    def delete_review(self, request, pk=None):
        """
        Delete user's review for a service.
        
        Endpoint: DELETE /api/services/{id}/delete_review/
        
        Authentication: Required (JWT token)
        Permissions: Only the review author can delete
        
        Returns:
        - 200: Review deleted successfully
        - 403: Permission denied
        - 404: Review not found
        """
        try:
            service = self.get_object()
            user = request.user
            
            # Find the user's review for this service
            review = Review.objects.filter(service=service, user=user).first()
            if not review:
                return Response({
                    'message': 'Review not found',
                    'errors': {'detail': 'You have not reviewed this service yet.'}
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Delete the review
            review.delete()
            
            return Response({
                'message': 'Review deleted successfully'
            }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({
                'message': 'Failed to delete review',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        """
        Get top-rated services.
        
        Endpoint: GET /api/services/top_rated/
        
        Query Parameters:
        - limit: Number of services to return (default: 10)
        - category: Filter by category (optional)
        
        Returns:
        - 200: List of top-rated services
        """
        try:
            limit = int(request.query_params.get('limit', 10))
            category = request.query_params.get('category')
            
            # Filter services by rating
            services = self.get_queryset().filter(
                rating__isnull=False,
                is_available=True
            ).order_by('-rating', '-total_ratings')
            
            # Apply category filter if provided
            if category:
                services = services.filter(category=category)
            
            # Limit results
            services = services[:limit]
            serializer = ServiceListSerializer(services, many=True)
            
            return Response({
                'message': 'Top-rated services retrieved successfully',
                'services': serializer.data
            }, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response({
                'message': 'Invalid limit parameter',
                'errors': {'limit': 'Must be a valid integer.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve top-rated services',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Get popular services (most reviewed).
        
        Endpoint: GET /api/services/popular/
        
        Query Parameters:
        - limit: Number of services to return (default: 10)
        - category: Filter by category (optional)
        
        Returns:
        - 200: List of popular services
        """
        try:
            limit = int(request.query_params.get('limit', 10))
            category = request.query_params.get('category')
            
            # Filter services by number of reviews
            services = self.get_queryset().filter(
                total_ratings__gt=0,
                is_available=True
            ).order_by('-total_ratings', '-rating')
            
            # Apply category filter if provided
            if category:
                services = services.filter(category=category)
            
            # Limit results
            services = services[:limit]
            serializer = ServiceListSerializer(services, many=True)
            
            return Response({
                'message': 'Popular services retrieved successfully',
                'services': serializer.data
            }, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response({
                'message': 'Invalid limit parameter',
                'errors': {'limit': 'Must be a valid integer.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve popular services',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def vendor_services(self, request):
        """
        Get all services from a specific vendor/shop.
        
        Endpoint: GET /api/services/vendor_services/?vendor_id=123
        
        Query Parameters:
        - vendor_id: ID of the vendor (required)
        - service_type: Filter by service type (optional)
        - category: Filter by category (optional)
        
        Returns:
        - 200: List of services from the vendor
        - 400: Missing vendor_id parameter
        - 404: Vendor not found
        """
        try:
            vendor_id = request.query_params.get('vendor_id')
            if not vendor_id:
                return Response({
                    'message': 'Vendor ID parameter is required',
                    'errors': {'vendor_id': 'Please specify a vendor ID.'}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get vendor services
            services = self.get_queryset().filter(vendor_id=vendor_id)
            
            # Apply additional filters
            service_type = request.query_params.get('service_type')
            if service_type:
                if service_type == 'booking':
                    services = services.filter(supports_booking=True)
                elif service_type == 'ordering':
                    services = services.filter(supports_ordering=True)
                elif service_type == 'walk_in':
                    services = services.filter(supports_walk_in=True)
                elif service_type == 'contact':
                    services = services.filter(requires_contact=True)
            
            category = request.query_params.get('category')
            if category:
                services = services.filter(category=category)
            
            # Check if vendor exists
            if not services.exists():
                return Response({
                    'message': 'Vendor not found or no services available',
                    'errors': {'vendor_id': 'No services found for this vendor.'}
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = ServiceListSerializer(services, many=True)
            
            # Get vendor profile info
            vendor = services.first().vendor
            vendor_info = {
                'id': vendor.id,
                'username': vendor.username,
                'business_name': getattr(vendor.vendor_profile, 'business_name', vendor.username),
                'description': getattr(vendor.vendor_profile, 'description', ''),
                'business_hours': getattr(vendor.vendor_profile, 'business_hours', ''),
                'address': getattr(vendor.vendor_profile, 'address', ''),
                'phone': getattr(vendor.vendor_profile, 'phone', ''),
                'is_verified': getattr(vendor.vendor_profile, 'is_verified', False),
            }
            
            return Response({
                'message': f'Services from {vendor_info["business_name"]} retrieved successfully',
                'vendor': vendor_info,
                'services': serializer.data,
                'total_services': services.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve vendor services',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'by_type', 'by_category', 'reviews', 'top_rated', 'popular', 'vendor_services', 'contact_info', 'categories']:
            return [AllowAny()]
        return [IsAuthenticated()]


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing orders.
    
    Features:
    - Order creation and management
    - Status updates
    - Role-based access control
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter orders based on user type and permissions.
        
        Returns:
            QuerySet: Filtered orders for the current user
        """
        user = self.request.user
        
        if user.user_type == 'student':
            # Students can see their own orders
            return Order.objects.filter(customer=user)
        elif user.user_type == 'vendor':
            # Vendors can see orders for their services
            return Order.objects.filter(service__vendor=user)
        elif user.user_type == 'admin':
            # Admins can see all orders
            return Order.objects.all()
        else:
            # Unknown user type - return empty queryset
            return Order.objects.none()

    def perform_create(self, serializer):
        """
        Set the customer when creating an order.
        
        Args:
            serializer: Order serializer instance
        """
        serializer.save(customer=self.request.user)

    def perform_update(self, serializer):
        """
        Validate permissions before updating order.
        
        Args:
            serializer: Order serializer instance
        """
        order = serializer.instance
        user = self.request.user
        
        # Check permissions
        if user.user_type == 'student' and order.customer != user:
            raise PermissionError("You can only update your own orders.")
        elif user.user_type == 'vendor' and order.service.vendor != user:
            raise PermissionError("You can only update orders for your services.")
        
        serializer.save()

    @action(detail=True, methods=['post'])
    def confirm_order(self, request, pk=None):
        """
        Confirm an order (vendor only).
        
        Endpoint: POST /api/orders/{id}/confirm_order/
        
        Authentication: Required (JWT token)
        Permissions: Vendor can confirm orders for their services
        
        Returns:
        - 200: Order confirmed successfully
        - 403: Permission denied
        - 400: Invalid status transition
        """
        try:
            order = self.get_object()
            
            # Check if user is the vendor for this order
            if request.user.user_type != 'vendor' or order.service.vendor != request.user:
                return Response({
                    'message': 'Permission denied',
                    'errors': {'detail': 'Only the service vendor can confirm orders.'}
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update status to confirmed
            serializer = OrderStatusUpdateSerializer(
                order, 
                data={'order_status': 'confirmed'}, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Order confirmed successfully',
                    'order': OrderSerializer(order).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Failed to confirm order',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'message': 'Failed to confirm order',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update order status (vendor only).
        
        Endpoint: POST /api/orders/{id}/update_status/
        
        Authentication: Required (JWT token)
        Permissions: Vendor can update orders for their services
        
        Returns:
        - 200: Order status updated successfully
        - 403: Permission denied
        - 400: Invalid status transition
        """
        try:
            order = self.get_object()
            
            # Check if user is the vendor for this order
            if request.user.user_type != 'vendor' or order.service.vendor != request.user:
                return Response({
                    'message': 'Permission denied',
                    'errors': {'detail': 'Only the service vendor can update order status.'}
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = OrderStatusUpdateSerializer(
                order, 
                data=request.data, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Order status updated successfully',
                    'order': OrderSerializer(order).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Failed to update order status',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'message': 'Failed to update order status',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """
        Get current user's orders.
        
        Endpoint: GET /api/orders/my_orders/
        
        Authentication: Required (JWT token)
        
        Returns:
        - 200: List of user's orders
        """
        try:
            user = request.user
            orders = Order.objects.filter(customer=user).order_by('-created_at')
            serializer = OrderSerializer(orders, many=True)
            
            return Response({
                'message': 'Your orders retrieved successfully',
                'orders': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve orders',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing reviews.
    
    Features:
    - Review creation and management
    - User permission validation
    - Service rating updates
    """
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter reviews based on user type and permissions.
        
        Returns:
            QuerySet: Filtered reviews for the current user
        """
        user = self.request.user
        
        if user.user_type == 'student':
            # Students can see their own reviews
            return Review.objects.filter(user=user)
        elif user.user_type == 'vendor':
            # Vendors can see reviews for their services
            return Review.objects.filter(service__vendor=user)
        elif user.user_type == 'admin':
            # Admins can see all reviews
            return Review.objects.all()
        else:
            # Unknown user type - return empty queryset
            return Review.objects.none()

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        
        Returns:
            Serializer: Appropriate serializer class
        """
        if self.action in ['create', 'update', 'partial_update']:
            return ReviewCreateSerializer
        return ReviewSerializer

    def perform_create(self, serializer):
        """
        Set the user when creating a review.
        
        Args:
            serializer: Review serializer instance
        """
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """
        Validate permissions before updating review.
        
        Args:
            serializer: Review serializer instance
        """
        review = serializer.instance
        user = self.request.user
        
        # Check permissions
        if user.user_type == 'student' and review.user != user:
            raise PermissionError("You can only update your own reviews.")
        elif user.user_type == 'vendor' and review.service.vendor != user:
            raise PermissionError("You can only update reviews for your services.")
        
        serializer.save()

    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """
        Get current user's reviews.
        
        Endpoint: GET /api/reviews/my_reviews/
        
        Authentication: Required (JWT token)
        
        Returns:
        - 200: List of user's reviews
        """
        try:
            user = request.user
            reviews = Review.objects.filter(user=user).order_by('-created_at')
            serializer = ReviewSerializer(reviews, many=True)
            
            return Response({
                'message': 'Your reviews retrieved successfully',
                'reviews': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve reviews',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VendorProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing vendor profiles.
    
    Features:
    - Vendor profile management
    - Business information display
    - Verification status
    """
    serializer_class = VendorProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter vendor profiles based on user type and permissions.
        
        Returns:
            QuerySet: Filtered vendor profiles for the current user
        """
        user = self.request.user
        
        if user.user_type == 'vendor':
            # Vendors can see their own profile
            return VendorProfile.objects.filter(user=user)
        elif user.user_type == 'student':
            # Students can see all active vendor profiles
            return VendorProfile.objects.filter(is_active=True)
        elif user.user_type == 'admin':
            # Admins can see all vendor profiles
            return VendorProfile.objects.all()
        else:
            # Unknown user type - return empty queryset
            return VendorProfile.objects.none()

    def perform_create(self, serializer):
        """
        Set the user when creating a vendor profile.
        
        Args:
            serializer: VendorProfile serializer instance
        """
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """
        Validate permissions before updating vendor profile.
        
        Args:
            serializer: VendorProfile serializer instance
        """
        profile = serializer.instance
        
        # Check if user is the vendor for this profile
        if self.request.user.user_type != 'vendor' or profile.user != self.request.user:
            raise PermissionError("You can only update your own vendor profile.")
        
        serializer.save()

    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """
        Get current vendor's profile.
        
        Endpoint: GET /api/vendor-profiles/my_profile/
        
        Authentication: Required (JWT token)
        Permissions: Vendor only
        
        Returns:
        - 200: Vendor's profile information
        - 403: Not a vendor
        """
        try:
            user = request.user
            
            if user.user_type != 'vendor':
                return Response({
                    'message': 'Permission denied',
                    'errors': {'detail': 'Only vendors can access vendor profiles.'}
                }, status=status.HTTP_403_FORBIDDEN)
            
            profile = VendorProfile.objects.filter(user=user).first()
            if not profile:
                return Response({
                    'message': 'Vendor profile not found',
                    'errors': {'detail': 'Please create your vendor profile first.'}
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = VendorProfileSerializer(profile)
            
            return Response({
                'message': 'Vendor profile retrieved successfully',
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve vendor profile',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def verified_vendors(self, request):
        """
        Get all verified vendor profiles.
        
        Endpoint: GET /api/vendor-profiles/verified_vendors/
        
        Authentication: Not required
        
        Returns:
        - 200: List of verified vendor profiles
        """
        try:
            profiles = VendorProfile.objects.filter(
                is_verified=True,
                is_active=True
            ).order_by('business_name')
            
            serializer = VendorProfileSerializer(profiles, many=True)
            
            return Response({
                'message': 'Verified vendors retrieved successfully',
                'vendors': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve verified vendors',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def vendor_dashboard(self, request):
        """
        Get vendor's dashboard data.
        
        Endpoint: GET /api/vendor-profiles/vendor_dashboard/
        
        Authentication: Required (JWT token)
        Permissions: Vendor only
        
        Returns:
        - 200: Vendor's dashboard data
        - 403: Not a vendor
        """
        try:
            user = request.user
            
            if user.user_type != 'vendor':
                return Response({
                    'message': 'Permission denied',
                    'errors': {'detail': 'Only vendors can access vendor profiles.'}
                }, status=status.HTTP_403_FORBIDDEN)
            
            profile = VendorProfile.objects.filter(user=user).first()
            if not profile:
                return Response({
                    'message': 'Vendor profile not found',
                    'errors': {'detail': 'Please create your vendor profile first.'}
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Calculate dashboard data
            current_date = timezone.now().date()
            one_month_ago = current_date - timedelta(days=30)
            
            total_services = Service.objects.filter(vendor=user).count()
            total_orders = Order.objects.filter(service__vendor=user).count()
            total_revenue = Order.objects.filter(service__vendor=user, order_status='confirmed').aggregate(Sum('price'))['price__sum'] or 0
            total_reviews = Review.objects.filter(service__vendor=user).count()
            average_rating = Review.objects.filter(service__vendor=user).aggregate(Avg('rating'))['rating__avg'] or 0
            recent_orders = Order.objects.filter(service__vendor=user, created_at__gte=one_month_ago).count()
            recent_revenue = Order.objects.filter(service__vendor=user, order_status='confirmed', created_at__gte=one_month_ago).aggregate(Sum('price'))['price__sum'] or 0
            
            return Response({
                'message': 'Vendor dashboard retrieved successfully',
                'total_services': total_services,
                'total_orders': total_orders,
                'total_revenue': total_revenue,
                'total_reviews': total_reviews,
                'average_rating': average_rating,
                'recent_orders': recent_orders,
                'recent_revenue': recent_revenue
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve vendor dashboard',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)