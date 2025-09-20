import React from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Package, 
  Calendar, 
  ShoppingCart, 
  MessageCircle,
  User,
  Shield
} from 'lucide-react';
import { Service } from '../../hooks/useServices';
import { cn } from '../../utils/helpers';
import { useTheme } from '../../theme/ThemeProvider';

interface MobileServiceCardProps {
  service: Service;
  onClick: () => void;
  onBook?: () => void;
  onOrder?: () => void;
  onContact?: () => void;
  className?: string;
}

export const MobileServiceCard: React.FC<MobileServiceCardProps> = ({
  service,
  onClick,
  onBook,
  onOrder,
  onContact,
  className
}) => {
  const { config } = useTheme();
  const isMobile = config.isMobile;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getActionButtons = () => {
    const buttons = [];
    
    if (service.can_book && onBook) {
      buttons.push(
        <button
          key="book"
          onClick={(e) => {
            e.stopPropagation();
            onBook();
          }}
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors touch-target"
        >
          <Calendar className="w-4 h-4 mr-1" />
          Book
        </button>
      );
    }
    
    if (service.can_order && onOrder) {
      buttons.push(
        <button
          key="order"
          onClick={(e) => {
            e.stopPropagation();
            onOrder();
          }}
          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors touch-target"
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          Order
        </button>
      );
    }
    
    if (service.requires_contact && onContact) {
      buttons.push(
        <button
          key="contact"
          onClick={(e) => {
            e.stopPropagation();
            onContact();
          }}
          className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors touch-target"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Contact
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden',
        isMobile ? 'p-4' : 'p-6',
        className
      )}
    >
      {/* Service Image */}
      <div className="relative mb-4">
        {service.images ? (
          <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={service.images}
              alt={service.service_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        ) : (
          <div className="aspect-video w-full bg-gray-100 rounded-xl flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            service.is_available 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}>
            {service.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Service Info */}
      <div className="space-y-3">
        {/* Title and Rating */}
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
            {service.service_name}
          </h3>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-600">
              {service.rating || '4.5'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2">
          {service.description}
        </p>

        {/* Vendor Info */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <User className="w-4 h-4" />
          <span className="truncate">{service.vendor_name}</span>
          {service.is_verified && (
            <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
          )}
        </div>

        {/* Location */}
        {service.location && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{service.location}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            {service.base_price ? formatPrice(service.base_price) : 'Contact for price'}
          </div>
          {service.has_flexible_pricing && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Flexible
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {getActionButtons().length > 0 && (
          <div className="flex gap-2 pt-2">
            {getActionButtons()}
          </div>
        )}
      </div>
    </div>
  );
};