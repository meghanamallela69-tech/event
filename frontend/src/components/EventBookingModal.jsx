import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import useAuth from "../context/useAuth";
import { API_BASE, authHeaders } from "../lib/http";

const EventBookingModal = ({ event, isOpen, onClose, onConfirm }) => {
  const { token, user } = useAuth();
  const [selectedTicketType, setSelectedTicketType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [couponData, setCouponData] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  
  // Form fields for full-service events
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  
  // Get ticket types for ticketed events
  const ticketTypes = event?.ticketTypes || [];
  const selectedType = ticketTypes.find(t => t.name === selectedTicketType) || ticketTypes[0];
  const price = selectedType?.price || event?.price || 0;
  const originalTotal = useMemo(() => {
    if (event?.eventType === "full-service") {
      return event?.price || 0;
    }
    return Math.max(1, Number(quantity || 1)) * price;
  }, [quantity, price, event]);
  
  const finalTotal = couponData ? couponData.finalAmount : originalTotal;
  
  const handleCouponApplied = (couponResult) => {
    setCouponData(couponResult);
  };

  const handleCouponRemoved = () => {
    setCouponData(null);
  };

  // Fetch available coupons when modal opens or total changes
  useEffect(() => {
    if (isOpen && event && event._id) {
      console.log('🔍 FETCHING COUPONS - Event:', event.title, '| ID:', event._id, '| Amount:', originalTotal);
      fetchAvailableCoupons();
    } else {
      console.log('⚠️ Modal not ready - isOpen:', isOpen, '| has event:', !!event, '| has eventId:', event?._id);
    }
  }, [isOpen, event, originalTotal]);

  const fetchAvailableCoupons = async () => {
    try {
      const amount = originalTotal || 1000;
      const url = `${API_BASE}/coupons/available?eventId=${event._id}&totalAmount=${amount}`;
      
      console.log('🎫 API Call Details:');
      console.log('   URL:', url);
      console.log('   Amount:', amount);
      console.log('   Token present:', !!token);
      console.log('   Event ID:', event._id);
      
      const response = await axios.get(url, { headers: authHeaders(token) });
      
      console.log('📦 Raw API Response Status:', response.status);
      console.log('📦 API Response Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        const coupons = response.data.coupons || [];
        console.log('✅ COUPONS FOUND:', coupons.length);
        coupons.forEach(c => {
          console.log('   -', c.code, '| Discount:', c.discountValue + '%', '| Min:', c.minAmount);
        });
        setAvailableCoupons(coupons);
        setShowCouponDropdown(coupons.length > 0);
      } else {
        console.log('❌ API returned success=false:', response.data);
        setAvailableCoupons([]);
        setShowCouponDropdown(false);
      }
    } catch (error) {
      console.error('❌ FAILED to fetch coupons:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      setAvailableCoupons([]);
      setShowCouponDropdown(false);
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
          amount: originalTotal
        },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        setCouponData(response.data);
        setCouponCode(coupon.code);
        setShowCouponDropdown(false);
        toast.success(`🎉 ${coupon.code} applied! You saved ₹${response.data.discountAmount}`);
      } else {
        throw new Error(response.data.message || "Invalid coupon");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast.error(error.response?.data?.message || "Failed to apply coupon");
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleManualApply = async () => {
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
          amount: originalTotal
        },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        setCouponData(response.data);
        toast.success(`🎉 ${couponCode.toUpperCase()} applied! You saved ₹${response.data.discountAmount}`);
      } else {
        throw new Error(response.data.message || "Invalid coupon");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast.error(error.response?.data?.message || "Invalid or expired coupon");
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setCouponCode("");
    setShowCouponDropdown(false);
    toast.success("Coupon removed");
  };

  const handleConfirm = () => {
    const bookingData = {
      customerName,
      eventId: event._id
    };

    if (event?.eventType === "full-service") {
      // Full service booking data
      bookingData.eventDate = eventDate;
      bookingData.eventTime = eventTime;
      bookingData.location = eventLocation;
      bookingData.guestCount = Math.max(1, Number(guestCount || 1));
    } else {
      // Ticketed event booking data
      bookingData.ticketType = selectedTicketType || (ticketTypes[0]?.name || "");
      bookingData.quantity = Math.max(1, Number(quantity || 1));
    }

    // Add coupon data if applied
    if (couponData) {
      bookingData.couponCode = couponData.coupon.code;
      bookingData.originalAmount = couponData.originalAmount;
      bookingData.discountAmount = couponData.discountAmount;
      bookingData.finalAmount = couponData.finalAmount;
    }

    onConfirm(bookingData);
  };

  if (!isOpen || !event) return null;

  const isFullService = event?.eventType === "full-service";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md sm:max-w-lg bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {isFullService ? "Book Service" : "Book Tickets"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">✕</button>
        </div>
        
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Event Info */}
          <div>
            <div className="text-sm text-gray-500">Service/Event</div>
            <div className="font-medium">{event.title}</div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="text-sm text-gray-500">Your Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Enter your name"
              required
            />
          </div>

          {isFullService ? (
            // Full Service Fields
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Event Time</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Event Location</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Enter event location"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Number of Guests</label>
                <input
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </div>
            </>
          ) : (
            // Ticketed Event Fields
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">
                    {event.date ? new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-medium">{event.time || "-"}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">{event.location || "-"}</div>
              </div>

              {/* Ticket Type Selection */}
              {ticketTypes.length > 1 && (
                <div>
                  <label className="text-sm text-gray-500">Ticket Type</label>
                  <select
                    value={selectedTicketType}
                    onChange={(e) => setSelectedTicketType(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                  >
                    {ticketTypes.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name} - ₹{type.price}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <div className="text-sm text-gray-500">Ticket Price</div>
                  <div className="text-xl font-semibold">{price > 0 ? `₹${price}` : "Free"}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedType?.quantityTotal - selectedType?.quantitySold || 999}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* Available tickets info */}
              {selectedType && (
                <div className="text-sm text-gray-500">
                  Available: {(selectedType.quantityTotal || 0) - (selectedType.quantitySold || 0)} tickets
                </div>
              )}
            </>
          )}

          {/* Promo Code Section */}
          {originalTotal > 0 && (
            <div className="border-t pt-4">
              {/* Debug Info */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                <div className="font-semibold text-yellow-800 mb-1">🔍 Debug Info:</div>
                <div className="text-yellow-700 space-y-1">
                  <div>Event: {event.title}</div>
                  <div>Event ID: {event._id}</div>
                  <div>Available Coupons: {availableCoupons.length}</div>
                  <div>Coupon Dropdown Open: {showCouponDropdown ? 'Yes' : 'No'}</div>
                  {availableCoupons.length > 0 && (
                    <div>Coupons: {availableCoupons.map(c => c.code).join(', ')}</div>
                  )}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>🎟️</span> Have a Promo Code?
              </h4>

              {/* Applied Coupon Display */}
              {couponData ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <div>
                        <div className="font-bold text-green-800">{couponData.coupon?.code}</div>
                        <div className="text-xs text-green-700">
                          {couponData.coupon?.discountType === 'percentage' 
                            ? `${couponData.coupon?.discountValue}% OFF` 
                            : `₹${couponData.coupon?.discountValue} OFF`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                      title="Remove coupon"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Original Amount:</span>
                      <span className="line-through">₹{couponData.originalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-700">
                      <span>Discount:</span>
                      <span className="font-semibold">-₹{couponData.discountAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                      <span className="font-bold text-green-800">Final Amount:</span>
                      <span className="font-bold text-green-800">₹{couponData.finalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-green-600 mt-2 text-center">
                      🎉 You saved ₹{couponData.savings?.toLocaleString()}!
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Coupon Input with Apply Button */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                        disabled={couponLoading}
                      />
                      
                      {/* Dropdown Arrow */}
                      {availableCoupons.length > 0 && (
                        <button
                          onClick={() => setShowCouponDropdown(!showCouponDropdown)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
                        >
                          ▼
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleManualApply}
                      disabled={!couponCode.trim() || couponLoading}
                      className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {couponLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span> Applying...
                        </span>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>

                  {/* Available Coupons Dropdown */}
                  {showCouponDropdown && availableCoupons.length > 0 && (
                    <div className="mb-4 bg-purple-50 rounded-lg border border-purple-200 overflow-hidden">
                      <div className="p-3 bg-purple-100 border-b border-purple-200">
                        <div className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                          <span>🏷️</span> Available Offers ({availableCoupons.length})
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {availableCoupons.map((coupon) => (
                          <div
                            key={coupon._id}
                            className="p-3 bg-white border-b border-purple-100 last:border-0 hover:bg-purple-50 cursor-pointer transition"
                            onClick={() => {
                              setCouponCode(coupon.code);
                              applyCouponFromOffer(coupon);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-purple-700">{coupon.code}</span>
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                    {coupon.discountValue}% OFF
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                  {coupon.description || `${coupon.discountValue}% off on orders above ₹${coupon.minAmount || 0}`}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCouponCode(coupon.code);
                                  applyCouponFromOffer(coupon);
                                }}
                                disabled={couponLoading}
                                className="ml-3 px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium disabled:opacity-50"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Coupons Message */}
                  {availableCoupons.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg border border-gray-200">
                      😕 No offers available for this event
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          {/* Price Summary */}
          <div className="pt-3 border-t space-y-2">
            {/* Original Amount */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Original Amount</span>
              <span className="font-medium text-gray-700">₹{originalTotal.toLocaleString()}</span>
            </div>
            
            {/* Discount Row (if coupon applied) */}
            {couponData && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <span>🏷️</span> Discount ({couponData.coupon?.code})
                </span>
                <span className="font-semibold text-green-600">
                  -₹{couponData.discountAmount.toLocaleString()}
                </span>
              </div>
            )}
            
            {/* Final Total */}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-base font-semibold text-gray-800">Total</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  ₹{finalTotal.toLocaleString()}
                </div>
                {couponData && (
                  <div className="text-xs text-green-600 mt-1">
                    🎉 You saved ₹{couponData.savings?.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-end gap-2">
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

EventBookingModal.propTypes = {
  event: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default EventBookingModal;

