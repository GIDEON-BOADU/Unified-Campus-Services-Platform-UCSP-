import React, { useState, useEffect, useMemo } from 'react';
import { Business, Service } from '../../types';
import { DashboardStats } from './DashboardStats';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinesses } from '../../hooks/useBusinesses';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { VendorOrderManagement } from './VendorOrderManagement';
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users,
  Plus,
  Eye,
  Edit,
  MoreVertical,
  Calendar,
  DollarSign,
  BarChart3,
  Target,
  RefreshCw,
  AlertCircle,
  XCircle,
  CheckCircle,
  Clock3,
  LayoutDashboard,
  Settings,
  Bell,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

// Mock Order type for MVP - will be moved to types file later
interface Order {
  id: number;
  customer_id: number;
  business_id: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_status: 'paid' | 'pending' | 'failed';
  created_at: string;
  updated_at: string;
}

// Navigation sections
type NavigationSection = 'overview' | 'products' | 'orders' | 'customers' | 'analytics' | 'settings' | 'notifications';

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
}

export const VendorDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Mock data for MVP - will be replaced with real API calls
  const [business] = useState<Business>({
    id: user?.id || '1',
    name: 'Campus Coffee Corner',
    description: 'Premium coffee and snacks for students',
    address: '123 University Ave, Campus Building A',
    phone: '+1234567890',
    email: user?.email || 'coffee@campus.edu',
    isActive: true,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ownerId: user?.id || '1',
    ownerName: user?.firstName + ' ' + user?.lastName || 'Business Owner'
  });

  // Mock products - will be replaced with real API calls
  const [products] = useState<Service[]>([
    {
      id: '1',
      name: 'Espresso',
      description: 'Single shot of espresso',
      price: 2.50,
      isAvailable: true,
      businessId: user?.id || '1',
      businessName: 'Campus Coffee Corner',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and foam',
      price: 3.50,
      isAvailable: true,
      businessId: user?.id || '1',
      businessName: 'Campus Coffee Corner',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ]);

  // Mock orders - will be replaced with real API calls
  const [recentOrders] = useState<Order[]>([
    {
      id: 1,
      customer_id: 1,
      business_id: 1,
      total_amount: 6.00,
      status: 'pending',
      payment_status: 'paid',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    }
  ]);

  // Navigation items
  const navigationItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Overview & quick stats'
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package className="w-5 h-5" />,
      description: 'Manage your offerings',
      badge: products.length.toString()
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingCart className="w-5 h-5" />,
      description: 'Track customer orders',
      badge: recentOrders.length.toString()
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-5 h-5" />,
      description: 'Customer management'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Performance insights'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Business configuration'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Alerts & updates',
      badge: '3'
    }
  ];

  // Real-time stats calculation
  const stats = useMemo(() => [
    { 
      name: 'Total Orders', 
      value: recentOrders.length.toString(), 
      change: '+12%', 
      changeType: 'positive' as const 
    },
    { 
      name: 'Revenue', 
      value: `$${recentOrders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}`, 
      change: '+8%', 
      changeType: 'positive' as const 
    },
    { 
      name: 'Products', 
      value: products.length.toString(), 
      change: '+2', 
      changeType: 'positive' as const 
    },
    { 
      name: 'Rating', 
      value: '4.5', 
      change: '+0.2', 
      changeType: 'positive' as const 
    }
  ], [recentOrders, products]);

  // Calculate business performance metrics
  const businessMetrics = useMemo(() => {
    const totalRevenue = recentOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const pendingOrders = recentOrders.filter(order => order.status === 'pending').length;
    const completedOrders = recentOrders.filter(order => order.status === 'completed').length;
    // For MVP, we'll use a mock low stock calculation since Service doesn't have stock_quantity
    const lowStockProducts = 0; // TODO: Add stock tracking when Product type is created
    
    return {
      totalRevenue,
      pendingOrders,
      completedOrders,
      lowStockProducts,
      totalProducts: products.length,
      lastUpdated: lastRefresh
    };
  }, [recentOrders, products, lastRefresh]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
      // TODO: Add real API calls here
      // await Promise.all([
      //   refreshBusinessData(),
      //   refreshProducts(),
      //   refreshOrders()
      // ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-muted-foreground">Loading your business dashboard...</p>
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
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl border border-blue-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Business Hub! 🚀</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Manage your campus business, track performance, and grow your customer base. 
                Everything you need to succeed is right here.
              </p>
              
              {/* Real-time Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{businessMetrics.pendingOrders}</div>
                  <div className="text-sm text-gray-600">Pending Orders</div>
                </div>
                <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">${businessMetrics.totalRevenue.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{businessMetrics.totalProducts}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">
                    {businessMetrics.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-gray-600">Last Updated</div>
                </div>
              </div>
              
              {/* Refresh Button */}
              <div className="mt-6">
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </div>

            {/* Main Stats */}
            <DashboardStats stats={stats} />

            {/* Business Overview & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Business Information */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500">Business Name</label>
                      <p className="text-lg font-semibold text-gray-900">{business.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-gray-900">{business.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500">Contact</label>
                      <p className="text-gray-900">{business.phone}</p>
                      <p className="text-gray-900">{business.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">{business.address}</p>
                    </div>
                  </div>
                  
                  {/* Business Status */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          business.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {business.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          business.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {business.isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg">
                    Edit Business Profile
                  </button>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                </div>
                
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-2xl p-4 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">${order.total_amount}</div>
                          <div className="text-sm text-gray-500">
                            {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {recentOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No orders yet</p>
                      <p className="text-sm">Orders will appear here once customers start buying</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg">
                    View All Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Products & Services</h1>
                <p className="text-lg text-gray-600">Manage your business offerings</p>
              </div>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="border border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-md transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Service
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'orders':
        return <VendorOrderManagement />;

      case 'customers':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
              <p className="text-lg text-gray-600">Manage your customer relationships</p>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Management Coming Soon</h3>
              <p className="text-gray-600">This feature will be available in future updates</p>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
              <p className="text-lg text-gray-600">Track your business performance</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
              <p className="text-lg text-gray-600">Configure your business preferences</p>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Coming Soon</h3>
              <p className="text-gray-600">Business configuration options will be available in future updates</p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-lg text-gray-600">Stay updated with important alerts</p>
            </div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications Coming Soon</h3>
              <p className="text-gray-600">Notification system will be available in future updates</p>
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
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{business.name}</h2>
                  <p className="text-sm text-gray-500">Business Dashboard</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6 text-white" />
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
        <div className="p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}; 