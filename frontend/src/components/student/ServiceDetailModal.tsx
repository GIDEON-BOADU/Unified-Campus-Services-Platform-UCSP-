import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  ShoppingCart, 
  MessageCircle, 
  User, 
  Shield, 
  Heart, 
  Package,
  Building2,
  Sparkles,
  Printer,
  CreditCard,
  CheckCircle,
  List,
  Share2,
  Flag
} from 'lucide-react';
import { Service } from '../../hooks/useServices';
import { apiClient } from '../../services/api';
import PrintingServiceModal from './PrintingServiceModal';
import MobileMoneyPaymentModal from './MobileMoneyPaymentModal';
import EnhancedBookingModal from './EnhancedBookingModal';
import { ServiceReviews } from './ServiceReviews';

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onBookService?: (service: Service) => void;
  onOrderService?: (service: Service) => void;
  onContactVendor?: (service: Service) => void;
  onServiceClick?: (service: Service) => void;
}

interface VendorInfo {
  id: number;
  username: string;
  business_name: string;
  description: string;
  business_hours: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  is_verified: boolean;
  // Mobile Money fields
  mtn_momo_number?: string;
  vodafone_cash_number?: string;
  airtel_money_number?: string;
  telecel_cash_number?: string;
  preferred_payment_method?: string;
}

