import { apiClient } from './api';

export interface MobileMoneyPayment {
  id: string;
  service_id: number;
  amount: number;
  currency: string;
  payment_method: 'mtn_momo' | 'vodafone_cash' | 'airtel_money' | 'telecel_cash';
  phone_number: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

export interface PaymentRequest {
  service_id: number;
  amount: number;
  payment_method: 'mtn_momo' | 'vodafone_cash' | 'airtel_money' | 'telecel_cash';
  phone_number: string;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment_id: string;
  reference: string;
  message: string;
  instructions?: string;
}

export class PaymentService {
  /**
   * Initiate mobile money payment
   */
  static async initiatePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post('/payments/mobile-money/initiate/', paymentData);
      return response;
    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  /**
   * Initiate MoMo payment (alias for initiatePayment)
   */
  static async initiateMoMoPayment(paymentData: {
    amount: number;
    phone: string;
    provider: string;
    order_id?: string;
    booking_id?: string | null;
    service_id: string;
  }): Promise<{
    success: boolean;
    transaction_id?: string;
    message: string;
  }> {
    try {
      const response = await apiClient.post('/payments/initiate/', {
        amount: paymentData.amount,
        phone: paymentData.phone,
        provider: paymentData.provider,
        order_id: paymentData.order_id,
        booking_id: paymentData.booking_id
      });
      
      return {
        success: true,
        transaction_id: response.transaction_id,
        message: response.message || 'Payment initiated successfully'
      };
    } catch (error: any) {
      console.error('MoMo payment initiation failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Payment initiation failed'
      };
    }
  }

  /**
   * Verify payment status
   */
  static async verifyPayment(paymentId: string): Promise<MobileMoneyPayment> {
    try {
      const response = await apiClient.get(`/payments/${paymentId}/verify/`);
      return response;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Get payment history for user
   */
  static async getPaymentHistory(): Promise<MobileMoneyPayment[]> {
    try {
      const response = await apiClient.get('/payments/history/');
      return response.results || response;
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      throw new Error('Failed to fetch payment history');
    }
  }

  /**
   * Get payment methods available for a service
   */
  static async getAvailablePaymentMethods(serviceId: number): Promise<string[]> {
    try {
      const response = await apiClient.get(`/services/${serviceId}/payment-methods/`);
      return response.payment_methods || [];
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      return [];
    }
  }

  /**
   * Cancel pending payment
   */
  static async cancelPayment(paymentId: string): Promise<boolean> {
    try {
      await apiClient.post(`/payments/${paymentId}/cancel/`);
      return true;
    } catch (error) {
      console.error('Payment cancellation failed:', error);
      return false;
    }
  }

  /**
   * Get payment instructions for specific method
   */
  static getPaymentInstructions(method: string): string {
    const instructions = {
      mtn_momo: 'Dial *170# and follow the prompts to send money to the provided number',
      vodafone_cash: 'Dial *110# and follow the prompts to send money to the provided number',
      airtel_money: 'Dial *126# and follow the prompts to send money to the provided number',
      telecel_cash: 'Dial *124# and follow the prompts to send money to the provided number'
    };
    return instructions[method as keyof typeof instructions] || 'Follow the prompts on your mobile money app';
  }

  /**
   * Format phone number for mobile money
   */
  static formatPhoneNumber(phone: string, method: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing
    if (cleaned.startsWith('0')) {
      return `+233${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('233')) {
      return `+${cleaned}`;
    } else if (cleaned.length === 9) {
      return `+233${cleaned}`;
    }
    
    return phone; // Return original if can't format
  }
}

// Export individual functions for easier importing
export const initiateMoMoPayment = PaymentService.initiateMoMoPayment;
export const initiatePayment = PaymentService.initiatePayment;
export const verifyPayment = PaymentService.verifyPayment;
export const getPaymentHistory = PaymentService.getPaymentHistory;
