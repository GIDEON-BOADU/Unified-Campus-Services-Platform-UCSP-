import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  MapPin,
  RefreshCw,
  Download
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    growth: number;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    growth: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    growth: number;
  };
  demandHeatmap: {
    hour: number;
    day: string;
    demand: number;
    revenue: number;
  }[];
  popularServices: {
    service_id: number;
    service_name: string;
    orders: number;
    revenue: number;
    rating: number;
  }[];
  locationInsights: {
    area: string;
    orders: number;
    revenue: number;
    avg_rating: number;
  }[];
  timeRange: {
    start: string;
    end: string;
  };
}

interface VendorAnalyticsProps {
  vendorId?: number;
}

export const VendorAnalytics: React.FC<VendorAnalyticsProps> = ({ vendorId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, vendorId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the analytics API
      const API_BASE = 'http://localhost:8000/api';
      const token = localStorage.getItem('accessToken');
      const url = `${API_BASE}/analytics/vendor/${vendorId || 'current'}?range=${timeRange}`;
      
      console.log('Fetching analytics from:', url);
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Analytics response status:', response.status);
      console.log('Analytics response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analytics error response:', errorText);
        throw new Error(`Failed to fetch analytics data: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Analytics data received:', data);
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
      // Mock data for demonstration
      setAnalytics(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalyticsData = (): AnalyticsData => ({
    revenue: {
      total: 15420.50,
      monthly: 3240.75,
      weekly: 810.25,
      daily: 115.75,
      growth: 12.5
    },
    orders: {
      total: 342,
      completed: 298,
      pending: 28,
      cancelled: 16,
      growth: 8.3
    },
    customers: {
      total: 156,
      new: 23,
      returning: 133,
      growth: 15.2
    },
    demandHeatmap: generateMockHeatmapData(),
    popularServices: [
      { service_id: 1, service_name: 'Document Printing', orders: 89, revenue: 445.00, rating: 4.8 },
      { service_id: 2, service_name: 'Photo Printing', orders: 67, revenue: 335.00, rating: 4.6 },
      { service_id: 3, service_name: 'Binding Services', orders: 45, revenue: 225.00, rating: 4.9 },
      { service_id: 4, service_name: 'Lamination', orders: 34, revenue: 170.00, rating: 4.7 }
    ],
    locationInsights: [
      { area: 'Hall A', orders: 89, revenue: 445.00, avg_rating: 4.8 },
      { area: 'Hall B', orders: 67, revenue: 335.00, avg_rating: 4.6 },
      { area: 'Library', orders: 45, revenue: 225.00, avg_rating: 4.9 },
      { area: 'Cafeteria', orders: 34, revenue: 170.00, avg_rating: 4.7 }
    ],
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    }
  });

  const generateMockHeatmapData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [];
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 6; hour < 22; hour++) {
        const baseDemand = Math.random() * 100;
        const isWeekend = day >= 5;
        const isPeakHour = (hour >= 8 && hour <= 10) || (hour >= 12 && hour <= 14) || (hour >= 17 && hour <= 19);
        
        let demand = baseDemand;
        if (isWeekend) demand *= 0.6;
        if (isPeakHour) demand *= 1.5;
        
        data.push({
          hour,
          day: days[day],
          demand: Math.round(demand),
          revenue: Math.round(demand * 2.5)
        });
      }
    }
    
    return data;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <BarChart3 className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
        <p className="text-gray-600 mb-4">{error || 'No analytics data available'}</p>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Insights and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* Export Button */}
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Revenue</h3>
            </div>
            <div className={`flex items-center gap-1 ${getGrowthColor(analytics.revenue.growth)}`}>
              {getGrowthIcon(analytics.revenue.growth)}
              <span className="text-sm font-medium">{analytics.revenue.growth}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue.total)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-sm text-gray-500">
              {formatCurrency(analytics.revenue.monthly)} this month
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Orders</h3>
            </div>
            <div className={`flex items-center gap-1 ${getGrowthColor(analytics.orders.growth)}`}>
              {getGrowthIcon(analytics.orders.growth)}
              <span className="text-sm font-medium">{analytics.orders.growth}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{analytics.orders.total}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="text-sm text-gray-500">
              {analytics.orders.completed} completed, {analytics.orders.pending} pending
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Customers</h3>
            </div>
            <div className={`flex items-center gap-1 ${getGrowthColor(analytics.customers.growth)}`}>
              {getGrowthIcon(analytics.customers.growth)}
              <span className="text-sm font-medium">{analytics.customers.growth}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{analytics.customers.total}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
            <div className="text-sm text-gray-500">
              {analytics.customers.new} new, {analytics.customers.returning} returning
            </div>
          </div>
        </div>
      </div>

      {/* Demand Heatmap */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Demand Heatmap</h3>
        <div className="text-sm text-gray-600 mb-4">Peak hours and days for your services</div>
        
        <div className="grid grid-cols-8 gap-1">
          {/* Header row */}
          <div className="text-xs font-medium text-gray-500 text-center py-2"></div>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
              {day}
            </div>
          ))}
          
          {/* Heatmap cells */}
          {Array.from({ length: 16 }, (_, hour) => hour + 6).map(hour => (
            <React.Fragment key={hour}>
              <div className="text-xs text-gray-500 py-1 text-right pr-2">
                {hour}:00
              </div>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                const data = analytics.demandHeatmap.find(
                  d => d.hour === hour && d.day === day
                );
                const intensity = data ? Math.min(data.demand / 100, 1) : 0;
                const bgColor = intensity > 0.7 ? 'bg-red-500' : 
                               intensity > 0.4 ? 'bg-yellow-400' : 
                               intensity > 0.1 ? 'bg-green-400' : 'bg-gray-100';
                
                return (
                  <div
                    key={`${hour}-${day}`}
                    className={`h-6 rounded ${bgColor} hover:opacity-80 transition-opacity cursor-pointer`}
                    title={`${day} ${hour}:00 - ${data?.demand || 0} orders`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Peak</span>
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Services</h3>
          <div className="space-y-3">
            {analytics.popularServices.map((service, index) => (
              <div key={service.service_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{service.service_name}</div>
                    <div className="text-sm text-gray-500">{service.orders} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(service.revenue)}</div>
                  <div className="text-sm text-gray-500">⭐ {service.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Location Insights</h3>
          <div className="space-y-3">
            {Array.isArray(analytics.locationInsights) ? analytics.locationInsights.map((location) => (
              <div key={location.area} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{location.area}</div>
                    <div className="text-sm text-gray-500">{location.orders} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(location.revenue)}</div>
                  <div className="text-sm text-gray-500">⭐ {location.avg_rating}</div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-4">
                No location data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
