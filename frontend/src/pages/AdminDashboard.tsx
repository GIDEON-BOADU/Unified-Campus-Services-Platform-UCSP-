import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  ArrowRight
} from 'lucide-react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BusinessService } from '../services/businesses';
import { VendorEnlistment } from '../types';

export const AdminDashboard: React.FC = () => {
  const [applications, setApplications] = useState<VendorEnlistment[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBusinesses: 0,
    pendingApplications: 0,
    platformRevenue: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load businesses data
      const businessesData = await BusinessService.getAllBusinesses();
      
      // MVP: Use placeholder data for applications
      const applicationsData: VendorEnlistment[] = [];
      
      setApplications(applicationsData);
      setBusinesses(businessesData);
      
      // Calculate stats
      setStats({
        totalUsers: 1234, // This would come from a user stats API
        activeBusinesses: businessesData.filter((b: any) => b.isActive).length,
        pendingApplications: 0, // MVP: No applications yet
        platformRevenue: 45678 // This would come from a revenue API
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { 
      name: 'Total Users', 
      value: stats.totalUsers.toString(), 
      change: '+12%', 
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      name: 'Active Businesses', 
      value: stats.activeBusinesses.toString(), 
      change: '+5', 
      changeType: 'positive' as const,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      name: 'Pending Applications', 
      value: stats.pendingApplications.toString(), 
      change: '-3', 
      changeType: 'negative' as const,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    { 
      name: 'Platform Revenue', 
      value: `$${stats.platformRevenue.toLocaleString()}`, 
      change: '+8%', 
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'application',
      message: `${stats.pendingApplications} pending vendor applications`,
      time: '2 hours ago',
      status: 'pending',
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      id: 2,
      type: 'business',
      message: `${stats.activeBusinesses} active businesses`,
      time: '4 hours ago',
      status: 'completed',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 3,
      type: 'user',
      message: `${stats.totalUsers} registered users`,
      time: '6 hours ago',
      status: 'completed',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 4,
      type: 'revenue',
      message: `$${stats.platformRevenue.toLocaleString()} total revenue`,
      time: '8 hours ago',
      status: 'completed',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const quickActions = [
    {
      name: 'Review Applications',
      description: `${stats.pendingApplications} pending vendor applications`,
      href: '/admin/vendor-requests',
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      count: stats.pendingApplications
    },
    {
      name: 'Manage Businesses',
      description: `${stats.activeBusinesses} active businesses`,
      href: '/admin/businesses',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      count: stats.activeBusinesses
    },
    {
      name: 'User Management',
      description: `${stats.totalUsers} registered users`,
      href: '/admin/users',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      count: stats.totalUsers
    },
    {
      name: 'View Analytics',
      description: 'Platform performance metrics',
      href: '/admin/analytics',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      count: null
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
              <p className="text-blue-100">
                Here's what's happening on the UCSP platform today.
              </p>
            </div>
            <div className="hidden md:block">
              <Activity className="h-16 w-16 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <DashboardStats stats={dashboardStats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <Link 
                to="/admin/vendor-requests"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {action.name}
                      </h3>
                      <p className="text-xs text-gray-500">{action.description}</p>
                      {action.count !== null && (
                        <p className="text-xs font-medium text-gray-700 mt-1">
                          {action.count} total
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link 
                to="/admin/analytics"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-xs text-green-600">+12% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.activeBusinesses}</div>
              <div className="text-sm text-gray-600">Active Businesses</div>
              <div className="text-xs text-green-600">+5 from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">${stats.platformRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-xs text-green-600">+8% from last month</div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
          <div className="space-y-3">
            {stats.pendingApplications > 0 ? (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    {stats.pendingApplications} vendor applications pending review
                  </p>
                  <p className="text-xs text-yellow-700">
                    Applications have been waiting for more than 24 hours
                  </p>
                </div>
                <Link 
                  to="/admin/vendor-requests"
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Review now
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    All vendor applications reviewed
                  </p>
                  <p className="text-xs text-green-700">
                    No pending applications to review
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  System running smoothly
                </p>
                <p className="text-xs text-green-700">
                  All services are operational with 99.9% uptime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}; 