import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import StarRating from "./StarRating";
import axios from "axios";
import { API_BASE } from "../lib/http";

const EventReviews = ({ eventId, showTitle = true }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (eventId) {
      fetchReviews();
    }
  }, [eventId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/reviews/event/${eventId}?page=${currentPage}&limit=5`
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>}
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-4">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>}
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews yet. Be the first to review this event!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900">
          Reviews ({reviews.length > 0 ? `${reviews.length} of many` : '0'})
        </h3>
      )}
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">
                    {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {review.user?.name || 'Anonymous User'}
                  </h4>
                  <div className="flex items-center gap-2">
                    <StarRating 
                      rating={review.rating}
                      size="sm"
                      showCount={false}
                    />
                    <span className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {review.reviewText && (
              <p className="text-gray-700 leading-relaxed">
                "{review.reviewText}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

EventReviews.propTypes = {
  eventId: PropTypes.string.isRequired,
  showTitle: PropTypes.bool,
};

export default EventReviews;