import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginForm, RegisterForm } from '../types';
import { AuthService } from '../services/auth';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginForm) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterForm) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  updateUser: (userData: User) => void;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Proactive token refresh
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      console.log('AuthContext: Proactively refreshing authentication...');
      
      // Check if token is about to expire (within 5 minutes)
      const timeUntilExpiry = apiClient.getTimeUntilExpiry();
      if (timeUntilExpiry > 300) { // 5 minutes = 300 seconds
        console.log('AuthContext: Token still valid for', timeUntilExpiry, 'seconds');
        return true;
      }

      if (timeUntilExpiry <= 0) {
        console.log('AuthContext: Token expired, attempting refresh...');
        // Force a refresh by making a request that will trigger refresh
        try {
          await apiClient.get('/users/profile/');
          return true;
        } catch (error) {
          console.error('AuthContext: Refresh failed:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('AuthContext: Refresh auth failed:', error);
      return false;
    }
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token && !hasInitialized) {
          console.log('AuthContext: Checking existing token on mount');
          
          // Check if token is valid before making API call
          if (!apiClient.isTokenValid()) {
            console.log('AuthContext: Stored token is expired, attempting refresh...');
            const refreshSuccess = await refreshAuth();
            if (!refreshSuccess) {
              console.log('AuthContext: Token refresh failed, clearing auth state');
              AuthService.logout();
              setIsLoading(false);
              setHasInitialized(true);
              return;
            }
          }
          
          const userProfile = await AuthService.getProfile();
          console.log('AuthContext: Restored user from token:', userProfile);
          setUser(userProfile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid tokens
        AuthService.logout();
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    checkAuth();
  }, [hasInitialized, refreshAuth]);

  // Set up periodic token refresh (every 4 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const success = await refreshAuth();
      if (!success) {
        console.log('AuthContext: Periodic refresh failed, logging out');
        logout();
      }
    }, 4 * 60 * 1000); // 4 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshAuth]);

  // Login function
  const login = useCallback(async (credentials: LoginForm) => {
    try {
      console.log('AuthContext: Login called with:', credentials);
      setIsLoading(true);
      
      const { user: userData, access, refresh } = await AuthService.login(credentials);
      
      console.log('AuthContext: Login successful, user:', userData);
      
      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('AuthContext: State updated, user authenticated');
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData: RegisterForm) => {
    try {
      setIsLoading(true);
      const { user: userProfile } = await AuthService.register(userData);
      
      // Registration successful, but user needs to login
      return { success: true, message: 'Registration successful! Please login with your new account.' };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    console.log('AuthContext: Logging out user');
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Update user profile
  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
