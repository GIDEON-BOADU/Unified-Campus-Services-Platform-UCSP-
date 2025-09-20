import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AIChatbotProvider } from './contexts/AIChatbotContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SessionStatusIndicator } from './components/common/SessionStatusIndicator';
import { SimpleErrorBoundary } from './components/common/SimpleErrorBoundary';
import { ApiErrorBoundary } from './components/common/ApiErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { BundleAnalyzer } from './components/debug/BundleAnalyzer';
// import { PerformanceMonitor } from './components/debug/PerformanceMonitor';
import { ThemeProvider } from './theme/ThemeProvider';
import { GlobalAIChatbot } from './components/ai/GlobalAIChatbot';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const AdminBusinessManagement = React.lazy(() => import('./pages/AdminBusinessManagement').then(module => ({ default: module.AdminBusinessManagement })));
const AdminVendorRequests = React.lazy(() => import('./pages/AdminVendorRequests').then(module => ({ default: module.AdminVendorRequests })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminUserManagement = React.lazy(() => import('./pages/AdminUserManagement').then(module => ({ default: module.AdminUserManagement })));
const AdminAnalytics = React.lazy(() => import('./pages/AdminAnalytics').then(module => ({ default: module.AdminAnalytics })));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings').then(module => ({ default: module.AdminSettings })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const SignupPage = React.lazy(() => import('./pages/SignupPage').then(module => ({ default: module.SignupPage })));
const VendorApplicationPage = React.lazy(() => import('./pages/VendorApplicationPage').then(module => ({ default: module.VendorApplicationPage })));
const ServicesPage = React.lazy(() => import('./pages/ServicesPage').then(module => ({ default: module.ServicesPage })));
const VendorsPage = React.lazy(() => import('./pages/VendorsPage').then(module => ({ default: module.VendorsPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const HelpPage = React.lazy(() => import('./pages/HelpPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const HomePage = React.lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));

function App() {
  return (
    <SimpleErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AIChatbotProvider>
            <ToastProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="min-h-screen bg-gray-50">
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <LoadingSpinner size="xl" text="Loading..." />
                </div>
              }>
                <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/vendor-application" element={<VendorApplicationPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ApiErrorBoundary>
                <Dashboard />
              </ApiErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ApiErrorBoundary>
                <AdminDashboard />
              </ApiErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/admin/businesses" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ApiErrorBoundary>
                <AdminBusinessManagement />
              </ApiErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/admin/vendor-requests" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ApiErrorBoundary>
                <AdminVendorRequests />
              </ApiErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ApiErrorBoundary>
                <AdminUserManagement />
              </ApiErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ApiErrorBoundary>
                <AdminAnalytics />
              </ApiErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ApiErrorBoundary>
                <AdminSettings />
              </ApiErrorBoundary>
            </ProtectedRoute>
          } />
                </Routes>
              </Suspense>
              
              {/* Background session management */}
              <SessionStatusIndicator />
              
              
              {/* Development tools */}
              {import.meta.env.DEV && (
                <>
                  <BundleAnalyzer />
                  {/* <PerformanceMonitor /> */}
                </>
              )}
              
              {/* Global AI Chatbot */}
              <GlobalAIChatbot />
            </div>
          </Router>
          </ToastProvider>
          </AIChatbotProvider>
        </AuthProvider>
      </ThemeProvider>
    </SimpleErrorBoundary>
  );
}

export default App;