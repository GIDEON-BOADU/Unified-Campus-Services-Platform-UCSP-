import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService, Notification, NotificationStats, NotificationPreference } from '../services/notifications';
import { logger } from '../utils/logger';

export interface NotificationData {
  // Data
  notifications: Notification[];
  stats: NotificationStats | null;
  preferences: NotificationPreference | null;
  
  // Loading states
  isLoading: boolean;
  isStatsLoading: boolean;
  isPreferencesLoading: boolean;
  isMarkingRead: boolean;
  isMarkingUnread: boolean;
  isDeleting: boolean;
  isBulkAction: boolean;
  
  // Error states
  error: string | null;
  statsError: string | null;
  preferencesError: string | null;
  
  // Filters
  filters: {
    type?: string;
    priority?: string;
    is_read?: boolean;
    limit: number;
    offset: number;
  };
  
  // Pagination
  hasMore: boolean;
  totalCount: number;
  
  // Real-time
  isConnected: boolean;
  unreadCount: number;
  
  // Actions
  markAsRead: (notificationId: number) => Promise<void>;
  markAsUnread: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  bulkAction: (notificationIds: number[], action: 'mark_read' | 'mark_unread' | 'delete') => Promise<void>;
  
  // Data management
  refreshNotifications: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
  loadMore: () => Promise<void>;
  
  // Filters
  setFilters: (filters: Partial<NotificationData['filters']>) => void;
  clearFilters: () => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreference>) => Promise<void>;
  
  // Real-time
  enableRealTime: () => void;
  disableRealTime: () => void;
}

