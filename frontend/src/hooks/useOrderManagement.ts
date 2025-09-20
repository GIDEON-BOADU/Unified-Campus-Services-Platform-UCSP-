import { useState, useEffect, useCallback } from 'react';
import { studentService } from '../services/student';
import { Order, OrderFilters } from '../types';
import { logger } from '../utils/logger';

export interface OrderManagementData {
  // Data
  orders: Order[];
  filteredOrders: Order[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  
  // Filters and search
  filters: OrderFilters;
  searchQuery: string;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  
  // Actions
  createOrder: (orderData: any) => Promise<Order | null>;
  updateOrder: (orderId: number, updates: Partial<Order>) => Promise<Order | null>;
  cancelOrder: (orderId: number) => Promise<boolean>;
  deleteOrder: (orderId: number) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
  
  // Filtering and search
  setFilters: (filters: Partial<OrderFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Pagination
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  
  // Real-time updates
  enableRealTimeUpdates: () => void;
  disableRealTimeUpdates: () => void;
}

export const useOrderManagement = (initialFilters?: Partial<OrderFilters>): OrderManagementData => {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Filters and search
  const [filters, setFiltersState] = useState<OrderFilters>({
    status: undefined,
    date_from: undefined,
    date_to: undefined,
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    ...initialFilters
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Real-time updates
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug('Fetching orders with filters:', filters);
      
      const ordersData = await studentService.getStudentOrders(filters);
      setOrders(ordersData);
      logger.debug('Orders fetched successfully:', ordersData.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      logger.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Apply filters and search
  const applyFilters = useCallback(() => {
    let filtered = [...orders];
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.service_name.toLowerCase().includes(query) ||
        order.id.toString().includes(query) ||
        order.status.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }
    
    // Apply date filters
    if (filters.date_from) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= new Date(filters.date_from!)
      );
    }
    
    if (filters.date_to) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) <= new Date(filters.date_to!)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[filters.sort_by as keyof Order];
      const bValue = b[filters.sort_by as keyof Order];
      
      if (filters.sort_order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredOrders(filtered);
    
    // Update pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(totalPages);
    
    // Reset to first page if current page is out of bounds
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [orders, searchQuery, filters, itemsPerPage, currentPage]);

  // Create order
  const createOrder = useCallback(async (orderData: any): Promise<Order | null> => {
    try {
      setIsCreating(true);
      setCreateError(null);
      logger.debug('Creating order:', orderData);
      
      const newOrder = await studentService.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      logger.debug('Order created successfully:', newOrder);
      
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setCreateError(errorMessage);
      logger.error('Error creating order:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  // Update order
  const updateOrder = useCallback(async (orderId: number, updates: Partial<Order>): Promise<Order | null> => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      logger.debug('Updating order:', orderId, updates);
      
      // Optimistic update
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      ));
      
      // In a real implementation, you would call an update API here
      // const updatedOrder = await studentService.updateOrder(orderId, updates);
      
      logger.debug('Order updated successfully');
      return null; // Return the updated order in real implementation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order';
      setUpdateError(errorMessage);
      logger.error('Error updating order:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Cancel order
  const cancelOrder = useCallback(async (orderId: number): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      logger.debug('Cancelling order:', orderId);
      
      const cancelledOrder = await studentService.cancelOrder(orderId);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? cancelledOrder : order
      ));
      
      logger.debug('Order cancelled successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      setUpdateError(errorMessage);
      logger.error('Error cancelling order:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Delete order
  const deleteOrder = useCallback(async (orderId: number): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      logger.debug('Deleting order:', orderId);
      
      // In a real implementation, you would call a delete API here
      // await studentService.deleteOrder(orderId);
      
      setOrders(prev => prev.filter(order => order.id !== orderId));
      logger.debug('Order deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete order';
      setDeleteError(errorMessage);
      logger.error('Error deleting order:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({
      status: undefined,
      date_from: undefined,
      date_to: undefined,
      search: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    setSearchQuery('');
  }, []);

  // Enable real-time updates
  const enableRealTimeUpdates = useCallback(() => {
    if (realTimeEnabled) return;
    
    setRealTimeEnabled(true);
    const interval = setInterval(() => {
      logger.debug('Auto-refreshing orders...');
      fetchOrders();
    }, 30000); // 30 seconds
    
    setRefreshInterval(interval);
    logger.debug('Real-time updates enabled');
  }, [realTimeEnabled, fetchOrders]);

  // Disable real-time updates
  const disableRealTimeUpdates = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    setRealTimeEnabled(false);
    logger.debug('Real-time updates disabled');
  }, [refreshInterval]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
    orders,
    filteredOrders,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createError,
    updateError,
    deleteError,
    filters,
    searchQuery,
    currentPage,
    totalPages,
    itemsPerPage,
    createOrder,
    updateOrder,
    cancelOrder,
    deleteOrder,
    refreshOrders,
    setFilters,
    setSearchQuery,
    clearFilters,
    setCurrentPage,
    setItemsPerPage,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
  };
};
