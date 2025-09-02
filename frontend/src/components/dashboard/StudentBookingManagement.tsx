import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { studentService, Booking } from '../../services/student';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  Edit,
  SortAsc,
  SortDesc,
  MapPin,
  MessageCircle,
  CalendarDays,
  AlertTriangle
} from 'lucide-react';



export const StudentBookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Booking['booking_status'] | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('booking_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedBookings = await studentService.getStudentBookings();
        setBookings(fetchedBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to fetch bookings. Please try again.');
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  // Handle status filter
  const handleStatusFilter = (status: Booking['booking_status'] | '') => {
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

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        // TODO: Implement booking cancellation API call
        console.log('Cancelling booking:', bookingId);
        
        // Update local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, booking_status: 'cancelled' }
              : booking
          )
        );
      } catch (err) {
        console.error('Failed to cancel booking:', err);
        setError('Failed to cancel booking. Please try again.');
      }
    }
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status: Booking['booking_status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return styles[status] || styles.pending;
  };

  // Get status icon
  const getStatusIcon = (status: Booking['booking_status']) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />
    };
    return icons[status] || icons.pending;
  };

  // Check if booking can be cancelled
  const canCancelBooking = (status: Booking['booking_status']) => {
    return ['pending', 'confirmed'].includes(status);
  };

  // Check if booking is upcoming
  const isUpcoming = (bookingDate: string) => {
    return new Date(bookingDate) > new Date();
  };

  // Check if booking is today
  const isToday = (bookingDate: string) => {
    const today = new Date();
    const booking = new Date(bookingDate);
    return today.toDateString() === booking.toDateString();
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

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Past';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else {
      return formatDate(dateString);
    }
  };

  // Show loading spinner when initially loading and no bookings exist
  if (isLoading && (!bookings || bookings.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-lg text-gray-600">Manage your service bookings</p>
          </div>
        </div>
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="text-gray-600 mt-2">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-lg text-gray-600">Manage your service bookings</p>
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
              placeholder="Search bookings by service name or vendor..."
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
                  onChange={(e) => handleStatusFilter(e.target.value as Booking['booking_status'] | '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
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

      {/* Bookings List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-2">
              <button
                onClick={() => handleSort('id')}
                className="flex items-center gap-2 hover:text-green-600 transition-colors"
              >
                Booking ID
                {sortField === 'id' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="col-span-3">Service & Vendor</div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('booking_date')}
                className="flex items-center gap-2 hover:text-green-600 transition-colors"
              >
                Booking Date
                {sortField === 'booking_date' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Actions</div>
          </div>
        </div>

        {/* Bookings */}
        <div className="divide-y divide-gray-200">
          {bookings && bookings.length > 0 ? bookings.map((booking) => (
            <div key={booking.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Booking ID */}
                <div className="col-span-2">
                  <span className="font-medium text-gray-900">#{booking.id}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(booking.created_at)}
                  </div>
                </div>

                {/* Service & Vendor */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{booking.service_name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    by {booking.vendor_name}
                  </div>
                  {booking.notes && (
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-32">
                      "{booking.notes}"
                    </div>
                  )}
                </div>

                {/* Booking Date */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(booking.booking_date)}
                      </div>
                      <div className={`text-xs ${
                        isToday(booking.booking_date) 
                          ? 'text-orange-600 font-medium' 
                          : isUpcoming(booking.booking_date) 
                            ? 'text-green-600' 
                            : 'text-gray-500'
                      }`}>
                        {formatDateDisplay(booking.booking_date)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(booking.booking_status)}`}>
                      {getStatusIcon(booking.booking_status)}
                      <span className="ml-1">{booking.booking_status}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      {expandedBooking === booking.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {canCancelBooking(booking.booking_status) && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Cancel Booking"
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

                    {isUpcoming(booking.booking_date) && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Upcoming</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Booking Details */}
              {expandedBooking === booking.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Booking Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking Date:</span>
                          <span className="text-gray-900">{formatDate(booking.booking_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900">{formatDate(booking.created_at)}</span>
                        </div>
                        {booking.notes && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Notes:</span>
                            <span className="text-gray-900">{booking.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Actions */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Booking Actions</h4>
                      <div className="space-y-2">
                        {canCancelBooking(booking.booking_status) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            Cancel Booking
                          </button>
                        )}
                        
                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                          Contact Vendor
                        </button>
                        
                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                          Reschedule
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
        {(!bookings || bookings.length === 0) && !isLoading && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">Start exploring campus services to make your first booking!</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-600 mt-2">Loading bookings...</p>
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
