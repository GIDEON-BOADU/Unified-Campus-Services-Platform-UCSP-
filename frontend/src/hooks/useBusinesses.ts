import { useState, useEffect, useCallback } from 'react';
import { Business } from '../types';
import { BusinessService } from '../services/businesses';
import { useAuth } from '../contexts/AuthContext';

// Business Hook
export const useBusinesses = () => {
  const { isAuthenticated } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await BusinessService.getAllBusinesses();
      setBusinesses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch businesses';
      setError(errorMessage);
      console.error('Error fetching businesses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh businesses
  const refresh = useCallback(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Get business by ID
  const getBusinessById = useCallback(async (id: string): Promise<Business | null> => {
    try {
      return await BusinessService.getBusinessById(id);
    } catch (err) {
      console.error(`Error fetching business ${id}:`, err);
      return null;
    }
  }, []);

  // Create new business
  const createBusiness = useCallback(async (businessData: Partial<Business>): Promise<Business | null> => {
    try {
      const newBusiness = await BusinessService.createBusiness(businessData);
      if (newBusiness) {
        // Refresh the list to include the new business
        await fetchBusinesses();
      }
      return newBusiness;
    } catch (err) {
      console.error('Error creating business:', err);
      return null;
    }
  }, [fetchBusinesses]);

  // Update business
  const updateBusiness = useCallback(async (id: string, businessData: Partial<Business>): Promise<Business | null> => {
    try {
      const updatedBusiness = await BusinessService.updateBusiness(id, businessData);
      if (updatedBusiness) {
        // Update the business in the local state
        setBusinesses(prev => 
          prev.map(business => 
            business.id === id ? updatedBusiness : business
          )
        );
      }
      return updatedBusiness;
    } catch (err) {
      console.error(`Error updating business ${id}:`, err);
      return null;
    }
  }, []);

  // Delete business
  const deleteBusiness = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await BusinessService.deleteBusiness(id);
      if (success) {
        // Remove the business from local state
        setBusinesses(prev => prev.filter(business => business.id !== id));
      }
      return success;
    } catch (err) {
      console.error(`Error deleting business ${id}:`, err);
      return false;
    }
  }, []);

  // Filter businesses by search term
  const searchBusinesses = useCallback((searchTerm: string): Business[] => {
    if (!searchTerm.trim()) return businesses;
    
    const term = searchTerm.toLowerCase();
    return businesses.filter(business => 
      business.name.toLowerCase().includes(term) ||
      business.description?.toLowerCase().includes(term) ||
      business.address?.toLowerCase().includes(term)
    );
  }, [businesses]);

  // Get active businesses only
  const getActiveBusinesses = useCallback((): Business[] => {
    return businesses.filter(business => business.isActive);
  }, [businesses]);

  // Initial fetch on mount - only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBusinesses();
    } else {
      // Reset state when not authenticated
      setBusinesses([]);
      setIsLoading(false);
      setError(null);
    }
  }, [fetchBusinesses, isAuthenticated]);

  return {
    businesses,
    isLoading,
    error,
    fetchBusinesses,
    refresh,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    searchBusinesses,
    getActiveBusinesses,
  };
};