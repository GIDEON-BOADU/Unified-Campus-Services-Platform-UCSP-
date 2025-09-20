from django.db.models import Count, Sum
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action

from users.permissions import IsAdminUserType
from users.models import VendorApplication
from services.models import Service, Order, Review
from bookings.models import Booking
from payments.models import Payment
from .models import Complaint
from .serializers import (
    ComplaintSerializer, ComplaintListSerializer, 
    ComplaintCreateSerializer, ComplaintUpdateSerializer
)


User = get_user_model()


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def admin_dashboard(request):
    """
    Aggregate platform metrics for the admin dashboard.
    """
    # Users
    total_users = User.objects.count()
    users_by_type = User.objects.values("user_type").annotate(count=Count("id"))
    users_map = {row["user_type"]: row["count"] for row in users_by_type}

    # Services
    total_services = Service.objects.count()
    services_by_category = (
        Service.objects.values("category").annotate(count=Count("id")).order_by("category")
    )

    # Orders
    total_orders = Order.objects.count()
    orders_by_status = Order.objects.values("order_status").annotate(count=Count("id"))

    # Bookings
    total_bookings = Booking.objects.count()
    bookings_by_status = Booking.objects.values("status").annotate(count=Count("id"))

    # Payments
    total_payments = Payment.objects.count()
    payments_by_status = Payment.objects.values("status").annotate(count=Count("id"))
    successful_revenue = (
        Payment.objects.filter(status="successful").aggregate(total=Sum("amount"))[["total"]]
        if total_payments
        else {"total": 0}
    )
    successful_revenue = Payment.objects.filter(status="successful").aggregate(total=Sum("amount"))

    # Reviews
    total_reviews = Review.objects.count()

    # Vendor applications
    total_vendor_apps = VendorApplication.objects.count()
    vendor_apps_by_status = (
        VendorApplication.objects.values("status").annotate(count=Count("id"))
    )

    return Response(
        {
            "users": {
                "total": total_users,
                "students": users_map.get("student", 0),
                "vendors": users_map.get("vendor", 0),
                "admins": users_map.get("admin", 0),
            },
            "services": {
                "total": total_services,
                "by_category": list(services_by_category),
            },
            "orders": {
                "total": total_orders,
                "by_status": list(orders_by_status),
            },
            "bookings": {
                "total": total_bookings,
                "by_status": list(bookings_by_status),
            },
            "payments": {
                "total": total_payments,
                "by_status": list(payments_by_status),
                "successful_revenue": successful_revenue.get("total") or 0,
            },
            "reviews": {"total": total_reviews},
            "vendor_applications": {
                "total": total_vendor_apps,
                "by_status": list(vendor_apps_by_status),
            },
        },
        status=status.HTTP_200_OK,
    )


class ComplaintViewSet(ModelViewSet):
    """
    ViewSet for managing complaints.
    
    Features:
    - Students can create and view their own complaints
    - Admins can view, update, and manage all complaints
    - Role-based access control
    - Complaint filtering and search
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter complaints based on user role."""
        user = self.request.user
        
        if user.user_type == 'student':
            # Students can only see their own complaints
            return Complaint.objects.filter(complainant=user)
        elif user.user_type == 'admin':
            # Admins can see all complaints
            return Complaint.objects.all()
        else:
            # Other user types cannot access complaints
            return Complaint.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action and user role."""
        user = self.request.user
        
        if self.action == 'list':
            return ComplaintListSerializer
        elif self.action == 'create' and user.user_type == 'student':
            return ComplaintCreateSerializer
        elif self.action in ['update', 'partial_update'] and user.user_type == 'admin':
            return ComplaintUpdateSerializer
        else:
            return ComplaintSerializer
    
    def perform_create(self, serializer):
        """Set complainant when creating complaint."""
        serializer.save(complainant=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_complaints(self, request):
        """Get current user's complaints (student view)."""
        if request.user.user_type != 'student':
            return Response(
                {'error': 'Only students can access their complaints'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        complaints = self.get_queryset()
        serializer = ComplaintListSerializer(complaints, many=True)
        
        return Response({
            'complaints': serializer.data,
            'total': complaints.count()
        })
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending complaints (admin view)."""
        if request.user.user_type != 'admin':
            return Response(
                {'error': 'Only admins can access pending complaints'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        complaints = Complaint.objects.filter(status='pending')
        serializer = ComplaintListSerializer(complaints, many=True)
        
        return Response({
            'complaints': serializer.data,
            'total': complaints.count()
        })
    
    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """Get urgent complaints (admin view)."""
        if request.user.user_type != 'admin':
            return Response(
                {'error': 'Only admins can access urgent complaints'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        complaints = Complaint.objects.filter(priority='urgent')
        serializer = ComplaintListSerializer(complaints, many=True)
        
        return Response({
            'complaints': serializer.data,
            'total': complaints.count()
        })
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign complaint to admin."""
        if request.user.user_type != 'admin':
            return Response(
                {'error': 'Only admins can assign complaints'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        complaint = self.get_object()
        admin_id = request.data.get('admin_id')
        
        if not admin_id:
            return Response(
                {'error': 'Admin ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            admin_user = User.objects.get(id=admin_id, user_type='admin')
            complaint.assigned_admin = admin_user
            complaint.status = 'in_progress'
            complaint.save()
            
            serializer = ComplaintSerializer(complaint)
            return Response({
                'message': 'Complaint assigned successfully',
                'complaint': serializer.data
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'Admin user not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve complaint with admin response."""
        if request.user.user_type != 'admin':
            return Response(
                {'error': 'Only admins can resolve complaints'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        complaint = self.get_object()
        admin_response = request.data.get('admin_response', '')
        
        if not admin_response:
            return Response(
                {'error': 'Admin response is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        complaint.admin_response = admin_response
        complaint.status = 'resolved'
        complaint.save()
        
        serializer = ComplaintSerializer(complaint)
        return Response({
            'message': 'Complaint resolved successfully',
            'complaint': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get complaint statistics (admin view)."""
        if request.user.user_type != 'admin':
            return Response(
                {'error': 'Only admins can access complaint statistics'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        total_complaints = Complaint.objects.count()
        pending_complaints = Complaint.objects.filter(status='pending').count()
        in_progress_complaints = Complaint.objects.filter(status='in_progress').count()
        resolved_complaints = Complaint.objects.filter(status='resolved').count()
        urgent_complaints = Complaint.objects.filter(priority='urgent').count()
        
        complaints_by_type = Complaint.objects.values('complaint_type').annotate(
            count=Count('id')
        )
        
        complaints_by_status = Complaint.objects.values('status').annotate(
            count=Count('id')
        )
        
        return Response({
            'total': total_complaints,
            'pending': pending_complaints,
            'in_progress': in_progress_complaints,
            'resolved': resolved_complaints,
            'urgent': urgent_complaints,
            'by_type': list(complaints_by_type),
            'by_status': list(complaints_by_status)
        })

