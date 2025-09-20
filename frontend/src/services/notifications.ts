import { apiClient } from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'order_update' | 'booking_update' | 'payment_update' | 'service_recommendation' | 'system_announcement' | 'vendor_application' | 'admin_alert' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  related_object_type?: string;
  related_object_id?: number;
  is_read: boolean;
  is_sent: boolean;
  is_delivered: boolean;
  action_url?: string;
  action_text?: string;
  metadata?: any;
  created_at: string;
  read_at?: string;
  time_ago: string;
  is_expired: boolean;
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  read_count: number;
  notifications_by_type: Record<string, number>;
  notifications_by_priority: Record<string, number>;
  recent_notifications: Notification[];
}

export interface NotificationPreference {
  id: number;
  email_enabled: boolean;
  email_order_updates: boolean;
  email_booking_updates: boolean;
  email_payment_updates: boolean;
  email_recommendations: boolean;
  email_announcements: boolean;
  push_enabled: boolean;
  push_order_updates: boolean;
  push_booking_updates: boolean;
  push_payment_updates: boolean;
  push_recommendations: boolean;
  push_announcements: boolean;
  sms_enabled: boolean;
  sms_order_updates: boolean;
  sms_booking_updates: boolean;
  sms_payment_updates: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  max_notifications_per_hour: number;
  max_notifications_per_day: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilters {
  type?: string;
  priority?: string;
  is_read?: boolean;
  limit?: number;
  offset?: number;
}

export const notificationService = {
  // Get notifications with filtering
  getNotifications: async (filters: NotificationFilters = {}): Promise<{
    notifications: Notification[];
    total_count: number;
    has_more: boolean;
  }> => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.is_read !== undefined) params.append('is_read', filters.is_read.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await apiClient.get(`/notifications/?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get notification statistics
  getStats: async (): Promise<NotificationStats> => {
    try {
      const response = await apiClient.get('/notifications/stats/');
      return response;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    try {
      const response = await apiClient.get('/notifications/unread-count/');
      return response;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<Notification> => {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/read/`);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark notification as unread
  markAsUnread: async (notificationId: number): Promise<Notification> => {
    try {
      const response = await apiClient.post(`/notifications/${notificationId}/unread/`);
      return response;
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/notifications/mark-all-read/');
      return response;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Bulk actions
  bulkAction: async (notificationIds: number[], action: 'mark_read' | 'mark_unread' | 'delete'): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/notifications/bulk-action/', {
        notification_ids: notificationIds,
        action
      });
      return response;
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<{ message: string }> => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}/delete/`);
      return response;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get notification preferences
  getPreferences: async (): Promise<NotificationPreference> => {
    try {
      const response = await apiClient.get('/notifications/preferences/');
      return response;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  },

  // Update notification preferences
  updatePreferences: async (preferences: Partial<NotificationPreference>): Promise<NotificationPreference> => {
    try {
      const response = await apiClient.put('/notifications/preferences/', preferences);
      return response;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  // Test notification
  testNotification: async (): Promise<Notification> => {
    try {
      const response = await apiClient.post('/notifications/test/');
      return response;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }
};

export default notificationService;
