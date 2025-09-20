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
  phoneNumber: string;
  userType: 'student' | 'vendor' | 'admin';
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
      console.log('AuthService: Attempting login with email:', email);
      
      const response = await fetch(`${this.API_BASE}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      console.log('AuthService: Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AuthService: Backend login error:', errorData);
        
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
        } else if (response.status === 401) {
          errorMessage = 'Invalid username or password. Please check your credentials.';
        } else if (response.status === 400) {
          errorMessage = 'Please enter both username and password.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('AuthService: Login successful, user data:', data.user);
      
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
      console.error('AuthService: Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed. Please check your credentials and try again.'
      };
    }
  }

  /**
   * Register new user
   */
  async signup(userData: RegisterData): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Transform frontend data to backend format
      const backendData = {
        username: userData.email, // Use email as username
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        password: userData.password,
        password_confirm: userData.password, // Add password confirmation
        user_type: userData.userType,
        phone_number: userData.phoneNumber,
      };

      console.log('Sending registration data:', backendData);

      const response = await fetch(`${this.API_BASE}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration error details:', errorData);
        
        // Handle specific validation errors
        if (errorData.errors) {
          const errorMessages = [];
          if (errorData.errors.password) {
            errorMessages.push(`Password: ${Array.isArray(errorData.errors.password) ? errorData.errors.password[0] : errorData.errors.password}`);
          }
          if (errorData.errors.phone_number) {
            errorMessages.push(`Phone: ${Array.isArray(errorData.errors.phone_number) ? errorData.errors.phone_number[0] : errorData.errors.phone_number}`);
          }
          if (errorData.errors.email) {
            errorMessages.push(`Email: ${Array.isArray(errorData.errors.email) ? errorData.errors.email[0] : errorData.errors.email}`);
          }
          if (errorData.errors.username) {
            errorMessages.push(`Username: ${Array.isArray(errorData.errors.username) ? errorData.errors.username[0] : errorData.errors.username}`);
          }
          
          return { 
            success: false, 
            error: errorMessages.length > 0 ? errorMessages.join(', ') : (errorData.message || 'Registration failed')
          };
        }
        
        return {
          success: false,
          error: errorData.message || 'Registration failed'
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Registration successful! Please login with your new account.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
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
    try {
      console.log('AuthService: Starting logout process');
      
      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.log('AuthService: Tokens cleared from localStorage');
      
      // Clear API client token
      apiClient.clearToken();
      console.log('AuthService: API client token cleared');
      
      // Clear any other stored data
      localStorage.removeItem('user');
      sessionStorage.clear();
      console.log('AuthService: All storage cleared');
      
      // Use a more reliable redirect method
      console.log('AuthService: Redirecting to login page');
      if (window.location.pathname !== '/login') {
        // Use replaceState to avoid back button issues
        window.history.replaceState(null, '', '/login');
        // Force a page reload to clear any cached state
        window.location.reload();
      }
      
    } catch (error) {
      console.error('AuthService: Logout error:', error);
      // Force redirect even if there's an error
      try {
        window.location.href = '/login';
      } catch (redirectError) {
        console.error('AuthService: Redirect failed:', redirectError);
        // Last resort - try to navigate programmatically
        window.location.replace('/login');
      }
    }
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