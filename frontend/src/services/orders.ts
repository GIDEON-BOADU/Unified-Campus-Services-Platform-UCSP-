import { apiClient } from './api';
import { Order, OrderItem } from '../types';

export interface CreateOrderData {
  service: string;
  special_instructions?: string;
  delivery_address?: string;
  order_items?: {
    service_item: string;
    quantity: number;
  }[];
}

export interface UpdateOrderData {
  special_instructions?: string;
  delivery_address?: string;
  order_items?: {
    service_item: string;
    quantity: number;
  }[];
}

export class OrderService {
  /**
   * Get all orders for the current student
   */
  static async getStudentOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get('/student/orders/');
      return response.results || response;
    } catch (error) {
      console.error('Error fetching student orders:', error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const response = await apiClient.post('/student/orders/', data);
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update an existing order
   */
  static async updateOrder(orderId: string, data: UpdateOrderData): Promise<Order> {
    try {
      const response = await apiClient.patch(`/student/orders/${orderId}/`, data);
      return response;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.post(`/student/orders/${orderId}/cancel_order/`);
      return response;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Get order details
   */
  static async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get(`/student/orders/${orderId}/`);
      return response;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Get service items for a service (for ordering)
   */
  static async getServiceItems(serviceId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/services/${serviceId}/items/`);
      return response.results || response;
    } catch (error) {
      console.error('Error fetching service items:', error);
      throw error;
    }
  }
}