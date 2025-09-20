import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useOrderManagement } from '../../hooks/useOrderManagement';
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  User, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  Edit,
  MoreVertical,
  SortAsc,
  SortDesc,
  Download,
  Printer,
  BarChart3,
  MapPin,
  MessageCircle,
  Plus,
  Settings,
  Bell,
  TrendingUp,
  Activity
} from 'lucide-react';

interface EnhancedStudentOrderManagementProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onUpdateOrder: (orderId: number, updates: Partial<Order>) => void;
}

export const EnhancedStudentOrderManagement: React.FC<EnhancedStudentOrderManagementProps> = ({
  orders,
  isLoading,
  error,
  onRefresh,
  onUpdateOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showStats, setShowStats] = useState(false);

  // Use the order management hook
  const {
    filteredOrders,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
    filters,
    currentPage,
    totalPages,
    itemsPerPage,
    createOrder,
    updateOrder,
    cancelOrder,
    deleteOrder,
    refreshOrders,
    setFilters,
    setSearchQuery: setSearchQueryHook,
    clearFilters,
    setCurrentPage,
    setItemsPerPage,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
  } = useOrderManagement();

  // Filter orders based on local state
  const filteredOrdersLocal = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === '' || order.status === selectedStatus;
    
    const matchesDateFrom = dateFrom === '' || new Date(order.created_at) >= new Date(dateFrom);
    const matchesDateTo = dateTo === '' || new Date(order.created_at) <= new Date(dateTo);
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Sort orders
  const sortedOrders = [...filteredOrdersLocal].sort((a, b) => {
    const aValue = a[sortField as keyof Order];
    const bValue = b[sortField as keyof Order];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get status color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'processing':
        return <Activity className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Handle order actions
  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const success = await cancelOrder(orderId);
      if (success) {
        onRefresh();
      }
    }
  };

  const handleUpdateOrder = async (orderId: number, updates: Partial<Order>) => {
    const success = await updateOrder(orderId, updates);
    if (success) {
      onUpdateOrder(orderId, updates);
    }
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => o.status === 'pending').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalValue: orders.reduce((sum, order) => sum + order.total_amount, 0),
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Manage your service orders and track their status</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </button>
          
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>{viewMode === 'grid' ? 'List' : 'Grid'}</span>
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₵{stats.totalValue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucsp-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-ucsp-green-100 text-ucsp-green-700 border border-ucsp-green-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucsp-green-500 focus:border-transparent"
            >
              <option value="created_at">Date</option>
              <option value="service_name">Service</option>
              <option value="total_amount">Amount</option>
              <option value="status">Status</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucsp-green-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucsp-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ucsp-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedStatus || dateFrom || dateTo 
                ? 'Try adjusting your filters to see more results.'
                : 'You haven\'t placed any orders yet.'
              }
            </p>
            {!searchQuery && !selectedStatus && !dateFrom && !dateTo && (
              <button
                onClick={() => window.location.href = '/services'}
                className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse Services
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-ucsp-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-ucsp-green-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.service_name}</h3>
                      <p className="text-sm text-gray-600">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">₵{order.total_amount.toFixed(2)}</p>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Service:</span> {order.service_name}</p>
                          <p><span className="font-medium">Quantity:</span> {order.quantity}</p>
                          <p><span className="font-medium">Unit Price:</span> ₵{order.unit_price.toFixed(2)}</p>
                          <p><span className="font-medium">Total Amount:</span> ₵{order.total_amount.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Status Information</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Status:</span> <span className="capitalize">{order.status}</span></p>
                          <p><span className="font-medium">Created:</span> {new Date(order.created_at).toLocaleString()}</p>
                          <p><span className="font-medium">Updated:</span> {new Date(order.updated_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {order.special_instructions && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.special_instructions}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end space-x-2">
                      <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>Contact Vendor</span>
                      </button>
                      
                      <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      
                      <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Printer className="w-4 h-4" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
