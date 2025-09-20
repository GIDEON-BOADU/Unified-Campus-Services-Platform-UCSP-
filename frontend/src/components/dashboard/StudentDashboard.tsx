import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// import { LoadingSpinner } from '../common/LoadingSpinner';
// import { useStudentDashboard } from '../../hooks/useStudentDashboard';
import { StudentOrderManagement } from './StudentOrderManagement';
import { StudentBookingManagement } from './StudentBookingManagement';
import { StudentReviewManagement } from './StudentReviewManagement';
import { StudentPaymentHistory } from './StudentPaymentHistory';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';
import { studentService } from '../../services/student';
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
  Search
} from 'lucide-react';

// Navigation sections
type NavigationSection = 'overview' | 'orders' | 'bookings' | 'reviews' | 'payments' | 'profile' | 'settings' | 'notifications';

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string | undefined;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768); // Start closed on mobile
  
  // Real-time notifications
  const { stats: notificationStats } = useRealtimeNotifications();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeBookings: 0,
    totalSpent: 0,
    pendingPayments: 0,
    averageRating: 0,
    totalReviews: 0
  });

  // Fetch student stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const studentStats = await studentService.getStudentStats();
        setStats(studentStats);
      } catch (error) {
        console.error('Error fetching student stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Handle window resize for sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true); // Always open on desktop
      } else {
        setIsSidebarOpen(false); // Always closed on mobile
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle touch gestures for mobile sidebar
  useEffect(() => {
    let startX = 0;
    let currentX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const diffX = startX - currentX;
      // Swipe left to close sidebar (only on mobile when sidebar is open)
      if (diffX > 50 && isSidebarOpen && window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSidebarOpen]);

  // Navigation items
  const navigationItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Overview & quick stats'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingCart className="w-5 h-5" />,
      description: 'Manage your orders',
      badge: stats.totalOrders.toString()
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Manage your bookings',
      badge: stats.activeBookings.toString()
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: <Star className="w-5 h-5" />,
      description: 'Your service reviews',
      badge: stats.totalReviews.toString()
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Payment history',
      badge: stats.pendingPayments.toString()
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      description: 'Personal information'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Account preferences'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Alerts & updates',
      badge: notificationStats.unread > 0 ? notificationStats.unread.toString() : undefined
    }
  ];

  // Render different sections based on active navigation
  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12 bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-3xl border border-green-100 shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Student Hub! 🎓</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Manage your orders, bookings, and reviews all in one place. 
                Track your spending and discover amazing campus services.
              </p>
              
              {/* Student User Info - Improved Mobile Layout */}
              <div className="bg-white rounded-2xl border border-green-200 p-4 sm:p-6 max-w-2xl mx-auto shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user?.firstName || 'Student'}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'S'}
                      </span>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 break-all">{user?.email}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Active Student</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      }) : 'Recently'}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                    Verified Student
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview - Improved Mobile Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Orders</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active Bookings</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.activeBookings}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Spent</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">${stats.totalSpent}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending Payments</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Average Rating</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Reviews</p>
                    <p className="text-xl sm:text-2xl font-bold text-indigo-600">{stats.totalReviews}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Improved Mobile Layout */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/services')}
                  className="group bg-gradient-to-br from-ucsp-green-500 to-ucsp-green-600 text-white p-4 sm:p-6 rounded-2xl hover:from-ucsp-green-600 hover:to-ucsp-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer touch-manipulation active:scale-95"
                >
                  <div className="text-center">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm font-medium leading-tight">Browse Services</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('orders')}
                  className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer touch-manipulation active:scale-95"
                >
                  <div className="text-center">
                    <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm font-medium leading-tight">View Orders</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('bookings')}
                  className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer touch-manipulation active:scale-95"
                >
                  <div className="text-center">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm font-medium leading-tight">Manage Bookings</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('reviews')}
                  className="group bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 sm:p-6 rounded-2xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer touch-manipulation active:scale-95"
                >
                  <div className="text-center">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm font-medium leading-tight">Write Reviews</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('payments')}
                  className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer touch-manipulation active:scale-95"
                >
                  <div className="text-center">
                    <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm font-medium leading-tight">Payment History</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return <StudentOrderManagement />;

      case 'bookings':
        return <StudentBookingManagement />;

      case 'reviews':
        return <StudentReviewManagement />;

      case 'payments':
        return <StudentPaymentHistory />;

      case 'profile':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
              <p className="text-lg text-gray-600">Manage your personal information and preferences</p>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management Coming Soon</h3>
              <p className="text-gray-600">This feature will be available in future updates</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-lg text-gray-600">Configure your account preferences and notifications</p>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Coming Soon</h3>
              <p className="text-gray-600">Account configuration will be available in future updates</p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-lg text-gray-600">Stay updated with important alerts and real-time updates</p>
              </div>
              <NotificationCenter className="relative" />
            </div>
            
            {/* Real-time Notifications Content */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Bell className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Notifications</h3>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Get instant notifications about your bookings, orders, and important updates. 
                  All notifications are delivered in real-time via WebSocket connection.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Booking Updates</h4>
                    <p className="text-sm text-gray-600">Get notified when your bookings are confirmed or updated</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Order Status</h4>
                    <p className="text-sm text-gray-600">Real-time updates about your order status and delivery</p>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Reviews & Feedback</h4>
                    <p className="text-sm text-gray-600">Get notified when vendors respond to your reviews</p>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-2">How it works:</h4>
                  <ol className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
                    <li>1. Book services or place orders</li>
                    <li>2. Receive instant notifications via WebSocket</li>
                    <li>3. Click the bell icon to view all notifications</li>
                    <li>4. Stay updated with real-time status changes</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          style={{ touchAction: 'none' }}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${
        isSidebarOpen 
          ? 'w-80' 
          : 'w-20'
        } ${
          isSidebarOpen 
            ? 'fixed md:relative inset-y-0 left-0 z-50 md:z-auto' 
            : 'relative'
        } bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 shadow-lg md:shadow-none`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Student Hub</h2>
                  <p className="text-sm text-gray-500">Campus Services</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto relative group">
                <Package className="w-6 h-6 text-white" />
                {/* Mobile hint */}
                <div className="md:hidden absolute -right-1 -top-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:block"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            
            {/* Mobile close button - more prominent */}
            {isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden absolute top-4 right-4 p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-left group touch-manipulation ${
                activeSection === item.id
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <div className={`flex-shrink-0 ${
                activeSection === item.id ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700'
              }`}>
                {item.icon}
              </div>
              
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                </div>
              )}
              
              {isSidebarOpen && activeSection === item.id && (
                <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95 touch-manipulation"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Student Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter className="relative" />
            </div>
          </div>
        </div>
        
        {/* Main Container with improved mobile responsiveness */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Mobile spacing adjustment */}
          <div className="md:hidden h-4"></div>
          
          {/* Content wrapper with better mobile handling */}
          <div className="max-w-7xl mx-auto">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}; 
