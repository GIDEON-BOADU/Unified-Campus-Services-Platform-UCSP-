import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Database,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react';
import { performanceService } from '../../services/performance';
import { cacheService } from '../../services/cache';

interface PerformanceStats {
  totalMetrics: number;
  apiMetrics: number;
  averageAPITime: number;
  slowestAPI: string | null;
  cacheStats: {
    size: number;
    keys: string[];
  };
  apiPerformance: {
    averageResponseTime: number;
    slowestEndpoints: Array<{ endpoint: string; avgDuration: number }>;
    errorRate: number;
    totalRequests: number;
  };
}

export const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      const performanceSummary = performanceService.getPerformanceSummary();
      const apiPerformance = performanceService.getAPIPerformance();
      const cacheStats = cacheService.getStats();

      setStats({
        ...performanceSummary,
        cacheStats,
        apiPerformance
      });
    } catch (error) {
      console.error('Error refreshing performance stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceColor = (duration: number): string => {
    if (duration < 500) return 'text-green-600';
    if (duration < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Performance Monitor</h2>
            <p className="text-sm text-gray-500">Real-time performance metrics and analytics</p>
          </div>
        </div>
        <button
          onClick={refreshStats}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.apiPerformance.totalRequests}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(stats.apiPerformance.averageResponseTime)}`}>
                {formatDuration(stats.apiPerformance.averageResponseTime)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className={`text-2xl font-bold ${stats.apiPerformance.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.apiPerformance.errorRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cache Size</p>
              <p className="text-2xl font-bold text-purple-600">{stats.cacheStats.size}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Slowest Endpoints */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Slowest API Endpoints</h3>
        </div>

        <div className="space-y-4">
          {stats.apiPerformance.slowestEndpoints.length > 0 ? (
            stats.apiPerformance.slowestEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{endpoint.endpoint}</p>
                  <p className="text-sm text-gray-500">Average response time</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${getPerformanceColor(endpoint.avgDuration)}`}>
                    {formatDuration(endpoint.avgDuration)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No API calls recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Cache Information */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Cache Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Cache Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Entries:</span>
                <span className="font-medium">{stats.cacheStats.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memory Usage:</span>
                <span className="font-medium">~{Math.round(stats.cacheStats.size * 0.1)}KB</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Cache Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  cacheService.clear();
                  refreshStats();
                }}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Clear Cache
              </button>
              <button
                onClick={() => {
                  cacheService.clearExpired();
                  refreshStats();
                }}
                className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                Clear Expired
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
