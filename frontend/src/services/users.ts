import { apiClient, API_ENDPOINTS } from './api';
import { User } from '../types';

// Transform Django API response to frontend format
const transformUser = (data: any): User => ({
  id: data.id.toString(),
  username: data.username,
  email: data.email,
  firstName: data.first_name || data.firstName || '',
  lastName: data.last_name || data.lastName || '',
  userType: data.user_type || data.userType || 'student',
  phoneNumber: data.phone_number || data.phoneNumber || '',
  profilePicture: data.profile_picture || data.profilePicture || undefined,
  isActive: data.is_active !== false,
  createdAt: data.created_at || data.createdAt || new Date().toISOString(),
});

export const getUsers = async (): Promise<User[]> => {
  try {
    const data = await apiClient.get<any>(API_ENDPOINTS.USERS.LIST);
    
    // Handle different response formats
    let usersArray: any[] = [];
    
    if (Array.isArray(data)) {
      // Direct array response
      usersArray = data;
    } else if (data && typeof data === 'object') {
      // Paginated response or object with users
      if (Array.isArray(data.results)) {
        usersArray = data.results;
      } else if (Array.isArray(data.users)) {
        usersArray = data.users;
      } else if (Array.isArray(data.data)) {
        usersArray = data.data;
      } else {
        // If it's an object but no array found, log for debugging
        console.warn('Unexpected API response format:', data);
        return [];
      }
    } else {
      console.warn('Invalid API response:', data);
      return [];
    }
    
    // Transform and return users
    return usersArray.map(transformUser);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const data = await apiClient.get<any>(API_ENDPOINTS.USERS.DETAIL(id));
    return transformUser(data);
  } catch (error: any) {
    if (error?.status === 404) return null;
    throw error;
  }
};

export const addUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: 'student' | 'vendor' | 'admin';
  password: string;
}): Promise<User> => {
  const res = await apiClient.post<any>(API_ENDPOINTS.USERS.CREATE, {
    first_name: userData.firstName,
    last_name: userData.lastName,
    email: userData.email,
    phone_number: userData.phone,
    user_type: userData.userType,
    password: userData.password,
  });
  return transformUser(res);
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const res = await apiClient.put<any>(API_ENDPOINTS.USERS.UPDATE(id), {
    first_name: data.firstName || '',
    last_name: data.lastName || '',
    email: data.email,
    user_type: data.userType,
    phone_number: data.phoneNumber,
  });
  return transformUser(res);
};

export const deleteUser = async (id: string): Promise<void> => {
  return apiClient.delete<void>(API_ENDPOINTS.USERS.DELETE(id));
};