import { useState, useEffect, useCallback } from 'react';
import { Order, CreateOrderData, UpdateOrderData } from '../types';
import { OrderService } from '../services/orders';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await OrderService.getStudentOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (data: CreateOrderData): Promise<Order | null> => {
    try {
      const newOrder = await OrderService.createOrder(data);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      return null;
    }
  }, []);

  const updateOrder = useCallback(async (orderId: string, data: UpdateOrderData): Promise<Order | null> => {
    try {
      const updatedOrder = await OrderService.updateOrder(orderId, data);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      return null;
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      await OrderService.cancelOrder(orderId);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, order_status: 'cancelled' } : order
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
      return false;
    }
  }, []);

  const getServiceItems = useCallback(async (serviceId: string) => {
    try {
      return await OrderService.getServiceItems(serviceId);
    } catch (err) {
      console.error('Error fetching service items:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    cancelOrder,
    getServiceItems,
  };
};