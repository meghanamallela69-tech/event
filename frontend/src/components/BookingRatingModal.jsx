import { useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE, authHeaders } from "../lib/http";

const BookingRatingModal = ({ isOpen, booking, onClose, onSuccess, token }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/event-bookings/${booking._id}/rating`,
        { rating, review },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Rating submitted successfully!");
        setRating(0);
        setReview("");
        onSuccess();
        onClose();
      } else {
        toast.error(response.data.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Rating error:", error);
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Rate Your Experience</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Event: <strong>{booking.eventTitle}</strong>
        </p>

        {/* Star Rating */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">How would you rate this event?</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
                disabled={loading}
              >
                <FaStar
                  size={32}
                  className={`${
                    star <= (hoverRating || rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share your feedback (optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us about your experience..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="4"
            disabled={loading}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            disabled={loading || rating === 0}
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingRatingModal;
