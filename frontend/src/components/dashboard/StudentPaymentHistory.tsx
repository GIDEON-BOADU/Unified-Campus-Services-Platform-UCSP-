import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { studentService, Payment } from '../../services/student';
import { 
  Search, 
  Filter, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Printer,
  SortAsc,
  SortDesc,
  DollarSign,
  Building2,
  AlertTriangle,
  Info
} from 'lucide-react';

export const StudentPaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Payment['status'] | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedPayment, setExpandedPayment] = useState<number | null>(null);

  // Fetch payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPayments = await studentService.getPaymentHistory();
        setPayments(fetchedPayments);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to fetch payments. Please try again.');
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  // Handle status filter
  const handleStatusFilter = (status: Payment['status'] | '') => {
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

  // Get status badge styling
  const getStatusBadgeStyle = (status: Payment['status']) => {
    const styles: Record<Payment['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      successful: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      refunded: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return styles[status] || styles.pending;
  };

  // Get status icon
  const getStatusIcon = (status: Payment['status']) => {
    const icons: Record<Payment['status'], React.ReactElement> = {
      pending: <Clock className="w-4 h-4" />,
      processing: <Clock className="w-4 h-4" />,
      successful: <CheckCircle className="w-4 h-4" />,
      failed: <XCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      refunded: <RefreshCw className="w-4 h-4" />
    };
    return icons[status] || icons.pending;
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    if (method.toLowerCase().includes('mobile')) return <CreditCard className="w-4 h-4" />;
    if (method.toLowerCase().includes('card')) return <CreditCard className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  // Calculate payment statistics
  const paymentStats = {
    total: payments.reduce((sum, payment) => sum + payment.amount, 0),
    successful: payments.filter(p => p.status === 'successful').reduce((sum, payment) => sum + payment.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0),
    failed: payments.filter(p => p.status === 'failed').reduce((sum, payment) => sum + payment.amount, 0),
    count: payments.length,
    successfulCount: payments.filter(p => p.status === 'successful').length,
    pendingCount: payments.filter(p => p.status === 'pending').length,
    failedCount: payments.filter(p => p.status === 'failed').length
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
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

  // Show loading spinner when initially loading and no payments exist
  if (isLoading && (!payments || payments.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
            <p className="text-lg text-gray-600">Track your payment transactions</p>
          </div>
        </div>
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="text-gray-600 mt-2">Loading your payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-lg text-gray-600">Track your payment transactions</p>
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
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(paymentStats.successful)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {paymentStats.successfulCount} successful payments
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(paymentStats.pending)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {paymentStats.pendingCount} pending payments
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Payments</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(paymentStats.failed)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {paymentStats.failedCount} failed payments
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{paymentStats.count}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            All payment attempts
          </div>
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
              placeholder="Search payments by service name or vendor..."
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
                  onChange={(e) => handleStatusFilter(e.target.value as Payment['status'] | '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="successful">Successful</option>
                  <option value="failed">Failed</option>
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

      {/* Payments List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-2">
              <button
                onClick={() => handleSort('id')}
                className="flex items-center gap-2 hover:text-green-600 transition-colors"
              >
                Payment ID
                {sortField === 'id' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="col-span-3">Service & Vendor</div>
            <div className="col-span-2">Payment Details</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Actions</div>
          </div>
        </div>

        {/* Payments */}
        <div className="divide-y divide-gray-200">
          {payments && payments.length > 0 ? payments.map((payment) => (
            <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Payment ID */}
                <div className="col-span-2">
                  <span className="font-medium text-gray-900">#{payment.id}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(payment.created_at)}
                  </div>
                </div>

                {/* Service & Vendor */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {payment.booking_details?.service_name || 'Service'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {payment.booking_details?.student_name ? `by ${payment.booking_details.student_name}` : 'Payment'}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(payment.payment_method)}
                    <div>
                      <div className="font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                      <div className="text-xs text-gray-500">{payment.payment_method}</div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1">{payment.status}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedPayment(expandedPayment === payment.id ? null : payment.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      {expandedPayment === payment.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Download Receipt"
                      disabled={payment.status !== 'successful'}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Print Receipt"
                      disabled={payment.status !== 'successful'}
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {payment.status === 'failed' && (
                      <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Failed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Payment Details */}
              {expandedPayment === payment.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Payment Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="text-gray-900 font-medium">{formatCurrency(payment.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="text-gray-900">{payment.payment_method}</span>
                        </div>
                        {payment.transaction_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="text-gray-900 font-mono text-xs">{payment.transaction_id}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900">{formatDate(payment.created_at)}</span>
                        </div>
cd                         {payment.phone_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="text-gray-900">{payment.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Actions */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Payment Actions</h4>
                      <div className="space-y-2">
                        {payment.status === 'successful' && (
                          <>
                            <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                              Download Receipt
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                              Print Receipt
                            </button>
                          </>
                        )}
                        
                        {payment.status === 'failed' && (
                          <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                            Retry Payment
                          </button>
                        )}
                        
                        {payment.status === 'pending' && (
                          <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <Info className="w-4 h-4" />
                            <span>Payment is being processed. Please wait for confirmation.</span>
                          </div>
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
        {(!payments || payments.length === 0) && !isLoading && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">Start using campus services to see your payment history!</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-600 mt-2">Loading payments...</p>
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
