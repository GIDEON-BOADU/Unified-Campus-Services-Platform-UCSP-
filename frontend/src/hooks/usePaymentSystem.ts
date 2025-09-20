import { useState, useEffect, useCallback } from 'react';
import { studentService, Payment } from '../services/student';
import { logger } from '../utils/logger';

export interface PaymentSystemData {
  // Data
  payments: Payment[];
  filteredPayments: Payment[];
  
  // Loading states
  isLoading: boolean;
  isProcessing: boolean;
  isVerifying: boolean;
  
  // Error states
  error: string | null;
  processError: string | null;
  verifyError: string | null;
  
  // Filters and search
  searchQuery: string;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  
  // Payment processing
  initiatePayment: (paymentData: {
    amount: number;
    phone: string;
    provider: 'mtn' | 'vodafone' | 'airtel' | 'telecel';
    orderId?: number;
    bookingId?: number;
  }) => Promise<Payment | null>;
  
  verifyPayment: (referenceId: string) => Promise<Payment | null>;
  
  // Data management
  refreshPayments: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  clearFilters: () => void;
  
  // Pagination
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  
  // Real-time updates
  enableRealTimeUpdates: () => void;
  disableRealTimeUpdates: () => void;
}

export const usePaymentSystem = (): PaymentSystemData => {
  // State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Real-time updates
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug('Fetching payments...');
      
      const paymentsData = await studentService.getPaymentHistory();
      setPayments(paymentsData);
      logger.debug('Payments fetched successfully:', paymentsData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments';
      setError(errorMessage);
      logger.error('Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...payments];
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.transaction_id.toLowerCase().includes(query) ||
        payment.phone_number?.toLowerCase().includes(query) ||
        payment.status.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }
    
    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(payment => 
        new Date(payment.created_at) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      filtered = filtered.filter(payment => 
        new Date(payment.created_at) <= new Date(dateTo)
      );
    }
    
    // Sort by created_at desc
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setFilteredPayments(filtered);
    
    // Update pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(totalPages);
    
    // Reset to first page if current page is out of bounds
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [payments, searchQuery, statusFilter, dateFrom, dateTo, itemsPerPage, currentPage]);

  // Initiate payment
  const initiatePayment = useCallback(async (paymentData: {
    amount: number;
    phone: string;
    provider: 'mtn' | 'vodafone' | 'airtel' | 'telecel';
    orderId?: number;
    bookingId?: number;
  }): Promise<Payment | null> => {
    try {
      setIsProcessing(true);
      setProcessError(null);
      logger.debug('Initiating payment:', paymentData);
      
      // Call the MoMo API endpoint
      const response = await fetch('/api/payments/initiate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          phone: paymentData.phone,
          provider: paymentData.provider,
          order_id: paymentData.orderId,
          booking_id: paymentData.bookingId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }
      
      const payment = await response.json();
      setPayments(prev => [payment, ...prev]);
      logger.debug('Payment initiated successfully:', payment);
      
      return payment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
      setProcessError(errorMessage);
      logger.error('Error initiating payment:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Verify payment
  const verifyPayment = useCallback(async (referenceId: string): Promise<Payment | null> => {
    try {
      setIsVerifying(true);
      setVerifyError(null);
      logger.debug('Verifying payment:', referenceId);
      
      // Call the MoMo verification endpoint
      const response = await fetch('/api/payments/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          reference_id: referenceId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }
      
      const result = await response.json();
      
      // Update the payment in the list
      setPayments(prev => prev.map(payment => 
        payment.reference_number === referenceId ? { ...payment, ...result } : payment
      ));
      
      logger.debug('Payment verified successfully:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify payment';
      setVerifyError(errorMessage);
      logger.error('Error verifying payment:', err);
      return null;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Refresh payments
  const refreshPayments = useCallback(async () => {
    await fetchPayments();
  }, [fetchPayments]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  }, []);

  // Enable real-time updates
  const enableRealTimeUpdates = useCallback(() => {
    if (realTimeEnabled) return;
    
    setRealTimeEnabled(true);
    const interval = setInterval(() => {
      logger.debug('Auto-refreshing payments...');
      fetchPayments();
    }, 30000); // 30 seconds
    
    setRefreshInterval(interval);
    logger.debug('Real-time updates enabled for payments');
  }, [realTimeEnabled, fetchPayments]);

  // Disable real-time updates
  const disableRealTimeUpdates = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    setRealTimeEnabled(false);
    logger.debug('Real-time updates disabled for payments');
  }, [refreshInterval]);

  // Initial load
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  return {
    payments,
    filteredPayments,
    isLoading,
    isProcessing,
    isVerifying,
    error,
    processError,
    verifyError,
    searchQuery,
    statusFilter,
    dateFrom,
    dateTo,
    currentPage,
    totalPages,
    itemsPerPage,
    initiatePayment,
    verifyPayment,
    refreshPayments,
    setSearchQuery,
    setStatusFilter,
    setDateFrom,
    setDateTo,
    clearFilters,
    setCurrentPage,
    setItemsPerPage,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
  };
};
