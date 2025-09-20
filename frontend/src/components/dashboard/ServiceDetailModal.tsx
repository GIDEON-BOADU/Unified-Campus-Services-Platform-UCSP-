import React, { useState } from 'react';
import { X, Star, MapPin, Phone, MessageCircle, Clock, Package } from 'lucide-react';
import { Service } from '../../hooks/useServices';

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onRate?: (serviceId: string, rating: number, comment: string) => Promise<void>;
  isStudent?: boolean;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  isOpen,
  onClose,
  onRate,
  isStudent = false
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !service) return null;

  const handleRate = async () => {
    if (!onRate || rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onRate(service.id, rating, comment);
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (value: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            className={`w-5 h-5 ${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
            }`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= value
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{service.service_name}</h2>
              <p className="text-gray-600">Service Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Service Image */}
          {service.images ? (
            <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src={service.images}
                alt={service.service_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('ServiceDetailModal: Image failed to load:', service.images);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
                onLoad={() => {
                  console.log('ServiceDetailModal: Image loaded successfully:', service.images);
                }}
              />
              <div className="hidden w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-gray-900">{service.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Type</label>
                  <p className="text-gray-900">{service.service_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{service.description}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing & Availability</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Base Price</label>
                  <p className="text-2xl font-bold text-gray-900">
                    {service.base_price ? `GHS ${service.base_price}` : 'Contact for price'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {service.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Availability</label>
                  <p className="text-gray-900">{service.availability_status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Capabilities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Capabilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {service.can_book && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-800">Booking</span>
                </div>
              )}
              {service.can_order && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-800">Ordering</span>
                </div>
              )}
              {service.can_walk_in && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-purple-800">Walk-in</span>
                </div>
              )}
              {service.requires_contact && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-orange-800">Contact</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.contact_info && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </h3>
                <p className="text-gray-900">{service.contact_info}</p>
              </div>
            )}
            
            {service.location && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h3>
                <p className="text-gray-900">{service.location}</p>
              </div>
            )}
          </div>

          {/* Rating Section */}
          {service.rating && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Ratings</h3>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{service.rating}</div>
                  {renderStars(service.rating)}
                  <div className="text-sm text-gray-500 mt-1">
                    {service.total_ratings} {service.total_ratings === 1 ? 'rating' : 'ratings'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student Rating Form */}
          {isStudent && onRate && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate This Service</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                  {renderStars(rating, true)}
                  <p className="text-sm text-gray-500 mt-1">
                    {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Share your experience with this service..."
                  />
                </div>

                <button
                  onClick={handleRate}
                  disabled={rating === 0 || isSubmitting}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      Submit Rating
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            
            {/* Add action buttons based on service type - only for students */}
            {isStudent && service.can_book && (
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Book Now
              </button>
            )}
            
            {isStudent && service.can_order && (
              <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                Order Now
              </button>
            )}
            
            {isStudent && service.requires_contact && (
              <button className="px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors">
                Contact Vendor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
