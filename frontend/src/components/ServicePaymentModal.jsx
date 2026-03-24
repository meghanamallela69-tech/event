import { useState } from "react";
import PropTypes from "prop-types";
import { FaCreditCard, FaUniversity, FaMobile, FaLock, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import { API_BASE, authHeaders } from "../lib/http";
import useAuth from "../context/useAuth";
import toast from "react-hot-toast";

const ServicePaymentModal = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const { token } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Card");
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState("method"); // method, processing, success

  const paymentMethods = [
    { id: "UPI", name: "UPI", icon: FaMobile, description: "Pay using UPI apps" },
    { id: "Card", name: "Credit/Debit Card", icon: FaCreditCard, description: "Visa, Mastercard, etc." },
    { id: "NetBanking", name: "Net Banking", icon: FaUniversity, description: "Online banking" },
  ];

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStep("processing");

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call the service payment API
      const response = await axios.post(
        `${API_BASE}/payments/pay-service`,
        {
          bookingId: booking._id,
          paymentMethod: selectedPaymentMethod,
          paymentAmount: booking.totalPrice
        },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Payment successful! Your service booking is confirmed.");
        
        // Call onPaymentSuccess with the updated booking data
        if (onPaymentSuccess) {
          onPaymentSuccess({
            ...booking,
            paymentStatus: "Paid",
            status: "confirmed",
            paymentMethod: selectedPaymentMethod,
            paymentId: response.data.paymentId,
            paymentDate: new Date()
          });
        }
        
        // Close the payment modal
        onClose();
        setPaymentStep("method");
      } else {
        throw new Error(response.data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed. Please try again.");
      setPaymentStep("method");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date will be confirmed by merchant";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="flex items-center gap-2">
            <FaLock />
            <h3 className="text-lg font-semibold">Service Payment</h3>
          </div>
          {paymentStep === "method" && (
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          )}
        </div>

        {/* Payment Method Selection */}
        {paymentStep === "method" && (
          <div className="p-6 space-y-4">
            {/* Service Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Service Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Event:</span>
                  <span className="font-medium">{booking.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Type:</span>
                  <span>Full Service Event</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Date:</span>
                  <span>{formatDate(booking.serviceDate || booking.selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span>{booking.location || "To be confirmed"}</span>
                </div>
                {booking.guestCount && (
                  <div className="flex justify-between">
                    <span>Guest Count:</span>
                    <span>{booking.guestCount} guests</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">₹{booking.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Event Information</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  <span>Event Date: {formatDate(booking.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                  <span>Venue: {booking.location || "To be confirmed by merchant"}</span>
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  <strong>Note:</strong> Final details will be confirmed by the merchant after payment.
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Select Payment Method</h4>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <method.icon className={`text-xl mr-3 ${
                      selectedPaymentMethod === method.id ? "text-green-600" : "text-gray-400"
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900">{method.name}</div>
                      <div className="text-xs text-gray-500">{method.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Pay ₹${booking.totalPrice?.toLocaleString()} Now`}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              🔒 Your payment is secured with 256-bit SSL encryption
            </p>
          </div>
        )}

        {/* Processing State */}
        {paymentStep === "processing" && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-100 border-t-green-600 mx-auto mb-4"></div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h4>
            <p className="text-gray-600">Please wait while we process your service payment...</p>
            <p className="text-sm text-gray-500 mt-2">Do not close this window</p>
          </div>
        )}

        {/* Success State */}
        {paymentStep === "success" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h4>
            <p className="text-gray-600 mb-4">Your service booking has been confirmed.</p>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                Booking ID: <span className="font-mono">{booking._id}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ServicePaymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.object,
  onPaymentSuccess: PropTypes.func.isRequired,
};

export default ServicePaymentModal;