interface VendorService {
  id: number;
  service_name: string;
  description: string;
  category: string;
  base_price: number;
  is_available: boolean;
  images: string;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  isOpen,
  onClose,
  onOrderService,
  onServiceClick
}) => {
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [vendorServices, setVendorServices] = useState<VendorService[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [isPrintingModalOpen, setIsPrintingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEnhancedBookingOpen, setIsEnhancedBookingOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (service && isOpen) {
      fetchVendorDetails();
      fetchRelatedServices();
    }
  }, [service, isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchVendorDetails = async () => {
    if (!service) return;
    
    try {
      // Fetch vendor services and info
      const response = await apiClient.get(`/services/vendor_services/?vendor_id=${service.vendor}`);
      setVendorInfo(response.vendor);
      setVendorServices(response.services.filter((s: VendorService) => s.id !== parseInt(service.id)));
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      // Set fallback vendor info with sample mobile money numbers for testing
      setVendorInfo({
        id: parseInt(service.vendor),
        username: service.vendor_name || 'Unknown Vendor',
        business_name: service.vendor_name || 'Unknown Business',
        description: '',
        business_hours: '',
        address: service.location || '',
        phone: '',
        email: '',
        website: '',
        is_verified: false,
        // Add sample mobile money numbers for testing
        mtn_momo_number: '0241234567',
        vodafone_cash_number: '0201234567',
        airtel_money_number: '0261234567',
        telecel_cash_number: '0271234567',
        preferred_payment_method: 'mtn_momo',
      });
      setVendorServices([]);
    }
  };

  const fetchRelatedServices = async () => {
    if (!service) return;
    
    setLoadingRelated(true);
    try {
      // Fetch services from the same category
      const response = await apiClient.get(`/services/?category=${service.category}&limit=6`);
      // Filter out the current service and limit to 5 related services
      const filtered = response.results?.filter((s: Service) => s.id !== service.id) || [];
      setRelatedServices(filtered.slice(0, 5));
    } catch (error) {
      console.error('Error fetching related services:', error);
      setRelatedServices([]);
    } finally {
      setLoadingRelated(false);
    }
  };

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
      other: '🔧'
    };
    return icons[category] || '🔧';
  };

  const getServiceTypeColor = (serviceType: string) => {
    const colors: { [key: string]: string } = {
      booking: 'bg-blue-100 text-blue-800',
      ordering: 'bg-green-100 text-green-800',
      contact: 'bg-purple-100 text-purple-800',
      walk_in: 'bg-orange-100 text-orange-800'
    };
    return colors[serviceType] || 'bg-gray-100 text-gray-800';
  };

  const handleWhatsAppContact = () => {
    if (vendorInfo?.phone) {
      let message = `Hi! I'm interested in your ${service?.service_name} service. Can you provide more details?`;
      
      // Customize message based on service type
      if (service?.can_book) {
        message = `Hi! I'd like to book your ${service?.service_name} service. What are your available times and pricing?`;
      } else if (service?.can_order) {
        message = `Hi! I'd like to order your ${service?.service_name} service. What are the details and pricing?`;
      } else if (service?.can_walk_in) {
        message = `Hi! I'd like to visit for your ${service?.service_name} service. What are your hours and location?`;
      } else if (service?.requires_contact) {
        message = `Hi! I'm interested in your ${service?.service_name} service. Can you provide more details?`;
      }
      
      // Clean phone number and ensure it starts with country code
      let phoneNumber = vendorInfo.phone.replace(/\D/g, '');
      
      // Add Ghana country code if not present ( Ghana +233)
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '233' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('233')) {
        phoneNumber = '233' + phoneNumber;
      }
      
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Failed to open WhatsApp:', error);
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(whatsappUrl).then(() => {
          alert('WhatsApp link copied to clipboard!');
        });
      }
    }
  };

  const handleCall = () => {
    if (vendorInfo?.phone) {
      window.open(`tel:${vendorInfo.phone}`, '_self');
    }
  };

  const handleEmail = () => {
    if (vendorInfo?.email) {
      const subject = `Inquiry about ${service?.service_name}`;
      const body = `Hi,\n\nI'm interested in your ${service?.service_name} service. Could you please provide more information?\n\nThank you!`;
      window.open(`mailto:${vendorInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
    }
  };

  const handleRelatedServiceClick = (relatedService: Service) => {
    onClose();
    onServiceClick?.(relatedService);
  };

  if (!isOpen || !service) return null;

  // Debug: Log service data to see what capabilities are available
  console.log('Service Detail Modal - Service Data:', {
    service_name: service.service_name,
    category: service.category,
    service_type: service.service_type,
    can_book: service.can_book,
    can_order: service.can_order,
    can_walk_in: service.can_walk_in,
    requires_contact: service.requires_contact,
    base_price: service.base_price
  });

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ucsp-green-500 to-ucsp-green-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Service Details</h2>
                <p className="text-sm text-gray-500">Complete information and actions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            <div className="p-6 space-y-8">
              {/* Service Header */}
              <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 rounded-3xl p-8 border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Service Image */}
                  <div className="lg:w-1/3">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
                      {service.images ? (
                        <img
                          src={service.images}
                          alt={service.service_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="lg:w-2/3 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getCategoryIcon(service.category)}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getServiceTypeColor(service.service_type)}`}>
                            {service.service_type.replace('_', ' ').toUpperCase()}
                          </span>
                          {service.is_available ? (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.service_name}</h1>
                        <p className="text-lg text-gray-600 mb-4">{service.description}</p>
                      </div>
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`p-3 rounded-xl transition-colors ${
                          isFavorite 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Service Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Category */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getCategoryIcon(service.category)}</span>
                          <span className="font-medium text-gray-900">Category</span>
                        </div>
                        <p className="text-sm text-gray-600 capitalize">{service.category}</p>
                      </div>

                      {/* Service Type */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">Type</span>
                        </div>
                        <p className="text-sm text-gray-600 capitalize">{service.service_type.replace('_', ' ')}</p>
                      </div>

                      {/* Rating */}
                      {service.rating && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium text-gray-900">Rating</span>
                          </div>
                          <p className="text-sm text-gray-600">{service.rating}/5 ({service.total_ratings} reviews)</p>
                        </div>
                      )}
                    </div>

                    {/* Order Calculator for Orderable Services */}
                    {service.can_order && service.base_price && (
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Order Calculator
                        </h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-lg font-medium">-</span>
                            </button>
                            <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">{orderQuantity}</span>
                            <button
                              onClick={() => setOrderQuantity(orderQuantity + 1)}
                              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-lg font-medium">+</span>
                            </button>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="text-lg font-semibold text-gray-900">
                              GHS {(service.base_price * orderQuantity).toFixed(2)} total
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price Display */}
                    <div className="flex items-center gap-6">
                      {service.base_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-ucsp-green-600">GHS {service.base_price}</span>
                          <span className="text-sm text-gray-500">per unit</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-semibold text-gray-600">Contact for pricing</span>
                        </div>
                      )}
                    </div>

                    {/* Service Capabilities */}
                    <div className="flex flex-wrap gap-2">
                      {service.can_book && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                          <Calendar className="w-4 h-4" />
                          Bookable
                        </div>
                      )}
                      {service.can_order && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                          <ShoppingCart className="w-4 h-4" />
                          Orderable
                        </div>
                      )}
                      {service.requires_contact && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium">
                          <MessageCircle className="w-4 h-4" />
                          Contact Required
                        </div>
                      )}
                      {service.can_walk_in && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium">
                          <User className="w-4 h-4" />
                          Walk-in Available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              {vendorInfo && (
                <div className="bg-white rounded-3xl border border-gray-200 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {vendorInfo.business_name}
                        {vendorInfo.is_verified && (
                          <Shield className="w-6 h-6 text-green-500" />
                        )}
                      </h3>
                      <p className="text-gray-600">by {vendorInfo.username}</p>
                    </div>
                  </div>

                  {vendorInfo.description && (
                    <p className="text-gray-700 mb-6 leading-relaxed">{vendorInfo.description}</p>
                  )}

                  {/* Vendor Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vendorInfo.business_hours && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Business Hours</p>
                          <p className="text-gray-600">{vendorInfo.business_hours}</p>
                        </div>
                      </div>
                    )}
                    
                    {vendorInfo.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-gray-600">{vendorInfo.address}</p>
                        </div>
                      </div>
                    )}
                    
                    {vendorInfo.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-gray-600">{vendorInfo.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {vendorInfo.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-gray-600">{vendorInfo.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {vendorInfo.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Website</p>
                          <a 
                            href={vendorInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {vendorInfo.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Money Information */}
                  {(vendorInfo.mtn_momo_number || vendorInfo.vodafone_cash_number || 
                    vendorInfo.airtel_money_number || vendorInfo.telecel_cash_number) && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">₵</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Payment Methods</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendorInfo.mtn_momo_number && (
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-xs">MTN</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">MTN Mobile Money</p>
                              <p className="text-gray-600 text-sm">{vendorInfo.mtn_momo_number}</p>
                            </div>
                          </div>
                        )}
                        
                        {vendorInfo.vodafone_cash_number && (
                          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-xs">VF</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Vodafone Cash</p>
                              <p className="text-gray-600 text-sm">{vendorInfo.vodafone_cash_number}</p>
                            </div>
                          </div>
                        )}
                        
                        {vendorInfo.airtel_money_number && (
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-xs">AT</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Airtel Money</p>
                              <p className="text-gray-600 text-sm">{vendorInfo.airtel_money_number}</p>
                            </div>
                          </div>
                        )}
                        
                        {vendorInfo.telecel_cash_number && (
                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-xs">TC</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">Telecel Cash</p>
                              <p className="text-gray-600 text-sm">{vendorInfo.telecel_cash_number}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {vendorInfo.preferred_payment_method && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Preferred Payment:</span> {
                              vendorInfo.preferred_payment_method === 'mtn_momo' ? 'MTN Mobile Money' :
                              vendorInfo.preferred_payment_method === 'vodafone_cash' ? 'Vodafone Cash' :
                              vendorInfo.preferred_payment_method === 'airtel_money' ? 'Airtel Money' :
                              vendorInfo.preferred_payment_method === 'telecel_cash' ? 'Telecel Cash' :
                              vendorInfo.preferred_payment_method === 'bank_transfer' ? 'Bank Transfer' :
                              vendorInfo.preferred_payment_method === 'cash' ? 'Cash Payment' :
                              vendorInfo.preferred_payment_method
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Other Services from Same Vendor */}
              {vendorServices.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-ucsp-green-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Other Services</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendorServices.slice(0, 6).map((vendorService) => (
                      <div key={vendorService.id} className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getCategoryIcon(vendorService.category)}</span>
                          <span className="font-medium text-gray-900 truncate">{vendorService.service_name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{vendorService.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ucsp-green-600">GHS {vendorService.base_price}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vendorService.is_available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {vendorService.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Services */}
              {(relatedServices.length > 0 || loadingRelated) && (
                <div className="bg-white rounded-3xl border border-gray-200 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Services</h3>
                  
                  {loadingRelated ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading related services...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {relatedServices.map((relatedService) => (
                        <div
                          key={relatedService.id}
                          onClick={() => handleRelatedServiceClick(relatedService)}
                          className="group cursor-pointer bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-lg">{getCategoryIcon(relatedService.category)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {relatedService.service_name}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {relatedService.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500">
                                    {relatedService.vendor_name}
                                  </span>
                                  {(relatedService as any).is_verified && (
                                    <Shield className="w-3 h-3 text-green-500" />
                                  )}
                                </div>
                                {relatedService.base_price && (
                                  <span className="text-sm font-bold text-green-600">
                                    GHS {relatedService.base_price}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(relatedService.service_type)}`}>
                                  {relatedService.service_type.replace('_', ' ')}
                                </span>
                                {relatedService.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="text-xs text-gray-600">{relatedService.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Booking Status & Availability */}
              {service.can_book && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Available for Booking</h4>
                        <p className="text-sm text-gray-600">
                          {service.availability_status === 'available' 
                            ? 'Ready to accept bookings' 
                            : service.availability_status === 'busy'
                            ? 'Limited availability - book soon!'
                            : 'Check availability with vendor'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {service.base_price ? `From GHS ${service.base_price}` : 'Contact for pricing'}
                      </div>
                      <div className="text-xs text-gray-500">per session</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Action Buttons */}
              <div className="bg-white rounded-3xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Take Action</h3>
                
                <div className="space-y-6">
                  {/* Debug Info */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h4>
                    <div className="text-xs text-yellow-700">
                      <p>Service Type: {service.service_type}</p>
                      <p>Can Book: {service.can_book ? 'Yes' : 'No'}</p>
                      <p>Can Order: {service.can_order ? 'Yes' : 'No'}</p>
                      <p>Can Walk-in: {service.can_walk_in ? 'Yes' : 'No'}</p>
                      <p>Requires Contact: {service.requires_contact ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {/* Primary Actions - Based on Service Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* 1. BOOKING SERVICES */}
                    {service.can_book && (
                      <>
                        <button
                          onClick={() => setIsEnhancedBookingOpen(true)}
                          className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                        >
                          <div className="text-center">
                            <Calendar className="w-8 h-8 mx-auto mb-2" />
                            <div className="font-medium">Book Now</div>
                            <div className="text-sm opacity-90">Schedule Appointment</div>
                          </div>
                        </button>

                        <button
                          onClick={() => setIsEnhancedBookingOpen(true)}
                          className="group bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <div className="text-center">
                            <Clock className="w-6 h-6 mx-auto mb-1" />
                            <div className="font-medium text-sm">View Slots</div>
                          </div>
                        </button>
                      </>
                    )}

                    {/* 2. ORDERING SERVICES */}
                    {service.can_order && (
                      <>
                        {service.base_price ? (
                          <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                          >
                            <div className="text-center">
                              <CreditCard className="w-8 h-8 mx-auto mb-2" />
                              <div className="font-medium">Order Now</div>
                              <div className="text-sm opacity-90">GHS {(service.base_price * orderQuantity).toFixed(2)}</div>
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() => onOrderService?.(service)}
                            className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                          >
                            <div className="text-center">
                              <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                              <div className="font-medium">Add to Cart</div>
                              <div className="text-sm opacity-90">Contact for pricing</div>
                            </div>
                          </button>
                        )}

                        <button
                          onClick={handleWhatsAppContact}
                          className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <div className="text-center">
                            <List className="w-6 h-6 mx-auto mb-1" />
                            <div className="font-medium text-sm">View Menu</div>
                          </div>
                        </button>
                      </>
                    )}

                    {/* 3. WALK-IN SERVICES */}
                    {service.can_walk_in && (
                      <>
                        <button
                          onClick={handleWhatsAppContact}
                          className="group bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                        >
                          <div className="text-center">
                            <MapPin className="w-8 h-8 mx-auto mb-2" />
                            <div className="font-medium">Get Directions</div>
                            <div className="text-sm opacity-90">View location</div>
                          </div>
                        </button>

                        <button
                          onClick={handleWhatsAppContact}
                          className="group bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <div className="text-center">
                            <Clock className="w-6 h-6 mx-auto mb-1" />
                            <div className="font-medium text-sm">View Hours</div>
                          </div>
                        </button>
                      </>
                    )}

                    {/* 4. CONTACT SERVICES */}
                    {service.requires_contact && (
                      <>
                        {service.category === 'printing' ? (
                          <button
                            onClick={() => setIsPrintingModalOpen(true)}
                            className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                          >
                            <div className="text-center">
                              <Printer className="w-8 h-8 mx-auto mb-2" />
                              <div className="font-medium">Request Print</div>
                              <div className="text-sm opacity-90">Upload document</div>
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={handleWhatsAppContact}
                            className="group bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                          >
                            <div className="text-center">
                              <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                              <div className="font-medium">Send Inquiry</div>
                              <div className="text-sm opacity-90">Get more info</div>
                            </div>
                          </button>
                        )}

                        <button
                          onClick={handleWhatsAppContact}
                          className="group bg-gradient-to-br from-violet-500 to-violet-600 text-white p-4 rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <div className="text-center">
                            <Phone className="w-6 h-6 mx-auto mb-1" />
                            <div className="font-medium text-sm">Request Callback</div>
                          </div>
                        </button>
                      </>
                    )}

                    {/* Fallback: Show message if no service-specific actions */}
                    {!service.can_book && !service.can_order && !service.can_walk_in && !service.requires_contact && (
                      <div className="col-span-full bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                        <div className="text-gray-600 mb-2">
                          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <h4 className="font-medium text-gray-900">No Specific Actions Available</h4>
                          <p className="text-sm">This service doesn't have specific action capabilities configured.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Communication Actions */}
                  {vendorInfo?.phone && (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Provider</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button
                          onClick={handleWhatsAppContact}
                          className="group bg-gradient-to-br from-green-400 to-green-500 text-white p-4 rounded-xl hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <div className="text-center">
                            <MessageCircle className="w-6 h-6 mx-auto mb-2" />
                            <div className="font-medium">WhatsApp</div>
                            <div className="text-sm opacity-90">Quick message</div>
                          </div>
                        </button>

                        <button
                          onClick={handleCall}
                          className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <div className="text-center">
                            <Phone className="w-6 h-6 mx-auto mb-2" />
                            <div className="font-medium">Call</div>
                            <div className="text-sm opacity-90">Direct call</div>
                          </div>
                        </button>

                        {vendorInfo?.email && (
                          <button
                            onClick={handleEmail}
                            className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <div className="text-center">
                              <Mail className="w-6 h-6 mx-auto mb-2" />
                              <div className="font-medium">Email</div>
                              <div className="text-sm opacity-90">Send message</div>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* General Actions */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">General Actions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button
                        onClick={() => {
                          const serviceUrl = `${window.location.origin}/services/${service.id}`;
                          navigator.clipboard.writeText(serviceUrl).then(() => {
                            setSuccessMessage('Service link copied to clipboard!');
                            setTimeout(() => setSuccessMessage(null), 3000);
                          }).catch(() => {
                            alert('Service link copied to clipboard!');
                          });
                        }}
                        className="group bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 p-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <div className="text-center">
                          <Share2 className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-medium text-sm">Share</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsFavorite(!isFavorite);
                          setSuccessMessage(isFavorite ? 'Removed from favorites!' : 'Added to favorites!');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                        className={`group p-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
                          isFavorite 
                            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' 
                            : 'bg-gradient-to-br from-red-100 to-red-200 text-red-700 hover:from-red-200 hover:to-red-300'
                        }`}
                      >
                        <div className="text-center">
                          <Heart className={`w-6 h-6 mx-auto mb-2 ${isFavorite ? 'fill-current' : ''}`} />
                          <div className="font-medium text-sm">{isFavorite ? 'Saved' : 'Save'}</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          const reportMessage = `Report for service: ${service.service_name}\nVendor: ${service.vendor_name}\nIssue: [Please describe the issue]`;
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(reportMessage).then(() => {
                              setSuccessMessage('Report template copied to clipboard!');
                              setTimeout(() => setSuccessMessage(null), 3000);
                            });
                          } else {
                            alert('Report template copied to clipboard!');
                          }
                        }}
                        className="group bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 p-4 rounded-xl hover:from-yellow-200 hover:to-yellow-300 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <div className="text-center">
                          <Flag className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-medium text-sm">Report</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          if (vendorInfo?.phone) {
                            handleWhatsAppContact();
                          } else {
                            setSuccessMessage('Vendor contact information not available');
                            setTimeout(() => setSuccessMessage(null), 3000);
                          }
                        }}
                        className="group bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 p-4 rounded-xl hover:from-indigo-200 hover:to-indigo-300 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <div className="text-center">
                          <User className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-medium text-sm">Profile</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <ServiceReviews
                serviceId={parseInt(service.id)}
                serviceName={service.service_name}
                currentRating={service.rating || 0}
                totalRatings={service.total_ratings || 0}
                onReviewAdded={() => {
                  // Refresh service data to get updated ratings
                  // This could trigger a parent component refresh
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Printing Service Modal */}
      {service && (
        <PrintingServiceModal
          isOpen={isPrintingModalOpen}
          onClose={() => setIsPrintingModalOpen(false)}
          service={service}
          onSuccess={(message) => {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(null), 5000);
          }}
        />
      )}

      {/* Mobile Money Payment Modal */}
      {service && (
        <MobileMoneyPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          service={service}
          quantity={orderQuantity}
          totalAmount={service.base_price ? service.base_price * orderQuantity : 0}
          vendorInfo={vendorInfo ? {
            ...(vendorInfo.mtn_momo_number && { mtn_momo_number: vendorInfo.mtn_momo_number }),
            ...(vendorInfo.vodafone_cash_number && { vodafone_cash_number: vendorInfo.vodafone_cash_number }),
            ...(vendorInfo.airtel_money_number && { airtel_money_number: vendorInfo.airtel_money_number }),
            ...(vendorInfo.telecel_cash_number && { telecel_cash_number: vendorInfo.telecel_cash_number }),
            ...(vendorInfo.preferred_payment_method && { preferred_payment_method: vendorInfo.preferred_payment_method })
          } : null}
          onSuccess={(message) => {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(null), 5000);
          }}
        />
      )}

      {/* Enhanced Booking Modal */}
      {service && (
        <EnhancedBookingModal
          isOpen={isEnhancedBookingOpen}
          onClose={() => setIsEnhancedBookingOpen(false)}
          service={service}
          vendorInfo={vendorInfo ? {
            business_name: vendorInfo.business_name,
            phone: vendorInfo.phone,
            address: vendorInfo.address,
            business_hours: vendorInfo.business_hours,
            is_verified: vendorInfo.is_verified
          } : null}
          onSuccess={(message) => {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(null), 5000);
          }}
        />
      )}

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[10000] flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}
    </>
  );
};
