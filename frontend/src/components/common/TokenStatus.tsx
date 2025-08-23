import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const TokenStatus: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<{
    isValid: boolean;
    expiry: number | null;
    timeUntilExpiry: number;
    formattedExpiry: string;
  } | null>(null);

  useEffect(() => {
    const updateTokenInfo = () => {
      const isValid = apiClient.isTokenValid();
      const expiry = apiClient.getTokenExpiry();
      const timeUntilExpiry = apiClient.getTimeUntilExpiry();
      
      let formattedExpiry = 'No token';
      if (expiry) {
        const date = new Date(expiry * 1000);
        formattedExpiry = date.toLocaleString();
      }

      setTokenInfo({
        isValid,
        expiry,
        timeUntilExpiry,
        formattedExpiry,
      });
    };

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  if (!tokenInfo) return null;

  const getStatusIcon = () => {
    if (!tokenInfo.expiry) return <XCircle className="w-4 h-4 text-red-500" />;
    if (tokenInfo.timeUntilExpiry <= 0) return <XCircle className="w-4 h-4 text-red-500" />;
    if (tokenInfo.timeUntilExpiry <= 300) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!tokenInfo.expiry) return 'No Token';
    if (tokenInfo.timeUntilExpiry <= 0) return 'Expired';
    if (tokenInfo.timeUntilExpiry <= 300) return 'Expiring Soon';
    return 'Valid';
  };

  const getStatusColor = () => {
    if (!tokenInfo.expiry) return 'text-red-600';
    if (tokenInfo.timeUntilExpiry <= 0) return 'text-red-600';
    if (tokenInfo.timeUntilExpiry <= 300) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Only show in development mode
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <span className={`font-medium ${getStatusColor()}`}>
          Token Status: {getStatusText()}
        </span>
      </div>
      
      {tokenInfo.expiry && (
        <div className="space-y-1 text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Expires: {tokenInfo.formattedExpiry}</span>
          </div>
          
          {tokenInfo.timeUntilExpiry > 0 && (
            <div className="flex items-center gap-2">
              <span>Time left: {Math.floor(tokenInfo.timeUntilExpiry / 60)}m {tokenInfo.timeUntilExpiry % 60}s</span>
            </div>
          )}
          
          {tokenInfo.timeUntilExpiry <= 300 && tokenInfo.timeUntilExpiry > 0 && (
            <div className="text-yellow-600 text-xs">
              ⚠️ Token expires soon
            </div>
          )}
        </div>
      )}
    </div>
  );
};
