import { apiClient } from './api';

export interface TokenResponse {
  access: string;
  refresh: string;
  access_token_expires_in?: number;
  refresh_token_expires_in?: number;
  token_type?: string;
  message?: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
}

class TokenService {
  private refreshInterval: any = null;
  private readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
  private readonly BACKGROUND_CHECK_INTERVAL = 60 * 1000; // Check every minute
  private isRefreshing = false;

  constructor() {
    this.startBackgroundRefresh();
  }

  /**
   * Start background token refresh service
   */
  startBackgroundRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      await this.checkAndRefreshIfNeeded();
    }, this.BACKGROUND_CHECK_INTERVAL);
  }

  /**
   * Stop background token refresh service
   */
  stopBackgroundRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Check if token needs refresh and refresh silently if needed
   */
  private async checkAndRefreshIfNeeded(): Promise<void> {
    if (this.isRefreshing) {
      return; // Already refreshing
    }

    const timeUntilExpiry = this.getTimeUntilExpiry();
    
    if (timeUntilExpiry <= this.REFRESH_THRESHOLD && timeUntilExpiry > 0) {
      console.log(`Token expires in ${Math.floor(timeUntilExpiry / 60)}m ${timeUntilExpiry % 60}s, refreshing...`);
      await this.silentRefresh();
    }
  }

  /**
   * Get time until access token expires in seconds
   */
  getTimeUntilExpiry(): number {
    const token = localStorage.getItem('accessToken');
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - currentTime);
    } catch {
      return 0;
    }
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(): boolean {
    return this.getTimeUntilExpiry() <= 0;
  }

  /**
   * Check if access token is expiring soon
   */
  isTokenExpiringSoon(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    return timeUntilExpiry > 0 && timeUntilExpiry <= this.REFRESH_THRESHOLD;
  }

  /**
   * Refresh tokens silently in background
   */
  async silentRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      return false;
    }

    this.isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/users/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data: TokenResponse = await response.json();
      
      // Store new tokens (backend returns 'access' and 'refresh')
      this.storeTokens(data.access, data.refresh);
      
      console.log('Tokens refreshed silently in background');
      return true;

    } catch (error) {
      console.error('Background token refresh failed:', error);
      
      // If refresh fails, clear tokens and trigger logout
      this.clearTokens();
      this.triggerLogout();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Store tokens in localStorage
   */
  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Update API client token
    apiClient.setToken(accessToken);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    apiClient.clearToken();
  }

  /**
   * Trigger logout event for other components to handle
   */
  private triggerLogout(): void {
    // Dispatch custom event for logout
    window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
  }

  /**
   * Manual token refresh (for explicit refresh requests)
   */
  async manualRefresh(): Promise<boolean> {
    return await this.silentRefresh();
  }

  /**
   * Get token information for debugging
   */
  getTokenInfo(): TokenInfo | null {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!accessToken || !refreshToken) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return {
        accessToken,
        refreshToken,
        accessTokenExpiry: payload.exp,
        refreshTokenExpiry: 0, // Refresh token expiry not stored in access token
      };
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const tokenService = new TokenService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  tokenService.stopBackgroundRefresh();
});
