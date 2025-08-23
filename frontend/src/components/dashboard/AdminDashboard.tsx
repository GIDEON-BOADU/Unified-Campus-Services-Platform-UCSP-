import React, { useEffect, useState } from 'react';
import { DashboardStats } from './DashboardStats';
import { useAuth } from '../../contexts/AuthContext';
import { adminService, type AdminStats, type AdminActivity, type QuickActionCounts } from '../../services/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  ShoppingCart,
  AlertTriangle,
  Settings,
  BarChart3,
  Shield,
  Bell,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  Activity,
  Globe,
  Database,
  Zap,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// Navigation sections
type NavigationSection = 'overview' | 'users' | 'businesses' | 'applications' | 'orders' | 'complaints' | 'analytics' | 'settings' | 'system';

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  color: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [quickCounts, setQuickCounts] = useState<QuickActionCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, activitiesData, countsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentActivities(5),
          adminService.getQuickActionCounts(),
        ]);

        setStats(statsData);
        setActivities(activitiesData);
        setQuickCounts(countsData);
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Navigation items
  const navigationItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Dashboard overview',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'users',
      label: 'Users',
      icon: <Users className="w-5 h-5" />,
      description: 'Manage platform users',
      badge: stats?.totalUsers?.toString() || '0',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'businesses',
      label: 'Businesses',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Business management',
      badge: stats?.activeBusinesses?.toString() || '0',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: <FileText className="w-5 h-5" />,
      description: 'Vendor applications',
      badge: stats?.pendingApplications?.toString() || '0',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingCart className="w-5 h-5" />,
      description: 'Order management',
      badge: quickCounts?.todayOrders?.toString() || '0',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'complaints',
      label: 'Complaints',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'Handle complaints',
      badge: quickCounts?.newComplaints?.toString() || '0',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Platform analytics',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Platform configuration',
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'system',
      label: 'System',
      icon: <Database className="w-5 h-5" />,
      description: 'System monitoring',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'applications':
        navigate('/admin/vendor-requests');
        break;
      case 'businesses':
        navigate('/admin/businesses');
        break;
      case 'complaints':
        navigate('/admin/complaints');
        break;
      case 'orders':
        navigate('/admin/orders');
        break;
      default:
        break;
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render different sections based on active navigation
  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-blue-100 shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Admin Control Center! 🚀</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Manage the entire Campus Hub platform with comprehensive oversight and control. 
                Monitor performance, manage users, and ensure platform security.
              </p>
              
              {/* Admin User Info */}
              <div className="bg-white rounded-2xl border border-blue-200 p-6 max-w-2xl mx-auto shadow-sm">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user?.firstName || 'Admin'}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'A'}
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
                      <span className="text-sm font-medium text-green-600">Super Administrator</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500">Last Login</p>
                    <p className="font-medium text-gray-900">
                      {new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                    Active Session
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="mb-8">
                <DashboardStats stats={[
                  {
                    name: 'Total Users',
                    value: stats.totalUsers.toLocaleString(),
                    change: stats.userGrowth,
                    changeType: (stats.userGrowth.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative'
                  },
                  {
                    name: 'Active Businesses',
                    value: stats.activeBusinesses.toLocaleString(),
                    change: stats.businessGrowth,
                    changeType: (stats.businessGrowth.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative'
                  },
                  {
                    name: 'Pending Applications',
                    value: stats.pendingApplications.toLocaleString(),
                    change: stats.applicationChange,
                    changeType: (stats.applicationChange.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative'
                  },
                  {
                    name: 'Total Revenue',
                    value: `$${stats.totalRevenue.toLocaleString()}`,
                    change: stats.revenueGrowth,
                    changeType: (stats.revenueGrowth.startsWith('+') ? 'positive' : 'negative') as 'positive' | 'negative'
                  }
                ]} />
              </div>
            )}

            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleQuickAction('applications')}
                    className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{quickCounts?.pendingApplications || 0}</div>
                      <div className="text-sm font-medium">Pending Applications</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('businesses')}
                    className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{quickCounts?.activeBusinesses || 0}</div>
                      <div className="text-sm font-medium">Active Businesses</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('complaints')}
                    className="group bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{quickCounts?.newComplaints || 0}</div>
                      <div className="text-sm font-medium">New Complaints</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('orders')}
                    className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{quickCounts?.todayOrders || 0}</div>
                      <div className="text-sm font-medium">Today's Orders</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.map(activity => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200">
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          activity.status === 'pending' ? 'bg-yellow-400' :
                          activity.status === 'completed' ? 'bg-green-400' :
                          'bg-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 leading-relaxed">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTime(activity.time)}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          activity.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 shadow-sm">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Need to manage something specific?
              </h3>
              <p className="text-gray-600 mb-8 text-xl max-w-2xl mx-auto">
                Access detailed management tools for users, businesses, and platform settings
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => navigate('/admin/businesses')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  Business Management
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  Platform Settings
                </button>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-lg text-gray-600">Manage all platform users</p>
              </div>
              <button className="bg-green-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-green-700 transition-colors">
                Add User
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">User Management Coming Soon</h3>
              <p className="text-gray-600">This feature will be available in future updates</p>
            </div>
          </div>
        );

      case 'businesses':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
                <p className="text-lg text-gray-600">Manage all platform businesses</p>
              </div>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-purple-700 transition-colors">
                Add Business
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Business Management Coming Soon</h3>
              <p className="text-gray-600">This feature will be available in future updates</p>
            </div>
          </div>
        );

      case 'applications':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vendor Applications</h1>
                <p className="text-lg text-gray-600">Review and manage vendor applications</p>
              </div>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-orange-700 transition-colors">
                View All
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Applications Coming Soon</h3>
              <p className="text-gray-600">This feature will be available in future updates</p>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="text-lg text-gray-600">Monitor and manage platform orders</p>
              </div>
              <button className="bg-pink-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-pink-700 transition-colors">
                View All Orders
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Management Coming Soon</h3>
              <p className="text-gray-600">This feature will be available in future updates</p>
            </div>
          </div>
        );

      case 'complaints':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
                <p className="text-lg text-gray-600">Handle and resolve user complaints</p>
              </div>
              <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-red-700 transition-colors">
                View All Complaints
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Complaint Management Coming Soon</h3>
              <p className="text-gray-600">This feature will be available in future updates</p>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
              <p className="text-lg text-gray-600">Comprehensive platform insights and reports</p>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">Detailed analytics will be available in future updates</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
              <p className="text-lg text-gray-600">Configure platform preferences and policies</p>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Coming Soon</h3>
              <p className="text-gray-600">Platform configuration will be available in future updates</p>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
              <p className="text-lg text-gray-600">Monitor system health and performance</p>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">System Monitoring Coming Soon</h3>
              <p className="text-gray-600">System monitoring will be available in future updates</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Admin Panel</h2>
                  <p className="text-sm text-gray-500">Campus Hub Control</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`flex-shrink-0 ${
                activeSection === item.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
              }`}>
                {item.icon}
              </div>
              
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                </div>
              )}
              
              {isSidebarOpen && activeSection === item.id && (
                <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>
      </div>

              {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="pt-4 px-8 pb-8">
            {renderSection()}
          </div>
        </div>
    </div>
  );
};