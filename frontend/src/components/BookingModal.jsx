import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTimes, FaCalendarAlt, FaUsers, FaStickyNote } from "react-icons/fa";
import { API_BASE } from "../lib/http";
import useAuth from "../context/useAuth";

const BookingModal = ({ service, isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventDate) {
      toast.error("Please select an event date");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE}/bookings`,
        {
          serviceId: service.id,
          serviceTitle: service.title,
          serviceCategory: service.category,
          servicePrice: service.price,
          eventDate,
          guestCount: parseInt(guestCount),
          notes,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
      onSuccess && onSuccess(response.data.booking);
      onClose();
      
      // Reset form
      setEventDate("");
      setGuestCount(1);
      setNotes("");
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to create booking";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const totalPrice = service.price * guestCount;

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

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
          maxWidth: "500px",
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
          <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#1f2937" }}>
            Book Service
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaTimes style={{ fontSize: "20px", color: "#6b7280" }} />
          </button>
        </div>

        {/* Service Info */}
        <div
          style={{
            padding: "20px 24px",
            backgroundColor: "#fef3e6",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#a2783a", marginBottom: "8px" }}>
            {service.title}
          </h3>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
            {service.desc}
          </p>
          <p style={{ fontSize: "20px", fontWeight: "600", color: "#a2783a" }}>
            ₹{service.price.toLocaleString("en-IN")} per guest
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {/* Event Date */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              <FaCalendarAlt style={{ color: "#a2783a" }} />
              Event Date *
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              min={today}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#a2783a")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* Guest Count */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              <FaUsers style={{ color: "#a2783a" }} />
              Number of Guests
            </label>
            <input
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="1000"
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#a2783a")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              <FaStickyNote style={{ color: "#a2783a" }} />
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Any special requirements or requests..."
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                outline: "none",
                resize: "vertical",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#a2783a")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* Total Price */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "16px", color: "#6b7280" }}>
                Total Amount:
              </span>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#a2783a",
                }}
              >
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
              ₹{service.price.toLocaleString("en-IN")} × {guestCount} guest(s)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 24px",
              backgroundColor: loading ? "#9ca3af" : "#a2783a",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.3s",
            }}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
