import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Clock, Phone, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiClient, API_ENDPOINTS } from '../services/api';

interface Service {
  id: string;
  service_name: string;
  description: string;
  category: string;
  service_type: string;
  base_price: number;
  location: string;
  vendor_name: string;
  rating: number;
  total_ratings: number;
  is_available: boolean;
  availability_status: string;
  contact_info: string;
  images: string;
}

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'type'>('none');
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(API_ENDPOINTS.SERVICES.LIST);
      setServices(response.results || response);
    } catch (error) {
      console.error('Failed to load services:', error);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesType = selectedType === 'all' || service.service_type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'beauty', label: 'Beauty & Grooming' },
    { value: 'printing', label: 'Printing & Copying' },
    { value: 'laundry', label: 'Laundry Services' },
    { value: 'academic', label: 'Academic Services' },
    { value: 'transport', label: 'Transportation' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other Services' },
  ];

  const serviceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'booking', label: 'Booking Required' },
    { value: 'ordering', label: 'Ordering System' },
    { value: 'contact', label: 'Contact Directly' },
    { value: 'walk_in', label: 'Walk-in Service' },
  ];

  // ServiceCard Component
  interface ServiceCardProps {
    service: Service;
    onRate: (serviceId: string, rating: number, comment: string) => void;
    userRating?: number;
  }

  const ServiceCard: React.FC<ServiceCardProps> = ({ service, onRate, userRating }) => {
    const [expanded, setExpanded] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(userRating || 0);
    const [comment, setComment] = useState('');

    const handleRatingSubmit = () => {
      if (rating > 0) {
        onRate(service.id, rating, comment);
        setShowRatingModal(false);
      }
    };

    const renderStars = (rating: number, interactive = false) => {
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={interactive ? () => setRating(star) : undefined}
              className={`w-4 h-4 ${
                interactive 
                  ? 'cursor-pointer hover:scale-110 transition-transform' 
                  : 'cursor-default'
              }`}
            >
              <Star 
                className={`w-4 h-4 ${
                  star <= rating 
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
      <>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
          {/* Service Image */}
          {service.images && (
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <img
                src={service.images}
                alt={service.service_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                {getStatusBadge(service.availability_status)}
              </div>
            </div>
          )}
          
          {/* Service Content */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                  {service.service_name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  by <span className="font-medium text-gray-700">{service.vendor_name}</span>
                </p>
              </div>
              <div className="text-right ml-3">
                <div className="text-xl font-bold text-blue-600">
                  {formatPrice(service.base_price)}
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {service.rating ? (
                  <>
                    {renderStars(service.rating)}
                    <span className="text-sm text-gray-600">
                      ({service.total_ratings || 0})
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">No ratings yet</span>
                )}
              </div>
              {userRating && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  You rated: {userRating}★
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {service.description}
            </p>

            {/* Service Type & Category */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {service.service_type.replace('_', ' ').toUpperCase()}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {service.category.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Expandable Details */}
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>View Details</span>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {expanded && (
                <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                  {/* Location */}
                  {service.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{service.location}</span>
                    </div>
                  )}
                  
                  {/* Contact Info */}
                  {service.contact_info && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MessageCircle className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{service.contact_info}</span>
                    </div>
                  )}
                  
                  {/* Rating Button */}
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    {userRating ? 'Update Rating' : 'Rate This Service'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Rate {service.service_name}</h3>
              
              {/* Star Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex justify-center">
                  {renderStars(rating, true)}
                </div>
              </div>
              
              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Share your experience..."
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRatingSubmit}
                  disabled={rating === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Available</span>;
      case 'busy':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Busy</span>;
      case 'unavailable':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Unavailable</span>;
      default:
        return null;
    }
  };

  const formatPrice = (price: any) => {
    if (price === null || price === undefined || price === '') {
      return 'Contact for pricing';
    }
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) {
      return 'Contact for pricing';
    }
    return `₵${numPrice.toFixed(2)}`;
  };

  // Group services by category
  const groupServicesByCategory = (services: Service[]) => {
    const grouped: Record<string, Service[]> = {};
    services.forEach(service => {
      const category = service.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });
    return grouped;
  };

  // Group services by type
  const groupServicesByType = (services: Service[]) => {
    const grouped: Record<string, Service[]> = {};
    services.forEach(service => {
      const type = service.service_type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(service);
    });
    return grouped;
  };

  // Handle rating submission
  const handleRateService = async (serviceId: string, rating: number, comment: string) => {
    try {
      const response = await apiClient.post(`/services/${serviceId}/add_review/`, {
        rating,
        comment
      });

      if (response) {
        // Update local state
        setUserRatings(prev => ({ ...prev, [serviceId]: rating }));
        // Refresh services to get updated ratings
        await loadServices();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Campus Services</h1>
          <p className="text-xl opacity-90">Discover all available services from trusted campus vendors</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search for services, vendors, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 focus:bg-white transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 focus:bg-white transition-all duration-200"
              >
                {serviceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid with Grouping */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredServices.length} services found
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setGroupBy('none')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  groupBy === 'none' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Services
              </button>
              <button
                onClick={() => setGroupBy('category')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  groupBy === 'category' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Group by Category
              </button>
              <button
                onClick={() => setGroupBy('type')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  groupBy === 'type' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Group by Type
              </button>
            </div>
          </div>

          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={loadServices}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No services found matching your criteria.</p>
            </div>
          ) : (
            <div>
              {groupBy === 'none' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredServices.map((service) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      onRate={handleRateService}
                      userRating={userRatings[service.id]}
                    />
                  ))}
                </div>
              ) : groupBy === 'category' ? (
                <div className="space-y-8">
                  {Object.entries(groupServicesByCategory(filteredServices)).map(([category, services]) => (
                    <div key={category} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">
                        {category.replace('_', ' ')} Services
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {services.map((service) => (
                          <ServiceCard 
                            key={service.id} 
                            service={service} 
                            onRate={handleRateService}
                            userRating={userRatings[service.id]}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupServicesByType(filteredServices)).map(([type, services]) => (
                    <div key={type} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">
                        {type.replace('_', ' ')} Services
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {services.map((service) => (
                          <ServiceCard 
                            key={service.id} 
                            service={service} 
                            onRate={handleRateService}
                            userRating={userRatings[service.id]}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}; 