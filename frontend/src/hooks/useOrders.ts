import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatusUpdate, OrderFilters, OrderStats } from '../types';
import { ordersService } from '../services/orders';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Fetch all orders with current filters
  const fetchOrders = useCallback(async (newFilters?: OrderFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      const fetchedOrders = await ordersService.getVendorOrders(currentFilters);
      
      setOrders(fetchedOrders || []);
      if (newFilters) {
        setFilters(currentFilters);
      }
    } catch (err) {
      console.warn('Failed to fetch orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setOrders([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch order statistics
  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const fetchedStats = await ordersService.getVendorOrderStats();
      setStats(fetchedStats);
    } catch (err) {
      console.warn('Failed to fetch order statistics:', err);
      // Don't set error for stats failure, just use fallback
      setStats({
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
      });
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: number, statusUpdate: OrderStatusUpdate) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedOrder = await ordersService.updateOrderStatus(orderId, statusUpdate);
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
      
      // Refresh stats to get updated counts
      await fetchStats();
      
      return updatedOrder;
    } catch (err) {
      console.warn('Failed to update order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats]);

  // Search orders
  const searchOrders = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!query.trim()) {
        await fetchOrders();
        return;
      }
      
      const searchResults = await ordersService.searchOrders(query);
      setOrders(searchResults || []);
    } catch (err) {
      console.warn('Failed to search orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to search orders');
      setOrders([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [fetchOrders]);

  // Filter orders by status
  const filterByStatus = useCallback(async (status: string | undefined) => {
    try {
      const newFilters = { ...filters, status: status as any };
      await fetchOrders(newFilters);
    } catch (err) {
      console.warn('Failed to filter orders by status:', err);
    }
  }, [filters, fetchOrders]);

  // Filter orders by date range
  const filterByDateRange = useCallback(async (dateFrom: string, dateTo: string) => {
    try {
      const newFilters = { ...filters, date_from: dateFrom, date_to: dateTo };
      await fetchOrders(newFilters);
    } catch (err) {
      console.warn('Failed to filter orders by date range:', err);
    }
  }, [filters, fetchOrders]);

  // Sort orders
  const sortOrders = useCallback(async (sortBy: string, sortOrder: 'asc' | 'desc') => {
    try {
      const newFilters = { ...filters, sort_by: sortBy as any, sort_order: sortOrder };
      await fetchOrders(newFilters);
    } catch (err) {
      console.warn('Failed to sort orders:', err);
    }
  }, [filters, fetchOrders]);

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    await fetchOrders();
    await fetchStats();
  }, [fetchOrders, fetchStats]);

  // Get orders by status count
  const getOrdersByStatusCount = useCallback((status: string) => {
    return orders.filter(order => order.order_status === status).length;
  }, [orders]);

  // Get total revenue
  const getTotalRevenue = useCallback(() => {
    return orders
      .filter(order => order.order_status === 'completed')
      .reduce((sum, order) => sum + order.total_amount, 0);
  }, [orders]);

  // Get average order value
  const getAverageOrderValue = useCallback(() => {
    if (orders.length === 0) return 0;
    const total = orders.reduce((sum, order) => sum + order.total_amount, 0);
    return total / orders.length;
  }, [orders]);

  // Initialize data
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  return {
    // State
    orders,
    stats,
    isLoading,
    error,
    filters,
    
    // Actions
    fetchOrders,
    fetchStats,
    updateOrderStatus,
    searchOrders,
    filterByStatus,
    filterByDateRange,
    sortOrders,
    refreshOrders,
    
    // Computed values
    getOrdersByStatusCount,
    getTotalRevenue,
    getAverageOrderValue,
    
    // Utility
    setFilters
  };
};

export default useOrders;
