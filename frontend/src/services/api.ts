import { ApiResponse, PaginatedResponse } from '../types';
import { tokenService } from './tokenService';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// HTTP Client Class
class ApiClient {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    // Listen for token refresh failures
    window.addEventListener('tokenRefreshFailed', () => {
      this.handleTokenRefreshFailure();
    });
  }

  // Set token for API requests
  setToken(token: string): void {
    if (token) {
      localStorage.setItem('accessToken', token);
    }
  }

  // Clear token
  clearToken(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Get current token
  private getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    return tokenService.isTokenExpired();
  }

  // Get token expiry time
  getTokenExpiry(): number | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp;
    } catch {
      return null;
    }
  }

  // Get time until token expires (in seconds)
  getTimeUntilExpiry(): number {
    return tokenService.getTimeUntilExpiry();
  }

  // Check if token is valid
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired();
  }

  // Handle token refresh failure
  private handleTokenRefreshFailure(): void {
    // Clear all tokens
    this.clearToken();
    
    // Redirect to login
    window.location.href = '/login';
  }

  // Process failed queue
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Make HTTP request with automatic token refresh
  private async makeRequest(url: string, options: RequestInit): Promise<any> {
    const token = this.getToken();
    
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);
    
    if (response.status === 401) {
      // Token expired, try to refresh
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        
        try {
          const refreshed = await tokenService.silentRefresh();
          if (refreshed) {
            // Retry the original request with new token
            this.isRefreshing = false;
            return await this.makeRequest(url, options);
          }
        } catch (error) {
          this.isRefreshing = false;
          this.processQueue(error);
          throw error;
        }
      }
      
      // If refresh failed, queue the request
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // GET request
  async get(url: string): Promise<any> {
    return this.makeRequest(url, { method: 'GET' });
  }

  // POST request
  async post(url: string, data?: any): Promise<any> {
    return this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    });
  }

  // PUT request
  async put(url: string, data?: any): Promise<any> {
    return this.makeRequest(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    });
  }

  // PATCH request
  async patch(url: string, data?: any): Promise<any> {
    return this.makeRequest(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    });
  }

  // DELETE request
  async delete(url: string): Promise<any> {
    return this.makeRequest(url, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

  // API Endpoints
  export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
      LOGIN: '/users/login/',
      REFRESH: '/users/auth/refresh/',
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