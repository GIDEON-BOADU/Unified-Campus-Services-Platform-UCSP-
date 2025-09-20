import React, { useState, useEffect } from 'react';
import { useLocation } from '../../hooks/useLocation';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Star,
  Phone,
  ExternalLink,
  Compass,
  Target
} from 'lucide-react';

interface LocationBasedServiceFinderProps {
  onServiceSelect?: (service: any) => void;
  category?: string;
  radius?: number;
  showDirections?: boolean;
}

export const LocationBasedServiceFinder: React.FC<LocationBasedServiceFinderProps> = ({
  onServiceSelect,
  category,
  radius = 5000,
  showDirections = true
}) => {
  const {
    currentLocation,
    isLocationLoading,
    locationError,
    permission,
    isPermissionLoading,
    geocodedLocation,
    nearbyServices,
    isFindingNearby,
    nearbyError,
    directions,
    isGettingDirections,
    directionsError,
    getCurrentLocation,
    requestPermission,
    findNearbyServices,
    getDirections,
    calculateDistance,
    formatDistance,
    formatCoordinates
  } = useLocation();

  const [selectedService, setSelectedService] = useState<any>(null);
  const [searchRadius, setSearchRadius] = useState(radius);
  const [searchCategory, setSearchCategory] = useState(category || '');
  const [showFilters, setShowFilters] = useState(false);

  // Auto-find nearby services when location is available
  useEffect(() => {
    if (currentLocation && nearbyServices.length === 0) {
      findNearbyServices(searchRadius, searchCategory || undefined);
    }
  }, [currentLocation, searchRadius, searchCategory, findNearbyServices, nearbyServices.length]);

  // Handle service selection
  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    onServiceSelect?.(service);
  };

  // Handle get directions
  const handleGetDirections = async (service: any) => {
    if (!currentLocation) return;
    
    try {
      await getDirections(service.location, 'walking');
    } catch (error) {
      console.error('Error getting directions:', error);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (currentLocation) {
      await findNearbyServices(searchRadius, searchCategory || undefined);
    }
  };

  // Handle permission request
  const handleRequestPermission = async () => {
    try {
      await requestPermission();
      if (permission?.granted) {
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  // Render permission request
  if (permission?.denied) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Access Denied</h3>
          <p className="text-gray-600 mb-4">
            We need access to your location to find nearby services. Please enable location access in your browser settings.
          </p>
          <button
            onClick={handleRequestPermission}
            className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLocationLoading || isPermissionLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Getting your location..." />
        </div>
      </div>
    );
  }

  // Render error state
  if (locationError) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Error</h3>
          <p className="text-gray-600 mb-4">{locationError}</p>
          <button
            onClick={getCurrentLocation}
            className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-ucsp-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-ucsp-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nearby Services</h3>
              <p className="text-sm text-gray-600">
                {geocodedLocation?.address.formattedAddress || 'Finding your location...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Filters"
            >
              <Filter className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isFindingNearby}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isFindingNearby ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius
                </label>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucsp-green-500 focus:border-transparent"
                >
                  <option value={1000}>1 km</option>
                  <option value={2000}>2 km</option>
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucsp-green-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="laundry">Laundry</option>
                  <option value="printing">Printing</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Location Info */}
        {currentLocation && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>📍 {formatCoordinates(currentLocation)}</span>
              <span>Accuracy: ±{Math.round(currentLocation.accuracy || 0)}m</span>
            </div>
          </div>
        )}
      </div>

      {/* Services List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {isFindingNearby ? (
          <div className="p-6 text-center">
            <LoadingSpinner size="lg" text="Finding nearby services..." />
          </div>
        ) : nearbyError ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Finding Services</h3>
            <p className="text-gray-600 mb-4">{nearbyError}</p>
            <button
              onClick={handleRefresh}
              className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : nearbyServices.length === 0 ? (
          <div className="p-6 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-600 mb-4">
              No services found within {formatDistance(searchRadius)}. Try increasing the search radius.
            </p>
            <button
              onClick={handleRefresh}
              className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {nearbyServices.map((service) => (
              <div
                key={service.id}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedService?.id === service.id ? 'bg-ucsp-green-50 border-l-4 border-ucsp-green-500' : ''
                }`}
                onClick={() => handleServiceSelect(service)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                      {service.isOpen && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Open
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{service.address.formattedAddress}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Navigation className="w-4 h-4 mr-1" />
                        <span>{formatDistance(service.distance)}</span>
                      </div>
                      
                      {service.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          <span>{service.rating.toFixed(1)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        <span className="capitalize">{service.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {showDirections && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetDirections(service);
                        }}
                        disabled={isGettingDirections}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Get Directions"
                      >
                        <Compass className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${service.phone || '#'}`, '_self');
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onServiceSelect?.(service);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Select Service"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Directions */}
      {directions && selectedService && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Directions to {selectedService.name}</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{directions.distance.text}</div>
              <div className="text-sm text-gray-600">Distance</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{directions.duration.text}</div>
              <div className="text-sm text-gray-600">Walking Time</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {directions.steps.map((step: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-ucsp-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{step.instruction}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistance(step.distance)} • {Math.round(step.duration / 60)} mins
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
