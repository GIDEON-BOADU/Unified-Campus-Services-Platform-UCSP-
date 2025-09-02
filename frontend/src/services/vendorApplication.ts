import { apiClient } from './api';

export interface VendorApplicationData {
  business_name: string;
  business_description: string;
  category: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  experience?: string;
  reason?: string;
}

export interface VendorApplication {
  id: string;
  applicant: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  business_name: string;
  business_description: string;
  category: string;
  category_display: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  status_display: string;
  notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_name?: string;
}

export interface VendorApplicationResponse {
  message: string;
  application: VendorApplication;
}

export class VendorApplicationService {
  /**
   * Submit a new vendor application
   */
  static async submitApplication(data: VendorApplicationData): Promise<VendorApplicationResponse> {
    try {
      const response = await apiClient.post('/users/vendor-applications/submit/', data);
      return response.data;
    } catch (error: any) {
      console.error('Error submitting vendor application:', error);
      throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Failed to submit application');
    }
  }

  /**
   * Get the current user's vendor application
   */
  static async getMyApplication(): Promise<VendorApplication | null> {
    try {
      const response = await apiClient.get('/users/vendor-applications/my/');
      return response.data.application;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No application found
      }
      console.error('Error fetching vendor application:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch application');
    }
  }

  /**
   * Check if user can submit a vendor application
   */
  static async canSubmitApplication(): Promise<boolean> {
    try {
      const application = await this.getMyApplication();
      return !application || application.status === 'rejected';
    } catch (error) {
      console.error('Error checking application eligibility:', error);
      return false;
    }
  }

  /**
   * Get application status
   */
  static async getApplicationStatus(): Promise<'none' | 'pending' | 'approved' | 'rejected'> {
    try {
      const application = await this.getMyApplication();
      return application ? application.status : 'none';
    } catch (error) {
      console.error('Error getting application status:', error);
      return 'none';
    }
  }
}
