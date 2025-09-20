// services/complaints.ts
import { apiClient } from './api';
import { Complaint, CreateComplaintData, ComplaintStats } from '../types';

export const complaintService = {
  // Get all complaints (admin only)
  async getComplaints(): Promise<Complaint[]> {
    const response = await apiClient.get('/complaints/');
    return response.results || response.value || response;
  },

  // Get current user's complaints (student)
  async getMyComplaints(): Promise<Complaint[]> {
    const response = await apiClient.get('/complaints/my_complaints/');
    return response.complaints || [];
  },

  // Get pending complaints (admin)
  async getPendingComplaints(): Promise<Complaint[]> {
    const response = await apiClient.get('/complaints/pending/');
    return response.complaints || [];
  },

  // Get urgent complaints (admin)
  async getUrgentComplaints(): Promise<Complaint[]> {
    const response = await apiClient.get('/complaints/urgent/');
    return response.complaints || [];
  },

  // Get complaint statistics (admin)
  async getComplaintStats(): Promise<ComplaintStats> {
    const response = await apiClient.get('/complaints/stats/');
    return response;
  },

  // Create a new complaint (student)
  async createComplaint(data: CreateComplaintData): Promise<Complaint> {
    const response = await apiClient.post('/complaints/', data);
    return response;
  },

  // Get complaint by ID
  async getComplaint(id: string): Promise<Complaint> {
    const response = await apiClient.get(`/complaints/${id}/`);
    return response;
  },

  // Update complaint (admin only)
  async updateComplaint(id: string, data: Partial<Complaint>): Promise<Complaint> {
    const response = await apiClient.patch(`/complaints/${id}/`, data);
    return response;
  },

  // Assign complaint to admin
  async assignComplaint(id: string, adminId: string): Promise<Complaint> {
    const response = await apiClient.post(`/complaints/${id}/assign/`, {
      admin_id: adminId
    });
    return response.complaint;
  },

  // Resolve complaint with admin response
  async resolveComplaint(id: string, adminResponse: string): Promise<Complaint> {
    const response = await apiClient.post(`/complaints/${id}/resolve/`, {
      admin_response: adminResponse
    });
    return response.complaint;
  },

  // Delete complaint (admin only)
  async deleteComplaint(id: string): Promise<void> {
    await apiClient.delete(`/complaints/${id}/`);
  }
};
