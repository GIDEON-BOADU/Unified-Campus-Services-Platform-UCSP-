import { useState, useEffect, useCallback, useRef } from 'react';
import { locationService, Location, Address, GeocodedLocation, LocationPermission, NearbyService } from '../services/location';
import { logger } from '../utils/logger';

export interface LocationData {
  // Current location
  currentLocation: Location | null;
  isLocationLoading: boolean;
  locationError: string | null;
  
  // Permission
  permission: LocationPermission | null;
  isPermissionLoading: boolean;
  
  // Geocoding
  geocodedLocation: GeocodedLocation | null;
  isGeocoding: boolean;
  geocodingError: string | null;
  
  // Nearby services
  nearbyServices: NearbyService[];
  isFindingNearby: boolean;
  nearbyError: string | null;
  
  // Directions
  directions: any | null;
  isGettingDirections: boolean;
  directionsError: string | null;
  
  // Watching
  isWatching: boolean;
  
  // Actions
  getCurrentLocation: () => Promise<Location>;
  requestPermission: () => Promise<LocationPermission>;
  geocodeLocation: (location: Location) => Promise<GeocodedLocation>;
  reverseGeocodeAddress: (address: string) => Promise<GeocodedLocation[]>;
  findNearbyServices: (radius?: number, category?: string) => Promise<NearbyService[]>;
  getDirections: (destination: Location, travelMode?: 'driving' | 'walking' | 'transit' | 'bicycling') => Promise<any>;
  startWatching: () => void;
  stopWatching: () => void;
  
