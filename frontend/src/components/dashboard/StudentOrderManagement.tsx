import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
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
  MessageCircle
} from 'lucide-react';

export const StudentOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Mock data for MVP - will be replaced with real API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders([
        {
          id: 1,
          service: 1,
          service_name: "Campus Coffee - Espresso",
          customer: 1,
          customer_name: "John Doe",
          vendor_name: "Campus Coffee Corner",
          quantity: 1,
          special_instructions: "Extra hot please",
          delivery_address: "Building A, Room 101",
          order_status: 'pending' as OrderStatus,
          total_amount: 3.50,
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          service: 2,
          service_name: "Study Space - Private Room",
          customer: 1,
          customer_name: "John Doe",
          vendor_name: "Study Hub",
          quantity: 1,
          special_instructions: "Quiet area preferred",
          delivery_address: "",
          order_status: 'confirmed' as OrderStatus,
          total_amount: 15.00,
          created_at: "2024-01-14T14:00:00Z",
          updated_at: "2024-01-14T16:00:00Z"
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  // Handle status filter
  const handleStatusFilter = (status: OrderStatus | '') => {
    setSelectedStatus(status);
    // TODO: Implement status filtering
    console.log('Filtering by status:', status);
  };

  // Handle date filter
  const handleDateFilter = () => {
    if (dateFrom && dateTo) {
      // TODO: Implement date filtering
      console.log('Filtering by date range:', dateFrom, 'to', dateTo);
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    // TODO: Implement sorting
    console.log('Sorting by:', field, newOrder);
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        // TODO: Implement order cancellation API call
        console.log('Cancelling order:', orderId);
        
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, order_status: 'cancelled' as OrderStatus }
              : order
          )
        );
      } catch (err) {
        console.error('Failed to cancel order:', err);
        setError('Failed to cancel order. Please try again.');
      }
    }
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status: OrderStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      delivering: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status] || styles.pending;
  };

  // Get status icon
  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      preparing: <Package className="w-4 h-4" />,
      ready: <CheckCircle className="w-4 h-4" />,
      delivering: <Package className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || icons.pending;
  };

  // Check if order can be cancelled
  const canCancelOrder = (status: OrderStatus) => {
    return ['pending', 'confirmed'].includes(status);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  // Show loading spinner when initially loading and no orders exist
  if (isLoading && (!orders || orders.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-lg text-gray-600">Track and manage your orders</p>
          </div>
        </div>
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="text-gray-600 mt-2">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-lg text-gray-600">Track and manage your orders</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            disabled={isLoading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders by service name or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusFilter(e.target.value as OrderStatus | '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivering">Delivering</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleDateFilter}
                disabled={!dateFrom || !dateTo}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Date Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-2">
              <button
                onClick={() => handleSort('id')}
                className="flex items-center gap-2 hover:text-green-600 transition-colors"
              >
                Order ID
                {sortField === 'id' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="col-span-3">Service & Vendor</div>
            <div className="col-span-2">Delivery Info</div>
            <div className="col-span-1">
              <button
                onClick={() => handleSort('total_amount')}
                className="flex items-center gap-2 hover:text-green-600 transition-colors"
              >
                Amount
                {sortField === 'total_amount' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>

        {/* Orders */}
        <div className="divide-y divide-gray-200">
          {orders && orders.length > 0 ? orders.map((order) => (
            <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Order ID */}
                <div className="col-span-2">
                  <span className="font-medium text-gray-900">#{order.id}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(order.created_at)}
                  </div>
                </div>

                {/* Service & Vendor */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{order.service_name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    by {order.vendor_name}
                  </div>
                  {order.special_instructions && (
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-32">
                      "{order.special_instructions}"
                    </div>
                  )}
                </div>

                {/* Delivery Info */}
                <div className="col-span-2">
                  {order.delivery_address ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600 truncate max-w-24">
                        {order.delivery_address}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No delivery</span>
                  )}
                </div>

                {/* Amount */}
                <div className="col-span-1">
                  <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(order.order_status)}`}>
                      {getStatusIcon(order.order_status)}
                      <span className="ml-1">{order.order_status}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {canCancelOrder(order.order_status) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Cancel Order"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Contact Vendor"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrder === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Order Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="text-gray-900">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="text-gray-900">{formatDate(order.updated_at)}</span>
                        </div>
                        {order.delivery_address && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Address:</span>
                            <span className="text-gray-900">{order.delivery_address}</span>
                          </div>
                        )}
                        {order.special_instructions && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Special Instructions:</span>
                            <span className="text-gray-900">{order.special_instructions}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Actions</h4>
                      <div className="space-y-2">
                        {canCancelOrder(order.order_status) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                        
                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                          Contact Vendor
                        </button>
                        
                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                          Download Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )) : null}
        </div>

        {/* Empty State */}
        {(!orders || orders.length === 0) && !isLoading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Start exploring campus services to place your first order!</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-600 mt-2">Loading orders...</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
