import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTimes, FaCreditCard, FaLock } from "react-icons/fa";
import { API_BASE } from "../lib/http";
import useAuth from "../context/useAuth";

const PaymentModal = ({ booking, isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  // Card details (mock)
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === "card") {
      if (!cardNumber || !expiryDate || !cvv || !cardName) {
        toast.error("Please fill in all card details");
        return;
      }
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await axios.post(
        `${API_BASE}/bookings/${booking._id}/pay`,
        {
          paymentId: `PAY-${Date.now()}`,
          amount: booking.totalPrice || booking.servicePrice
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Payment successful!");
      onSuccess && onSuccess(response.data.booking);
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || "Payment failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
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
          maxWidth: "480px",
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
            Complete Payment
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

        {/* Booking Summary */}
        <div
          style={{
            padding: "20px 24px",
            backgroundColor: "#fef3e6",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#a2783a", marginBottom: "8px" }}>
            {booking.serviceTitle}
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>Total Amount</span>
            <span style={{ fontSize: "24px", fontWeight: "700", color: "#a2783a" }}>
              ₹{(booking.totalPrice || booking.servicePrice).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {/* Payment Method Selection */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "12px", display: "block" }}>
              Select Payment Method
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                style={{
                  flex: 1,
                  padding: "16px",
                  border: "2px solid",
                  borderColor: paymentMethod === "card" ? "#a2783a" : "#e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: paymentMethod === "card" ? "#fef3e6" : "white",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaCreditCard style={{ fontSize: "24px", color: "#a2783a" }} />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                style={{
                  flex: 1,
                  padding: "16px",
                  border: "2px solid",
                  borderColor: paymentMethod === "upi" ? "#a2783a" : "#e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: paymentMethod === "upi" ? "#fef3e6" : "white",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "20px", fontWeight: "700", color: "#a2783a" }}>UPI</span>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>UPI</span>
              </button>
            </div>
          </div>

          {/* Card Payment Form */}
          {paymentMethod === "card" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px", display: "block" }}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    outline: "none",
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px", display: "block" }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Name on card"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px", display: "block" }}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").substring(0, 5))}
                    placeholder="MM/YY"
                    maxLength="5"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px", display: "block" }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                    placeholder="123"
                    maxLength="3"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI Payment Form */}
          {paymentMethod === "upi" && (
            <div>
              <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px", display: "block" }}>
                UPI ID
              </label>
              <input
                type="text"
                placeholder="username@upi"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </div>
          )}

          {/* Security Note */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "24px",
              padding: "12px",
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
            }}
          >
            <FaLock style={{ color: "#16a34a" }} />
            <span style={{ fontSize: "12px", color: "#166534" }}>
              Your payment information is secure and encrypted
            </span>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 24px",
              marginTop: "24px",
              backgroundColor: loading ? "#9ca3af" : "#a2783a",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div style={{ width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Processing...
              </span>
            ) : (
              `Pay ₹${(booking.totalPrice || booking.servicePrice).toLocaleString("en-IN")}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
