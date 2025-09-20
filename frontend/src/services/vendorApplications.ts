import { VendorEnlistment } from '../types';

// API base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const vendorApplicationService = {
  // Submit a new vendor application
  async submitApplication(applicationData: Omit<VendorEnlistment, 'id' | 'status' | 'submittedAt'>): Promise<VendorEnlistment> {
    const response = await fetch(`${API_BASE_URL}/users/vendor-applications/submit/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        business_name: applicationData.businessName,
        business_description: applicationData.businessDescription,
        category: applicationData.category,
        address: applicationData.address,
      }),
    });

    const data = await handleResponse(response);
    
    // Transform Django API response to frontend format
    return {
      id: data.application.id.toString(),
      name: data.application.applicant_name || 'Unknown',
      email: data.application.applicant_email || '',
      phone: data.application.applicant_phone || '',
      businessName: data.application.business_name,
      businessDescription: data.application.business_description,
      category: data.application.category,
      address: data.application.address,
      status: data.application.status,
      submittedAt: data.application.submitted_at,
      reviewedAt: data.application.reviewed_at,
      reviewedBy: data.application.reviewer_name,
      notes: data.application.notes,
    };
  },

  // Get all vendor applications (for admin)
  async getAllApplications(): Promise<VendorEnlistment[]> {
    const response = await fetch(`${API_BASE_URL}/users/vendor-applications/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    const results = data.results || data; // fallback for non-paginated
    if (!Array.isArray(results)) {
      return [];
    }
    return results.map((app: any) => ({
      id: app.id.toString(),
      name: app.applicant_name || 'Unknown',
      email: app.applicant_email || '',
      phone: app.applicant_phone || '',
      businessName: app.business_name,
      businessDescription: app.business_description,
      category: app.category,
      address: app.address,
      status: app.status,
      submittedAt: app.submitted_at,
      reviewedAt: app.reviewed_at,
      reviewedBy: app.reviewer_name,
      notes: app.notes,
    }));
  },

  // Get applications by status
  async getApplicationsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<VendorEnlistment[]> {
    const response = await fetch(`${API_BASE_URL}/users/vendor-applications/?status=${status}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    const results = data.results || data; // fallback for non-paginated
    if (!Array.isArray(results)) {
      return [];
    }
    return results.map((app: any) => ({
      id: app.id.toString(),
      name: app.applicant_name || 'Unknown',
      email: app.applicant_email || '',
      phone: app.applicant_phone || '',
      businessName: app.business_name,
      businessDescription: app.business_description,
      category: app.category,
      address: app.address,
      status: app.status,
      submittedAt: app.submitted_at,
      reviewedAt: app.reviewed_at,
      reviewedBy: app.reviewer_name,
      notes: app.notes,
    }));
  },

  // Update application status (approve/reject)
  async updateApplicationStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    reviewerEmail: string, 
    notes: string
  ): Promise<VendorEnlistment> {
    const endpoint = status === 'approved' ? 'approve' : 'reject';
    const response = await fetch(`${API_BASE_URL}/users/vendor-applications/${id}/${endpoint}/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        notes: notes,
      }),
    });

    const data = await handleResponse(response);
    
    return {
      id: data.application.id.toString(),
      name: data.application.applicant_name || 'Unknown',
      email: data.application.applicant_email || '',
      phone: data.application.applicant_phone || '',
      businessName: data.application.business_name,
      businessDescription: data.application.business_description,
      category: data.application.category,
      address: data.application.address,
      status: data.application.status,
      submittedAt: data.application.submitted_at,
      reviewedAt: data.application.reviewed_at,
      reviewedBy: data.application.reviewer_name,
      notes: data.application.notes,
    };
  },

  // Get application by ID
  async getApplicationById(id: string): Promise<VendorEnlistment | null> {
    const response = await fetch(`${API_BASE_URL}/users/vendor-applications/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 404) {
      return null;
    }

    const app = await handleResponse(response);
    
    return {
      id: app.id.toString(),
      name: app.applicant_name || 'Unknown',
      email: app.applicant_email || '',
      phone: app.applicant_phone || '',
      businessName: app.business_name,
      businessDescription: app.business_description,
      category: app.category,
      address: app.address,
      status: app.status,
      submittedAt: app.submitted_at,
      reviewedAt: app.reviewed_at,
      reviewedBy: app.reviewer_name,
      notes: app.notes,
    };
  },

  // Get current user's application
  async getMyApplication(): Promise<VendorEnlistment | null> {
    const response = await fetch(`${API_BASE_URL}/users/vendor-applications/my/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 404) {
      return null;
    }

    const data = await handleResponse(response);
    const app = data.application;
    
    if (!app) {
      return null;
    }

    return {
      id: app.id.toString(),
      name: app.applicant_name || 'Unknown',
      email: app.applicant_email || '',
      phone: app.applicant_phone || '',
      businessName: app.business_name,
      businessDescription: app.business_description,
      category: app.category,
      address: app.address,
      status: app.status,
      submittedAt: app.submitted_at,
      reviewedAt: app.reviewed_at,
      reviewedBy: app.reviewer_name,
      notes: app.notes,
    };
  },
}; 