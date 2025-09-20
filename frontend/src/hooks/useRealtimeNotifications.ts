/**
 * React hook for managing real-time notifications.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { websocketService, NotificationData } from '../services/websocket';

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface UseRealtimeNotificationsReturn {
  notifications: NotificationData[];
  stats: NotificationStats;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: number) => void;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
  getVendorStats: () => void;
  getServiceNotifications: (serviceId: number) => void;
}

export const useRealtimeNotifications = (): UseRealtimeNotificationsReturn => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {}
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !hasInitialized.current) {
      hasInitialized.current = true;
      connectWebSocket();
    } else if (!isAuthenticated && hasInitialized.current) {
      hasInitialized.current = false;
      websocketService.disconnect();
      setIsConnected(false);
      setNotifications([]);
      setStats({ total: 0, unread: 0, byType: {}, byPriority: {} });
    }
  }, [isAuthenticated, user]);

  // Update token when it changes
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && isConnected) {
      websocketService.updateToken(token);
    }
  }, [isConnected]);

  const connectWebSocket = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const userType = user.user_type === 'vendor' ? 'vendor' : 'user';
      await websocketService.connect(userType);

      // Set up message handlers
      websocketService.on('connection_established', handleConnectionEstablished);
      websocketService.on('vendor_connection_established', handleConnectionEstablished);
      websocketService.on('notification', handleNotification);
      websocketService.on('vendor_notification', handleNotification);
      websocketService.on('count_update', handleCountUpdate);
      websocketService.on('unread_count', handleUnreadCount);
      websocketService.on('recent_notifications', handleRecentNotifications);
      websocketService.on('vendor_stats', handleVendorStats);
      websocketService.on('service_notifications', handleServiceNotifications);

      // Request initial data
      websocketService.getUnreadCount();
      websocketService.getRecentNotifications(20);

      if (user.user_type === 'vendor') {
        websocketService.getVendorStats();
      }

    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
      setError('Failed to connect to real-time notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleConnectionEstablished = useCallback((data: any) => {
    console.log('WebSocket connection established:', data);
    setIsConnected(true);
    setError(null);
  }, []);

  const handleNotification = useCallback((notification: NotificationData) => {
    setNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;

      // Add new notification at the beginning
      return [notification, ...prev];
    });

    // Update stats
    setStats(prev => ({
      ...prev,
      unread: prev.unread + 1,
      total: prev.total + 1
    }));
  }, []);

  const handleCountUpdate = useCallback((data: { count: number }) => {
    setStats(prev => ({
      ...prev,
      unread: data.count
    }));
  }, []);

  const handleUnreadCount = useCallback((data: { count: number }) => {
    setStats(prev => ({
      ...prev,
      unread: data.count
    }));
  }, []);

  const handleRecentNotifications = useCallback((data: { notifications: NotificationData[] }) => {
    setNotifications(data.notifications);
    
    // Calculate stats
    const total = data.notifications.length;
    const unread = data.notifications.filter(n => !n.is_read).length;
    
    const byType = data.notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byPriority = data.notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      total,
      unread,
      byType,
      byPriority
    });
  }, []);

  const handleVendorStats = useCallback((data: { stats: any }) => {
    console.log('Vendor stats received:', data.stats);
    // You can add vendor-specific stats handling here
  }, []);

  const handleServiceNotifications = useCallback((data: any) => {
    console.log('Service notifications received:', data);
    // You can add service-specific notifications handling here
  }, []);

  const markAsRead = useCallback((id: number) => {
    // Optimistically update local state
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );

    setStats(prev => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1)
    }));

    // Send to WebSocket
    websocketService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/notifications/mark_all_as_read/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        );
        setStats(prev => ({
          ...prev,
          unread: 0
        }));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    if (isConnected) {
      websocketService.getUnreadCount();
      websocketService.getRecentNotifications(20);
    }
  }, [isConnected]);

  const getVendorStats = useCallback(() => {
    if (isConnected && user?.user_type === 'vendor') {
      websocketService.getVendorStats();
    }
  }, [isConnected, user]);

  const getServiceNotifications = useCallback((serviceId: number) => {
    if (isConnected && user?.user_type === 'vendor') {
      websocketService.getServiceNotifications(serviceId);
    }
  }, [isConnected, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      websocketService.off('connection_established', handleConnectionEstablished);
      websocketService.off('vendor_connection_established', handleConnectionEstablished);
      websocketService.off('notification', handleNotification);
      websocketService.off('vendor_notification', handleNotification);
      websocketService.off('count_update', handleCountUpdate);
      websocketService.off('unread_count', handleUnreadCount);
      websocketService.off('recent_notifications', handleRecentNotifications);
      websocketService.off('vendor_stats', handleVendorStats);
      websocketService.off('service_notifications', handleServiceNotifications);
    };
  }, [
    handleConnectionEstablished,
    handleNotification,
    handleCountUpdate,
    handleUnreadCount,
    handleRecentNotifications,
    handleVendorStats,
    handleServiceNotifications
  ]);

  return {
    notifications,
    stats,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    getVendorStats,
    getServiceNotifications
  };
};
