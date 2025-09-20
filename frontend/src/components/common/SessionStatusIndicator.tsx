import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { useBackgroundSession } from '../../hooks/useBackgroundSession';

export const SessionStatusIndicator: React.FC = () => {
  const { isValid, timeUntilExpiry, isRefreshing, retryCount, lastRefreshTime } = useBackgroundSession();
  const [showIndicator, setShowIndicator] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Show indicator when refreshing or when there are retries
    if (isRefreshing || retryCount > 0) {
      setShowIndicator(true);
    } else {
      // Hide indicator after a delay when not refreshing
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing, retryCount]);

  if (!showIndicator) return null;

  const getStatusIcon = () => {
    if (isRefreshing) {
      return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
    }
    if (retryCount > 0) {
      return <AlertCircle className="w-4 h-4 text-orange-600" />;
    }
    if (isValid) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <Clock className="w-4 h-4 text-gray-600" />;
  };

  const getStatusText = () => {
    if (isRefreshing) {
      return 'Refreshing session...';
    }
    if (retryCount > 0) {
      return `Retry ${retryCount}/3`;
    }
    if (isValid) {
      const minutes = Math.floor(timeUntilExpiry / 60);
      return `${minutes}m remaining`;
    }
    return 'Session status';
  };

  const getStatusColor = () => {
    if (isRefreshing) return 'bg-blue-50 border-blue-200';
    if (retryCount > 0) return 'bg-orange-50 border-orange-200';
    if (isValid) return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="fixed bottom-4 right-32 z-40">
      <div
        className={`${getStatusColor()} border rounded-lg px-3 py-2 shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md`}
        onClick={() => setShowDetails(!showDetails)}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700">
            {getStatusText()}
          </span>
        </div>

        {/* Detailed status popup */}
        {showDetails && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isValid ? 'Active' : 'Invalid'}
                </span>
              </div>
              
              {isValid && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires in:</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor(timeUntilExpiry / 60)}m {timeUntilExpiry % 60}s
                  </span>
                </div>
              )}
              
              {lastRefreshTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last refresh:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(lastRefreshTime).toLocaleTimeString()}
                  </span>
                </div>
              )}
              
              {retryCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Retry attempts:</span>
                  <span className="font-medium text-orange-600">
                    {retryCount}/3
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
