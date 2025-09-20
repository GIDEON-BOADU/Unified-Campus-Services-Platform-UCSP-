import { useState, useEffect, useCallback } from 'react';
import { studentService, Booking, Payment } from '../services/student';
import { Order } from '../types';
import { logger } from '../utils/logger';

export interface StudentDashboardData {
  // Stats
  stats: {
    totalOrders: number;
    activeBookings: number;
    totalSpent: number;
    pendingPayments: number;
    averageRating: number;
    totalReviews: number;
  };
  
  // Data
  orders: Order[];
  bookings: Booking[];
  payments: Payment[];
  
  // Loading states
  isLoading: boolean;
  isStatsLoading: boolean;
  isOrdersLoading: boolean;
  isBookingsLoading: boolean;
  isPaymentsLoading: boolean;
  
  // Error states
  error: string | null;
  statsError: string | null;
  ordersError: string | null;
  bookingsError: string | null;
  paymentsError: string | null;
  
  // Refresh functions
  refreshStats: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  refreshPayments: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Data manipulation
  updateOrder: (orderId: number, updates: Partial<Order>) => void;
  updateBooking: (bookingId: number, updates: Partial<Booking>) => void;
  updatePayment: (paymentId: number, updates: Partial<Payment>) => void;
}

export const useStudentDashboard = (): StudentDashboardData => {
  // State
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeBookings: 0,
    totalSpent: 0,
    pendingPayments: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      setStatsError(null);
      logger.debug('Fetching student stats...');
      
      const statsData = await studentService.getStudentStats();
      setStats(statsData);
      logger.debug('Student stats fetched successfully:', statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setStatsError(errorMessage);
      logger.error('Error fetching student stats:', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsOrdersLoading(true);
      setOrdersError(null);
      logger.debug('Fetching student orders...');
      
      const ordersData = await studentService.getStudentOrders();
      setOrders(ordersData);
      logger.debug('Student orders fetched successfully:', ordersData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setOrdersError(errorMessage);
      logger.error('Error fetching student orders:', err);
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setIsBookingsLoading(true);
      setBookingsError(null);
      logger.debug('Fetching student bookings...');
      
      const bookingsData = await studentService.getStudentBookings();
      setBookings(bookingsData);
      logger.debug('Student bookings fetched successfully:', bookingsData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setBookingsError(errorMessage);
      logger.error('Error fetching student bookings:', err);
    } finally {
      setIsBookingsLoading(false);
    }
  }, []);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      setIsPaymentsLoading(true);
      setPaymentsError(null);
      logger.debug('Fetching student payments...');
      
      const paymentsData = await studentService.getPaymentHistory();
      setPayments(paymentsData);
      logger.debug('Student payments fetched successfully:', paymentsData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments';
      setPaymentsError(errorMessage);
      logger.error('Error fetching student payments:', err);
    } finally {
      setIsPaymentsLoading(false);
    }
  }, []);

  // Refresh functions
  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  const refreshBookings = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  const refreshPayments = useCallback(async () => {
    await fetchPayments();
  }, [fetchPayments]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.debug('Refreshing all student dashboard data...');
      await Promise.all([
        fetchStats(),
        fetchOrders(),
        fetchBookings(),
        fetchPayments()
      ]);
      logger.debug('All student dashboard data refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      logger.error('Error refreshing student dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats, fetchOrders, fetchBookings, fetchPayments]);

  // Data manipulation functions
  const updateOrder = useCallback((orderId: number, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
  }, []);

  const updateBooking = useCallback((bookingId: number, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, ...updates } : booking
    ));
  }, []);

  const updatePayment = useCallback((paymentId: number, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId ? { ...payment, ...updates } : payment
    ));
  }, []);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      logger.debug('Auto-refreshing student dashboard data...');
      refreshAll();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshAll]);

  return {
    stats,
    orders,
    bookings,
    payments,
    isLoading,
    isStatsLoading,
    isOrdersLoading,
    isBookingsLoading,
    isPaymentsLoading,
    error,
    statsError,
    ordersError,
    bookingsError,
    paymentsError,
    refreshStats,
    refreshOrders,
    refreshBookings,
    refreshPayments,
    refreshAll,
    updateOrder,
    updateBooking,
    updatePayment,
  };
};
