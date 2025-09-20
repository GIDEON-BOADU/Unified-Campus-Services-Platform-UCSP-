import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { vendorProfileService, VendorProfile, CreateVendorProfileData, UpdateVendorProfileData } from '../services/vendorProfile';

export const useVendorProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user || user.userType !== 'vendor') {
      setProfile(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const profileData = await vendorProfileService.getVendorProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching vendor profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vendor profile');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createProfile = useCallback(async (profileData: CreateVendorProfileData): Promise<VendorProfile> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newProfile = await vendorProfileService.createVendorProfile(profileData);
      setProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.error('Error creating vendor profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create vendor profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: UpdateVendorProfileData): Promise<VendorProfile> => {
    if (!profile) {
      throw new Error('No profile to update');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const updatedProfile = await vendorProfileService.updateVendorProfile(profile.id, profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error updating vendor profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update vendor profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const deleteProfile = useCallback(async (): Promise<void> => {
    if (!profile) {
      throw new Error('No profile to delete');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await vendorProfileService.deleteVendorProfile(profile.id);
      setProfile(null);
    } catch (err) {
      console.error('Error deleting vendor profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete vendor profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const refreshProfile = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Auto-fetch profile when user changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    refreshProfile,
    hasProfile: !!profile,
    isVendor: user?.userType === 'vendor'
  };
};
