import { apiClient } from './api';
import { serviceWorkerManager } from '../utils/serviceWorker';

export interface SessionConfig {
  refreshThreshold: number; // seconds before expiry to refresh
  checkInterval: number; // milliseconds between checks
  maxRetries: number; // maximum refresh attempts
  retryDelay: number; // milliseconds between retries
}

export class SessionManager {
  private static instance: SessionManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private retryCount = 0;
  private config: SessionConfig;

  private constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      refreshThreshold: 300, // 5 minutes
      checkInterval: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds
      ...config,
    };

    // Initialize background session management
    this.initialize();
  }

  public static getInstance(config?: Partial<SessionConfig>): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager(config);
    }
    return SessionManager.instance;
  }

  private async initialize(): void {
    // Register service worker for background session management
    await serviceWorkerManager.register();

    // Start background session monitoring
    this.startBackgroundMonitoring();

    // Listen for visibility changes to handle tab switching
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Listen for storage events (for multi-tab sync)
    window.addEventListener('storage', this.handleStorageChange.bind(this));

    // Listen for service worker events
    window.addEventListener('serviceWorkerSessionRefresh', this.handleServiceWorkerRefresh.bind(this));
    window.addEventListener('serviceWorkerSessionCheck', this.handleServiceWorkerCheck.bind(this));
    window.addEventListener('serviceWorkerForceRefresh', this.handleServiceWorkerForceRefresh.bind(this));
  }

  private startBackgroundMonitoring(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.checkAndRefreshToken();
    }, this.config.checkInterval);
  }

  private async checkAndRefreshToken(): Promise<void> {
    // Skip if already refreshing or no token
    if (this.isRefreshing || !apiClient.isTokenValid()) {
      return;
    }

    const timeUntilExpiry = apiClient.getTimeUntilExpiry();
    
    // Check if token needs refresh
    if (timeUntilExpiry <= this.config.refreshThreshold) {
      await this.refreshToken();
    }
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return false;
    }

    this.isRefreshing = true;

    try {
      // Attempt silent refresh
      const success = await this.performSilentRefresh();
      
      if (success) {
        this.retryCount = 0;
        this.isRefreshing = false;
        this.notifyTokenRefreshed();
        return true;
      } else {
        throw new Error('Refresh failed');
      }
    } catch (error) {
      console.warn('Token refresh failed:', error);
      
      // Retry logic
      if (this.retryCount < this.config.maxRetries) {
        this.retryCount++;
        setTimeout(() => {
          this.isRefreshing = false;
          this.refreshToken();
        }, this.config.retryDelay);
        return false;
      } else {
        // Max retries reached, handle session expiry
        this.handleSessionExpiry();
        return false;
      }
    }
  }

  private async performSilentRefresh(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/users/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update tokens
        if (data.access) {
          localStorage.setItem('accessToken', data.access);
          if (data.refresh) {
            localStorage.setItem('refreshToken', data.refresh);
          }
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Silent refresh error:', error);
      return false;
    }
  }

  private handleSessionExpiry(): void {
    this.isRefreshing = false;
    this.retryCount = 0;
    
    // Clear tokens
    apiClient.clearToken();
    
    // Notify about session expiry
    this.notifySessionExpired();
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      // Tab became visible, check token immediately
      this.checkAndRefreshToken();
    }
  }

  private handleOnline(): void {
    // Connection restored, check token
    this.checkAndRefreshToken();
  }

  private handleOffline(): void {
    // Connection lost, pause refresh attempts
    this.isRefreshing = false;
  }

  private handleStorageChange(event: StorageEvent): void {
    // Handle token changes from other tabs
    if (event.key === 'accessToken' || event.key === 'refreshToken') {
      this.checkAndRefreshToken();
    }
  }

  private handleServiceWorkerRefresh(event: CustomEvent): void {
    // Handle service worker session refresh request
    this.checkAndRefreshToken();
  }

  private handleServiceWorkerCheck(event: CustomEvent): void {
    // Handle service worker session check request
    this.checkAndRefreshToken();
  }

  private handleServiceWorkerForceRefresh(event: CustomEvent): void {
    // Handle service worker forced refresh request
    this.refreshToken();
  }

  private notifyTokenRefreshed(): void {
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('tokenRefreshed', {
      detail: { timestamp: Date.now() }
    }));
  }

  private notifySessionExpired(): void {
    // Dispatch custom event for session expiry
    window.dispatchEvent(new CustomEvent('sessionExpired', {
      detail: { timestamp: Date.now() }
    }));
  }

  // Public methods
  public getSessionStatus(): {
    isValid: boolean;
    timeUntilExpiry: number;
    isRefreshing: boolean;
    retryCount: number;
  } {
    return {
      isValid: apiClient.isTokenValid(),
      timeUntilExpiry: apiClient.getTimeUntilExpiry(),
      isRefreshing: this.isRefreshing,
      retryCount: this.retryCount,
    };
  }

  public forceRefresh(): Promise<boolean> {
    return this.refreshToken();
  }

  public updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.startBackgroundMonitoring();
  }

  public destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    window.removeEventListener('serviceWorkerSessionRefresh', this.handleServiceWorkerRefresh.bind(this));
    window.removeEventListener('serviceWorkerSessionCheck', this.handleServiceWorkerCheck.bind(this));
    window.removeEventListener('serviceWorkerForceRefresh', this.handleServiceWorkerForceRefresh.bind(this));
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
