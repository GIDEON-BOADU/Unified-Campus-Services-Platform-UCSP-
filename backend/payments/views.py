"""
Payment views for managing payment transactions.
Provides endpoints for payment processing and management.
"""
import uuid
from django.shortcuts import render, get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import IntegrityError
import paystack
from .models import Payment
from .serializers import PaymentSerializer, PaymentStatusUpdateSerializer
from bookings.models import Booking


# Initialize Paystack with your secret key
paystack.api_key = 'YOUR_PAYSTACK_SECRET_KEY'

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    Create a new payment for a booking.
    
    Endpoint: POST /api/payments/create/
    
    Authentication: Required (JWT token)
    
    Required fields:
    - booking_id: ID of the booking to pay for
    - payment_method: 'momo' or 'cash'
    
    Returns:
    - 201: Payment created successfully
    - 400: Validation errors
    - 403: Permission denied
    - 404: Booking not found
    """
    try:
        booking_id = request.data.get('booking_id')
        payment_method = request.data.get('payment_method')
        
        if not booking_id:
            return Response({
                'message': 'Payment creation failed',
                'errors': {'booking_id': 'Booking ID is required.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not payment_method:
            return Response({
                'message': 'Payment creation failed',
                'errors': {'payment_method': 'Payment method is required.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the booking
        booking = get_object_or_404(Booking, id=booking_id)
        
        # Check permissions - only the student who made the booking can pay
        if booking.student != request.user:
            return Response({
                'message': 'Permission denied',
                'errors': {'detail': 'You can only make payments for your own bookings.'}
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if payment already exists
        if Payment.objects.filter(booking=booking, status='successful').exists():
            return Response({
                'message': 'Payment creation failed',
                'errors': {'detail': 'Payment has already been made for this booking.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create payment data
        payment_data = {
            'booking': booking,
            'amount': booking.service.price,
            'payment_method': payment_method,
            'transaction_id': f"TXN_{uuid.uuid4().hex[:16].upper()}",
            'status': 'pending'
        }
        
        serializer = PaymentSerializer(data=payment_data)
        if serializer.is_valid():
            payment = serializer.save()
            return Response({
                'message': 'Payment created successfully',
                'payment': PaymentSerializer(payment).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Payment creation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'message': 'Payment creation failed',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_list(request):
    """
    Get list of payments for the current user.
    
    Endpoint: GET /api/payments/
    
    Authentication: Required (JWT token)
    
    Query Parameters:
    - status: Filter by payment status (optional)
    - booking_id: Filter by booking ID (optional)
    
    Returns:
    - 200: List of payments
    """
    try:
        user = request.user
        payments = Payment.objects.all()
        if not getattr(user, 'is_authenticated', False):
            return Response({
                'message': 'Payments retrieved successfully',
                'payments': []
            }, status=status.HTTP_200_OK)
        
        # Filter based on user type
        if user.user_type == 'student':
            payments = payments.filter(booking__student=user)
        elif user.user_type == 'vendor':
            payments = payments.filter(booking__service__vendor=user)
        elif user.user_type != 'admin':
            # Unknown user type - return empty list
            payments = Payment.objects.none()
        
        # Apply additional filters
        status_filter = request.query_params.get('status')
        if status_filter:
            payments = payments.filter(status=status_filter)
        
        booking_id = request.query_params.get('booking_id')
        if booking_id:
            payments = payments.filter(booking_id=booking_id)
        
        # Order by creation date (newest first)
        payments = payments.order_by('-created_at')
        
        serializer = PaymentSerializer(payments, many=True)
        return Response({
            'message': 'Payments retrieved successfully',
            'payments': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': 'Failed to retrieve payments',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_detail(request, payment_id):
    """
    Get details of a specific payment.
    
    Endpoint: GET /api/payments/{id}/
    
    Authentication: Required (JWT token)
    
    Returns:
    - 200: Payment details
    - 403: Permission denied
    - 404: Payment not found
    """
    try:
        payment = get_object_or_404(Payment, id=payment_id)
        user = request.user
        
        # Check permissions
        can_view = False
        if user.user_type == 'student' and payment.booking.student == user:
            can_view = True
        elif user.user_type == 'vendor' and payment.booking.service.vendor == user:
            can_view = True
        elif user.user_type == 'admin':
            can_view = True
        
        if not can_view:
            return Response({
                'message': 'Permission denied',
                'errors': {'detail': 'You do not have permission to view this payment.'}
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PaymentSerializer(payment)
        return Response({
            'message': 'Payment details retrieved successfully',
            'payment': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': 'Failed to retrieve payment details',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_paystack_payment(request):
    """
    Process payment through Paystack integration.
    
    Endpoint: POST /api/payments/paystack/
    
    Authentication: Required (JWT token)
    
    Required fields:
    - payment_id: ID of the payment to process
    - reference: Paystack transaction reference
    
    Returns:
    - 200: Payment processed successfully
    - 400: Validation errors
    - 403: Permission denied
    - 404: Payment not found
    """
    try:
        payment_id = request.data.get('payment_id')
        reference = request.data.get('reference')
        
        if not payment_id:
            return Response({
                'message': 'Payment processing failed',
                'errors': {'payment_id': 'Payment ID is required.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not reference:
            return Response({
                'message': 'Payment processing failed',
                'errors': {'reference': 'Paystack reference is required.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the payment
        payment = get_object_or_404(Payment, id=payment_id)
        
        # Check permissions - only the student who made the payment can process it
        if payment.booking.student != request.user:
            return Response({
                'message': 'Permission denied',
                'errors': {'detail': 'You can only process payments for your own bookings.'}
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if payment is already processed
        if payment.status == 'successful':
            return Response({
                'message': 'Payment already processed',
                'errors': {'detail': 'This payment has already been processed successfully.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update payment status to successful
        serializer = PaymentStatusUpdateSerializer(
            payment,
            data={'status': 'successful'},
            partial=True
        )
        
        if serializer.is_valid():
            payment = serializer.save()
            
            # Update booking status to confirmed if it was pending
            if payment.booking.status == 'pending':
                payment.booking.status = 'confirmed'
                payment.booking.save()
            
            return Response({
                'message': 'Payment processed successfully',
                'payment': PaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Payment processing failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'message': 'Payment processing failed',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# Create your views here.
