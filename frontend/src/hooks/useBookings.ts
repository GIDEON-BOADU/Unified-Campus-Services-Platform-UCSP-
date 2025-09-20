import { useState, useEffect, useCallback } from 'react';
import { Booking, CreateBookingData, UpdateBookingData } from '../types';
import { BookingService } from '../services/bookings';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await BookingService.getStudentBookings();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (data: CreateBookingData): Promise<Booking | null> => {
    try {
      const newBooking = await BookingService.createBooking(data);
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      return null;
    }
  }, []);

  const updateBooking = useCallback(async (bookingId: string, data: UpdateBookingData): Promise<Booking | null> => {
    try {
      const updatedBooking = await BookingService.updateBooking(bookingId, data);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      return updatedBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      return null;
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      await BookingService.cancelBooking(bookingId);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, booking_status: 'cancelled' } : booking
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      return false;
    }
  }, []);

  const checkAvailability = useCallback(async (serviceId: string, bookingDate: string): Promise<boolean> => {
    try {
      return await BookingService.checkAvailability(serviceId, bookingDate);
    } catch (err) {
      console.error('Error checking availability:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    isLoading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    checkAvailability,
  };
};
