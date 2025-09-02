import { useState, useEffect } from 'react';
import { sessionManager } from '../services/sessionManager';

export interface BackgroundSessionStatus {
  isValid: boolean;
  timeUntilExpiry: number;
  isRefreshing: boolean;
  retryCount: number;
  lastRefreshTime: number | null;
  sessionExpired: boolean;
}

export const useBackgroundSession = (updateInterval = 5000) => {
  const [status, setStatus] = useState<BackgroundSessionStatus>({
    isValid: false,
    timeUntilExpiry: 0,
    isRefreshing: false,
    retryCount: 0,
    lastRefreshTime: null,
    sessionExpired: false,
  });

  useEffect(() => {
    const updateStatus = () => {
      const sessionStatus = sessionManager.getSessionStatus();
      setStatus(prev => ({
        ...sessionStatus,
        lastRefreshTime: prev.lastRefreshTime,
        sessionExpired: prev.sessionExpired,
      }));
    };

    // Initial status update
    updateStatus();

    // Set up interval for status updates
    const interval = setInterval(updateStatus, updateInterval);

    // Listen for token refresh events
    const handleTokenRefreshed = (event: CustomEvent) => {
      setStatus(prev => ({
        ...prev,
        lastRefreshTime: event.detail.timestamp,
        isRefreshing: false,
        retryCount: 0,
      }));
    };

    // Listen for session expiry events
    const handleSessionExpired = () => {
      setStatus(prev => ({
        ...prev,
        sessionExpired: true,
        isValid: false,
        isRefreshing: false,
      }));
    };

    // Add event listeners
    window.addEventListener('tokenRefreshed', handleTokenRefreshed as EventListener);
    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed as EventListener);
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, [updateInterval]);

  const forceRefresh = async (): Promise<boolean> => {
    setStatus(prev => ({ ...prev, isRefreshing: true }));
    const success = await sessionManager.forceRefresh();
    if (!success) {
      setStatus(prev => ({ ...prev, isRefreshing: false }));
    }
    return success;
  };

  const updateConfig = (config: Partial<{
    refreshThreshold: number;
    checkInterval: number;
    maxRetries: number;
    retryDelay: number;
  }>) => {
    sessionManager.updateConfig(config);
  };

  return {
    ...status,
    forceRefresh,
    updateConfig,
  };
};
