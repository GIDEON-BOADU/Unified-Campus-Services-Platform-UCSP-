import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Star, 
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
  Trash2,
  Plus,
  SortAsc,
  SortDesc,
  MessageCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

// Review interface based on backend model
interface Review {
  id: number;
  service: number;
  service_name: string;
  user: number;
  user_name: string;
  vendor_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export const StudentReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Mock data for MVP - will be replaced with real API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReviews([
        {
          id: 1,
          service: 1,
          service_name: "Campus Coffee - Espresso",
          user: 1,
          user_name: "John Doe",
          vendor_name: "Campus Coffee Corner",
          rating: 5,
          comment: "Amazing coffee! The barista was very friendly and the espresso was perfectly brewed. Will definitely order again!",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          service: 2,
          service_name: "Study Space - Private Room",
          user: 1,
          user_name: "John Doe",
          vendor_name: "Study Hub",
          rating: 4,
          comment: "Great study environment. The room was clean and quiet. Only giving 4 stars because the AC was a bit too cold.",
          created_at: "2024-01-14T14:00:00Z",
          updated_at: "2024-01-14T14:00:00Z"
        },
        {
          id: 3,
          service: 3,
          service_name: "Fitness Center - Personal Training",
          user: 1,
          user_name: "John Doe",
          vendor_name: "Campus Fitness",
          rating: 3,
          comment: "The trainer was knowledgeable but the session felt rushed. Equipment was in good condition though.",
          created_at: "2024-01-13T16:00:00Z",
          updated_at: "2024-01-13T16:00:00Z"
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

  // Handle rating filter
  const handleRatingFilter = (rating: number | '') => {
    setSelectedRating(rating);
    // TODO: Implement rating filtering
    console.log('Filtering by rating:', rating);
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

  // Handle review deletion
  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        // TODO: Implement review deletion API call
        console.log('Deleting review:', reviewId);
        
        // Update local state
        setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
      } catch (err) {
        console.error('Failed to delete review:', err);
        setError('Failed to delete review. Please try again.');
      }
    }
  };

  // Handle review editing
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowWriteReview(true);
  };

  // Handle review submission (create/update)
  const handleSubmitReview = async (reviewData: Partial<Review>) => {
    try {
      if (editingReview) {
        // TODO: Implement review update API call
        console.log('Updating review:', reviewData);
        
        // Update local state
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === editingReview.id 
              ? { ...review, ...reviewData, updated_at: new Date().toISOString() }
              : review
          )
        );
      } else {
        // TODO: Implement review creation API call
        console.log('Creating new review:', reviewData);
        
        // Add to local state
        const newReview: Review = {
          id: Date.now(), // Temporary ID
          service: 0, // Will be set by API
          service_name: '', // Will be set by API
          user: 1, // Current user ID
          user_name: 'John Doe', // Current user name
          vendor_name: '', // Will be set by API
          rating: reviewData.rating || 5,
          comment: reviewData.comment || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setReviews(prevReviews => [newReview, ...prevReviews]);
      }
      
      setShowWriteReview(false);
      setEditingReview(null);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError('Failed to submit review. Please try again.');
    }
  };

  // Get rating display
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">({rating}/5)</span>
      </div>
    );
  };

  // Get rating badge styling
  const getRatingBadgeStyle = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800 border-green-200';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
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

  // Show loading spinner when initially loading and no reviews exist
  if (isLoading && (!reviews || reviews.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
            <p className="text-lg text-gray-600">Manage your service reviews</p>
          </div>
        </div>
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="text-gray-600 mt-2">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-lg text-gray-600">Manage your service reviews</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWriteReview(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Write Review
          </button>
          
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

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reviews by service name or vendor..."
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
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={selectedRating}
                  onChange={(e) => handleRatingFilter(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
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

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-2">
              <button
                onClick={() => handleSort('id')}
                className="flex items-center gap-2 hover:text-green-600 transition-colors"
              >
                Review ID
                {sortField === 'id' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="col-span-3">Service & Vendor</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-3">Comment</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>

        {/* Reviews */}
        <div className="divide-y divide-gray-200">
          {reviews && reviews.length > 0 ? reviews.map((review) => (
            <div key={review.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Review ID */}
                <div className="col-span-2">
                  <span className="font-medium text-gray-900">#{review.id}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(review.created_at)}
                  </div>
                  {review.updated_at !== review.created_at && (
                    <div className="text-xs text-blue-500 mt-1">
                      Edited {formatDate(review.updated_at)}
                    </div>
                  )}
                </div>

                {/* Service & Vendor */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{review.service_name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    by {review.vendor_name}
                  </div>
                </div>

                {/* Rating */}
                <div className="col-span-2">
                  {renderStars(review.rating)}
                </div>

                {/* Comment */}
                <div className="col-span-3">
                  <div className="text-sm text-gray-900 line-clamp-2">
                    {review.comment}
                  </div>
                  <button
                    onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    {expandedReview === review.id ? 'Show less' : 'Read more'}
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-blue-400 hover:text-blue-600 transition-colors"
                      title="Edit Review"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Review Details */}
              {expandedReview === review.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Full Review</h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRatingBadgeStyle(review.rating)}`}>
                        {review.rating} Stars
                      </span>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800">{review.comment}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Posted: {formatDate(review.created_at)}</span>
                      {review.updated_at !== review.created_at && (
                        <span>Last edited: {formatDate(review.updated_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )) : null}
        </div>

        {/* Empty State */}
        {(!reviews || reviews.length === 0) && !isLoading && (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">Start reviewing services to help other students make informed decisions!</p>
            <button
              onClick={() => setShowWriteReview(true)}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Write Your First Review
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-600 mt-2">Loading reviews...</p>
          </div>
        )}
      </div>

      {/* Write/Edit Review Modal */}
      {showWriteReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingReview ? 'Edit Review' : 'Write New Review'}
              </h2>
              <button
                onClick={() => {
                  setShowWriteReview(false);
                  setEditingReview(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSubmitReview({
                rating: Number(formData.get('rating')),
                comment: formData.get('comment') as string
              });
            }} className="space-y-4">
              {/* Rating Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        defaultChecked={editingReview?.rating === star}
                        className="sr-only"
                      />
                      <Star className="w-8 h-8 text-gray-300 hover:text-yellow-400 transition-colors peer-checked:text-yellow-400" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Comment</label>
                <textarea
                  name="comment"
                  rows={4}
                  defaultValue={editingReview?.comment || ''}
                  placeholder="Share your experience with this service..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowWriteReview(false);
                    setEditingReview(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
