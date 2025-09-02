import { apiClient } from './api';
import { Order, OrderFilters } from '../types';

// Booking interface based on backend model
export interface Booking {
  id: number;
  service: number;
  service_name: string;
  student: number;
  student_name: string;
  vendor_name: string;
  booking_date: string;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Payment interface based on backend model
export interface Payment {
  id: number;
  order: number;
  order_details: string;
  student: number;
  student_name: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  created_at: string;
}

// Create booking data interface
export interface CreateBookingData {
  service: number;
  booking_date: string;
  notes?: string;
}

// Create order data interface
export interface CreateOrderData {
  service: number;
  special_instructions?: string;
  delivery_address?: string;
}

export const studentService = {
  // Order Management
  getStudentOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);
    
    const response = await apiClient.get(`/student/orders/?${params.toString()}`);
    return response.data || [];
  },

  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/student/orders/', orderData);
    return response.data;
  },

  cancelOrder: async (orderId: number): Promise<Order> => {
    const response = await apiClient.post(`/student/orders/${orderId}/cancel_order/`);
    return response.data.order;
  },

  getOrderDetails: async (orderId: number): Promise<Order> => {
    const response = await apiClient.get(`/student/orders/${orderId}/`);
    return response.data;
  },

  // Booking Management
  getStudentBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get('/student/bookings/');
    return response.data || [];
  },

  createBooking: async (bookingData: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.post('/student/bookings/', bookingData);
    return response.data;
  },

  cancelBooking: async (bookingId: number): Promise<Booking> => {
    const response = await apiClient.post(`/student/bookings/${bookingId}/cancel_booking/`);
    return response.data.booking;
  },

  getBookingDetails: async (bookingId: number): Promise<Booking> => {
    const response = await apiClient.get(`/student/bookings/${bookingId}/`);
    return response.data;
  },

  // Payment History
  getPaymentHistory: async (): Promise<Payment[]> => {
    const response = await apiClient.get('/student/payments/');
    return response.data || [];
  },

  getPaymentDetails: async (paymentId: number): Promise<Payment> => {
    const response = await apiClient.get(`/student/payments/${paymentId}/`);
    return response.data;
  },

  // Student Dashboard Stats
  getStudentStats: async (): Promise<{
    totalOrders: number;
    activeBookings: number;
    totalSpent: number;
    pendingPayments: number;
    averageRating: number;
    totalReviews: number;
  }> => {
    try {
      const [orders, bookings, payments] = await Promise.all([
        this.getStudentOrders(),
        this.getStudentBookings(),
        this.getPaymentHistory()
      ]);

      const totalOrders = orders.length;
      const activeBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.booking_status)).length;
      const totalSpent = payments
        .filter(p => p.payment_status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      const pendingPayments = payments.filter(p => p.payment_status === 'pending').length;

      // For now, return mock values for rating and reviews
      // These would come from a separate API endpoint in a real implementation
      const averageRating = 4.2;
      const totalReviews = 8;

      return {
        totalOrders,
        activeBookings,
        totalSpent,
        pendingPayments,
        averageRating,
        totalReviews
      };
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return {
        totalOrders: 0,
        activeBookings: 0,
        totalSpent: 0,
        pendingPayments: 0,
        averageRating: 0,
        totalReviews: 0
      };
    }
  }
};

export default studentService;
