import React, { useState, useEffect } from 'react';
import { Star, MapPin, Package, Eye, Filter, Search, X } from 'lucide-react';
import { Service } from '../../hooks/useServices';
import { ServiceDetailModal } from '../dashboard/ServiceDetailModal';

interface StudentServiceFeedProps {
  services: Service[];
  isLoading: boolean;
  onRate: (serviceId: string, rating: number, comment: string) => Promise<void>;
}

export const StudentServiceFeed: React.FC<StudentServiceFeedProps> = ({
  services,
  isLoading,
  onRate
}) => {
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [sortBy, setSortBy] = useState('service_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...services];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    // Apply service type filter
    if (selectedServiceType) {
      filtered = filtered.filter(service => service.service_type === selectedServiceType);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Service];
      let bValue: any = b[sortBy as keyof Service];
      
      // Handle string values
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Handle null values
      if (aValue === null) aValue = '';
      if (bValue === null) bValue = '';
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory, selectedServiceType, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedServiceType('');
    setSortBy('service_name');
    setSortOrder('desc');
  };

  const handleServiceView = (service: Service) => {
    setSelectedService(service);
    setIsDetailModalOpen(true);
  };

  const handleServiceRate = async (serviceId: string, rating: number, comment: string) => {
    try {
      await onRate(serviceId, rating, comment);
      // Close modal after successful rating
      setIsDetailModalOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Failed to rate service:', error);
    }
  };

  const CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'beauty', label: 'Beauty & Grooming' },
    { value: 'printing', label: 'Printing & Copying' },
    { value: 'laundry', label: 'Laundry Services' },
    { value: 'academic', label: 'Academic Services' },
    { value: 'transport', label: 'Transportation' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other Services' }
  ];

  const SERVICE_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'booking', label: 'Booking Required' },
    { value: 'ordering', label: 'Ordering System' },
    { value: 'contact', label: 'Contact Directly' },
    { value: 'walk_in', label: 'Walk-in Service' }
  ];

  const SORT_OPTIONS = [
    { value: 'service_name', label: 'Service Name' },
    { value: 'base_price', label: 'Price' },
    { value: 'rating', label: 'Rating' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading services...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Find Services
          </h3>
          {(searchTerm || selectedCategory || selectedServiceType || sortBy !== 'service_name') && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Services
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or vendor..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              {SERVICE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {services.length === 0 ? 'No services available' : 'No services match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {services.length === 0 
              ? 'Check back later for new services'
              : 'Try adjusting your search criteria or clear all filters'
            }
          </p>
          {services.length > 0 && (
            <button 
              onClick={clearFilters}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div
              key={service.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => handleServiceView(service)}
            >
              {/* Service Image */}
              {service.images ? (
                <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden mb-4">
                  <img
                    src={service.images}
                    alt={service.service_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Service Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {service.service_name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {service.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Package className="w-4 h-4" />
                  <span>{service.category}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{service.vendor_name}</span>
                </div>

                {/* Price and Rating */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xl font-bold text-gray-900">
                    {service.base_price ? `GHS ${service.base_price}` : 'Contact for price'}
                  </span>
                  
                  {service.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{service.rating}</span>
                      <span className="text-xs text-gray-500">({service.total_ratings})</span>
                    </div>
                  )}
                </div>

                {/* Service Capabilities */}
                <div className="flex flex-wrap gap-1">
                  {service.can_book && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Booking
                    </span>
                  )}
                  {service.can_order && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ordering
                    </span>
                  )}
                  {service.can_walk_in && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Walk-in
                    </span>
                  )}
                  {service.requires_contact && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Contact
                    </span>
                  )}
                </div>

                {/* View Details Button */}
                <button className="w-full mt-4 bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedService(null);
        }}
        onRate={handleServiceRate}
        isStudent={true}
      />
    </div>
  );
};
