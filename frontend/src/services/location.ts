import { logger } from '../utils/logger';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export interface GeocodedLocation {
  location: Location;
  address: Address;
  placeId?: string;
}

export interface LocationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  error?: string;
}

export interface LocationServiceConfig {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  geocodingProvider?: 'google' | 'openstreetmap' | 'mapbox';
  apiKey?: string;
}

export interface NearbyService {
  id: number;
  name: string;
  distance: number;
  location: Location;
  address: Address;
  category: string;
  rating?: number;
  isOpen?: boolean;
}

class LocationService {
  private config: LocationServiceConfig;
  private watchId: number | null = null;
  private currentLocation: Location | null = null;
  private listeners: ((location: Location) => void)[] = [];

  constructor(config: LocationServiceConfig = {}) {
    this.config = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      watchPosition: false,
      geocodingProvider: 'openstreetmap',
      ...config
    };
  }

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Request location permission
   */
  async requestPermission(): Promise<LocationPermission> {
    if (!this.isSupported()) {
      return {
        granted: false,
        denied: true,
        prompt: false,
        error: 'Geolocation is not supported by this browser'
      };
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      if (permission.state === 'granted') {
        return { granted: true, denied: false, prompt: false };
      } else if (permission.state === 'denied') {
        return { granted: false, denied: true, prompt: false };
      } else {
        return { granted: false, denied: false, prompt: true };
      }
    } catch (error) {
      logger.error('Error checking location permission:', error);
      return {
        granted: false,
        denied: false,
        prompt: true,
        error: 'Unable to check location permission'
      };
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: this.config.enableHighAccuracy,
        timeout: this.config.timeout,
        maximumAge: this.config.maximumAge
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };

          this.currentLocation = location;
          this.notifyListeners(location);
          resolve(location);
        },
        (error) => {
          logger.error('Error getting current location:', error);
          reject(new Error(this.getErrorMessage(error.code)));
        },
        options
      );
    });
  }

  /**
   * Start watching position
   */
  startWatching(): void {
    if (!this.isSupported()) {
      logger.error('Geolocation is not supported');
      return;
    }

    if (this.watchId !== null) {
      logger.warn('Already watching position');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: this.config.enableHighAccuracy,
      timeout: this.config.timeout,
      maximumAge: this.config.maximumAge
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };

        this.currentLocation = location;
        this.notifyListeners(location);
      },
      (error) => {
        logger.error('Error watching position:', error);
      },
      options
    );

    logger.debug('Started watching position');
  }

  /**
   * Stop watching position
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      logger.debug('Stopped watching position');
    }
  }

  /**
   * Add location change listener
   */
  addLocationListener(listener: (location: Location) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove location change listener
   */
  removeLocationListener(listener: (location: Location) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Get cached location
   */
  getCachedLocation(): Location | null {
    return this.currentLocation;
  }

  /**
   * Calculate distance between two points (in meters)
   */
  calculateDistance(location1: Location, location2: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = location1.latitude * Math.PI / 180;
    const φ2 = location2.latitude * Math.PI / 180;
    const Δφ = (location2.latitude - location1.latitude) * Math.PI / 180;
    const Δλ = (location2.longitude - location1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Geocode coordinates to address
   */
  async geocodeLocation(location: Location): Promise<GeocodedLocation> {
    try {
      let address: Address = {};

      if (this.config.geocodingProvider === 'google' && this.config.apiKey) {
        address = await this.geocodeWithGoogle(location);
      } else {
        address = await this.geocodeWithOpenStreetMap(location);
      }

      return {
        location,
        address,
        placeId: undefined
      };
    } catch (error) {
      logger.error('Error geocoding location:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode address to coordinates
   */
  async reverseGeocodeAddress(address: string): Promise<GeocodedLocation[]> {
    try {
      let locations: GeocodedLocation[] = [];

      if (this.config.geocodingProvider === 'google' && this.config.apiKey) {
        locations = await this.reverseGeocodeWithGoogle(address);
      } else {
        locations = await this.reverseGeocodeWithOpenStreetMap(address);
      }

      return locations;
    } catch (error) {
      logger.error('Error reverse geocoding address:', error);
      throw error;
    }
  }

  /**
   * Find nearby services
   */
  async findNearbyServices(
    location: Location, 
    radius: number = 5000, 
    category?: string
  ): Promise<NearbyService[]> {
    try {
      // This would typically call your backend API
      // For now, return mock data
      const mockServices: NearbyService[] = [
        {
          id: 1,
          name: 'Campus Laundry Service',
          distance: 150,
          location: {
            latitude: location.latitude + 0.001,
            longitude: location.longitude + 0.001,
            timestamp: Date.now()
          },
          address: {
            street: '123 University Street',
            city: 'Accra',
            country: 'Ghana',
            formattedAddress: '123 University Street, Accra, Ghana'
          },
          category: 'laundry',
          rating: 4.5,
          isOpen: true
        },
        {
          id: 2,
          name: 'Quick Print Shop',
          distance: 300,
          location: {
            latitude: location.latitude - 0.001,
            longitude: location.longitude + 0.002,
            timestamp: Date.now()
          },
          address: {
            street: '456 Campus Road',
            city: 'Accra',
            country: 'Ghana',
            formattedAddress: '456 Campus Road, Accra, Ghana'
          },
          category: 'printing',
          rating: 4.2,
          isOpen: true
        }
      ];

      return mockServices.filter(service => {
        const distance = this.calculateDistance(location, service.location);
        return distance <= radius && (!category || service.category === category);
      });
    } catch (error) {
      logger.error('Error finding nearby services:', error);
      throw error;
    }
  }

  /**
   * Get directions between two locations
   */
  async getDirections(
    origin: Location, 
    destination: Location, 
    travelMode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'walking'
  ): Promise<any> {
    try {
      // This would typically call Google Maps Directions API or similar
      // For now, return mock data
      const distance = this.calculateDistance(origin, destination);
      const duration = Math.round(distance / 1000 * 12); // Rough estimate: 12 minutes per km

      return {
        distance: {
          text: `${(distance / 1000).toFixed(1)} km`,
          value: distance
        },
        duration: {
          text: `${duration} mins`,
          value: duration * 60
        },
        steps: [
          {
            instruction: 'Head towards destination',
            distance: distance,
            duration: duration * 60
          }
        ]
      };
    } catch (error) {
      logger.error('Error getting directions:', error);
      throw error;
    }
  }

  /**
   * Check if location is within bounds
   */
  isLocationInBounds(location: Location, bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): boolean {
    return location.latitude >= bounds.south &&
           location.latitude <= bounds.north &&
           location.longitude >= bounds.west &&
           location.longitude <= bounds.east;
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceInMeters: number): string {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    }
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(location: Location): string {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  // Private methods

  private notifyListeners(location: Location): void {
    this.listeners.forEach(listener => {
      try {
        listener(location);
      } catch (error) {
        logger.error('Error in location listener:', error);
      }
    });
  }

  private getErrorMessage(errorCode: number): string {
    switch (errorCode) {
      case 1:
        return 'Location access denied by user';
      case 2:
        return 'Location unavailable';
      case 3:
        return 'Location request timed out';
      default:
        return 'Unknown location error';
    }
  }

  private async geocodeWithGoogle(location: Location): Promise<Address> {
    // Implementation for Google Geocoding API
    // This would make an API call to Google's geocoding service
    throw new Error('Google geocoding not implemented');
  }

  private async geocodeWithOpenStreetMap(location: Location): Promise<Address> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      return {
        street: data.address?.road || data.address?.pedestrian,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        country: data.address?.country,
        postalCode: data.address?.postcode,
        formattedAddress: data.display_name
      };
    } catch (error) {
      logger.error('Error geocoding with OpenStreetMap:', error);
      throw error;
    }
  }

  private async reverseGeocodeWithGoogle(address: string): Promise<GeocodedLocation[]> {
    // Implementation for Google Geocoding API
    throw new Error('Google reverse geocoding not implemented');
  }

  private async reverseGeocodeWithOpenStreetMap(address: string): Promise<GeocodedLocation[]> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }

      const data = await response.json();
      
      return data.map((item: any) => ({
        location: {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          timestamp: Date.now()
        },
        address: {
          street: item.address?.road || item.address?.pedestrian,
          city: item.address?.city || item.address?.town || item.address?.village,
          state: item.address?.state,
          country: item.address?.country,
          postalCode: item.address?.postcode,
          formattedAddress: item.display_name
        },
        placeId: item.place_id
      }));
    } catch (error) {
      logger.error('Error reverse geocoding with OpenStreetMap:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const locationService = new LocationService();

// Export types and service
export default locationService;