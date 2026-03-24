import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { API_BASE, authHeaders } from "../lib/http";
import useAuth from "../context/useAuth";
import toast from "react-hot-toast";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaStickyNote } from "react-icons/fa";

const ServiceBookingModal = ({ isOpen, onClose, event, onBookingSuccess }) => {
  const { token } = useAuth();
  
  console.log('🔍 ServiceBookingModal rendered:', {
    isOpen,
    hasEvent: !!event,
    eventTitle: event?.title,
    eventType: event?.eventType,
    hasToken: !!token
  });
  const [formData, setFormData] = useState({
    serviceDate: "",
    guestCount: 1,
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponOffers, setShowCouponOffers] = useState(false);

  const basePrice = event?.price || 0;
  const discountAmount = appliedCoupon ? (basePrice * appliedCoupon.discountPercentage / 100) : 0;
  const totalPrice = basePrice - discountAmount;

  useEffect(() => {
    if (isOpen && event) {
      fetchAvailableCoupons();
    }
  }, [isOpen, event, basePrice]);

  const fetchAvailableCoupons = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/coupons/available?eventId=${event._id}&totalAmount=${basePrice}`,
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        setAvailableCoupons(response.data.coupons || []);
      }
    } catch (error) {
      console.error("Failed to fetch available coupons:", error);
      setAvailableCoupons([]);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/coupons/validate`,
        { 
          couponCode: couponCode.trim().toUpperCase(),
          eventId: event._id,
          amount: basePrice
        },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        toast.success(`Coupon applied! ${response.data.coupon.discountPercentage}% discount`);
      } else {
        throw new Error(response.data.message || "Invalid coupon");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast.error(error.response?.data?.message || "Invalid or expired coupon");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const applyCouponFromOffer = async (coupon) => {
    setCouponLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/coupons/validate`,
        { 
          couponCode: coupon.code,
          eventId: event._id,
          amount: basePrice
        },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setCouponCode(coupon.code);
        setShowCouponOffers(false);
        toast.success(`Coupon ${coupon.code} applied! ${response.data.coupon.discountPercentage}% discount`);
      } else {
        throw new Error(response.data.message || "Invalid coupon");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast.error(error.response?.data?.message || "Failed to apply coupon");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.serviceDate) {
      toast.error("Please select a service date");
      return;
    }

    console.log("=== FRONTEND BOOKING ATTEMPT ===");
    console.log("Event:", event);
    console.log("Token:", token ? "Present" : "Missing");
    console.log("API_BASE:", API_BASE);

    setLoading(true);
    try {
      const payload = {
        eventId: event._id,
        serviceDate: formData.serviceDate,
        guestCount: formData.guestCount,
        notes: formData.notes,
        // Add coupon information if applied
        ...(appliedCoupon && {
          couponCode: appliedCoupon.code,
          couponId: appliedCoupon._id,
          originalAmount: basePrice,
          discountAmount: discountAmount,
          finalAmount: totalPrice
        })
      };

      console.log("Booking Payload:", payload);
      console.log("Request URL:", `${API_BASE}/event-bookings/create`);
      console.log("Headers:", authHeaders(token));

      const response = await axios.post(
        `${API_BASE}/event-bookings/create`,
        payload,
        { headers: authHeaders(token) }
      );

      console.log("✅ Booking response:", response.data);

      if (response.data.success) {
        toast.success("Service booking request sent to merchant!");
        onBookingSuccess(response.data.booking);
        onClose();
        setFormData({ serviceDate: "", guestCount: 1, notes: "" });
      } else {
        throw new Error(response.data.message || "Booking failed");
      }
    } catch (error) {
      console.error("❌ Booking error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(error.response?.data?.message || "Failed to create booking request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaCalendarAlt className="text-purple-600" />
            Book Service
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Event Info */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">{event.title}</h4>
            <div className="text-sm text-purple-700">
              <div className="flex items-center gap-2 mb-1">
                <FaMapMarkerAlt />
                <span>{event.location || "Location will be confirmed"}</span>
              </div>
              <p className="text-xs">
                This is a full-service event. The merchant will review your request and confirm details.
              </p>
            </div>
          </div>

          {/* Service Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Service Date *
            </label>
            <input
              type="date"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleInputChange}
              min={minDate}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Select your preferred date. The merchant may suggest alternatives.
            </p>
          </div>

          {/* Guest Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests
            </label>
            <div className="flex items-center gap-2">
              <FaUsers className="text-gray-400" />
              <input
                type="number"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleInputChange}
                min={1}
                max={1000}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements (Optional)
            </label>
            <div className="relative">
              <FaStickyNote className="absolute top-3 left-3 text-gray-400" />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any special requirements, dietary restrictions, or additional information..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength="500"
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.notes.length}/500 characters
            </div>
          </div>

          {/* Coupon Code Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Coupon Code (Optional)
              </label>
              {availableCoupons.length > 0 && (
                <button
                  onClick={() => setShowCouponOffers(!showCouponOffers)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <span className="text-purple-500">%</span>
                  Available Offers
                </button>
              )}
            </div>

            {/* Available Offers Section */}
            {showCouponOffers && availableCoupons.length > 0 && (
              <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <span className="text-purple-600">%</span>
                  Available Offers
                </h4>
                <div className="space-y-2">
                  {availableCoupons.slice(0, 3).map((coupon) => (
                    <div
                      key={coupon._id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-700 text-sm">{coupon.code}</span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                            {coupon.discountValue}% OFF
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {coupon.description || `${coupon.discountValue}% off on orders above ₹${coupon.minAmount || 0}`}
                        </p>
                      </div>
                      <button
                        onClick={() => applyCouponFromOffer(coupon)}
                        disabled={couponLoading}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Coupon Input */}
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">✓ {appliedCoupon.code}</span>
                  <span className="text-sm text-green-600">({appliedCoupon.discountPercentage}% off)</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Price Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            {event.price > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Service Price:</span>
                  <span className="font-medium">₹{event.price}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center mb-2 text-green-600">
                    <span>Discount ({appliedCoupon.discountPercentage}%):</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold text-purple-600">₹{totalPrice}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Service Price:</span>
                <span className="text-xl font-bold text-purple-600">Price on Request</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Final pricing will be confirmed by the merchant based on your requirements.
            </p>
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
            disabled={loading || !formData.serviceDate}
            className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending Request...
              </>
            ) : (
              "Send Booking Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ServiceBookingModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  event: PropTypes.object,
  onBookingSuccess: PropTypes.func,
};

export default ServiceBookingModal;