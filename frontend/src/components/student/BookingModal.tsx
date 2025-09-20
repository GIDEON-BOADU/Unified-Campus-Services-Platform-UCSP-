import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { Service } from '../../hooks/useServices';
import { useBookings } from '../../hooks/useBookings';

interface BookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (booking: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createBooking, checkAvailability, isLoading } = useBookings();
  const [formData, setFormData] = useState({
    booking_date: '',
    notes: ''
  });
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Set default booking date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
      setFormData({
        booking_date: tomorrow.toISOString().slice(0, 16),
        notes: ''
      });
      setError(null);
      setIsAvailable(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.booking_date && service) {
      checkAvailability(service.id, formData.booking_date)
        .then(setIsAvailable)
        .catch(() => setIsAvailable(false));
    }
  }, [formData.booking_date, service, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable) {
      setError('This time slot is not available. Please choose a different time.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const booking = await createBooking({
        service: service.id,
        booking_date: formData.booking_date,
        notes: formData.notes || undefined
      });

      if (booking) {
        onSuccess?.(booking);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ booking_date: '', notes: '' });
    setError(null);
    setIsAvailable(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book Service</h2>
                <p className="text-sm text-gray-600">{service.service_name}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Select Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.booking_date}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_date: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {isAvailable !== null && (
                <div className={`mt-2 flex items-center gap-2 text-sm ${
                  isAvailable ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isAvailable ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {isAvailable ? 'Time slot is available' : 'Time slot is not available'}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Special Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requirements or notes for your booking..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Service Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-2">Service Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{service.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium capitalize">{service.category}</span>
                </div>
                {service.base_price && (
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">GHS {service.base_price}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium">{service.location || 'Contact vendor'}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">₵</span>
                </div>
                <h3 className="font-medium text-gray-900">Payment Information</h3>
              </div>
              <p className="text-sm text-gray-600">
                Payment will be processed via mobile money (MTN MoMo, Vodafone Cash, Airtel Money, or Telecel Cash) 
                once your booking is confirmed. You'll receive payment details from the service provider.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isAvailable || isLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Book Now
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
