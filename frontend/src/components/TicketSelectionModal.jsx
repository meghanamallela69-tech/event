import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { API_BASE, authHeaders } from "../lib/http";
import useAuth from "../context/useAuth";
import toast from "react-hot-toast";
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";

const TicketSelectionModal = ({ isOpen, onClose, event, onBookingSuccess }) => {
  const { token } = useAuth();
  
  console.log('🔍 TicketSelectionModal rendered:', {
    isOpen,
    hasEvent: !!event,
    eventTitle: event?.title,
    eventType: event?.eventType,
    hasToken: !!token
  });
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicketType, setSelectedTicketType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingTickets, setFetchingTickets] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponOffers, setShowCouponOffers] = useState(false);

  useEffect(() => {
    if (isOpen && event && event.eventType === "ticketed") {
      fetchTicketTypes();
      fetchAvailableCoupons();
    }
  }, [isOpen, event]);

  const fetchTicketTypes = async () => {
    try {
      setFetchingTickets(true);
      const response = await axios.get(
        `${API_BASE}/event-bookings/event/${event._id}/tickets`,
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        setTicketTypes(response.data.ticketTypes);
        if (response.data.ticketTypes.length > 0) {
          setSelectedTicketType(response.data.ticketTypes[0].name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch ticket types:", error);
      toast.error("Failed to load ticket information");
    } finally {
      setFetchingTickets(false);
    }
  };

  const selectedType = ticketTypes.find(t => t.name === selectedTicketType);
  const basePrice = selectedType ? selectedType.price * quantity : 0;
  const discountAmount = appliedCoupon ? (basePrice * appliedCoupon.discountPercentage / 100) : 0;
  const totalPrice = basePrice - discountAmount;
  const availableQuantity = selectedType ? selectedType.quantityAvailable : 0;

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

  const handleBookNow = async () => {
    if (!selectedType) {
      toast.error("Please select a ticket type");
      return;
    }

    if (quantity > availableQuantity) {
      toast.error(`Only ${availableQuantity} tickets available`);
      return;
    }

    console.log("=== FRONTEND TICKET BOOKING ATTEMPT ===");
    console.log("Event:", event);
    console.log("Token:", token ? "Present" : "Missing");
    console.log("API_BASE:", API_BASE);

    setLoading(true);
    try {
      const payload = {
        eventId: event._id,
        ticketType: selectedTicketType,
        quantity: quantity,
        paymentMethod: "Card",
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

      console.log("✅ Ticket booking response:", response.data);

      if (response.data.success) {
        toast.success("Ticket booking confirmed!");
        onBookingSuccess(response.data.booking, response.data.ticketDetails);
        onClose();
      } else {
        throw new Error(response.data.message || "Booking failed");
      }
    } catch (error) {
      console.error("❌ Ticket booking error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(error.response?.data?.message || "Failed to book tickets");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaTicketAlt className="text-blue-600" />
            Book Tickets
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Event Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">{event.title}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <FaCalendarAlt />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock />
                <span>{event.time || "Time TBD"}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <FaMapMarkerAlt />
                <span>{event.location || "Location TBD"}</span>
              </div>
            </div>
          </div>

          {fetchingTickets ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Ticket Type Selection */}
              {ticketTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Ticket Type
                  </label>
                  <select
                    value={selectedTicketType}
                    onChange={(e) => setSelectedTicketType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ticketTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name} - ₹{type.price} ({type.quantityAvailable} available)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={availableQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(availableQuantity, Number(e.target.value) || 1)))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {selectedType && (
                  <p className="text-sm text-gray-500 mt-1">
                    {availableQuantity} tickets available
                  </p>
                )}
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
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              {/* Price Summary */}
              {selectedType && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Ticket Price:</span>
                    <span className="font-medium">₹{selectedType.price}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{basePrice}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center mb-2 text-green-600">
                      <span>Discount ({appliedCoupon.discountPercentage}%):</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-blue-600">₹{totalPrice}</span>
                  </div>
                </div>
              )}
            </>
          )}
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
            onClick={handleBookNow}
            disabled={loading || fetchingTickets || !selectedType || availableQuantity <= 0}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Booking...
              </>
            ) : availableQuantity <= 0 ? (
              "Sold Out"
            ) : (
              `Book Now - ₹${totalPrice}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

TicketSelectionModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  event: PropTypes.object,
  onBookingSuccess: PropTypes.func,
};

export default TicketSelectionModal;