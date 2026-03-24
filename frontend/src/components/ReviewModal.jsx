import { useState } from "react";
import PropTypes from "prop-types";
import StarRating from "./StarRating";
import axios from "axios";
import { API_BASE, authHeaders } from "../lib/http";
import useAuth from "../context/useAuth";
import toast from "react-hot-toast";

const ReviewModal = ({ isOpen, onClose, event, onReviewSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    rating: 0,
    reviewText: ""
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (newRating) => {
    setFormData(prev => ({
      ...prev,
      rating: newRating
    }));
  };

  const handleSubmit = async () => {
    if (formData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!formData.reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/reviews`,
        {
          eventId: event._id,
          rating: formData.rating,
          reviewText: formData.reviewText.trim()
        },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Review submitted successfully!");
        if (onReviewSuccess) {
          onReviewSuccess(response.data.review);
        }
        onClose();
        setFormData({ rating: 0, reviewText: "" });
      } else {
        throw new Error(response.data.message || "Review failed");
      }
    } catch (error) {
      console.error("Review error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Write Review</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Event Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900">{event.title}</h4>
            <p className="text-sm text-gray-600">{event.category}</p>
          </div>

          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={formData.rating}
                size="lg"
                interactive={true}
                showCount={false}
                onRatingChange={handleRatingChange}
              />
              <span className="text-sm text-gray-500">
                {formData.rating === 0 && "Click to rate"}
                {formData.rating === 1 && "Poor"}
                {formData.rating === 2 && "Fair"}
                {formData.rating === 3 && "Good"}
                {formData.rating === 4 && "Very Good"}
                {formData.rating === 5 && "Excellent"}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              name="reviewText"
              value={formData.reviewText}
              onChange={handleInputChange}
              rows="4"
              placeholder="Share your experience with this event..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              maxLength="500"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.reviewText.length}/500 characters
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex items-center justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || formData.rating === 0 || !formData.reviewText.trim()}
            className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ReviewModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  event: PropTypes.object,
  onReviewSuccess: PropTypes.func,
};

export default ReviewModal;