import { ApiResponse, PaginatedResponse } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Token management utilities
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
};

const getTokenExpiryTime = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp;
  } catch {
    return null;
  }
};

// HTTP Client Class
class ApiClient {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newAccessToken = data.access;
      
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear all tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token
    let token = localStorage.getItem('accessToken');
    
    // Check if token is expired before making the request
    if (token && isTokenExpired(token)) {
      console.log('Token expired, attempting refresh...');
      token = await this.refreshToken();
      if (!token) {
        // Redirect to login if refresh fails
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
    }
    
    // Prepare headers
    const headers = new Headers(options.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401 && retryCount === 0) {
        // Token might be expired, try to refresh
        if (this.isRefreshing) {
          // Wait for the current refresh to complete
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => this.request<T>(endpoint, options, retryCount + 1));
        }

        this.isRefreshing = true;
        
        try {
          const newToken = await this.refreshToken();
          this.isRefreshing = false;
          
          if (newToken) {
            this.processQueue(null, newToken);
            // Retry the original request with new token
            return this.request<T>(endpoint, options, retryCount + 1);
          } else {
            this.processQueue(new Error('Token refresh failed'), null);
            // Redirect to login
            window.location.href = '/login';
            throw new Error('Authentication required');
          }
        } catch (error) {
          this.isRefreshing = false;
          this.processQueue(error, null);
          throw error;
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const config: RequestInit = { method: 'POST' };
    if (data) {
      config.body = JSON.stringify(data);
    }
    return this.request<T>(endpoint, config);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const config: RequestInit = { method: 'PUT' };
    if (data) {
      config.body = JSON.stringify(data);
    }
    return this.request<T>(endpoint, config);
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Check if current token is valid
  isTokenValid(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    return !isTokenExpired(token);
  }

  // Get token expiry time
  getTokenExpiry(): number | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return getTokenExpiryTime(token);
  }

  // Get time until token expires (in seconds)
  getTimeUntilExpiry(): number {
    const expiry = this.getTokenExpiry();
    if (!expiry) return 0;
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, expiry - currentTime);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/token/',
    REFRESH: '/token/refresh/',
    REGISTER: '/users/register/',
    PROFILE: '/users/profile/',
  },
  
  // Businesses
  BUSINESSES: {
    LIST: '/vendor-profiles/',
    DETAIL: (id: string) => `/vendor-profiles/${id}/`,
    CREATE: '/vendor-profiles/',
    UPDATE: (id: string) => `/vendor-profiles/${id}/`,
    DELETE: (id: string) => `/vendor-profiles/${id}/`,
  },
  
  // Services
  SERVICES: {
    LIST: '/services/',
    DETAIL: (id: string) => `/services/${id}/`,
    CREATE: '/services/',
    UPDATE: (id: string) => `/services/${id}/`,
    DELETE: (id: string) => `/services/${id}/`,
  },
} as const;