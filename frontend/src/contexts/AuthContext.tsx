import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { AuthService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: any) => Promise<{ success: boolean; message?: string; error?: string }>;
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



  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token && !hasInitialized) {
          console.log('AuthContext: Checking existing token on mount');
          
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
  }, [hasInitialized]);



  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await AuthService.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('Login failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    console.log('AuthContext: Logging out user');
    
    try {
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);
      console.log('AuthContext: Auth state cleared');
      
      // Clear tokens and redirect
      AuthService.logout();
      console.log('AuthContext: AuthService logout called');
      
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Force clear state even if there's an error
      setUser(null);
      setIsAuthenticated(false);
      // Force redirect
      window.location.href = '/login';
    }
  }, []);

  // Signup function
  const signup = useCallback(async (userData: any): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      setIsLoading(true);
      const result = await AuthService.signup(userData);
      
      if (result.success) {
        // Don't automatically log in after signup - let user login manually
        // This is more secure and follows best practices
      }
      
      return result;
    } catch (error) {
      console.error('Signup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
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
