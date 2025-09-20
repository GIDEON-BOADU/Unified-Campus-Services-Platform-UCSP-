import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'vendor' | 'admin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const userType = user.userType || (user as any).user_type;
    console.log('ProtectedRoute - userType:', userType, 'allowedRoles:', allowedRoles);
    
    if (!allowedRoles.includes(userType as any)) {
      console.log('ProtectedRoute - User type not allowed, redirecting based on role');
      // Redirect to appropriate dashboard based on user role
      switch (userType) {
        case 'student':
          return <Navigate to="/dashboard" replace />;
        case 'vendor':
          return <Navigate to="/dashboard" replace />;
        case 'admin':
          return <Navigate to="/admin/dashboard" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
}; 