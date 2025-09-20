/**
 * WebSocket service for real-time notifications.
 */
import { toast } from '../components/common/Toast';

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  related_service_id?: number;
  related_booking_id?: number;
  related_order_id?: number;
  extra_data?: Record<string, any>;
}

export interface WebSocketMessage {
  type: string;
  notification?: NotificationData;
  count?: number;
  stats?: any;
  message?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('accessToken');
  }

  /**
   * Connect to WebSocket server
   */
  connect(userType: 'user' | 'vendor' = 'user'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = 'localhost:8000'; // Backend WebSocket server
        const endpoint = userType === 'vendor' ? 'ws/vendor-notifications/' : 'ws/notifications/';
        const url = `${protocol}//${host}/${endpoint}?token=${this.token}`;

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected to:', url);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason, 'from URL:', url);
          this.isConnecting = false;
          this.ws = null;

          // Attempt to reconnect if not a manual close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect(userType);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error, 'URL:', url);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  /**
   * Send message to WebSocket server
   */
  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Subscribe to message types
   */
  on(messageType: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  /**
   * Unsubscribe from message types
   */
  off(messageType: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Update authentication token
   */
  updateToken(token: string): void {
    this.token = token;
    // Reconnect with new token if currently connected
    if (this.isConnected) {
      this.disconnect();
      this.connect();
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: number): void {
    this.send({
      type: 'mark_as_read',
      notification_id: notificationId
    });
  }

  /**
   * Get unread count
   */
  getUnreadCount(): void {
    this.send({
      type: 'get_unread_count'
    });
  }

  /**
   * Get recent notifications
   */
  getRecentNotifications(limit: number = 10): void {
    this.send({
      type: 'get_recent_notifications',
      limit
    });
  }

  /**
   * Get vendor stats (vendor only)
   */
  getVendorStats(): void {
    this.send({
      type: 'get_vendor_stats'
    });
  }

  /**
   * Get service notifications (vendor only)
   */
  getServiceNotifications(serviceId: number): void {
    this.send({
      type: 'get_service_notifications',
      service_id: serviceId
    });
  }

  private handleMessage(data: WebSocketMessage): void {
    const { type } = data;

    // Handle connection confirmation
    if (type === 'connection_established' || type === 'vendor_connection_established') {
      console.log('WebSocket connection established:', data.message);
      this.emit('connection_established', data);
      return;
    }

    // Handle notifications
    if (type === 'notification' || type === 'vendor_notification') {
      this.emit('notification', data.notification);
      
      // Show toast notification
      if (data.notification) {
        this.showNotificationToast(data.notification);
      }
      return;
    }

    // Handle notification count updates
    if (type === 'notification_count_update') {
      this.emit('count_update', { count: data.count });
      return;
    }

    // Handle unread count
    if (type === 'unread_count') {
      this.emit('unread_count', { count: data.count });
      return;
    }

    // Handle recent notifications
    if (type === 'recent_notifications') {
      this.emit('recent_notifications', { notifications: data.notifications });
      return;
    }

    // Handle vendor stats
    if (type === 'vendor_stats') {
      this.emit('vendor_stats', { stats: data.stats });
      return;
    }

    // Handle service notifications
    if (type === 'service_notifications') {
      this.emit('service_notifications', data);
      return;
    }

    // Emit generic message
    this.emit(type, data);
  }

  private emit(messageType: string, data: any): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in message handler for ${messageType}:`, error);
        }
      });
    }
  }

  private showNotificationToast(notification: NotificationData): void {
    const toastType = notification.priority === 'urgent' ? 'error' : 
                     notification.priority === 'high' ? 'warning' : 'info';

    toast[toastType](
      notification.title,
      notification.message
    );
  }

  private scheduleReconnect(userType: 'user' | 'vendor'): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(userType).catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
