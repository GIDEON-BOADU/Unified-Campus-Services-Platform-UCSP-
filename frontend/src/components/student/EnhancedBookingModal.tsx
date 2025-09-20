import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle,
  Star,
  Shield
} from 'lucide-react';
import { Service } from '../../types';
import { BookingService } from '../../services/bookings';

interface EnhancedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  vendorInfo?: {
    business_name?: string;
    phone?: string;
    address?: string;
    business_hours?: string;
    is_verified?: boolean;
  } | null;
  onSuccess?: (message: string) => void;
}

interface BookingFormData {
  service_id: string;
  preferred_date: string;
  preferred_time: string;
  duration: number;
  special_requests: string;
  contact_phone: string;
  contact_name: string;
  booking_type: 'appointment' | 'walk_in' | 'consultation';
  estimated_cost: number;
}

const EnhancedBookingModal: React.FC<EnhancedBookingModalProps> = ({
  isOpen,
  onClose,
  service,
  vendorInfo,
  onSuccess
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    service_id: service.id,
    preferred_date: '',
    preferred_time: '',
    duration: 60, // Default 1 hour
    special_requests: '',
    contact_phone: '',
    contact_name: '',
    booking_type: 'appointment',
    estimated_cost: service.base_price || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Generate time slots (9 AM to 6 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get available dates (next 14 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create the booking using the booking service
      const bookingData = {
        service: service.id,
        booking_date: `${formData.preferred_date}T${formData.preferred_time}:00Z`,
        notes: `Booking Type: ${formData.booking_type}\nDuration: ${formData.duration} minutes\nSpecial Requests: ${formData.special_requests}\nContact: ${formData.contact_name} (${formData.contact_phone})`
      };

      await BookingService.createBooking(bookingData);
      
      onSuccess?.(`Booking confirmed for ${service.service_name} on ${formData.preferred_date} at ${formData.preferred_time}!`);
      onClose();
    } catch (err: any) {
      console.error('Booking creation error:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    const icons: { [key: string]: string } = {
      barbering: '💇‍♂️',
      beauty: '💄',
      massage: '💆‍♀️',
      consultation: '💬',
      appointment: '📅',
      walk_in: '🚶‍♂️'
    };
    return icons[serviceType] || '📅';
  };

  const getServiceTypeColor = (serviceType: string) => {
    const colors: { [key: string]: string } = {
      barbering: 'bg-blue-100 text-blue-800',
      beauty: 'bg-pink-100 text-pink-800',
      massage: 'bg-purple-100 text-purple-800',
      consultation: 'bg-green-100 text-green-800',
      appointment: 'bg-indigo-100 text-indigo-800',
      walk_in: 'bg-orange-100 text-orange-800'
    };
    return colors[serviceType] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book Service</h2>
                <p className="text-sm text-gray-600">{service.service_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Service Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">{getServiceTypeIcon(service.service_type)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{service.service_name}</h3>
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getServiceTypeColor(service.service_type)}`}>
                    {service.service_type.replace('_', ' ')}
                  </span>
                  {service.base_price && (
                    <span className="text-sm font-bold text-green-600">
                      GHS {service.base_price}
                    </span>
                  )}
                  {service.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{service.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Info */}
          {vendorInfo && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Service Provider
              </h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{vendorInfo.business_name}</span>
                  {vendorInfo.is_verified && (
                    <Shield className="w-4 h-4 text-green-500" />
                  )}
                </div>
                {vendorInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{vendorInfo.phone}</span>
                  </div>
                )}
                {vendorInfo.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{vendorInfo.address}</span>
                  </div>
                )}
                {vendorInfo.business_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{vendorInfo.business_hours}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'appointment', label: 'Appointment', icon: '📅' },
                  { value: 'walk_in', label: 'Walk-in', icon: '🚶‍♂️' },
                  { value: 'consultation', label: 'Consultation', icon: '💬' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, booking_type: type.value as any }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.booking_type === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-sm font-medium">{type.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <select
                  value={formData.preferred_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a date</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={formData.preferred_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  name="contact_name"
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  name="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="0241234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests or Notes
              </label>
              <textarea
                value={formData.special_requests}
                onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
                placeholder="Any specific requirements or notes for your booking..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{service.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{formData.booking_type.replace('_', ' ')}</span>
                </div>
                {formData.preferred_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(formData.preferred_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                {formData.preferred_time && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formData.preferred_time}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formData.duration} minutes</span>
                </div>
                {service.base_price && (
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Estimated Cost:</span>
                      <span className="font-bold text-lg text-green-600">GHS {service.base_price}</span>
                    </div>
                  </div>
                )}
              </div>
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.preferred_date || !formData.preferred_time}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Confirm Booking
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

export default EnhancedBookingModal;
