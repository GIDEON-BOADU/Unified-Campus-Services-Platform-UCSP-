"""
Booking views for managing service bookings.
Provides endpoints for creating, viewing, and managing bookings.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from .models import Booking
from .serializers import BookingSerializer, BookingStatusUpdateSerializer
from realtime_notifications.services import notification_service


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bookings.
    
    Features:
    - Role-based access control
    - Automatic student assignment
    - Status management
    - Custom actions for booking operations
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter bookings based on user type and permissions.
        
        Returns:
            QuerySet: Filtered bookings for the current user
        """
        user = self.request.user

        if not getattr(user, 'is_authenticated', False):
            return Booking.objects.none()

        if user.user_type == 'student':
            # Students can see their own bookings
            return Booking.objects.filter(student=user)
        elif user.user_type == 'vendor':
            # Vendors can see bookings for their services
            return Booking.objects.filter(service__vendor=user)
        elif user.user_type == 'admin':
            # Admins can see all bookings
            return Booking.objects.all()
        else:
            # Unknown user type - return empty queryset
            return Booking.objects.none()

    def perform_create(self, serializer):
        """
        Set the student when creating a booking and send notifications.
        
        Args:
            serializer: Booking serializer instance
        """
        booking = serializer.save(student=self.request.user)
        
        # Send real-time notification to vendor
        try:
            notification_service.send_booking_notification(booking)
        except Exception as e:
            # Log error but don't fail the booking creation
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send booking notification: {e}")

    def perform_update(self, serializer):
        """
        Validate permissions before updating booking.
        
        Args:
            serializer: Booking serializer instance
        """
        booking = serializer.instance
        user = self.request.user
        
        # Check permissions
        if user.user_type == 'student' and booking.student != user:
            raise PermissionError("You can only update your own bookings.")
        elif user.user_type == 'vendor' and booking.service.vendor != user:
            raise PermissionError("You can only update bookings for your services.")
        
        serializer.save()

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """
        Confirm a booking (vendor only).
        
        Endpoint: POST /api/bookings/{id}/confirm/
        
        Authentication: Required (JWT token)
        Permissions: Vendor can confirm bookings for their services
        
        Returns:
        - 200: Booking confirmed successfully
        - 403: Permission denied
        - 400: Invalid status transition
        """
        try:
            booking = self.get_object()
            
            # Check if user is the vendor for this booking
            if request.user.user_type != 'vendor' or booking.service.vendor != request.user:
                return Response({
                    'message': 'Permission denied',
                    'errors': {'detail': 'Only the service vendor can confirm bookings.'}
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update status to confirmed
            serializer = BookingStatusUpdateSerializer(
                booking, 
                data={'status': 'confirmed'}, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Booking confirmed successfully',
                    'booking': BookingSerializer(booking).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Failed to confirm booking',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'message': 'Failed to confirm booking',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a booking.
        
        Endpoint: POST /api/bookings/{id}/cancel/
        
        Authentication: Required (JWT token)
        Permissions: Student can cancel their own bookings, vendor can cancel bookings for their services
        
        Returns:
        - 200: Booking cancelled successfully
        - 403: Permission denied
        - 400: Invalid status transition
        """
        try:
            booking = self.get_object()
            user = request.user
            
            # Check permissions
            can_cancel = False
            if user.user_type == 'student' and booking.student == user:
                can_cancel = True
            elif user.user_type == 'vendor' and booking.service.vendor == user:
                can_cancel = True
            elif user.user_type == 'admin':
                can_cancel = True
            
            if not can_cancel:
                return Response({
                    'message': 'Permission denied',
                    'errors': {'detail': 'You do not have permission to cancel this booking.'}
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update status to cancelled
            serializer = BookingStatusUpdateSerializer(
                booking, 
                data={'status': 'cancelled'}, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Booking cancelled successfully',
                    'booking': BookingSerializer(booking).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Failed to cancel booking',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'message': 'Failed to cancel booking',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Mark a booking as completed (vendor only).
        
        Endpoint: POST /api/bookings/{id}/complete/
        
        Authentication: Required (JWT token)
        Permissions: Vendor can complete bookings for their services
        
        Returns:
        - 200: Booking completed successfully
        - 403: Permission denied
        - 400: Invalid status transition
        """
        try:
            booking = self.get_object()
            
            # Check if user is the vendor for this booking
            if request.user.user_type != 'vendor' or booking.service.vendor != request.user:
                return Response({
                    'message': 'Permission denied',
                    'errors': {'detail': 'Only the service vendor can complete bookings.'}
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update status to completed
            serializer = BookingStatusUpdateSerializer(
                booking, 
                data={'status': 'completed'}, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Booking completed successfully',
                    'booking': BookingSerializer(booking).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Failed to complete booking',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'message': 'Failed to complete booking',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Get upcoming bookings for the current user.
        
        Endpoint: GET /api/bookings/upcoming/
        
        Authentication: Required (JWT token)
        
        Returns:
        - 200: List of upcoming bookings
        """
        try:
            from django.utils import timezone
            
            user = request.user
            now = timezone.now()
            
            if user.user_type == 'student':
                bookings = Booking.objects.filter(
                    student=user,
                    booking_date__gte=now,
                    booking_status__in=['pending', 'confirmed']
                ).order_by('booking_date')
            elif user.user_type == 'vendor':
                bookings = Booking.objects.filter(
                    service__vendor=user,
                    booking_date__gte=now,
                    booking_status__in=['pending', 'confirmed']
                ).order_by('booking_date')
            else:
                bookings = Booking.objects.filter(
                    booking_date__gte=now,
                    booking_status__in=['pending', 'confirmed']
                ).order_by('booking_date')
            
            serializer = BookingSerializer(bookings, many=True)
            return Response({
                'message': 'Upcoming bookings retrieved successfully',
                'bookings': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Failed to retrieve upcoming bookings',
                'errors': {'detail': 'An unexpected error occurred.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Create your views here.
