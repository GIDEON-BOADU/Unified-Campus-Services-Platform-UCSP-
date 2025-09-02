import React from 'react';
import { useBackgroundSession } from '../../hooks/useBackgroundSession';
import { sessionManager } from '../../services/sessionManager';

export const SessionTest: React.FC = () => {
  const { isValid, timeUntilExpiry, isRefreshing, retryCount, lastRefreshTime } = useBackgroundSession();

  const handleForceRefresh = async () => {
    const success = await sessionManager.forceRefresh();
    console.log('Force refresh result:', success);
  };

  const handleUpdateConfig = () => {
    sessionManager.updateConfig({
      refreshThreshold: 60, // 1 minute
      checkInterval: 10000, // 10 seconds
    });
    console.log('Config updated');
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Session Test Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            {isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Expires in:</span>
          <span className="font-medium text-gray-900">
            {Math.floor(timeUntilExpiry / 60)}m {timeUntilExpiry % 60}s
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Refreshing:</span>
          <span className={`font-medium ${isRefreshing ? 'text-blue-600' : 'text-gray-600'}`}>
            {isRefreshing ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Retry count:</span>
          <span className="font-medium text-gray-900">{retryCount}</span>
        </div>
        
        {lastRefreshTime && (
          <div className="flex justify-between">
            <span className="text-gray-600">Last refresh:</span>
            <span className="font-medium text-gray-900">
              {new Date(lastRefreshTime).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <button
          onClick={handleForceRefresh}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Force Refresh
        </button>
        
        <button
          onClick={handleUpdateConfig}
          className="w-full px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
        >
          Update Config
        </button>
      </div>
    </div>
  );
};
