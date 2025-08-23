import React, { useState } from 'react';
import { Order, OrderStatus, OrderFilters } from '../../types';
import { useOrders } from '../../hooks/useOrders';
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
  BarChart3
} from 'lucide-react';

interface OrderManagementProps {
  onOrderSelect?: (order: Order) => void;
}

export const VendorOrderManagement: React.FC<OrderManagementProps> = ({ onOrderSelect }) => {
  const {
    orders,
    stats,
    isLoading,
    error,
    filters,
    updateOrderStatus,
    searchOrders,
    filterByStatus,
    filterByDateRange,
    sortOrders,
    refreshOrders,
    getOrdersByStatusCount
  } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrders(searchQuery);
  };

  // Handle status filter
  const handleStatusFilter = (status: OrderStatus | '') => {
    setSelectedStatus(status);
    filterByStatus(status || undefined);
  };

  // Handle date filter
  const handleDateFilter = () => {
    if (dateFrom && dateTo) {
      filterByDateRange(dateFrom, dateTo);
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    sortOrders(field, newOrder);
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, { order_status: newStatus });
    } catch (err) {
      console.error('Failed to update order status:', err);
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

  // Get available status transitions
  const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivering', 'completed', 'cancelled'],
      delivering: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };
    return transitions[currentStatus] || [];
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
            <p className="text-lg text-gray-600">Track and manage customer orders</p>
          </div>
        </div>
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="text-gray-600 mt-2">Loading orders...</p>
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
          <p className="text-lg text-gray-600">Track and manage customer orders</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={refreshOrders}
            disabled={isLoading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_orders}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_revenue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Order</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.average_order_value)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Statistics</h3>
            <p className="text-gray-600">Order statistics are being loaded...</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders by customer name or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleDateFilter}
                disabled={!dateFrom || !dateTo}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                Order ID
                {sortField === 'id' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="col-span-3">
              <button
                onClick={() => handleSort('customer_name')}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                Customer
                {sortField === 'customer_name' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="col-span-3">Service</div>
            <div className="col-span-1">
              <button
                onClick={() => handleSort('total_amount')}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                Amount
                {sortField === 'total_amount' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
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

                {/* Customer */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{order.customer_name}</span>
                  </div>
                </div>

                {/* Service */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{order.service_name}</span>
                  </div>
                  {order.special_instructions && (
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-32">
                      "{order.special_instructions}"
                    </div>
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
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <div className="relative">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
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

                    {/* Status Management */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Update Status</h4>
                      <div className="space-y-2">
                        {getAvailableStatuses(order.order_status).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(order.id, status)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              status === 'cancelled' 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                        {getAvailableStatuses(order.order_status).length === 0 && (
                          <p className="text-sm text-gray-500">No further status updates available</p>
                        )}
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
            <p className="text-gray-600">Orders will appear here once customers start placing orders</p>
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

export default VendorOrderManagement;
