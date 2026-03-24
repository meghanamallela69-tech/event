import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import CouponInput from "./CouponInput";
import useAuth from "../context/useAuth";

const EventBookingModal = ({ event, isOpen, onClose, onConfirm }) => {
  const { token, user } = useAuth();
  const [selectedTicketType, setSelectedTicketType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [couponData, setCouponData] = useState(null);
  
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

          {/* Coupon Input */}
          {originalTotal > 0 && (
            <CouponInput
              totalAmount={originalTotal}
              eventId={event._id}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              token={token}
            />
          )}
          
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-xl font-semibold">
              {originalTotal > 0 ? `₹${finalTotal.toLocaleString()}` : "Free"}
              {couponData && (
                <div className="text-sm text-green-600">
                  (Saved ₹{couponData.discountAmount.toLocaleString()})
                </div>
              )}
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

