import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import { logger } from '../utils/logger';

export interface AdminDashboardData {
  // Analytics
  analytics: {
    totalUsers: number;
    totalVendors: number;
    totalServices: number;
    totalOrders: number;
    totalBookings: number;
    totalRevenue: number;
    activeUsers: number;
    pendingVendorRequests: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  
  // Charts data
  charts: {
    userGrowth: Array<{ date: string; count: number }>;
    revenueGrowth: Array<{ date: string; amount: number }>;
    serviceCategories: Array<{ category: string; count: number }>;
    orderStatusDistribution: Array<{ status: string; count: number }>;
    topServices: Array<{ name: string; orders: number; revenue: number }>;
    vendorPerformance: Array<{ name: string; services: number; orders: number; rating: number }>;
  };
  
  // Recent activity
  recentActivity: Array<{
    id: string;
    type: 'user_registration' | 'vendor_application' | 'order_created' | 'payment_received' | 'service_created';
    description: string;
    timestamp: string;
    user?: string;
    metadata?: any;
  }>;
  
  // System metrics
  systemMetrics: {
    serverUptime: number;
    databaseSize: number;
    apiResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  
  // Loading states
  isLoading: boolean;
  isAnalyticsLoading: boolean;
  isChartsLoading: boolean;
  isActivityLoading: boolean;
  isMetricsLoading: boolean;
  
  // Error states
  error: string | null;
  analyticsError: string | null;
  chartsError: string | null;
  activityError: string | null;
  metricsError: string | null;
  
  // Actions
  refreshAnalytics: () => Promise<void>;
  refreshCharts: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Real-time
  enableRealTime: () => void;
  disableRealTime: () => void;
}

export const useAdminDashboard = (): AdminDashboardData => {
  // State
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalServices: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingVendorRequests: 0,
    systemHealth: 'healthy' as 'healthy' | 'warning' | 'critical'
  });
  
  const [charts, setCharts] = useState({
    userGrowth: [],
    revenueGrowth: [],
    serviceCategories: [],
    orderStatusDistribution: [],
    topServices: [],
    vendorPerformance: []
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    serverUptime: 0,
    databaseSize: 0,
    apiResponseTime: 0,
    errorRate: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [isChartsLoading, setIsChartsLoading] = useState(false);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [chartsError, setChartsError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  
  // Real-time
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setIsAnalyticsLoading(true);
      setAnalyticsError(null);
      logger.debug('Fetching admin analytics...');
      
      const response = await apiClient.get('/admin/analytics/');
      setAnalytics(response);
      logger.debug('Admin analytics fetched successfully:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setAnalyticsError(errorMessage);
      logger.error('Error fetching admin analytics:', err);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, []);

  // Fetch charts data
  const fetchCharts = useCallback(async () => {
    try {
      setIsChartsLoading(true);
      setChartsError(null);
      logger.debug('Fetching charts data...');
      
      const response = await apiClient.get('/admin/charts/');
      setCharts(response);
      logger.debug('Charts data fetched successfully:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch charts data';
      setChartsError(errorMessage);
      logger.error('Error fetching charts data:', err);
    } finally {
      setIsChartsLoading(false);
    }
  }, []);

  // Fetch recent activity
  const fetchActivity = useCallback(async () => {
    try {
      setIsActivityLoading(true);
      setActivityError(null);
      logger.debug('Fetching recent activity...');
      
      const response = await apiClient.get('/admin/activity/');
      setRecentActivity(response);
      logger.debug('Recent activity fetched successfully:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent activity';
      setActivityError(errorMessage);
      logger.error('Error fetching recent activity:', err);
    } finally {
      setIsActivityLoading(false);
    }
  }, []);

  // Fetch system metrics
  const fetchMetrics = useCallback(async () => {
    try {
      setIsMetricsLoading(true);
      setMetricsError(null);
      logger.debug('Fetching system metrics...');
      
      const response = await apiClient.get('/admin/metrics/');
      setSystemMetrics(response);
      logger.debug('System metrics fetched successfully:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system metrics';
      setMetricsError(errorMessage);
      logger.error('Error fetching system metrics:', err);
    } finally {
      setIsMetricsLoading(false);
    }
  }, []);

  // Refresh functions
  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const refreshCharts = useCallback(async () => {
    await fetchCharts();
  }, [fetchCharts]);

  const refreshActivity = useCallback(async () => {
    await fetchActivity();
  }, [fetchActivity]);

  const refreshMetrics = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug('Refreshing all admin dashboard data...');
      await Promise.all([
        fetchAnalytics(),
        fetchCharts(),
        fetchActivity(),
        fetchMetrics()
      ]);
      logger.debug('All admin dashboard data refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      logger.error('Error refreshing admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAnalytics, fetchCharts, fetchActivity, fetchMetrics]);

  // Enable real-time updates
  const enableRealTime = useCallback(() => {
    if (refreshInterval) return;
    
    const interval = setInterval(() => {
      logger.debug('Auto-refreshing admin dashboard data...');
      refreshAll();
    }, 60000); // 1 minute
    
    setRefreshInterval(interval);
    logger.debug('Real-time updates enabled for admin dashboard');
  }, [refreshAll, refreshInterval]);

  // Disable real-time updates
  const disableRealTime = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    logger.debug('Real-time updates disabled for admin dashboard');
  }, [refreshInterval]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  return {
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
    analyticsError,
    chartsError,
    activityError,
    metricsError,
    refreshAnalytics,
    refreshCharts,
    refreshActivity,
    refreshMetrics,
    refreshAll,
    enableRealTime,
    disableRealTime,
  };
};
