import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { logger } from '../utils/logger';

export interface Service {
  id: string;
  vendor: string;
  vendor_name: string;
  vendor_phone?: string;
  service_name: string;
  description: string;
  category: 'food' | 'beauty' | 'printing' | 'laundry' | 'academic' | 'transport' | 'health' | 'entertainment' | 'gym' | 'other';
  service_type: 'booking' | 'ordering' | 'contact' | 'walk_in';
  base_price: number | null;
  has_flexible_pricing: boolean;
  is_available: boolean;
  availability_status: 'available' | 'busy' | 'unavailable' | 'closed';
  contact_info: string;
  location: string;
  images: string | null;
  created_at: string;
  updated_at: string;
  can_book: boolean;
  can_order: boolean;
  requires_contact: boolean;
  can_walk_in: boolean;
  rating?: number | null;
  total_ratings?: number;
  // Computed properties for UI
  can_contact?: boolean;
}

export interface CreateServiceData {
  service_name: string;
  description: string;
  category: string;
  service_type: string;
  base_price?: number;
  has_flexible_pricing?: boolean;
  is_available?: boolean;
  availability_status?: string;
  contact_info?: string;
  location?: string;
  can_book?: boolean;
  can_order?: boolean;
  can_walk_in?: boolean;
  requires_contact?: boolean;
  image?: File | null;
}

