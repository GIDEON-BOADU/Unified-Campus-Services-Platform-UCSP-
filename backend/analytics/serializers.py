# analytics/serializers.py
from rest_framework import serializers
from .models import VendorAnalytics, ServiceAnalytics
from services.models import Service


class ServiceAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for service analytics data."""
    service_name = serializers.CharField(source='service.service_name', read_only=True)
    
    class Meta:
        model = ServiceAnalytics
        fields = [
            'id', 'service', 'service_name', 'date', 'period',
            'views', 'orders', 'revenue', 'rating', 'rating_count',
            'created_at', 'updated_at'
        ]


class VendorAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for vendor analytics data."""
    
    class Meta:
        model = VendorAnalytics
        fields = [
            'id', 'vendor', 'date', 'period',
            'total_revenue', 'order_count', 'completed_orders', 'cancelled_orders',
            'unique_customers', 'new_customers',
            'popular_services', 'location_insights', 'demand_heatmap',
            'created_at', 'updated_at'
        ]


class AnalyticsSummarySerializer(serializers.Serializer):
    """Serializer for analytics summary data."""
    revenue = serializers.DictField()
    orders = serializers.DictField()
    customers = serializers.DictField()
    demandHeatmap = serializers.ListField()
    popularServices = serializers.ListField()
    locationInsights = serializers.DictField()
    timeRange = serializers.CharField()
    lastUpdated = serializers.DateTimeField()
