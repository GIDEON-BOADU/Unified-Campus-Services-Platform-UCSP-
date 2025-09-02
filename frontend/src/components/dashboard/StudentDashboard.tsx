import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { studentService } from '../../services/student';
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
  AlertCircle
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

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768); // Start closed on mobile
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
              
              {/* Student User Info */}
              <div className="bg-white rounded-2xl border border-green-200 p-6 max-w-2xl mx-auto shadow-sm">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
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
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Active Student</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-6 text-sm">
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

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeBookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-purple-600">${stats.totalSpent}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.totalReviews}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveSection('orders')}
                  className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="text-center">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">View Orders</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('bookings')}
                  className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">Manage Bookings</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('reviews')}
                  className="group bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="text-center">
                    <Star className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">Write Reviews</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('payments')}
                  className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">Payment History</div>
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
      <div className="flex-1 overflow-auto">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Student Hub</span>
            </div>
            <div className="w-8 h-8"></div> {/* Spacer for centering */}
          </div>
        </div>
        
        <div className="pt-20 md:pt-20 px-4 md:px-8 pb-8">
          {/* Mobile spacing adjustment */}
          <div className="md:hidden h-4"></div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}; 