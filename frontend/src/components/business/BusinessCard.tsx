import React from 'react';
import { MapPin, Star, Phone, Mail } from 'lucide-react';
import { Business, Category } from '../../types';

interface BusinessCardProps {
  business: Business;
  category?: Category;
  onClick?: () => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ 
  business, 
  category,
  onClick 
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg">
        {business.image_url ? (
          <img
            src={business.image_url}
            alt={business.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <div className="text-gray-400 text-4xl font-bold">
              {business.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {business.name}
          </h3>
          {category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {category.name}
            </span>
          )}
        </div>
        
        {business.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {business.description}
          </p>
        )}
        
        <div className="space-y-2">
          {business.address && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{business.address}</span>
            </div>
          )}
          
          {business.phone && (
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{business.phone}</span>
            </div>
          )}
          
          {business.email && (
            <div className="flex items-center text-sm text-gray-500">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{business.email}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">4.5</span>
            <span className="text-sm text-gray-400 ml-1">(24 reviews)</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              business.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {business.is_active ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 