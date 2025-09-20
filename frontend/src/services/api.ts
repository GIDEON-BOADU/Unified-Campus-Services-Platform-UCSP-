import { ApiResponse, PaginatedResponse } from '../types';
import { tokenService } from './tokenService';
import { cacheService } from './cache';
import { performanceService } from './performance';

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

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });
      
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
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('CORS or Network Error:', error);
        throw new Error('Network error: Unable to connect to server. Please check your connection and try again.');
      }
      throw error;
    }
  }

  // GET request with caching
  async get(url: string, useCache: boolean = true): Promise<any> {
    const cacheKey = cacheService.generateKey(url);
    
    // Check cache first for GET requests
    if (useCache) {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log(`Cache hit for ${url}`);
        return cached;
      }
    }

    const startTime = performance.now();
    try {
      const result = await this.makeRequest(url, { method: 'GET' });
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceService.trackAPI(url, 'GET', duration, 200);
      
      // Cache successful GET responses
      if (useCache && result) {
        cacheService.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceService.trackAPI(url, 'GET', duration, 500);
      throw error;
    }
  }

  // POST request
  async post(url: string, data?: any): Promise<any> {
    const startTime = performance.now();
    try {
      const result = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : null,
      });
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceService.trackAPI(url, 'POST', duration, 200);
      
      // Invalidate related cache entries
      this.invalidateCache(url);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceService.trackAPI(url, 'POST', duration, 500);
      throw error;
    }
  }

  // PUT request
  async put(url: string, data?: any): Promise<any> {
    const startTime = performance.now();
    try {
      const result = await this.makeRequest(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : null,
      });
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceService.trackAPI(url, 'PUT', duration, 200);
      
      // Invalidate related cache entries
      this.invalidateCache(url);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceService.trackAPI(url, 'PUT', duration, 500);
      throw error;
    }
  }

  // PATCH request
  async patch(url: string, data?: any): Promise<any> {
    const startTime = performance.now();
    try {
      const result = await this.makeRequest(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : null,
      });
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceService.trackAPI(url, 'PATCH', duration, 200);
      
      // Invalidate related cache entries
      this.invalidateCache(url);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceService.trackAPI(url, 'PATCH', duration, 500);
      throw error;
    }
  }

  // DELETE request
  async delete(url: string): Promise<any> {
    const startTime = performance.now();
    try {
      const result = await this.makeRequest(url, { method: 'DELETE' });
      
      // Track performance
      const duration = performance.now() - startTime;
      performanceService.trackAPI(url, 'DELETE', duration, 200);
      
      // Invalidate related cache entries
      this.invalidateCache(url);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceService.trackAPI(url, 'DELETE', duration, 500);
      throw error;
    }
  }

  // Invalidate cache entries related to a URL
  private invalidateCache(url: string): void {
    const stats = cacheService.getStats();
    const baseUrl = url.split('?')[0]; // Remove query parameters
    
    stats.keys.forEach(key => {
      if (key.includes(baseUrl)) {
        cacheService.delete(key);
      }
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

  // API Endpoints
  export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
      LOGIN: '/users/login/',
      REFRESH: '/token/refresh/',
      REGISTER: '/users/register/',
      PROFILE: '/users/profile/',
    },
  
    // Users (Admin only)
    USERS: {
      LIST: '/users/users/',
      DETAIL: (id: string) => `/users/users/${id}/`,
      CREATE: '/users/users/',
      UPDATE: (id: string) => `/users/users/${id}/`,
      DELETE: (id: string) => `/users/users/${id}/`,
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