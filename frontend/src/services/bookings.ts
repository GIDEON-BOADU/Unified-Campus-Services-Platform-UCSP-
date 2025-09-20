import { apiClient } from './api';
import { Booking } from '../types';

export interface CreateBookingData {
  service: string;
  booking_date: string;
  notes?: string;
}

export interface UpdateBookingData {
  booking_date?: string;
  notes?: string;
}

export class BookingService {
  /**
   * Get all bookings for the current student
   */
  static async getStudentBookings(): Promise<Booking[]> {
    try {
      const response = await apiClient.get('/student/bookings/');
      return response.results || response;
    } catch (error) {
      console.error('Error fetching student bookings:', error);
      throw error;
    }
  }

  /**
   * Create a new booking
   */
  static async createBooking(data: CreateBookingData): Promise<Booking> {
    try {
      const response = await apiClient.post('/student/bookings/', data);
      return response;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Update an existing booking
   */
  static async updateBooking(bookingId: string, data: UpdateBookingData): Promise<Booking> {
    try {
      const response = await apiClient.patch(`/student/bookings/${bookingId}/`, data);
      return response;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await apiClient.post(`/student/bookings/${bookingId}/cancel_booking/`);
      return response;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Get booking details
   */
  static async getBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await apiClient.get(`/student/bookings/${bookingId}/`);
      return response;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  /**
   * Check if a time slot is available for booking
   */
  static async checkAvailability(serviceId: string, bookingDate: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/bookings/check-availability/?service=${serviceId}&date=${bookingDate}`);
      return response.available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }
}
