import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTimes, FaStar } from "react-icons/fa";
import { API_BASE } from "../lib/http";
import useAuth from "../context/useAuth";

const RatingModal = ({ booking, isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_BASE}/bookings/${booking._id}/rate`,
        { score: rating, review },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Thank you for your feedback!");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          maxWidth: "450px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937" }}>
            Rate Your Experience
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <FaTimes style={{ fontSize: "20px", color: "#6b7280" }} />
          </button>
        </div>

        {/* Event Info */}
        <div
          style={{
            padding: "20px 24px",
            backgroundColor: "#fef3e6",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#a2783a" }}>
            {booking.serviceTitle}
          </h3>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            How was your experience at this event?
          </p>
        </div>

        {/* Rating Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {/* Star Rating */}
          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "12px", display: "block" }}>
              Your Rating
            </label>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    transition: "transform 0.2s",
                    transform: hoverRating >= star || rating >= star ? "scale(1.2)" : "scale(1)",
                  }}
                >
                  <FaStar
                    style={{
                      fontSize: "32px",
                      color: (hoverRating || rating) >= star ? "#fbbf24" : "#e5e7eb",
                      transition: "color 0.2s",
                    }}
                  />
                </button>
              ))}
            </div>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Review Text */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px", display: "block" }}>
              Your Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with others..."
              rows="4"
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || rating === 0}
            style={{
              width: "100%",
              padding: "14px 24px",
              backgroundColor: loading || rating === 0 ? "#9ca3af" : "#a2783a",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              cursor: loading || rating === 0 ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
