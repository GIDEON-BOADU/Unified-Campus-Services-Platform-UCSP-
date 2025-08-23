import React, { useState, useEffect } from 'react';
import { useTokenStatus } from '../../hooks/useTokenStatus';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, RefreshCw, LogOut, X } from 'lucide-react';

export const TokenExpiryAlert: React.FC = () => {
  const { isExpiringSoon, needsRefresh, timeUntilExpiry, refreshToken } = useTokenStatus();
  const { logout } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Show alert when token is expiring soon (within 5 minutes)
    if (isExpiringSoon && !showAlert) {
      setShowAlert(true);
    }
  }, [isExpiringSoon, showAlert]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshToken();
      if (success) {
        setShowAlert(false);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowAlert(false);
  };

  const handleDismiss = () => {
    setShowAlert(false);
  };

  if (!showAlert || !isExpiringSoon) return null;

  const minutesLeft = Math.floor(timeUntilExpiry / 60);
  const secondsLeft = timeUntilExpiry % 60;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-md">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Session Expiring Soon
            </h3>
            
            <p className="text-sm text-yellow-700 mb-3">
              Your session will expire in{' '}
              <span className="font-medium">
                {minutesLeft}m {secondsLeft}s
              </span>
              . Please refresh your session to continue.
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
              </button>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-yellow-400 hover:text-yellow-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
