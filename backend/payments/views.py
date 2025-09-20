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
            if payment.booking.booking_status == 'pending':
                payment.booking.booking_status = 'confirmed'
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_momo_payment(request):
    """
    Initiate a Mobile Money payment (Development/Dummy version).
    
    Endpoint: POST /api/payments/initiate/
    
    Authentication: Required (JWT token)
    
    Required fields:
    - amount: Payment amount (decimal)
    - phone: Phone number for MoMo payment
    - provider: Mobile money provider ('mtn', 'vodafone', 'airtel', 'telecel')
    - order_id: ID of the order (optional)
    - booking_id: ID of the booking (optional)
    
    Returns:
    - 201: Payment initiated successfully with fake response
    - 400: Validation errors
    - 403: Permission denied
    """
    try:
        amount = request.data.get('amount')
        phone = request.data.get('phone')
        provider = request.data.get('provider', 'mtn')
        order_id = request.data.get('order_id')
        booking_id = request.data.get('booking_id')
        
        # Validate required fields
        if not amount:
            return Response({
                'message': 'Payment initiation failed',
                'errors': {'amount': 'Amount is required.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not phone:
            return Response({
                'message': 'Payment initiation failed',
                'errors': {'phone': 'Phone number is required.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate amount
        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError("Amount must be greater than zero")
        except (ValueError, TypeError):
            return Response({
                'message': 'Payment initiation failed',
                'errors': {'amount': 'Amount must be a positive number.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate provider
        valid_providers = ['mtn', 'vodafone', 'airtel', 'telecel']
        if provider not in valid_providers:
            return Response({
                'message': 'Payment initiation failed',
                'errors': {'provider': f'Provider must be one of: {", ".join(valid_providers)}'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate that either order_id or booking_id is provided
        if not order_id and not booking_id:
            return Response({
                'message': 'Payment initiation failed',
                'errors': {'detail': 'Either order_id or booking_id is required.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the order or booking
        order = None
        booking = None
        
        if order_id:
            try:
                from services.models import Order
                order = get_object_or_404(Order, id=order_id)
                # Check permissions
                if order.customer != request.user:
                    return Response({
                        'message': 'Permission denied',
                        'errors': {'detail': 'You can only make payments for your own orders.'}
                    }, status=status.HTTP_403_FORBIDDEN)
            except Exception:
                return Response({
                    'message': 'Payment initiation failed',
                    'errors': {'order_id': 'Invalid order ID.'}
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if booking_id:
            try:
                booking = get_object_or_404(Booking, id=booking_id)
                # Check permissions
                if booking.student != request.user:
                    return Response({
                        'message': 'Permission denied',
                        'errors': {'detail': 'You can only make payments for your own bookings.'}
                    }, status=status.HTTP_403_FORBIDDEN)
            except Exception:
                return Response({
                    'message': 'Payment initiation failed',
                    'errors': {'booking_id': 'Invalid booking ID.'}
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate fake reference ID (UUID)
        reference_id = str(uuid.uuid4())
        
        # Create payment record
        payment_data = {
            'amount': amount,
            'payment_method': 'mobile_money',
            'mobile_money_provider': provider,
            'phone_number': phone,
            'reference_number': reference_id,
            'transaction_id': f"MOMO_{uuid.uuid4().hex[:16].upper()}",
            'status': 'pending',
            'payment_notes': f'MoMo payment initiated via {provider.upper()}'
        }
        
        if order:
            payment_data['order'] = order
        if booking:
            payment_data['booking'] = booking
        
        serializer = PaymentSerializer(data=payment_data)
        if serializer.is_valid():
            payment = serializer.save()
            
            # Create fake MoMo API response
            fake_response = {
                'referenceId': reference_id,
                'status': 'PENDING',
                'amount': amount,
                'phone': phone,
                'provider': provider.upper(),
                'message': 'Payment initiated successfully. Please complete the transaction on your mobile device.',
                'payment_id': payment.id,
                'transaction_id': payment.transaction_id,
                'created_at': payment.created_at.isoformat()
            }
            
            return Response({
                'message': 'MoMo payment initiated successfully',
                'payment': fake_response
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Payment initiation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'message': 'Payment initiation failed',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_momo_payment(request):
    """
    Verify a Mobile Money payment status (Development/Dummy version).
    
    Endpoint: POST /api/payments/verify/
    
    Authentication: Required (JWT token)
    
    Required fields:
    - reference_id: Reference ID from payment initiation
    
    Returns:
    - 200: Payment status retrieved
    - 400: Validation errors
    - 404: Payment not found
    """
    try:
        reference_id = request.data.get('reference_id')
        
        if not reference_id:
            return Response({
                'message': 'Payment verification failed',
                'errors': {'reference_id': 'Reference ID is required.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find payment by reference number
        try:
            payment = Payment.objects.get(reference_number=reference_id)
        except Payment.DoesNotExist:
            return Response({
                'message': 'Payment not found',
                'errors': {'reference_id': 'No payment found with this reference ID.'}
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check permissions
        can_view = False
        if request.user.user_type == 'student':
            if payment.order and payment.order.customer == request.user:
                can_view = True
            elif payment.booking and payment.booking.student == request.user:
                can_view = True
        elif request.user.user_type == 'vendor':
            if payment.order and payment.order.service.vendor == request.user:
                can_view = True
            elif payment.booking and payment.booking.service.vendor == request.user:
                can_view = True
        elif request.user.user_type == 'admin':
            can_view = True
        
        if not can_view:
            return Response({
                'message': 'Permission denied',
                'errors': {'detail': 'You do not have permission to view this payment.'}
            }, status=status.HTTP_403_FORBIDDEN)
        
        # For development, randomly update status to simulate real MoMo API
        import random
        if payment.status == 'pending' and random.random() < 0.8:  # 80% success rate
            payment.status = 'successful'
            payment.save()
        
        # Create fake verification response
        verification_response = {
            'referenceId': reference_id,
            'status': payment.status.upper(),
            'amount': float(payment.amount),
            'phone': payment.phone_number,
            'provider': payment.mobile_money_provider.upper(),
            'transaction_id': payment.transaction_id,
            'verified_at': payment.updated_at.isoformat(),
            'message': f'Payment {payment.status}'
        }
        
        return Response({
            'message': 'Payment verification completed',
            'payment': verification_response
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': 'Payment verification failed',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
