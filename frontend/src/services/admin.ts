import { apiClient, API_ENDPOINTS } from './api';

export interface AdminStats {
  totalUsers: number;
  activeBusinesses: number;
  pendingApplications: number;
  totalRevenue: number;
  userGrowth: string;
  businessGrowth: string;
  applicationChange: string;
  revenueGrowth: string;
}

export interface AdminActivity {
  id: string;
  type: 'application' | 'business' | 'user' | 'order' | 'complaint';
  message: string;
  time: string;
  status: 'pending' | 'completed' | 'failed';
  entityId?: string;
  entityType?: string;
}

export interface QuickActionCounts {
  pendingApplications: number;
  activeBusinesses: number;
  newComplaints: number;
  todayOrders: number;
}

export const adminService = {
  // Get admin dashboard statistics
  async getDashboardStats(): Promise<AdminStats> {
    const data = await apiClient.get<any>('/admin/stats/');
    return {
      totalUsers: data.total_users || 0,
      activeBusinesses: data.active_businesses || 0,
      pendingApplications: data.pending_applications || 0,
      totalRevenue: data.total_revenue || 0,
      userGrowth: data.user_growth || '+0%',
      businessGrowth: data.business_growth || '+0',
      applicationChange: data.application_change || '+0',
      revenueGrowth: data.revenue_growth || '+0%',
    };
  },

  // Get recent admin activities
  async getRecentActivities(limit: number = 5): Promise<AdminActivity[]> {
    const data = await apiClient.get<any[]>('/admin/activities/');
    
    const activities = Array.isArray(data) ? data : (data as any).results || [];
    return activities.slice(0, limit).map((activity: any) => ({
      id: activity.id.toString(),
      type: activity.activity_type || 'user',
      message: activity.message || 'Activity recorded',
      time: activity.created_at || new Date().toISOString(),
      status: activity.status || 'completed',
      entityId: activity.entity_id?.toString(),
      entityType: activity.entity_type,
    }));
  },

  // Get quick action counts
  async getQuickActionCounts(): Promise<QuickActionCounts> {
    const data = await apiClient.get<any>('/admin/quick-stats/');
    return {
      pendingApplications: data.pending_applications || 0,
      activeBusinesses: data.active_businesses || 0,
      newComplaints: data.new_complaints || 0,
      todayOrders: data.today_orders || 0,
    };
  },
};