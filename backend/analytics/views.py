# analytics/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
import json

from .models import VendorAnalytics, ServiceAnalytics
from .serializers import AnalyticsSummarySerializer
from services.models import Service, Order, Review
from users.models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_analytics(request):
    """Test endpoint to verify analytics app is working."""
    return Response({
        'message': 'Analytics app is working!',
        'user': request.user.username if request.user.is_authenticated else 'Anonymous',
        'timestamp': timezone.now()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_analytics(request, vendor_id=None):
    """
    Get analytics data for a vendor.
    
    Query parameters:
    - range: Time range (7d, 30d, 90d, 1y)
    - period: Period type (daily, weekly, monthly)
    """
    try:
        print(f"Analytics request: vendor_id={vendor_id}, user={request.user}, authenticated={request.user.is_authenticated}")
        # Determine the vendor
        if vendor_id == 'current' or vendor_id is None:
            vendor = request.user
        else:
            vendor = User.objects.get(id=vendor_id)
        
        # Check if user is the vendor or admin
        if request.user != vendor and request.user.user_type != 'admin':
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get time range from query parameters
        time_range = request.GET.get('range', '30d')
        
        # Calculate date range
        end_date = timezone.now().date()
        if time_range == '7d':
            start_date = end_date - timedelta(days=7)
        elif time_range == '30d':
            start_date = end_date - timedelta(days=30)
        elif time_range == '90d':
            start_date = end_date - timedelta(days=90)
        elif time_range == '1y':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)
        
        # Get vendor's services
        services = Service.objects.filter(vendor=vendor)
        service_ids = list(services.values_list('id', flat=True))
        
        # Calculate revenue metrics
        orders = Order.objects.filter(
            service__in=services,
            created_at__date__range=[start_date, end_date]
        )
        
        total_revenue = orders.aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0')
        
        order_count = orders.count()
        completed_orders = orders.filter(order_status='completed').count()
        cancelled_orders = orders.filter(order_status='cancelled').count()
        
        # Calculate customer metrics
        unique_customers = orders.values('customer').distinct().count()
        
        # Get previous period for growth calculation
        prev_start_date = start_date - (end_date - start_date)
        prev_orders = Order.objects.filter(
            service__in=services,
            created_at__date__range=[prev_start_date, start_date - timedelta(days=1)]
        )
        prev_revenue = prev_orders.aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0')
        
        # Calculate growth percentages
        revenue_growth = 0
        if prev_revenue > 0:
            revenue_growth = ((total_revenue - prev_revenue) / prev_revenue) * 100
        
        order_growth = 0
        prev_order_count = prev_orders.count()
        if prev_order_count > 0:
            order_growth = ((order_count - prev_order_count) / prev_order_count) * 100
        
        # Get popular services
        popular_services = []
        for service in services:
            service_orders = orders.filter(service=service)
            service_revenue = service_orders.aggregate(
                total=Sum('total_amount')
            )['total'] or Decimal('0')
            
            # Get average rating
            service_reviews = Review.objects.filter(service=service)
            avg_rating = service_reviews.aggregate(
                avg=Avg('rating')
            )['avg'] or 0
            
            popular_services.append({
                'service_id': service.id,
                'service_name': service.service_name,
                'orders': service_orders.count(),
                'revenue': float(service_revenue),
                'rating': float(avg_rating)
            })
        
        # Sort by revenue
        popular_services.sort(key=lambda x: x['revenue'], reverse=True)
        popular_services = popular_services[:10]  # Top 10
        
        # Generate demand heatmap data (mock data for now)
        demand_heatmap = []
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        for day in days:
            for hour in range(24):
                # Mock demand data - in real implementation, this would be calculated from actual order times
                base_demand = 0.1
                if day in ['Friday', 'Saturday', 'Sunday']:
                    base_demand = 0.3
                if 12 <= hour <= 14 or 18 <= hour <= 20:  # Lunch and dinner times
                    base_demand *= 2
                
                demand_heatmap.append({
                    'hour': hour,
                    'day': day,
                    'demand': round(base_demand, 2),
                    'revenue': round(float(total_revenue) * base_demand / 100, 2)
                })
        
        # Location insights (mock data for now)
        location_insights = [
            {'area': 'Hostel A', 'orders': 45, 'revenue': 1200.50, 'avg_rating': 4.2},
            {'area': 'Hostel B', 'orders': 32, 'revenue': 890.25, 'avg_rating': 4.0},
            {'area': 'Hostel C', 'orders': 28, 'revenue': 756.80, 'avg_rating': 3.8},
        ]
        
        # Prepare response data
        analytics_data = {
            'revenue': {
                'total': float(total_revenue),
                'monthly': float(total_revenue),  # For 30d range
                'weekly': float(total_revenue) / 4,  # Approximate
                'daily': float(total_revenue) / 30,  # Approximate
                'growth': round(revenue_growth, 2)
            },
            'orders': {
                'total': order_count,
                'completed': completed_orders,
                'pending': order_count - completed_orders - cancelled_orders,
                'cancelled': cancelled_orders,
                'growth': round(order_growth, 2)
            },
            'customers': {
                'total': unique_customers,
                'new': unique_customers,  # Simplified - would need more complex logic
                'returning': 0,  # Simplified
                'growth': 0  # Simplified
            },
            'demandHeatmap': demand_heatmap,
            'popularServices': popular_services,
            'locationInsights': location_insights,
            'timeRange': time_range,
            'lastUpdated': timezone.now()
        }
        
        return Response(analytics_data, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Vendor not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Analytics error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Failed to fetch analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def service_analytics(request, service_id):
    """
    Get analytics data for a specific service.
    """
    try:
        service = Service.objects.get(id=service_id)
        
        # Check if user owns the service or is admin
        if request.user != service.vendor and request.user.user_type != 'admin':
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get time range
        time_range = request.GET.get('range', '30d')
        end_date = timezone.now().date()
        
        if time_range == '7d':
            start_date = end_date - timedelta(days=7)
        elif time_range == '30d':
            start_date = end_date - timedelta(days=30)
        elif time_range == '90d':
            start_date = end_date - timedelta(days=90)
        elif time_range == '1y':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)
        
        # Get service analytics
        orders = Order.objects.filter(
            service=service,
            created_at__date__range=[start_date, end_date]
        )
        
        revenue = orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        order_count = orders.count()
        
        # Get reviews
        reviews = Review.objects.filter(service=service)
        avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        rating_count = reviews.count()
        
        analytics_data = {
            'service_id': service.id,
            'service_name': service.service_name,
            'revenue': float(revenue),
            'orders': order_count,
            'rating': float(avg_rating),
            'rating_count': rating_count,
            'time_range': time_range,
            'last_updated': timezone.now()
        }
        
        return Response(analytics_data, status=status.HTTP_200_OK)
        
    except Service.DoesNotExist:
        return Response(
            {'error': 'Service not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch service analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )