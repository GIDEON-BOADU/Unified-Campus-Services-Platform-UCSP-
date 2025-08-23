import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export interface TokenStatus {
  isValid: boolean;
  expiry: number | null;
  timeUntilExpiry: number;
  formattedExpiry: string;
  isExpiringSoon: boolean;
  needsRefresh: boolean;
}

export const useTokenStatus = (updateInterval = 1000) => {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    isValid: false,
    expiry: null,
    timeUntilExpiry: 0,
    formattedExpiry: 'No token',
    isExpiringSoon: false,
    needsRefresh: false,
  });

  useEffect(() => {
    const updateTokenStatus = () => {
      const isValid = apiClient.isTokenValid();
      const expiry = apiClient.getTokenExpiry();
      const timeUntilExpiry = apiClient.getTimeUntilExpiry();
      
      let formattedExpiry = 'No token';
      if (expiry) {
        const date = new Date(expiry * 1000);
        formattedExpiry = date.toLocaleString();
      }

      const isExpiringSoon = timeUntilExpiry > 0 && timeUntilExpiry <= 300; // 5 minutes
      const needsRefresh = timeUntilExpiry > 0 && timeUntilExpiry <= 600; // 10 minutes

      setTokenStatus({
        isValid,
        expiry,
        timeUntilExpiry,
        formattedExpiry,
        isExpiringSoon,
        needsRefresh,
      });
    };

    updateTokenStatus();
    const interval = setInterval(updateTokenStatus, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  const refreshToken = async () => {
    try {
      // Force a refresh by making a request
      await apiClient.get('/users/profile/');
      return true;
    } catch (error) {
      console.error('Manual token refresh failed:', error);
      return false;
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Force a re-render
    setTokenStatus(prev => ({ ...prev, isValid: false, expiry: null }));
  };

  return {
    ...tokenStatus,
    refreshToken,
    clearTokens,
  };
};
