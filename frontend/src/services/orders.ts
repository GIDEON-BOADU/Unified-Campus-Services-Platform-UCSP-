import { apiClient } from './api';
import { Order, OrderStatusUpdate, OrderFilters, OrderStats } from '../types';

export const ordersService = {
  // Get all orders for the current vendor
  getVendorOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);

    const response = await apiClient.get<{ data: Order[] }>(`/orders/?${params.toString()}`);
    return (response as any).data || [];
  },

  // Get a specific order by ID
  getOrder: async (orderId: number): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}/`);
    return (response as any).data;
  },

  // Update order status (vendor only)
  updateOrderStatus: async (orderId: number, statusUpdate: OrderStatusUpdate): Promise<Order> => {
    const response = await apiClient.post(`/orders/${orderId}/update_status/`, statusUpdate);
    return (response as any).data.order;
  },

  // Get order statistics for vendor dashboard
  getVendorOrderStats: async (): Promise<OrderStats> => {
    try {
      const response = await apiClient.get('/vendor-profiles/vendor_dashboard/');
      const data = (response as any).data;
      
      // Transform the response to match our OrderStats interface
      return {
        total_orders: data.total_orders || 0,
        pending_orders: data.orders_by_status?.find((s: any) => s.order_status === 'pending')?.count || 0,
        confirmed_orders: data.orders_by_status?.find((s: any) => s.order_status === 'confirmed')?.count || 0,
        preparing_orders: data.orders_by_status?.find((s: any) => s.order_status === 'preparing')?.count || 0,
        ready_orders: data.orders_by_status?.find((s: any) => s.order_status === 'ready')?.count || 0,
        delivering_orders: data.orders_by_status?.find((s: any) => s.order_status === 'delivering')?.count || 0,
        completed_orders: data.orders_by_status?.find((s: any) => s.order_status === 'completed')?.count || 0,
        cancelled_orders: data.orders_by_status?.find((s: any) => s.order_status === 'cancelled')?.count || 0,
        total_revenue: data.total_revenue || 0,
        average_order_value: data.total_orders > 0 ? (data.total_revenue / data.total_orders) : 0
      };
    } catch (error) {
      console.warn('Failed to fetch vendor dashboard stats, using fallback:', error);
      // Return fallback stats if the dashboard endpoint fails
      return {
        total_orders: 0,
        pending_orders: 0,
        confirmed_orders: 0,
        preparing_orders: 0,
        ready_orders: 0,
        delivering_orders: 0,
        completed_orders: 0,
        cancelled_orders: 0,
        total_revenue: 0,
        average_order_value: 0
      };
    }
  },

  // Get recent orders for vendor dashboard
  getRecentOrders: async (limit: number = 5): Promise<Order[]> => {
    const response = await apiClient.get(`/orders/?limit=${limit}&sort_by=created_at&sort_order=desc`);
    return (response as any).data || [];
  },

  // Search orders by customer name or service name
  searchOrders: async (query: string): Promise<Order[]> => {
    const response = await apiClient.get(`/orders/?search=${encodeURIComponent(query)}`);
    return (response as any).data || [];
  },

  // Filter orders by date range
  getOrdersByDateRange: async (dateFrom: string, dateTo: string): Promise<Order[]> => {
    const response = await apiClient.get(`/orders/?date_from=${dateFrom}&date_to=${dateTo}`);
    return (response as any).data || [];
  },

  // Get orders by status
  getOrdersByStatus: async (status: string): Promise<Order[]> => {
    const response = await apiClient.get(`/orders/?status=${status}`);
    return (response as any).data || [];
  }
};

export default ordersService;
