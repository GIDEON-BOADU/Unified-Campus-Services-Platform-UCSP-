import { apiClient, API_ENDPOINTS } from './api';
import { User, LoginForm, RegisterForm, ApiResponse } from '../types';

// Authentication Service
export class AuthService {
  // Login user
  static async login(credentials: LoginForm): Promise<{ user: User; access: string; refresh: string }> {
    console.log('AuthService.login called with:', credentials);
    const response = await apiClient.post<{ 
      access: string; 
      refresh: string; 
      user: any; // Use any to handle backend format
      message: string;
    }>(
      '/users/login/',
      credentials
    );
    
    console.log('AuthService.login API response:', response);
    
    // Transform backend user data to frontend format
    const transformedUser: User = {
      id: response.user.id.toString(),
      username: response.user.username,
      email: response.user.email,
      firstName: response.user.first_name || response.user.firstName,
      lastName: response.user.last_name || response.user.lastName,
      userType: response.user.user_type || response.user.userType,
      phoneNumber: response.user.phone_number || response.user.phoneNumber,
      profilePicture: response.user.profile_picture || response.user.profilePicture,
      isActive: response.user.is_active !== false,
      createdAt: response.user.created_at || response.user.createdAt || response.user.date_joined,
      // Backend compatibility fields
      user_type: response.user.user_type,
      phone_number: response.user.phone_number,
      profile_picture: response.user.profile_picture,
      is_active: response.user.is_active,
      created_at: response.user.created_at,
    };
    
    console.log('Transformed user:', transformedUser);
    
    return {
      user: transformedUser,
      access: response.access,
      refresh: response.refresh,
    };
  }

  // Register user
  static async register(userData: RegisterForm): Promise<{ user: User; access: string; refresh: string }> {
    const response = await apiClient.post<{ 
      user: User;
      message: string;
    }>(
      '/users/register/',
      userData
    );
    
    // For registration, we don't get tokens immediately
    // User needs to login after registration
    return {
      user: response.user,
      access: '',
      refresh: '',
    };
  }

  // Get current user profile
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<{ user: any }>(API_ENDPOINTS.AUTH.PROFILE);
    
    console.log('getProfile response:', response);
    
    // Transform backend user data to frontend format (same as login)
    const transformedUser: User = {
      id: response.user.id.toString(),
      username: response.user.username,
      email: response.user.email,
      firstName: response.user.first_name || response.user.firstName,
      lastName: response.user.last_name || response.user.lastName,
      userType: response.user.user_type || response.user.userType,
      phoneNumber: response.user.phone_number || response.user.phoneNumber,
      profilePicture: response.user.profile_picture || response.user.profilePicture,
      isActive: response.user.is_active !== false,
      createdAt: response.user.created_at || response.user.createdAt || response.user.date_joined,
      // Backend compatibility fields
      user_type: response.user.user_type,
      phone_number: response.user.phone_number,
      profile_picture: response.user.profile_picture,
      is_active: response.user.is_active,
      created_at: response.user.created_at,
    };
    
    console.log('getProfile transformed user:', transformedUser);
    
    return transformedUser;
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<{ access: string }> {
    return apiClient.post<{ access: string }>(API_ENDPOINTS.AUTH.REFRESH, {
      refresh: refreshToken,
    });
  }

  // Logout (client-side only, clear tokens)
  static logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}