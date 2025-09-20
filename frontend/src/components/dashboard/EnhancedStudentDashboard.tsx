import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useStudentDashboard } from '../../hooks/useStudentDashboard';
import { StudentOrderManagement } from './StudentOrderManagement';
import { StudentBookingManagement } from './StudentBookingManagement';
import { StudentReviewManagement } from './StudentReviewManagement';
import { StudentPaymentHistory } from './StudentPaymentHistory';
import { 
  LayoutDashboard,
  ShoppingCart,
  Calendar,
  Star,
  CreditCard,
  User,
  Bell,
  Settings,
  Menu,
  X,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react';

// Navigation sections
type NavigationSection = 'overview' | 'orders' | 'bookings' | 'reviews' | 'payments' | 'profile' | 'settings';

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

export const EnhancedStudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  
  // Use the enhanced dashboard hook
  const {
    stats,
    orders,
    bookings,
    payments,
    isLoading,
    isStatsLoading,
    isOrdersLoading,
    isBookingsLoading,
    isPaymentsLoading,
    error,
    statsError,
    ordersError,
    bookingsError,
    paymentsError,
    refreshStats,
    refreshOrders,
    refreshBookings,
    refreshPayments,
    refreshAll,
    updateOrder,
    updateBooking,
    updatePayment,
  } = useStudentDashboard();

  // Navigation items
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Dashboard overview and statistics'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingCart className="w-5 h-5" />,
      description: 'Manage your orders',
      badge: orders.filter(order => order.status === 'pending').length > 0 ? 
        orders.filter(order => order.status === 'pending').length.toString() : undefined
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Manage your appointments',
      badge: bookings.filter(booking => booking.booking_status === 'pending').length > 0 ? 
        bookings.filter(booking => booking.booking_status === 'pending').length.toString() : undefined
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: <Star className="w-5 h-5" />,
      description: 'Your reviews and ratings'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Payment history and transactions',
      badge: payments.filter(payment => payment.status === 'pending').length > 0 ? 
        payments.filter(payment => payment.status === 'pending').length.toString() : undefined
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      description: 'Your profile information'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Account settings and preferences'
    }
  ];

  // Handle window resize for sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle section change
  const handleSectionChange = (section: NavigationSection) => {
    setActiveSection(section);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Render overview section
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-ucsp-green-500 to-ucsp-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name || 'Student'}! 👋
            </h1>
            <p className="text-ucsp-green-100">
              Here's what's happening with your services today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>Next: Tomorrow 2:00 PM</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₵{stats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <Activity className="w-4 h-4 mr-1" />
            <span>This month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>Action required</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button
            onClick={refreshAll}
            className="flex items-center text-sm text-ucsp-green-600 hover:text-ucsp-green-700"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
        
        <div className="space-y-4">
          {orders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-ucsp-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Package className="w-5 h-5 text-ucsp-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.service_name}</p>
                  <p className="text-sm text-gray-500">Order #{order.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">₵{order.total_amount}</p>
                <p className={`text-xs px-2 py-1 rounded-full ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </p>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent orders</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/services')}
            className="flex items-center justify-center p-4 bg-ucsp-green-50 hover:bg-ucsp-green-100 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-ucsp-green-600 mr-2" />
            <span className="font-medium text-ucsp-green-700">Browse Services</span>
          </button>
          
          <button
            onClick={() => setActiveSection('orders')}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-700">View Orders</span>
          </button>
          
          <button
            onClick={() => setActiveSection('bookings')}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-700">Book Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Loading your dashboard..." />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-200 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshAll}
            className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-64 bg-white border-r border-gray-200 
          transition-transform duration-300 ease-in-out lg:translate-x-0`}>
          
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Student Dashboard</h2>
            
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-ucsp-green-50 text-ucsp-green-700 border border-ucsp-green-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-3 font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'orders' && (
              <StudentOrderManagement 
                orders={orders}
                isLoading={isOrdersLoading}
                error={ordersError}
                onRefresh={refreshOrders}
                onUpdateOrder={updateOrder}
              />
            )}
            {activeSection === 'bookings' && (
              <StudentBookingManagement 
                bookings={bookings}
                isLoading={isBookingsLoading}
                error={bookingsError}
                onRefresh={refreshBookings}
                onUpdateBooking={updateBooking}
              />
            )}
            {activeSection === 'reviews' && (
              <StudentReviewManagement 
                reviews={[]} // This would come from a reviews API
                isLoading={false}
                error={null}
                onRefresh={() => {}}
              />
            )}
            {activeSection === 'payments' && (
              <StudentPaymentHistory 
                payments={payments}
                isLoading={isPaymentsLoading}
                error={paymentsError}
                onRefresh={refreshPayments}
                onUpdatePayment={updatePayment}
              />
            )}
            {activeSection === 'profile' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
                <p className="text-gray-600">Profile management coming soon...</p>
              </div>
            )}
            {activeSection === 'settings' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                <p className="text-gray-600">Settings management coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
