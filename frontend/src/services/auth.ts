import { apiClient } from './api';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'vendor' | 'admin';
  phone?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  message?: string;
}

class AuthServiceClass {
  private readonly API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  /**
   * Login user and store tokens
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const response = await fetch(`${this.API_BASE}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend login error:', errorData);
        
        // Show detailed error information
        let errorMessage = 'Login failed';
        if (errorData.errors) {
          // Format validation errors
          const errorDetails = Object.entries(errorData.errors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage = `Login failed: ${errorDetails}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Store tokens (backend returns 'access' and 'refresh')
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      // Store user data
      if (data.user) {
        this.storeUser(data.user);
      }
      
      // Update API client token
      apiClient.setToken(data.access);
      
      return {
        success: true,
        user: data.user,
        message: data.message
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Register new user
   */
  async signup(userData: RegisterData): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get('/users/profile/');
      return response.user; // Backend wraps user data in a 'user' field
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear tokens
   */
  logout(): void {
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clear API client token
    apiClient.clearToken();
    
    // Redirect to login
    window.location.href = '/login';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token && !apiClient.isTokenExpired();
  }

  /**
   * Get current user from localStorage (for initial state)
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Store user data in localStorage
   */
  storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear user data from localStorage
   */
  clearUser(): void {
    localStorage.removeItem('user');
  }
}

export const AuthService = new AuthServiceClass();