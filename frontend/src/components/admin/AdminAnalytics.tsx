import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  AlertTriangle, 
  Clock,
  DollarSign,
  Activity,
  RefreshCw,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { adminService } from '../../services/admin';

interface AnalyticsData {
  totalUsers: number;
  totalVendors: number;
  totalServices: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    vendors: number;
    orders: number;
    revenue: number;
  };
  topServices: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  userRegistrations: Array<{
    date: string;
    count: number;
  }>;
  orderTrends: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock data - replace with real API call
      const mockData: AnalyticsData = {
        totalUsers: 1250,
        totalVendors: 45,
        totalServices: 180,
        totalOrders: 3420,
        totalRevenue: 125000,
        monthlyGrowth: {
          users: 12.5,
          vendors: 8.3,
          orders: 25.7,
          revenue: 18.2
        },
        topServices: [
          { name: 'Food Delivery', orders: 1200, revenue: 45000 },
          { name: 'Printing Services', orders: 800, revenue: 12000 },
          { name: 'Beauty Services', orders: 600, revenue: 18000 },
          { name: 'Academic Support', orders: 400, revenue: 15000 },
          { name: 'Transportation', orders: 300, revenue: 8000 }
        ],
        recentActivity: [
          { id: '1', type: 'user_registration', description: 'New user registered', timestamp: '2024-01-15T10:30:00Z', user: 'John Doe' },
          { id: '2', type: 'vendor_application', description: 'Vendor application submitted', timestamp: '2024-01-15T09:15:00Z', user: 'Jane Smith' },
          { id: '3', type: 'order_completed', description: 'Order completed', timestamp: '2024-01-15T08:45:00Z', user: 'Mike Johnson' },
          { id: '4', type: 'complaint_resolved', description: 'Complaint resolved', timestamp: '2024-01-15T07:20:00Z', user: 'Sarah Wilson' }
        ],
        userRegistrations: [
          { date: '2024-01-01', count: 25 },
          { date: '2024-01-02', count: 32 },
          { date: '2024-01-03', count: 28 },
          { date: '2024-01-04', count: 41 },
          { date: '2024-01-05', count: 35 },
          { date: '2024-01-06', count: 38 },
          { date: '2024-01-07', count: 42 }
        ],
        orderTrends: [
          { date: '2024-01-01', orders: 120, revenue: 4500 },
          { date: '2024-01-02', orders: 135, revenue: 5200 },
          { date: '2024-01-03', orders: 98, revenue: 3800 },
          { date: '2024-01-04', orders: 156, revenue: 6200 },
          { date: '2024-01-05', orders: 142, revenue: 5800 },
          { date: '2024-01-06', orders: 168, revenue: 7200 },
          { date: '2024-01-07', orders: 175, revenue: 7800 }
        ]
      };
      
      setAnalytics(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4" />;
    if (growth < 0) return <TrendingUp className="w-4 h-4 rotate-180" />;
    return <Activity className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Platform Analytics</h2>
            <p className="text-sm text-gray-500">Comprehensive insights and metrics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={refreshAnalytics}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalUsers)}</p>
              <div className="flex items-center gap-1 mt-1">
                {getGrowthIcon(analytics.monthlyGrowth.users)}
                <span className={`text-sm font-medium ${getGrowthColor(analytics.monthlyGrowth.users)}`}>
                  +{analytics.monthlyGrowth.users}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalVendors)}</p>
              <div className="flex items-center gap-1 mt-1">
                {getGrowthIcon(analytics.monthlyGrowth.vendors)}
                <span className={`text-sm font-medium ${getGrowthColor(analytics.monthlyGrowth.vendors)}`}>
                  +{analytics.monthlyGrowth.vendors}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalOrders)}</p>
              <div className="flex items-center gap-1 mt-1">
                {getGrowthIcon(analytics.monthlyGrowth.orders)}
                <span className={`text-sm font-medium ${getGrowthColor(analytics.monthlyGrowth.orders)}`}>
                  +{analytics.monthlyGrowth.orders}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
              <div className="flex items-center gap-1 mt-1">
                {getGrowthIcon(analytics.monthlyGrowth.revenue)}
                <span className={`text-sm font-medium ${getGrowthColor(analytics.monthlyGrowth.revenue)}`}>
                  +{analytics.monthlyGrowth.revenue}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Services</h3>
          <button className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        
        <div className="space-y-4">
          {analytics.topServices.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-500">{formatNumber(service.orders)} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(service.revenue)}</p>
                <p className="text-sm text-gray-500">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        
        <div className="space-y-4">
          {analytics.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.description}</p>
                <p className="text-sm text-gray-500">by {activity.user}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