  // Utilities
  calculateDistance: (location1: Location, location2: Location) => number;
  formatDistance: (distanceInMeters: number) => string;
  formatCoordinates: (location: Location) => string;
  isLocationInBounds: (location: Location, bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => boolean;
}

export const useLocation = (config?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  geocodingProvider?: 'google' | 'openstreetmap' | 'mapbox';
  apiKey?: string;
}): LocationData => {
  // State
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [permission, setPermission] = useState<LocationPermission | null>(null);
  const [isPermissionLoading, setIsPermissionLoading] = useState(false);
  
  const [geocodedLocation, setGeocodedLocation] = useState<GeocodedLocation | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]);
  const [isFindingNearby, setIsFindingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  
  const [directions, setDirections] = useState<any | null>(null);
  const [isGettingDirections, setIsGettingDirections] = useState(false);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  
  const [isWatching, setIsWatching] = useState(false);
  
  // Refs
  const locationServiceRef = useRef(locationService);
  const isInitialized = useRef(false);

  // Initialize location service with config
  useEffect(() => {
    if (config) {
      locationServiceRef.current = new (locationService.constructor as any)(config);
    }
  }, [config]);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<Location> => {
    try {
      setIsLocationLoading(true);
      setLocationError(null);
      logger.debug('Getting current location...');
      
      const location = await locationServiceRef.current.getCurrentLocation();
      setCurrentLocation(location);
      
      logger.debug('Current location obtained:', location);
      return location;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get current location';
      setLocationError(errorMessage);
      logger.error('Error getting current location:', error);
      throw error;
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<LocationPermission> => {
    try {
      setIsPermissionLoading(true);
      logger.debug('Requesting location permission...');
      
      const permissionResult = await locationServiceRef.current.requestPermission();
      setPermission(permissionResult);
      
      logger.debug('Location permission result:', permissionResult);
      return permissionResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request permission';
      logger.error('Error requesting location permission:', error);
      throw error;
    } finally {
      setIsPermissionLoading(false);
    }
  }, []);

  // Geocode location
  const geocodeLocation = useCallback(async (location: Location): Promise<GeocodedLocation> => {
    try {
      setIsGeocoding(true);
      setGeocodingError(null);
      logger.debug('Geocoding location:', location);
      
      const geocoded = await locationServiceRef.current.geocodeLocation(location);
      setGeocodedLocation(geocoded);
      
      logger.debug('Location geocoded:', geocoded);
      return geocoded;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to geocode location';
      setGeocodingError(errorMessage);
      logger.error('Error geocoding location:', error);
      throw error;
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Reverse geocode address
  const reverseGeocodeAddress = useCallback(async (address: string): Promise<GeocodedLocation[]> => {
    try {
      setIsGeocoding(true);
      setGeocodingError(null);
      logger.debug('Reverse geocoding address:', address);
      
      const locations = await locationServiceRef.current.reverseGeocodeAddress(address);
      
      logger.debug('Address reverse geocoded:', locations);
      return locations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reverse geocode address';
      setGeocodingError(errorMessage);
      logger.error('Error reverse geocoding address:', error);
      throw error;
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Find nearby services
  const findNearbyServices = useCallback(async (radius: number = 5000, category?: string): Promise<NearbyService[]> => {
    try {
      setIsFindingNearby(true);
      setNearbyError(null);
      
      if (!currentLocation) {
        throw new Error('No current location available');
      }
      
      logger.debug('Finding nearby services:', { radius, category, currentLocation });
      
      const services = await locationServiceRef.current.findNearbyServices(
        currentLocation, 
        radius, 
        category
      );
      
      setNearbyServices(services);
      logger.debug('Nearby services found:', services.length);
      return services;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to find nearby services';
      setNearbyError(errorMessage);
      logger.error('Error finding nearby services:', error);
      throw error;
    } finally {
      setIsFindingNearby(false);
    }
  }, [currentLocation]);

  // Get directions
  const getDirections = useCallback(async (
    destination: Location, 
    travelMode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'walking'
  ): Promise<any> => {
    try {
      setIsGettingDirections(true);
      setDirectionsError(null);
      
      if (!currentLocation) {
        throw new Error('No current location available');
      }
      
      logger.debug('Getting directions:', { currentLocation, destination, travelMode });
      
      const directionsResult = await locationServiceRef.current.getDirections(
        currentLocation, 
        destination, 
        travelMode
      );
      
      setDirections(directionsResult);
      logger.debug('Directions obtained:', directionsResult);
      return directionsResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get directions';
      setDirectionsError(errorMessage);
      logger.error('Error getting directions:', error);
      throw error;
    } finally {
      setIsGettingDirections(false);
    }
  }, [currentLocation]);

  // Start watching
  const startWatching = useCallback(() => {
    try {
      locationServiceRef.current.startWatching();
      setIsWatching(true);
      logger.debug('Started watching location');
    } catch (error) {
      logger.error('Error starting location watch:', error);
    }
  }, []);

  // Stop watching
  const stopWatching = useCallback(() => {
    try {
      locationServiceRef.current.stopWatching();
      setIsWatching(false);
      logger.debug('Stopped watching location');
    } catch (error) {
      logger.error('Error stopping location watch:', error);
    }
  }, []);

  // Utility functions
  const calculateDistance = useCallback((location1: Location, location2: Location): number => {
    return locationServiceRef.current.calculateDistance(location1, location2);
  }, []);

  const formatDistance = useCallback((distanceInMeters: number): string => {
    return locationServiceRef.current.formatDistance(distanceInMeters);
  }, []);

  const formatCoordinates = useCallback((location: Location): string => {
    return locationServiceRef.current.formatCoordinates(location);
  }, []);

  const isLocationInBounds = useCallback((location: Location, bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): boolean => {
    return locationServiceRef.current.isLocationInBounds(location, bounds);
  }, []);

  // Location change listener
  useEffect(() => {
    const handleLocationChange = (location: Location) => {
      setCurrentLocation(location);
      setLocationError(null);
    };

    locationServiceRef.current.addLocationListener(handleLocationChange);

    return () => {
      locationServiceRef.current.removeLocationListener(handleLocationChange);
    };
  }, []);

  // Initial permission check
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      requestPermission().catch(error => {
        logger.error('Error checking initial permission:', error);
      });
    }
  }, [requestPermission]);

  // Auto-geocode when location changes
  useEffect(() => {
    if (currentLocation && !geocodedLocation) {
      geocodeLocation(currentLocation).catch(error => {
        logger.error('Error auto-geocoding location:', error);
      });
    }
  }, [currentLocation, geocodedLocation, geocodeLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isWatching) {
        stopWatching();
      }
    };
  }, [isWatching, stopWatching]);

  return {
    currentLocation,
    isLocationLoading,
    locationError,
    permission,
    isPermissionLoading,
    geocodedLocation,
    isGeocoding,
    geocodingError,
    nearbyServices,
    isFindingNearby,
    nearbyError,
    directions,
    isGettingDirections,
    directionsError,
    isWatching,
    getCurrentLocation,
    requestPermission,
    geocodeLocation,
    reverseGeocodeAddress,
    findNearbyServices,
    getDirections,
    startWatching,
    stopWatching,
    calculateDistance,
    formatDistance,
    formatCoordinates,
    isLocationInBounds,
  };
};