export const useNotifications = (): NotificationData => {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isMarkingUnread, setIsMarkingUnread] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkAction, setIsBulkAction] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  
  // Filters and pagination
  const [filters, setFiltersState] = useState({
    type: undefined as string | undefined,
    priority: undefined as string | undefined,
    is_read: undefined as boolean | undefined,
    limit: 20,
    offset: 0
  });
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Real-time
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  
  // Refs
  const isInitialized = useRef(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setFiltersState(prev => ({ ...prev, offset: 0 }));
      }
      
      setError(null);
      logger.debug('Fetching notifications with filters:', filters);
      
      const response = await notificationService.getNotifications(filters);
      setNotifications(prev => reset ? response.notifications : [...prev, ...response.notifications]);
      setHasMore(response.has_more);
      setTotalCount(response.total_count);
      
      logger.debug('Notifications fetched successfully:', response.notifications.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      logger.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      setStatsError(null);
      logger.debug('Fetching notification stats...');
      
      const statsData = await notificationService.getStats();
      setStats(statsData);
      setUnreadCount(statsData.unread_count);
      logger.debug('Notification stats fetched successfully:', statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setStatsError(errorMessage);
      logger.error('Error fetching notification stats:', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      setIsPreferencesLoading(true);
      setPreferencesError(null);
      logger.debug('Fetching notification preferences...');
      
      const preferencesData = await notificationService.getPreferences();
      setPreferences(preferencesData);
      logger.debug('Notification preferences fetched successfully:', preferencesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preferences';
      setPreferencesError(errorMessage);
      logger.error('Error fetching notification preferences:', err);
    } finally {
      setIsPreferencesLoading(false);
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      setIsMarkingRead(true);
      logger.debug('Marking notification as read:', notificationId);
      
      const updatedNotification = await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId ? updatedNotification : notification
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      logger.debug('Notification marked as read successfully');
    } catch (err) {
      logger.error('Error marking notification as read:', err);
      throw err;
    } finally {
      setIsMarkingRead(false);
    }
  }, []);

  // Mark as unread
  const markAsUnread = useCallback(async (notificationId: number) => {
    try {
      setIsMarkingUnread(true);
      logger.debug('Marking notification as unread:', notificationId);
      
      const updatedNotification = await notificationService.markAsUnread(notificationId);
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId ? updatedNotification : notification
      ));
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      logger.debug('Notification marked as unread successfully');
    } catch (err) {
      logger.error('Error marking notification as unread:', err);
      throw err;
    } finally {
      setIsMarkingUnread(false);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      logger.debug('Marking all notifications as read...');
      
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })));
      setUnreadCount(0);
      
      logger.debug('All notifications marked as read successfully');
    } catch (err) {
      logger.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      setIsDeleting(true);
      logger.debug('Deleting notification:', notificationId);
      
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      setTotalCount(prev => prev - 1);
      
      logger.debug('Notification deleted successfully');
    } catch (err) {
      logger.error('Error deleting notification:', err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Bulk action
  const bulkAction = useCallback(async (notificationIds: number[], action: 'mark_read' | 'mark_unread' | 'delete') => {
    try {
      setIsBulkAction(true);
      logger.debug('Performing bulk action:', action, notificationIds);
      
      await notificationService.bulkAction(notificationIds, action);
      
      if (action === 'mark_read') {
        setNotifications(prev => prev.map(notification => 
          notificationIds.includes(notification.id) 
            ? { ...notification, is_read: true }
            : notification
        ));
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      } else if (action === 'mark_unread') {
        setNotifications(prev => prev.map(notification => 
          notificationIds.includes(notification.id) 
            ? { ...notification, is_read: false }
            : notification
        ));
        setUnreadCount(prev => prev + notificationIds.length);
      } else if (action === 'delete') {
        setNotifications(prev => prev.filter(notification => !notificationIds.includes(notification.id)));
        setTotalCount(prev => prev - notificationIds.length);
      }
      
      logger.debug('Bulk action completed successfully');
    } catch (err) {
      logger.error('Error performing bulk action:', err);
      throw err;
    } finally {
      setIsBulkAction(false);
    }
  }, []);

  // Refresh functions
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const refreshPreferences = useCallback(async () => {
    await fetchPreferences();
  }, [fetchPreferences]);

  // Load more
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    
    setFiltersState(prev => ({ ...prev, offset: prev.offset + prev.limit }));
  }, [hasMore, isLoading]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<NotificationData['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters, offset: 0 }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({
      type: undefined,
      priority: undefined,
      is_read: undefined,
      limit: 20,
      offset: 0
    });
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreference>) => {
    try {
      logger.debug('Updating notification preferences...');
      
      const updatedPreferences = await notificationService.updatePreferences(newPreferences);
      setPreferences(updatedPreferences);
      
      logger.debug('Notification preferences updated successfully');
    } catch (err) {
      logger.error('Error updating notification preferences:', err);
      throw err;
    }
  }, []);

  // Enable real-time updates
  const enableRealTime = useCallback(() => {
    if (isConnected) return;
    
    // Set up polling for now (in production, use WebSockets)
    const interval = setInterval(() => {
      logger.debug('Polling for new notifications...');
      fetchStats();
    }, 30000); // 30 seconds
    
    setRefreshInterval(interval);
    setIsConnected(true);
    logger.debug('Real-time notifications enabled');
  }, [isConnected, fetchStats]);

  // Disable real-time updates
  const disableRealTime = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    setIsConnected(false);
    logger.debug('Real-time notifications disabled');
  }, [refreshInterval]);

  // Initial load
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      Promise.all([
        fetchNotifications(true),
        fetchStats(),
        fetchPreferences()
      ]);
    }
  }, [fetchNotifications, fetchStats, fetchPreferences]);

  // Load more when offset changes
  useEffect(() => {
    if (filters.offset > 0) {
      fetchNotifications(false);
    }
  }, [filters.offset, fetchNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [refreshInterval, wsConnection]);

  return {
    notifications,
    stats,
    preferences,
    isLoading,
    isStatsLoading,
    isPreferencesLoading,
    isMarkingRead,
    isMarkingUnread,
    isDeleting,
    isBulkAction,
    error,
    statsError,
    preferencesError,
    filters,
    hasMore,
    totalCount,
    isConnected,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    bulkAction,
    refreshNotifications,
    refreshStats,
    refreshPreferences,
    loadMore,
    setFilters,
    clearFilters,
    updatePreferences,
    enableRealTime,
    disableRealTime,
  };
};
