import React, { useState, useEffect } from 'react';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Users, 
  Building2, 
  Package, 
  ShoppingCart, 
  Calendar, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const EnhancedAdminDashboard: React.FC = () => {
  const {
    analytics,
    charts,
    recentActivity,
    systemMetrics,
    isLoading,
    isAnalyticsLoading,
    isChartsLoading,
    isActivityLoading,
    isMetricsLoading,
    error,
    refreshAll,
    enableRealTime,
    disableRealTime
  } = useAdminDashboard();

  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  // Toggle real-time updates
  const toggleRealTime = () => {
    if (isRealTimeEnabled) {
      disableRealTime();
      setIsRealTimeEnabled(false);
    } else {
      enableRealTime();
      setIsRealTimeEnabled(true);
    }
  };

  // Get system health color
  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get system health icon
  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Loading admin dashboard..." />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-200 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshAll}
            className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">System overview and analytics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucsp-green-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            {/* Real-time Toggle */}
            <button
              onClick={toggleRealTime}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isRealTimeEnabled
                  ? 'bg-ucsp-green-100 text-ucsp-green-700 border border-ucsp-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Real-time</span>
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={refreshAll}
              disabled={isAnalyticsLoading || isChartsLoading || isActivityLoading || isMetricsLoading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyticsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* System Health Alert */}
        {analytics.systemHealth !== 'healthy' && (
          <div className={`p-4 rounded-lg border-l-4 ${
            analytics.systemHealth === 'critical' 
              ? 'bg-red-50 border-red-400' 
              : 'bg-yellow-50 border-yellow-400'
          }`}>
            <div className="flex items-center">
              {getSystemHealthIcon(analytics.systemHealth)}
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  analytics.systemHealth === 'critical' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  System {analytics.systemHealth === 'critical' ? 'Critical' : 'Warning'}
                </h3>
                <p className={`text-sm ${
                  analytics.systemHealth === 'critical' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {analytics.systemHealth === 'critical' 
                    ? 'System is experiencing critical issues. Immediate attention required.'
                    : 'System is experiencing minor issues. Monitor closely.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.totalUsers)}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.totalServices)}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Package className="w-4 h-4 mr-1" />
                  {analytics.pendingVendorRequests} pending requests
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className={`text-2xl font-bold ${getSystemHealthColor(analytics.systemHealth).split(' ')[0]}`}>
                  {analytics.systemHealth.charAt(0).toUpperCase() + analytics.systemHealth.slice(1)}
                </p>
                <p className={`text-sm flex items-center mt-1 ${getSystemHealthColor(analytics.systemHealth).split(' ')[0]}`}>
                  {getSystemHealthIcon(analytics.systemHealth)}
                  <span className="ml-1">All systems operational</span>
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                analytics.systemHealth === 'healthy' ? 'bg-green-100' : 
                analytics.systemHealth === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Shield className={`w-6 h-6 ${
                  analytics.systemHealth === 'healthy' ? 'text-green-600' : 
                  analytics.systemHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <LineChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                <p>Chart will be rendered here</p>
                <p className="text-sm">Data points: {charts.userGrowth.length}</p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Growth</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-2" />
                <p>Chart will be rendered here</p>
                <p className="text-sm">Data points: {charts.revenueGrowth.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Server className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">Uptime</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatUptime(systemMetrics.serverUptime)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">Database Size</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {(systemMetrics.databaseSize / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">API Response Time</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {systemMetrics.apiResponseTime}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">Error Rate</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(systemMetrics.errorRate)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Cpu className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">CPU Usage</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(systemMetrics.cpuUsage)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HardDrive className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">Memory Usage</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(systemMetrics.memoryUsage)}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-ucsp-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-ucsp-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Service Categories and Top Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Categories */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Categories</h3>
            <div className="space-y-3">
              {charts.serviceCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No category data available</p>
                </div>
              ) : (
                charts.serviceCategories.map((category: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{category.category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-ucsp-green-500 h-2 rounded-full" 
                          style={{ width: `${(category.count / Math.max(...charts.serviceCategories.map((c: any) => c.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{category.count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h3>
            <div className="space-y-3">
              {charts.topServices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No service data available</p>
                </div>
              ) : (
                charts.topServices.map((service: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(service.revenue)}</p>
                      <p className="text-xs text-gray-500">revenue</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
