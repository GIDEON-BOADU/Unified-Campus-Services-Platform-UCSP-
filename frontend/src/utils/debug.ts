import { apiClient } from '../services/api';

// Debug utilities for development
export const debug = {
  // Token information
  getTokenInfo: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No access token found');
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      
      console.log('Token Info:', {
        issuedAt: new Date(payload.iat * 1000).toLocaleString(),
        expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        timeUntilExpiry: `${Math.floor(timeUntilExpiry / 60)}m ${timeUntilExpiry % 60}s`,
        isExpired: timeUntilExpiry <= 0,
        userId: payload.user_id,
        tokenType: payload.token_type,
      });
      
      return payload;
    } catch (error) {
      console.error('Failed to parse token:', error);
      return null;
    }
  },

  // Check token validity
  checkToken: () => {
    const isValid = apiClient.isTokenValid();
    const expiry = apiClient.getTokenExpiry();
    const timeUntilExpiry = apiClient.getTimeUntilExpiry();
    
    console.log('Token Status:', {
      isValid,
      expiry: expiry ? new Date(expiry * 1000).toLocaleString() : 'No expiry',
      timeUntilExpiry: `${Math.floor(timeUntilExpiry / 60)}m ${timeUntilExpiry % 60}s`,
      needsRefresh: timeUntilExpiry <= 300, // 5 minutes
    });
    
    return { isValid, expiry, timeUntilExpiry };
  },

  // Test API endpoints
  testAPI: async (endpoint = '/users/profile/') => {
    try {
      console.log(`Testing API endpoint: ${endpoint}`);
      const response = await apiClient.get(endpoint);
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  // Clear all tokens
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('All tokens cleared');
  },

  // Show all localStorage items
  showStorage: () => {
    console.log('LocalStorage contents:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value);
      }
    }
  },

  // Force token refresh
  forceRefresh: async () => {
    try {
      console.log('Forcing token refresh...');
      const response = await apiClient.get('/users/profile/');
      console.log('Refresh successful:', response);
      return true;
    } catch (error) {
      console.error('Refresh failed:', error);
      return false;
    }
  },
};

// Make debug utilities available globally in development
if (import.meta.env.DEV) {
  (window as any).debug = debug;
  console.log('Debug utilities available. Use debug.help() for available commands.');
  
  // Add help function
  debug.help = () => {
    console.log('Available debug commands:');
    console.log('debug.getTokenInfo() - Show detailed token information');
    console.log('debug.checkToken() - Check current token status');
    console.log('debug.testAPI(endpoint) - Test an API endpoint');
    console.log('debug.clearTokens() - Clear all stored tokens');
    console.log('debug.showStorage() - Show all localStorage items');
    console.log('debug.forceRefresh() - Force a token refresh');
    console.log('debug.help() - Show this help message');
  };
}
