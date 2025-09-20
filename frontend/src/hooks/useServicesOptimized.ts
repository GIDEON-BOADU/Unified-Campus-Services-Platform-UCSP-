import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { useApiCache } from './useApiCache';

export interface Service {
  id: string;
  vendor: string;
  vendor_name: string;
  service_name: string;
  description: string;
  category: string;
  service_type: string;
  base_price: number | null;
  is_available: boolean;
  availability_status: string;
  contact_info: string;
  location: string;
  images: string | null;
  created_at: string;
  updated_at: string;
  rating: number;
  total_ratings: number;
  supports_booking: boolean;
  supports_ordering: boolean;
  supports_walk_in: boolean;
  requires_contact: boolean;
}

export interface CreateServiceData {
  service_name: string;
  description: string;
  category: string;
  service_type: 'booking' | 'ordering' | 'contact';
  base_price?: number;
  is_available?: boolean;
  availability_status?: 'available' | 'busy' | 'unavailable' | 'closed';
  contact_info?: string;
  location?: string;
  supports_booking?: boolean;
  supports_ordering?: boolean;
  supports_walk_in?: boolean;
  requires_contact?: boolean;
  image?: File | null;
}

export interface ServiceFilters {
  category?: string;
  service_type?: string;
  availability_status?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: 'created_at' | 'service_name' | 'base_price' | 'rating';
  sort_order?: 'asc' | 'desc';
}

export interface ServiceStats {
  total_services: number;
  available_services: number;
  unavailable_services: number;
  average_rating: number;
  total_ratings: number;
  category_breakdown: Record<string, number>;
}

export const useServices = (filters: ServiceFilters = {}) => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ServiceStats | null>(null);

  // Create cache key based on filters
  const cacheKey = `services-${JSON.stringify(filters)}`;

  // Use API cache for services data
  const {
    data: cachedServices,
    isLoading: isCacheLoading,
    error: cacheError,
    refetch: refetchServices,
    invalidate: invalidateCache
  } = useApiCache(
    cacheKey,
    async () => {
      const response = await apiClient.get('/services/', { params: filters });
      return response.value || response.results || response;
    },
    { ttl: 2 * 60 * 1000 } // 2 minutes cache
  );

  // Update local state when cache data changes
  useEffect(() => {
    if (cachedServices) {
      setServices(Array.isArray(cachedServices) ? cachedServices : []);
    }
  }, [cachedServices]);

  // Fetch services with loading state
  const fetchServices = useCallback(async (newFilters?: ServiceFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      const response = await apiClient.get('/services/', { params: currentFilters });
      
      const servicesData = response.value || response.results || response;
      const servicesArray = Array.isArray(servicesData) ? servicesData : [];
      
      setServices(servicesArray);
      
      // Update cache
      if (newFilters) {
        const newCacheKey = `services-${JSON.stringify(newFilters)}`;
        // This would be handled by the cache system
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch service statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/services/stats/');
      setStats(response);
    } catch (err) {
      console.warn('Failed to fetch service statistics:', err);
      setStats(null);
    }
  }, []);

  // Create a new service
  const createService = useCallback(async (serviceData: CreateServiceData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      Object.entries(serviceData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.post('/services/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newService = response;
      setServices(prev => [newService, ...prev]);
      
      // Invalidate cache to force refresh
      invalidateCache();
      
      return newService;
    } catch (err) {
      console.error('Error creating service:', err);
      setError(err instanceof Error ? err.message : 'Failed to create service');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [invalidateCache]);

  // Update a service
  const updateService = useCallback(async (id: string, serviceData: Partial<CreateServiceData>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      Object.entries(serviceData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.put(`/services/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedService = response;
      setServices(prev => prev.map(service => 
        service.id === id ? updatedService : service
      ));
      
      // Invalidate cache
      invalidateCache();
      
      return updatedService;
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err instanceof Error ? err.message : 'Failed to update service');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [invalidateCache]);

  // Delete a service
  const deleteService = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await apiClient.delete(`/services/${id}/`);
      
      setServices(prev => prev.filter(service => service.id !== id));
      
      // Invalidate cache
      invalidateCache();
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete service');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [invalidateCache]);

  // Get services by vendor
  const getVendorServices = useCallback(async (vendorId: string) => {
    try {
      const response = await apiClient.get(`/services/vendor/${vendorId}/`);
      return response.value || response.results || response;
    } catch (err) {
      console.error('Error fetching vendor services:', err);
      throw err;
    }
  }, []);

  // Rate a service
  const rateService = useCallback(async (serviceId: string, rating: number, review?: string) => {
    try {
      const response = await apiClient.post(`/services/${serviceId}/rate/`, {
        rating,
        review
      });
      
      // Update local service data
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, rating: response.rating, total_ratings: response.total_ratings }
          : service
      ));
      
      return response;
    } catch (err) {
      console.error('Error rating service:', err);
      throw err;
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchServices();
    fetchStats();
  }, [fetchServices, fetchStats]);

  return {
    services,
    stats,
    isLoading: isLoading || isCacheLoading,
    error: error || (cacheError instanceof Error ? cacheError.message : null),
    fetchServices,
    fetchStats,
    createService,
    updateService,
    deleteService,
    getVendorServices,
    rateService,
    refetch: refetchServices,
    isCached: !!cachedServices
  };
};
