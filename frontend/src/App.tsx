import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { TokenStatus } from './components/common/TokenStatus';
import { TokenExpiryAlert } from './components/common/TokenExpiryAlert';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { AdminBusinessManagement } from './pages/AdminBusinessManagement';
import { AdminVendorRequests } from './pages/AdminVendorRequests';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUserManagement } from './pages/AdminUserManagement';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminSettings } from './pages/AdminSettings';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VendorApplicationPage } from './pages/VendorApplicationPage';
import { ServicesPage } from './pages/ServicesPage';
import { VendorsPage } from './pages/VendorsPage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import './utils/debug'; // Import debug utilities

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
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
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/businesses" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBusinessManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/vendor-requests" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminVendorRequests />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Routes>
        
        {/* Token expiry countdown and alerts */}
        <TokenStatus />
        <TokenExpiryAlert />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;