import { apiClient, API_ENDPOINTS } from './api';
import { Business, PaginatedResponse } from '../types';

// Business Service
export class BusinessService {
  // Get all businesses (for students)
  static async getAllBusinesses(): Promise<Business[]> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.BUSINESSES.LIST
      );
      
      console.log('Business API response:', response);
      
      // Handle different response formats
      let businesses = [];
      if (response.results && Array.isArray(response.results)) {
        businesses = response.results;
      } else if (Array.isArray(response)) {
        businesses = response;
      } else if (response.data && Array.isArray(response.data)) {
        businesses = response.data;
      } else {
        console.warn('Unexpected business API response format:', response);
        return [];
      }
      
      // Transform backend data to frontend format
      return businesses.map(this.transformBusiness);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      return [];
    }
  }

  // Get business by ID
  static async getBusinessById(id: string): Promise<Business | null> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.BUSINESSES.DETAIL(id));
      return this.transformBusiness(response);
    } catch (error) {
      console.error(`Failed to fetch business ${id}:`, error);
      return null;
    }
  }

  // Create new business (for vendors)
  static async createBusiness(businessData: Partial<Business>): Promise<Business | null> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.BUSINESSES.CREATE, businessData);
      return this.transformBusiness(response);
    } catch (error) {
      console.error('Failed to create business:', error);
      return null;
    }
  }

  // Update business
  static async updateBusiness(id: string, businessData: Partial<Business>): Promise<Business | null> {
    try {
      const response = await apiClient.put<any>(API_ENDPOINTS.BUSINESSES.UPDATE(id), businessData);
      return this.transformBusiness(response);
    } catch (error) {
      console.error(`Failed to update business ${id}:`, error);
      return null;
    }
  }

  // Delete business
  static async deleteBusiness(id: string): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.BUSINESSES.DELETE(id));
      return true;
    } catch (error) {
      console.error(`Failed to delete business ${id}:`, error);
      return false;
    }
  }

  // Transform backend data to frontend format
  private static transformBusiness(data: any): Business {
    return {
      id: data.id.toString(),
      name: data.business_name || data.name,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      isActive: data.is_active !== false,
      isVerified: data.is_verified || false,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
      ownerId: data.user?.toString() || data.owner_id?.toString(),
      ownerName: data.user_username || data.owner_name || 'Unknown',
    };
  }
}