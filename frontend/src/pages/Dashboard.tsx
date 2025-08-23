import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { VendorDashboard } from '../components/dashboard/VendorDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background font-poppins flex items-center justify-center">
        <div className="text-center bg-gradient-card rounded-3xl border border-border shadow-strong p-12 max-w-md mx-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Access Denied</h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">Please sign in to access your personalized dashboard</p>
          <a 
            href="/login" 
            className="inline-flex items-center justify-center bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-medium hover:shadow-strong transform hover:-translate-y-1 hover:scale-105"
          >
            Sign In Now
          </a>
        </div>
      </div>
    );
  }

  const getDashboardComponent = () => {
    if (!user) return null;
    
    switch (user.userType) {
      case 'vendor':
        return <VendorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  const getDashboardTitle = () => {
    if (!user) return 'Dashboard';
    
    switch (user.userType) {
      case 'vendor':
        return 'Vendor Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      default:
        return 'Student Dashboard';
    }
  };

  const getDashboardDescription = () => {
    if (!user) return 'Welcome to your dashboard';
    
    switch (user.userType) {
      case 'admin':
        return 'Manage the entire Campus Hub platform with comprehensive oversight and control';
      case 'vendor':
        return 'Manage your business profile, track performance, and grow your campus presence';
      default:
        return 'Track your orders, discover new businesses, and manage your campus experience';
    }
  };

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero overflow-hidden py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-ucsp-green-400/10 via-transparent to-primary/5"></div>
        <div className="container relative mx-auto px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[0.9] tracking-tight">
              {getDashboardTitle()}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
              {getDashboardDescription()}
            </p>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-background via-ucsp-green-50/20 to-background rounded-3xl border border-border shadow-medium p-8 lg:p-12">
          {getDashboardComponent()}
        </div>
      </div>

      <Footer />
    </div>
  );
};