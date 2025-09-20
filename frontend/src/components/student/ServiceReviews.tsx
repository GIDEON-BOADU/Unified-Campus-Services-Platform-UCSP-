import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageCircle, 
  User, 
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface Review {
  id: number;
  service: number;
  user: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface ServiceReviewsProps {
  serviceId: number;
  serviceName: string;
  currentRating?: number;
  totalRatings?: number;
  onReviewAdded?: () => void;
}

export const ServiceReviews: React.FC<ServiceReviewsProps> = ({
  serviceId,
  serviceName,
  currentRating = 0,
  totalRatings = 0,
  onReviewAdded
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [serviceId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/reviews/?service=${serviceId}`);
      
      // Handle different response formats
      let reviewsData: Review[] = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          reviewsData = response;
        } else if (response.reviews && Array.isArray(response.reviews)) {
          reviewsData = response.reviews;
        } else if (response.results && Array.isArray(response.results)) {
          reviewsData = response.results;
        } else if (response.data && Array.isArray(response.data)) {
          reviewsData = response.data;
        }
      }
      
      setReviews(reviewsData);
      
      // Check if current user has already reviewed
      const userReview = reviewsData.find((review: Review) => 
        review.user_name === localStorage.getItem('username')
      );
      setHasUserReviewed(!!userReview);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
      setReviews([]); // Ensure reviews is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post(`/services/${serviceId}/add_review/`, {
        rating: newRating,
        comment: newComment
      });

      // Reset form
      setNewRating(0);
      setNewComment('');
      setShowWriteReview(false);
      setHasUserReviewed(true);

      // Refresh reviews
      await fetchReviews();
      
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReviewExpansion = (reviewId: number) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            className={`w-5 h-5 ${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
            }`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingText = (rating: number) => {
    const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return texts[rating] || '';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Reviews for {serviceName}</h3>
          <div className="flex items-center gap-2 mt-1">
            {renderStars(Math.round(currentRating))}
            <span className="text-sm text-gray-600">
              {currentRating.toFixed(1)} out of 5 ({totalRatings} reviews)
            </span>
          </div>
        </div>
        
        {!hasUserReviewed && (
          <button
            onClick={() => setShowWriteReview(!showWriteReview)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Write Review
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteReview && !hasUserReviewed && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Write a Review</h4>
          
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center gap-2">
                {renderStars(newRating, true, setNewRating)}
                <span className="text-sm text-gray-600 ml-2">
                  {newRating > 0 && getRatingText(newRating)}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this service..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting || newRating === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => {
                  setShowWriteReview(false);
                  setNewRating(0);
                  setNewComment('');
                  setError(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
  {Array.isArray(reviews) && reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reviews yet. Be the first to review this service!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(reviews || []).map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const shouldTruncate = review.comment.length > 150;
            const displayComment = isExpanded || !shouldTruncate 
              ? review.comment 
              : review.comment.substring(0, 150) + '...';

            return (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">{review.user_name}</h5>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {review.updated_at !== review.created_at && (
                    <span className="text-xs text-blue-500">Edited</span>
                  )}
                </div>

                {/* Review Content */}
                <div className="ml-13">
                  <p className="text-gray-700 leading-relaxed">
                    {displayComment}
                  </p>
                  
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleReviewExpansion(review.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm mt-2 flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show More
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
