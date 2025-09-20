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
  booking?: number;
  order?: number;
  booking_details?: {
    id: number;
    service_name: string;
    booking_date: string;
    student_name: string;
  };
  amount: number;
  payment_method: string;
  mobile_money_provider?: string;
  transaction_id: string;
  status: 'pending' | 'processing' | 'successful' | 'failed' | 'cancelled' | 'refunded';
  phone_number?: string;
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
    try {
      console.log('StudentService: Fetching student orders...');
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);
      
      const url = `/student/orders/?${params.toString()}`;
      console.log('StudentService: Calling URL:', url);
      
      const response = await apiClient.get(url);
      console.log('StudentService: Response received:', response);
      
      return Array.isArray(response) ? response : response.results || [];
    } catch (error) {
      console.error('StudentService: Error fetching orders:', error);
      // Return empty array for now to prevent crashes
      return [];
    }
  },

  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/student/orders/', orderData);
    return response;
  },

  cancelOrder: async (orderId: number): Promise<Order> => {
    const response = await apiClient.post(`/student/orders/${orderId}/cancel_order/`);
    return response.order;
  },

  getOrderDetails: async (orderId: number): Promise<Order> => {
    const response = await apiClient.get(`/student/orders/${orderId}/`);
    return response;
  },

  // Booking Management
  getStudentBookings: async (): Promise<Booking[]> => {
    try {
      console.log('StudentService: Fetching student bookings...');
      const response = await apiClient.get('/student/bookings/');
      console.log('StudentService: Bookings response:', response);
      return Array.isArray(response) ? response : response.results || [];
    } catch (error) {
      console.error('StudentService: Error fetching bookings:', error);
      return [];
    }
  },

  createBooking: async (bookingData: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.post('/student/bookings/', bookingData);
    return response;
  },

  cancelBooking: async (bookingId: number): Promise<Booking> => {
    const response = await apiClient.post(`/student/bookings/${bookingId}/cancel_booking/`);
    return response.booking;
  },

  getBookingDetails: async (bookingId: number): Promise<Booking> => {
    const response = await apiClient.get(`/student/bookings/${bookingId}/`);
    return response;
  },

  // Payment History
  getPaymentHistory: async (): Promise<Payment[]> => {
    try {
      console.log('StudentService: Fetching payment history...');
      const response = await apiClient.get('/student/payments/');
      console.log('StudentService: Payments response:', response);
      return Array.isArray(response) ? response : response.results || [];
    } catch (error) {
      console.error('StudentService: Error fetching payments:', error);
      return [];
    }
  },

  getPaymentDetails: async (paymentId: number): Promise<Payment> => {
    const response = await apiClient.get(`/student/payments/${paymentId}/`);
    return response;
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
      console.log('StudentService: Fetching student stats...');
      const results = await Promise.all([
        studentService.getStudentOrders(),
        studentService.getStudentBookings(),
        studentService.getPaymentHistory()
      ]);
      
      const [orders, bookings, payments] = results as [Order[], Booking[], Payment[]];
      console.log('StudentService: Stats data - orders:', orders.length, 'bookings:', bookings.length, 'payments:', payments.length);

      const totalOrders = Array.isArray(orders) ? orders.length : 0;
      const activeBookings = Array.isArray(bookings) ? bookings.filter((b: Booking) => ['pending', 'confirmed'].includes(b.booking_status)).length : 0;
      const totalSpent = Array.isArray(payments) ? payments
        .filter((p: Payment) => p.status === 'successful')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0) : 0;
      const pendingPayments = Array.isArray(payments) ? payments.filter((p: Payment) => p.status === 'pending').length : 0;

      // For now, return mock values for rating and reviews
      // These would come from a separate API endpoint in a real implementation
      const averageRating = 4.2;
      const totalReviews = 8;

      const stats = {
        totalOrders,
        activeBookings,
        totalSpent,
        pendingPayments,
        averageRating,
        totalReviews
      };
      
      console.log('StudentService: Calculated stats:', stats);
      return stats;
    } catch (error) {
      console.error('StudentService: Error fetching student stats:', error);
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
