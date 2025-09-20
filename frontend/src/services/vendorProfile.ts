import { apiClient, API_ENDPOINTS } from './api';

export interface VendorProfile {
  id: string;
  user: string;
  user_username: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_full_name: string;
  business_name: string;
  description: string;
  business_hours: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  is_verified: boolean;
  is_active: boolean;
  mtn_momo_number?: string;
  vodafone_cash_number?: string;
  airtel_money_number?: string;
  telecel_cash_number?: string;
  preferred_payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVendorProfileData {
  business_name: string;
  description?: string;
  business_hours?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: File;
  mtn_momo_number?: string;
  vodafone_cash_number?: string;
  airtel_money_number?: string;
  telecel_cash_number?: string;
  preferred_payment_method?: 'mtn_momo' | 'vodafone_cash' | 'airtel_money' | 'telecel_cash' | 'cash' | 'card';
}

export interface UpdateVendorProfileData extends Partial<CreateVendorProfileData> {
  is_active?: boolean;
}

class VendorProfileService {
  private readonly API_BASE = API_ENDPOINTS.BUSINESSES;

  /**
   * Get vendor profile by user ID
   */
  async getVendorProfile(userId?: string): Promise<VendorProfile> {
    try {
      const url = userId ? `${this.API_BASE.LIST}by_user_id/?user_id=${userId}` : `${this.API_BASE.LIST}my_profile/`;
      const response = await apiClient.get(url);
      return response.profile || response;
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      throw error;
    }
  }

  /**
   * Create vendor profile
   */
  async createVendorProfile(profileData: CreateVendorProfileData): Promise<VendorProfile> {
    try {
      const formData = new FormData();
      
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'logo' && value instanceof File) {
            formData.append('logo', value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.post(
        this.API_BASE.CREATE,
        formData
      );
      return response;
    } catch (error) {
      console.error('Error creating vendor profile:', error);
      throw error;
    }
  }

  /**
   * Update vendor profile
   */
  async updateVendorProfile(profileId: string, profileData: UpdateVendorProfileData): Promise<VendorProfile> {
    try {
      const formData = new FormData();
      
      console.log('Updating vendor profile with data:', profileData);
      
      // Define required fields that must always be sent
      const requiredFields = ['business_name'];
      
      Object.entries(profileData).forEach(([key, value]) => {
        // Always include required fields, even if empty
        // Include other fields only if they have values
        if (requiredFields.includes(key) || (value !== null && value !== undefined)) {
          if (key === 'logo' && value instanceof File) {
            formData.append('logo', value);
            console.log(`Added file: ${key}`);
          } else {
            formData.append(key, value.toString());
            console.log(`Added field: ${key} = ${value}`);
          }
        }
      });

      // Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await apiClient.put(
        this.API_BASE.UPDATE(profileId),
        formData
      );
      console.log('Update response:', response);
      return response;
    } catch (error: any) {
      console.error('Error updating vendor profile:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  }

  /**
   * Delete vendor profile
   */
  async deleteVendorProfile(profileId: string): Promise<void> {
    try {
      await apiClient.delete(this.API_BASE.DELETE(profileId));
    } catch (error) {
      console.error('Error deleting vendor profile:', error);
      throw error;
    }
  }

  /**
   * Get all vendor profiles (admin only)
   */
  async getAllVendorProfiles(): Promise<VendorProfile[]> {
    try {
      const response = await apiClient.get(this.API_BASE.LIST);
      return Array.isArray(response) ? response : response.results || [];
    } catch (error) {
      console.error('Error fetching all vendor profiles:', error);
      throw error;
    }
  }

  /**
   * Get vendor profile by ID
   */
  async getVendorProfileById(profileId: string): Promise<VendorProfile> {
    try {
      const response = await apiClient.get(this.API_BASE.DETAIL(profileId));
      return response;
    } catch (error) {
      console.error('Error fetching vendor profile by ID:', error);
      throw error;
    }
  }
}

export const vendorProfileService = new VendorProfileService();