export const useServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [sortBy, setSortBy] = useState('service_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch services for the current user
  const fetchServices = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      // Use different endpoints based on user type
      if (user.userType === 'vendor') {
        console.log('Fetching vendor services from /services/my_services/');
        // Vendors get their own services
        response = await apiClient.get('/services/my_services/');
        console.log('Vendor services response:', response);
        const servicesData = response.services || response.results || response;
        console.log('Parsed services data:', servicesData);
        
        // Convert IDs to strings if needed and construct proper image URLs
        const processedServices = Array.isArray(servicesData) ? servicesData.map(service => {
          console.log('Processing service:', service.service_name, 'Images:', service.images);
          
          // Construct proper image URL if image exists
          let imageUrl = null;
          if (service.images) {
            // If it's already a full URL, use it; otherwise construct it
            if (service.images.startsWith('http')) {
              imageUrl = service.images;
            } else {
              // Ensure the image path starts with / if it doesn't already
              const imagePath = service.images.startsWith('/') ? service.images : `/${service.images}`;
              imageUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${imagePath}`;
            }
          }
          
          return {
            ...service,
            id: service.id ? service.id.toString() : service.id,
            images: imageUrl
          };
        }) : [];
        
        setServices(processedServices);
      } else {
        console.log('Fetching all services from /services/');
        // Students and admins get all services
        response = await apiClient.get('/services/');
        console.log('All services response:', response);
        const servicesData = response.value || response.results || response;
        
        // Convert IDs to strings if needed and construct proper image URLs
        const processedServices = Array.isArray(servicesData) ? servicesData.map(service => {
          console.log('Processing student service:', service.service_name, 'Images:', service.images);
          
          // Construct proper image URL if image exists
          let imageUrl = null;
          if (service.images) {
            // If it's already a full URL, use it; otherwise construct it
            if (service.images.startsWith('http')) {
              imageUrl = service.images;
            } else {
              // Ensure the image path starts with / if it doesn't already
              const imagePath = service.images.startsWith('/') ? service.images : `/${service.images}`;
              imageUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${imagePath}`;
            }
          }
          
          return {
            ...service,
            id: service.id ? service.id.toString() : service.id,
            images: imageUrl
          };
        }) : [];
        
        setServices(processedServices);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create a new service
  const createService = useCallback(async (serviceData: CreateServiceData): Promise<Service | null> => {
    if (!user) return null;

    console.log('createService called with:', serviceData);
    setError(null);

    try {
      // Check if we have an image to upload
      const hasImage = serviceData.image && serviceData.image instanceof File;
      console.log('Has image:', hasImage);
      
      let response;
      
      if (hasImage) {
        // Use FormData for image uploads
        const formData = new FormData();
        
        // Map frontend fields to backend fields
        const fieldMapping = {
          service_name: 'service_name',
          description: 'description',
          category: 'category',
          service_type: 'service_type',
          base_price: 'base_price',
          has_flexible_pricing: 'has_flexible_pricing',
          is_available: 'is_available',
          availability_status: 'availability_status',
          contact_info: 'contact_info',
          location: 'location',
          // Note: can_book, can_order, can_walk_in, requires_contact are automatically set by backend based on service_type
        };
        
        // Add all text fields with proper mapping
        Object.entries(fieldMapping).forEach(([frontendKey, backendKey]) => {
          if (serviceData[frontendKey as keyof CreateServiceData] !== undefined) {
            const value = serviceData[frontendKey as keyof CreateServiceData];
            if (typeof value === 'boolean') {
              formData.append(backendKey, value.toString());
            } else if (value !== null && value !== undefined) {
              formData.append(backendKey, String(value));
            }
          }
        });
        
        // Add the image file - backend expects 'images' field
        if (serviceData.image) {
          formData.append('images', serviceData.image);
        }
        
        console.log('Sending FormData with image');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          response = await fetch('http://localhost:8000/api/services/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              // Don't set Content-Type for FormData, let the browser set it with boundary
            },
            body: formData,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
        } catch (error: any) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('Request timed out after 30 seconds');
          }
          throw error;
        }
      } else {
        // Use JSON for text-only data
        const { image, ...jsonData } = serviceData;
        
        // Map frontend fields to backend fields
        // Note: can_book, can_order, can_walk_in, requires_contact are automatically set by backend based on service_type
        const mappedData = {
          service_name: jsonData.service_name,
          description: jsonData.description,
          category: jsonData.category,
          service_type: jsonData.service_type,
          base_price: jsonData.base_price,
          has_flexible_pricing: jsonData.has_flexible_pricing,
          is_available: jsonData.is_available,
          availability_status: jsonData.availability_status,
          contact_info: jsonData.contact_info,
          location: jsonData.location
        };
        
        logger.debug('Sending JSON data:', mappedData);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          response = await fetch('http://localhost:8000/api/services/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(mappedData),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
        } catch (error: any) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('Request timed out after 30 seconds');
          }
          throw error;
        }
      }

      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Response error:', errorData);
        throw new Error(errorData.message || errorData.detail || 'Failed to create service');
      }

      const responseData = await response.json();
      console.log('Service creation response:', responseData);
      
      // Extract the service from the response
      const newService = responseData.service || responseData;
      console.log('Service created successfully:', newService);
      
      // Convert ID to string if needed
      if (newService.id && typeof newService.id === 'number') {
        newService.id = newService.id.toString();
      }
      
      // Add the new service to the list
      setServices(prev => {
        console.log('Previous services count:', prev.length);
        const updated = [newService, ...prev];
        console.log('Updated services count:', updated.length);
        return updated;
      });
      
      return newService;
    } catch (err) {
      console.error('Error in createService:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create service';
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw for component handling
    }
  }, [user]);

  // Update an existing service
  const updateService = useCallback(async (serviceId: string, serviceData: Partial<CreateServiceData>): Promise<Service | null> => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Check if we have an image to upload
      const hasImage = serviceData.image && serviceData.image instanceof File;
      console.log('updateService: Has image:', hasImage);
      
      let response;
      
      if (hasImage) {
        // Use FormData for image uploads
        const formData = new FormData();
        
        // Map frontend fields to backend fields
        const fieldMapping = {
          service_name: 'service_name',
          description: 'description',
          category: 'category',
          service_type: 'service_type',
          base_price: 'base_price',
          has_flexible_pricing: 'has_flexible_pricing',
          is_available: 'is_available',
          availability_status: 'availability_status',
          contact_info: 'contact_info',
          location: 'location',
          // Note: can_book, can_order, can_walk_in, requires_contact are automatically set by backend based on service_type
        };
        
        // Add all text fields with proper mapping
        Object.entries(fieldMapping).forEach(([frontendKey, backendKey]) => {
          if (serviceData[frontendKey as keyof CreateServiceData] !== undefined) {
            const value = serviceData[frontendKey as keyof CreateServiceData];
            if (typeof value === 'boolean') {
              formData.append(backendKey, value.toString());
            } else if (value !== null && value !== undefined) {
              formData.append(backendKey, String(value));
            }
          }
        });
        
        // Add the image file - backend expects 'images' field
        if (serviceData.image) {
          formData.append('images', serviceData.image);
        }
        
        console.log('updateService: Sending FormData with image');
        response = await fetch(`http://localhost:8000/api/services/${serviceId}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            // Don't set Content-Type for FormData, let the browser set it with boundary
          },
          body: formData
        });
      } else {
        // Use JSON for text-only data
        const { image, ...jsonData } = serviceData;
        
        // Map frontend fields to backend fields
        const mappedData = {
          service_name: jsonData.service_name,
          description: jsonData.description,
          category: jsonData.category,
          service_type: jsonData.service_type,
          base_price: jsonData.base_price,
          has_flexible_pricing: jsonData.has_flexible_pricing,
          is_available: jsonData.is_available,
          availability_status: jsonData.availability_status,
          contact_info: jsonData.contact_info,
          location: jsonData.location,
          can_book: jsonData.can_book,
          can_order: jsonData.can_order,
          can_walk_in: jsonData.can_walk_in,
          requires_contact: jsonData.requires_contact
        };
        
        console.log('updateService: Sending JSON data:', mappedData);
        response = await fetch(`http://localhost:8000/api/services/${serviceId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(mappedData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail || 'Failed to update service');
      }

      const updatedService = await response.json();
      
      // Update the service in the list
      setServices(prev => prev.map(service => 
        service.id === serviceId ? updatedService : service
      ));
      
      return updatedService;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update service';
      setError(errorMessage);
      console.error('Error updating service:', err);
      throw new Error(errorMessage); // Re-throw for component handling
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Delete a service
  const deleteService = useCallback(async (serviceId: string): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/services/${serviceId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      // Remove the service from the list
      setServices(prev => prev.filter(service => service.id !== serviceId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete service';
      setError(errorMessage);
      console.error('Error deleting service:', err);
      throw new Error(errorMessage); // Re-throw for component handling
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Toggle service availability
  const toggleServiceAvailability = useCallback(async (serviceId: string, isAvailable: boolean): Promise<boolean> => {
    return await updateService(serviceId, { is_available: isAvailable }) !== null;
  }, [updateService]);

  // Rate a service
  const rateService = useCallback(async (serviceId: string, rating: number, comment: string): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ service: serviceId, rating, comment })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }

      // Refresh services to get updated ratings
      await fetchServices();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit rating';
      setError(errorMessage);
      console.error('Error rating service:', err);
      throw new Error(errorMessage); // Re-throw for component handling
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchServices]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...services];
    
    // Debug logging
    console.log('useServices: Applying filters and sorting', {
      servicesCount: services.length,
      sortBy,
      sortOrder,
      searchTerm,
      selectedCategory,
      selectedServiceType
    });
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (filtered.length > 0) {
      try {
        filtered.sort((a, b) => {
          // Add safety check for sortBy
          if (!sortBy || !a || !b) {
            return 0;
          }
          
          // Check if the sort field exists on both objects
          if (!(sortBy in a) || !(sortBy in b)) {
            console.warn(`useServices: Sort field '${sortBy}' not found on service objects`);
            return 0;
          }
          
          let aValue: any = a[sortBy as keyof Service];
          let bValue: any = b[sortBy as keyof Service];
          
          // Debug logging for first item
          if (filtered.indexOf(a) === 0) {
            console.log('useServices: Sorting debug', {
              sortBy,
              aValue,
              bValue,
              aKeys: Object.keys(a),
              bKeys: Object.keys(b)
            });
          }
          
          // Handle undefined values - if property doesn't exist, use empty string
          if (aValue === undefined) aValue = '';
          if (bValue === undefined) bValue = '';
          
          // Handle string values
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          // Handle null values
          if (aValue === null) aValue = '';
          if (bValue === null) bValue = '';
          
          // Final safety check - ensure both values are comparable
          if (aValue === undefined || bValue === undefined) {
            return 0;
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      } catch (error) {
        console.error('useServices: Error during sorting:', error);
        // If sorting fails, just use the filtered array as-is
      }
    }
    
    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory, selectedServiceType, sortBy, sortOrder]);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedServiceType('');
    setSortBy('service_name');
    setSortOrder('desc');
  }, []);

  return {
    services,
    filteredServices,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedServiceType,
    setSelectedServiceType,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    clearFilters,
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleServiceAvailability,
    rateService
  };
};
