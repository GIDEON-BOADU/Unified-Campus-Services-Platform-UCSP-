import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MapPin, 
  Package, 
  Eye, 
  Search, 
  X, 
  Sparkles,
  Users,
  ArrowRight,
  Grid3X3,
  List,
  Heart,
  Bookmark,
  Zap,
  ChevronDown,
  ChevronRight,
  Filter,
  Layers
} from 'lucide-react';
import { Service } from '../../hooks/useServices';
import { ServiceDetailModal } from './ServiceDetailModal';
import { BookingModal } from './BookingModal';
import { OrderModal } from './OrderModal';
import { SuccessToast } from '../common/SuccessToast';

interface StudentServiceFeedProps {
  services: Service[];
  isLoading: boolean;
}

export const StudentServiceFeed: React.FC<StudentServiceFeedProps> = ({
  services,
  isLoading
}) => {
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle service tile click
  const handleServiceView = (service: Service) => {
    setSelectedService(service);
    setIsDetailModalOpen(true);
  };

  // Handle service click from related services
  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsDetailModalOpen(true);
  };

  // Category clustering functions
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      food: '🍔',
      beauty: '💄',
      printing: '🖨️',
      laundry: '👕',
      academic: '📚',
      transport: '🚗',
      health: '🏥',
      entertainment: '🎮',
      gym: '💪',
      barbering: '💇‍♂️',
      other: '🔧'
    };
    return icons[category] || '🔧';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      food: 'from-orange-500 to-red-500',
      beauty: 'from-pink-500 to-rose-500',
      printing: 'from-blue-500 to-indigo-500',
      laundry: 'from-cyan-500 to-blue-500',
      academic: 'from-green-500 to-emerald-500',
      transport: 'from-yellow-500 to-orange-500',
      health: 'from-red-500 to-pink-500',
      entertainment: 'from-purple-500 to-pink-500',
      gym: 'from-red-500 to-pink-500',
      barbering: 'from-indigo-500 to-purple-500',
      other: 'from-gray-500 to-slate-500'
    };
    return colors[category] || 'from-gray-500 to-slate-500';
  };

  const groupServicesByCategory = (services: Service[]) => {
    const grouped = services.reduce((acc, service) => {
      const category = service.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as Record<string, Service[]>);

    // Sort categories by service count (descending)
    return Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length);
  };

  const toggleCategoryExpansion = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAllCategories = () => {
    const allCategories = new Set(filteredServices.map(s => s.category || 'other'));
    setExpandedCategories(allCategories);
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [sortBy, setSortBy] = useState('service_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // UI states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoriteServices, setFavoriteServices] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [clusteringMode, setClusteringMode] = useState<'clustered' | 'flat'>('clustered');

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

  const toggleFavorite = (serviceId: string) => {
    setFavoriteServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
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
    { value: 'gym', label: 'Gym & Fitness' },
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-ucsp-green-500/10 via-transparent to-blue-500/10"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-ucsp-green-400/20 to-ucsp-green-600/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                UCSP
              </h2>
              <p className="text-sm text-gray-500 font-medium">Campus Hub</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">Loading amazing services...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-ucsp-green-500/10 via-transparent to-blue-500/10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-ucsp-green-400/20 to-ucsp-green-600/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-xl animate-pulse delay-2000"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Discover Campus Services
            <Star className="w-4 h-4 fill-current text-yellow-500" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="block text-transparent bg-gradient-to-r from-ucsp-green-600 via-ucsp-green-500 to-blue-600 bg-clip-text">
              Campus Service
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Explore verified campus services, from food delivery to academic support. 
            Everything you need for campus life, all in one place.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{services.length}</div>
              <div className="text-sm text-gray-600">Available Services</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-ucsp-green-600">{CATEGORIES.length - 1}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Enhanced Search and Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Find Services</h3>
                  <p className="text-sm text-gray-600">Search and filter campus services</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Clustering Mode Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setClusteringMode('clustered')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      clusteringMode === 'clustered' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setClusteringMode('flat')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      clusteringMode === 'flat' 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                
          {(searchTerm || selectedCategory || selectedServiceType || sortBy !== 'service_name') && (
            <button
              onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
              </div>
        </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Enhanced Search */}
          <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
              Search Services
            </label>
            <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or vendor..."
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-300 text-gray-700 placeholder:text-gray-400 font-medium shadow-sm hover:shadow-md"
              />
            </div>
          </div>

              {/* Enhanced Category Filter */}
          <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
            >
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                      {category.value ? `${getCategoryIcon(category.value)} ${category.label}` : category.label}
                </option>
              ))}
            </select>
          </div>

              {/* Enhanced Service Type Filter */}
          <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
              Service Type
            </label>
            <select
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
            >
              {SERVICE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

              {/* Enhanced Sort Options */}
          <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredServices.length} Service{filteredServices.length !== 1 ? 's' : ''} Found
              </h2>
              {(searchTerm || selectedCategory || selectedServiceType) && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Filtered
                </span>
              )}
            </div>
          </div>

          {/* Clustering Controls */}
          {clusteringMode === 'clustered' && filteredServices.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Service Categories</h3>
                    <p className="text-sm text-gray-600">Organized by category for easy browsing</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={expandAllCategories}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAllCategories}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Collapse All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Services Grid/List */}
      {filteredServices.length === 0 ? (
            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {services.length === 0 ? 'No services available' : 'No services match your filters'}
          </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {services.length === 0 
              ? 'Check back later for new services'
              : 'Try adjusting your search criteria or clear all filters'
            }
          </p>
          {services.length > 0 && (
            <button 
              onClick={clearFilters}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : clusteringMode === 'clustered' ? (
        // Clustered View
        <div className="space-y-6">
          {groupServicesByCategory(filteredServices).map(([category, categoryServices]) => {
            const isExpanded = expandedCategories.has(category);
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            
            return (
              <div key={category} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Category Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategoryExpansion(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(category)} rounded-2xl flex items-center justify-center`}>
                        <span className="text-2xl">{getCategoryIcon(category)}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{categoryName}</h3>
                        <p className="text-sm text-gray-600">{categoryServices.length} service{categoryServices.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Click to {isExpanded ? 'collapse' : 'expand'}</div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Category Services */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className={`grid gap-4 sm:gap-6 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-1'
                    }`}>
                      {categoryServices.map(service => (
                        <div
                          key={service.id}
                          className={`bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                            viewMode === 'list' ? 'p-6 flex gap-6' : 'p-6'
                          }`}
                          onClick={() => handleServiceView(service)}
                        >
                          {/* Service Image */}
                          <div className={`relative ${
                            viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : 'w-full h-48'
                          } bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mb-4`}>
                            {service.images ? (
                              <img
                                src={service.images}
                                alt={service.service_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-400" />
                              </div>
                            )}

                            {/* Favorite Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(service.id);
                              }}
                              className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200"
                            >
                              <Heart 
                                className={`w-4 h-4 ${
                                  favoriteServices.has(service.id) 
                                    ? 'text-red-500 fill-current' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            </button>
                            
                            {/* Availability Badge */}
                            <div className="absolute top-3 left-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                service.is_available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {service.is_available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                          </div>

                          {/* Service Info */}
                          <div className={`space-y-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                  {service.service_name}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {service.description}
                                </p>
                              </div>
                            </div>

                            {/* Category and Vendor */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getCategoryIcon(service.category)}</span>
                                <span className="font-medium capitalize">{service.category}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{service.location || 'Location not specified'}</span>
                              </div>
                            </div>

                            {/* Price and Rating */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  {service.base_price ? `GHS ${service.base_price}` : 'Contact for price'}
                                </span>
                                {service.base_price && (
                                  <span className="text-sm text-gray-500">starting from</span>
                                )}
                              </div>
                              
                              {service.rating && (
                                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm font-semibold text-gray-900">{service.rating}</span>
                                  <span className="text-xs text-gray-500">({service.total_ratings})</span>
                                </div>
                              )}
                            </div>

                            {/* Service Capabilities */}
                            <div className="flex flex-wrap gap-2">
                              {service.can_book && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                  <Bookmark className="w-3 h-3 mr-1" />
                                  Booking
                                </span>
                              )}
                              {service.can_order && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  <Package className="w-3 h-3 mr-1" />
                                  Ordering
                                </span>
                              )}
                              {service.can_walk_in && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                  <Users className="w-3 h-3 mr-1" />
                                  Walk-in
                                </span>
                              )}
                              {service.requires_contact && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Contact
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 space-y-3">
                              {/* Primary Action Button */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedService(service);
                                  setIsDetailModalOpen(true);
                                }}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                              </button>

                              {/* Quick Action Buttons */}
                              <div className="grid grid-cols-2 gap-2">
                                {/* Book Service */}
                                {service.can_book && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedService(service);
                                      setIsBookingModalOpen(true);
                                    }}
                                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2"
                                  >
                                    <Bookmark className="w-4 h-4" />
                                    Book
                                  </button>
                                )}

                                {/* Order Service */}
                                {service.can_order && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedService(service);
                                      setIsOrderModalOpen(true);
                                    }}
                                    className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-medium hover:bg-green-100 transition-colors duration-200 flex items-center justify-center gap-2"
                                  >
                                    <Package className="w-4 h-4" />
                                    Order
                                  </button>
                                )}

                                {/* Contact Vendor */}
                                {service.requires_contact && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (service.vendor_phone) {
                                        const phoneNumber = service.vendor_phone.replace(/\D/g, '');
                                        const message = `Hi! I'm interested in your ${service.service_name} service.`;
                                        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                                      } else {
                                        alert('Contact information not available for this vendor.');
                                      }
                                    }}
                                    className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl font-medium hover:bg-orange-100 transition-colors duration-200 flex items-center justify-center gap-2"
                                  >
                                    <Zap className="w-4 h-4" />
                                    Contact
                                  </button>
                                )}

                                {/* Walk-in Service */}
                                {service.can_walk_in && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      alert(`You can visit ${service.vendor_name} directly for this service. Location: ${service.location || 'Contact vendor for location'}`);
                                    }}
                                    className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl font-medium hover:bg-purple-100 transition-colors duration-200 flex items-center justify-center gap-2"
                                  >
                                    <Users className="w-4 h-4" />
                                    Visit
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Flat View (Original)
        <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredServices.map(service => (
            <div
              key={service.id}
              className={`bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                viewMode === 'list' ? 'p-6 flex gap-6' : 'p-6'
              }`}
              onClick={() => handleServiceView(service)}
            >
              {/* Service Image */}
              <div className={`relative ${
                viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : 'w-full h-48'
              } bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mb-4`}>
                {service.images ? (
                  <img
                    src={service.images}
                    alt={service.service_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(service.id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200"
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      favoriteServices.has(service.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-400'
                    }`} 
                  />
                </button>
                
                {/* Availability Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    service.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {service.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Service Info */}
              <div className={`space-y-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {service.service_name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Category and Vendor */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(service.category)}</span>
                    <span className="font-medium capitalize">{service.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{service.location || 'Location not specified'}</span>
                  </div>
                </div>

                {/* Price and Rating */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {service.base_price ? `GHS ${service.base_price}` : 'Contact for price'}
                    </span>
                    {service.base_price && (
                      <span className="text-sm text-gray-500">starting from</span>
                    )}
                  </div>
                  
                  {service.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold text-gray-900">{service.rating}</span>
                      <span className="text-xs text-gray-500">({service.total_ratings})</span>
                    </div>
                  )}
                </div>

                {/* Service Capabilities */}
                <div className="flex flex-wrap gap-2">
                  {service.can_book && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      <Bookmark className="w-3 h-3 mr-1" />
                      Booking
                    </span>
                  )}
                  {service.can_order && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <Package className="w-3 h-3 mr-1" />
                      Ordering
                    </span>
                  )}
                  {service.can_walk_in && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                      <Users className="w-3 h-3 mr-1" />
                      Walk-in
                    </span>
                  )}
                  {service.requires_contact && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                      <Zap className="w-3 h-3 mr-1" />
                      Contact
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  {/* Primary Action Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedService(service);
                      setIsDetailModalOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Book Service */}
                    {service.can_book && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(service);
                          setIsBookingModalOpen(true);
                        }}
                        className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Bookmark className="w-4 h-4" />
                        Book
                      </button>
                    )}

                    {/* Order Service */}
                    {service.can_order && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(service);
                          setIsOrderModalOpen(true);
                        }}
                        className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-medium hover:bg-green-100 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        Order
                      </button>
                    )}

                    {/* Contact Vendor */}
                    {service.requires_contact && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (service.vendor_phone) {
                            const phoneNumber = service.vendor_phone.replace(/\D/g, '');
                            const message = `Hi! I'm interested in your ${service.service_name} service.`;
                            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                          } else {
                            alert('Contact information not available for this vendor.');
                          }
                        }}
                        className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl font-medium hover:bg-orange-100 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Contact
                      </button>
                    )}

                    {/* Walk-in Service */}
                    {service.can_walk_in && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`You can visit ${service.vendor_name} directly for this service. Location: ${service.location || 'Contact vendor for location'}`);
                        }}
                        className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl font-medium hover:bg-purple-100 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Visit
                      </button>
                    )}
                  </div>
                </div>
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
            onBookService={(service) => {
              setSelectedService(service);
              setIsDetailModalOpen(false);
              setIsBookingModalOpen(true);
            }}
            onOrderService={(service) => {
              setSelectedService(service);
              setIsDetailModalOpen(false);
              setIsOrderModalOpen(true);
            }}
            onContactVendor={(service) => {
              // Open WhatsApp or phone contact
              if (service.vendor_phone) {
                const phoneNumber = service.vendor_phone.replace(/\D/g, '');
                const message = `Hi! I'm interested in your ${service.service_name} service.`;
                window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
              } else {
                alert('Contact information not available for this vendor.');
              }
            }}
            onServiceClick={handleServiceClick}
          />

          {/* Booking Modal */}
          <BookingModal
            service={selectedService!}
            isOpen={isBookingModalOpen}
            onClose={() => {
              setIsBookingModalOpen(false);
              setSelectedService(null);
            }}
            onSuccess={(booking) => {
              console.log('Booking created successfully:', booking);
              setSuccessMessage('Booking created successfully! You will receive a confirmation soon.');
            }}
          />

          {/* Order Modal */}
          <OrderModal
            service={selectedService!}
            isOpen={isOrderModalOpen}
            onClose={() => {
              setIsOrderModalOpen(false);
              setSelectedService(null);
            }}
            onSuccess={(order) => {
              console.log('Order created successfully:', order);
              setSuccessMessage('Order placed successfully! The vendor will contact you soon.');
            }}
          />

          {/* Success Toast */}
          <SuccessToast
            message={successMessage || ''}
            isVisible={!!successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        </div>
      </div>

    </div>
  );
};
