import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaPercent, FaCheckSquare, FaSquare, FaTicketAlt, FaUsers, FaPlus, FaMinus } from "react-icons/fa";
import { API_BASE } from "../lib/http";
import useAuth from "../context/useAuth";
import PaymentModal from "./PaymentModal";

const BookingModal = ({ service, isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  
  // Determine event type
  const eventType = service?.eventType || "full-service";
  const isFullService = eventType === "full-service";
  const isTicketed = eventType === "ticketed";

  // Full Service States
  const [eventDate, setEventDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [address, setAddress] = useState("");

  // Ticketed States - Support multiple ticket types
  const [selectedTickets, setSelectedTickets] = useState({}); // { "Regular": 2, "VIP": 1 }

  // Common States
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setEventDate("");
      setTimeSlot("");
      setSelectedAddons([]);
      setUseCurrentLocation(false);
      setAddress("");
      setSelectedTickets({});
      setPromoCode("");
      setDiscount(0);
      setShowPayment(false);
      setCreatedBooking(null);
    }
  }, [isOpen]);

  if (!isOpen || !service) return null;

  // Get available addons from service
  const availableAddons = service.addons || [];
  
  // Get ticket info - handle both ticketTypes and simple ticket structure
  let ticketTypes = [];
  let availableTickets = 0;
  let totalTickets = 0;
  
  if (isTicketed) {
    // Check if service has ticketTypes array (from Event schema)
    if (service.ticketTypes && Array.isArray(service.ticketTypes) && service.ticketTypes.length > 0) {
      // Map Event schema structure to expected structure
      ticketTypes = service.ticketTypes.map(ticket => ({
        name: ticket.name,
        price: parseInt(ticket.price) || 0,
        quantityTotal: parseInt(ticket.quantity) || 0,
        quantitySold: Math.max(0, (parseInt(ticket.quantity) || 0) - (parseInt(ticket.available) || 0)),
        quantityAvailable: parseInt(ticket.available) || 0
      }));
      
      // Calculate totals from ticket types
      totalTickets = ticketTypes.reduce((sum, t) => {
        const total = parseInt(t.quantityTotal) || 0;
        return sum + total;
      }, 0);
      
      availableTickets = ticketTypes.reduce((sum, t) => {
        const available = parseInt(t.quantityAvailable) || 0;
        return sum + available;
      }, 0);
    } else {
      // Fallback to simple structure or create default ticket types
      const basePrice = parseInt(service.price) || 2999;
      const totalAvailable = parseInt(service.availableTickets || service.totalTickets || 15);
      const totalCapacity = parseInt(service.totalTickets || totalAvailable || 15);
      
      // Create default ticket types if none exist
      ticketTypes = [
        { 
          name: "Regular", 
          price: basePrice, 
          quantityTotal: Math.floor(totalCapacity * 0.7), // 70% regular
          quantitySold: 0,
          quantityAvailable: Math.floor(totalAvailable * 0.7)
        },
        { 
          name: "VIP", 
          price: basePrice + 2000, 
          quantityTotal: Math.ceil(totalCapacity * 0.3), // 30% VIP
          quantitySold: 0,
          quantityAvailable: Math.ceil(totalAvailable * 0.3)
        }
      ];
      
      totalTickets = totalCapacity;
      availableTickets = totalAvailable;
    }
  } else {
    // For non-ticketed events
    availableTickets = parseInt(service.availableTickets || service.totalTickets || 0);
    totalTickets = parseInt(service.totalTickets || availableTickets || 0);
  }

  // Ensure we have valid numbers (no NaN)
  totalTickets = isNaN(totalTickets) ? 0 : totalTickets;
  availableTickets = isNaN(availableTickets) ? 0 : availableTickets;

  // Calculate total selected tickets and price
  const totalSelectedTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const ticketedSubtotal = ticketTypes.reduce((sum, ticket) => {
    const quantity = selectedTickets[ticket.name] || 0;
    const price = parseInt(ticket.price) || 0;
    return sum + (price * quantity);
  }, 0);

  // Helper functions for ticket management
  const updateTicketQuantity = (ticketName, newQuantity) => {
    const ticket = ticketTypes.find(t => t.name === ticketName);
    if (!ticket) return;
    
    const maxAvailable = ticket.quantityAvailable !== undefined ? ticket.quantityAvailable : 
      (ticket.quantityTotal - (ticket.quantitySold || 0));
    
    const validQuantity = Math.max(0, Math.min(newQuantity, maxAvailable));
    
    setSelectedTickets(prev => {
      const updated = { ...prev };
      if (validQuantity === 0) {
        delete updated[ticketName];
      } else {
        updated[ticketName] = validQuantity;
      }
      return updated;
    });
  };

  const incrementTicket = (ticketName) => {
    const currentQuantity = selectedTickets[ticketName] || 0;
    updateTicketQuantity(ticketName, currentQuantity + 1);
  };

  const decrementTicket = (ticketName) => {
    const currentQuantity = selectedTickets[ticketName] || 0;
    updateTicketQuantity(ticketName, currentQuantity - 1);
  };

  // Calculate prices for Full Service
  const basePrice = service.price || 0;
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
  const fullServiceSubtotal = basePrice + addonsTotal;
  const fullServiceTotal = Math.max(0, fullServiceSubtotal - discount);

  // Calculate prices for Ticketed
  const ticketedTotal = Math.max(0, ticketedSubtotal - discount);

  // Toggle addon selection
  const toggleAddon = (addon) => {
    const exists = selectedAddons.find(a => a.name === addon.name);
    if (exists) {
      setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  // Apply promo code (optional)
  const handleApplyPromo = () => {
    // If no promo code entered, just return without error
    if (!promoCode || !promoCode.trim()) {
      return;
    }
    
    const subtotal = isTicketed ? ticketedSubtotal : fullServiceSubtotal;
    if (promoCode.toUpperCase() === "EVENT10") {
      const discountAmount = Math.floor(subtotal * 0.1);
      setDiscount(discountAmount);
      toast.success(`Promo applied! You saved ₹${discountAmount.toLocaleString("en-IN")}`);
    } else {
      toast.error("Invalid promo code");
      setDiscount(0);
    }
  };

  // Handle Full Service Submit
  const handleFullServiceSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventDate) {
      toast.error("Please select an event date");
      return;
    }
    if (!timeSlot) {
      toast.error("Please select a time slot");
      return;
    }
    if (!useCurrentLocation && !address.trim()) {
      toast.error("Please enter your address or use current location");
      return;
    }

    setLoading(true);

    try {
      const finalLocation = useCurrentLocation ? "Current Location" : address;

      const bookingData = {
        serviceId: service._id || service.id,
        serviceTitle: service.title,
        serviceCategory: service.category,
        servicePrice: basePrice,
        eventType: "full-service",
        eventDate: `${eventDate} ${timeSlot}`,
        selectedDate: eventDate,
        selectedTime: timeSlot,
        selectedAddOns: selectedAddons,
        addons: selectedAddons,
        location: finalLocation,
        locationType: useCurrentLocation ? "current" : "custom",
        totalAmount: fullServiceTotal,
        basePrice: basePrice,
        addonsTotal: addonsTotal,
        discount: discount,
        promoCode: promoCode || null,
        status: "pending",
        notes: "",
        guestCount: 1,
      };

      const response = await axios.post(
        `${API_BASE}/bookings`,
        bookingData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Booking request sent. Waiting for merchant approval.");
      onSuccess && onSuccess(response.data.booking);
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to create booking";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Ticketed Submit - Open Payment Directly
  const handleTicketedSubmit = async (e) => {
    e.preventDefault();
    
    if (totalSelectedTickets === 0) {
      toast.error("Please select at least 1 ticket");
      return;
    }

    setLoading(true);

    try {
      // Create booking first with pending payment status
      const bookingData = {
        serviceId: service._id || service.id,
        serviceTitle: service.title || "Event Booking",
        serviceCategory: service.category || "event",
        servicePrice: service.price || 0,
        eventType: "ticketed",
        eventDate: service.date, // Use service date
        eventTime: service.time, // Add separate time field
        selectedTickets: selectedTickets, // Multiple ticket types with quantities
        totalAmount: ticketedTotal,
        discount: discount || 0,
        promoCode: promoCode && promoCode.trim() ? promoCode.trim() : null,
        status: "pending_payment",
        paymentStatus: "pending",
        location: service.location || "Event Venue",
        notes: "",
      };

      const response = await axios.post(
        `${API_BASE}/bookings`,
        bookingData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const booking = response.data.booking;
      setCreatedBooking(booking);
      setShowPayment(true);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to create booking";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paidBooking) => {
    toast.success("Payment successful! Your ticket has been generated.");
    setShowPayment(false);
    onSuccess && onSuccess(paidBooking);
    onClose();
  };

  const today = new Date().toISOString().split("T")[0];

  // If showing payment modal for ticketed event
  if (showPayment && createdBooking) {
    return (
      <PaymentModal
        booking={createdBooking}
        isOpen={true}
        onClose={() => {
          setShowPayment(false);
          onClose();
        }}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "white",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      {/* Full Page Layout */}
      <div style={{ display: "flex", height: "100vh" }}>
        
        {/* LEFT SIDE - Image Gallery */}
        <div style={{ 
          width: "50%", // Fixed 50% width instead of flex: 1
          backgroundColor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          position: "relative"
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              background: "rgba(0, 0, 0, 0.5)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <FaTimes style={{ fontSize: "16px", color: "white" }} />
          </button>

          {/* Main Banner Image - Further reduced height */}
          <div style={{ 
            height: "50%", // Further reduced from 60% to 50%
            position: "relative",
            overflow: "hidden"
          }}>
            <img 
              src={service.images?.[0]?.url || "/party.jpg"} 
              alt={service.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
            {/* Overlay with Event Info */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              padding: "40px 30px 30px",
              color: "white"
            }}>
              <h1 style={{ 
                fontSize: "32px", 
                fontWeight: "700", 
                marginBottom: "8px",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)"
              }}>
                {service.title}
              </h1>
              <p style={{ 
                fontSize: "16px", 
                opacity: 0.9,
                marginBottom: "12px"
              }}>
                {service.category} • {service.location}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaCalendarAlt />
                  <span>
                    {service.date ? new Date(service.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short", 
                      day: "numeric",
                      year: "numeric"
                    }) : (service.eventDate ? new Date(service.eventDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short", 
                      day: "numeric",
                      year: "numeric"
                    }) : "Date TBD")}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaClock />
                  <span>
                    {service.time ? (
                      // Convert 24-hour format to 12-hour format if needed
                      service.time.includes(':') && !service.time.includes('M') ? 
                        (() => {
                          const [hours, minutes] = service.time.split(':');
                          const hour = parseInt(hours);
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                          return `${displayHour}:${minutes} ${ampm}`;
                        })() : service.time
                    ) : (service.eventTime ? (
                      service.eventTime.includes(':') && !service.eventTime.includes('M') ? 
                        (() => {
                          const [hours, minutes] = service.eventTime.split(':');
                          const hour = parseInt(hours);
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                          return `${displayHour}:${minutes} ${ampm}`;
                        })() : service.eventTime
                    ) : "Time TBD")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery Thumbnails - Increased size and better layout */}
          <div style={{ 
            height: "50%", // Increased from 40% to 50%
            padding: "24px",
            backgroundColor: "white",
            borderTop: "1px solid #e5e7eb",
            overflow: "hidden"
          }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              marginBottom: "16px",
              color: "#374151"
            }}>
              Event Gallery
            </h3>
            {service.images && service.images.length > 0 ? (
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", // Responsive grid
                gap: "16px",
                height: "calc(100% - 50px)",
                overflowY: "auto"
              }}>
                {service.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${service.title} ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "120px", // Increased from 100px to 120px for larger thumbnails
                      objectFit: "cover",
                      borderRadius: "12px", // Increased border radius
                      cursor: "pointer",
                      border: "3px solid transparent", // Thicker border
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "#a2783a";
                      e.target.style.transform = "scale(1.05)";
                      e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "transparent";
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "calc(100% - 50px)",
                color: "#9ca3af",
                fontSize: "14px"
              }}>
                No additional images available
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - Booking Form */}
        <div style={{ 
          width: "50%", // Fixed 50% width instead of 480px
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #e5e7eb"
        }}>
          {/* Header */}
          <div style={{
            padding: "24px 32px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#fafafa"
          }}>
            <h2 style={{ 
              fontSize: "24px", 
              fontWeight: "700", 
              color: "#1f2937",
              marginBottom: "4px"
            }}>
              Book Now
            </h2>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "14px" 
            }}>
              {isTicketed ? "Select your tickets and complete payment" : "Fill in your details for booking request"}
            </p>
          </div>

          {/* Form Container */}
          <div style={{ 
            flex: "1", 
            overflowY: "auto",
            padding: "32px"
          }}>
            <form onSubmit={isTicketed ? handleTicketedSubmit : handleFullServiceSubmit}>
          {isTicketed ? (
            <>
              {/* TICKETED EVENT FORM */}
              
              {/* 1. Price Section (Top) */}
              <div style={{ 
                textAlign: "center", 
                padding: "20px", 
                backgroundColor: "#fef3e6", 
                borderRadius: "12px",
                marginBottom: "20px",
                border: "1px solid #a2783a"
              }}>
                <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
                  {totalSelectedTickets > 0 ? `Total for ${totalSelectedTickets} tickets` : "Price per ticket"}
                </div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#a2783a" }}>
                  {totalSelectedTickets > 0 
                    ? `₹${ticketedSubtotal.toLocaleString("en-IN")}`
                    : `₹${(service.price || 2999).toLocaleString("en-IN")}`
                  }
                </div>
              </div>

              {/* 2. Event Details (Display Only) */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <FaMapMarkerAlt style={{ color: "#ef4444" }} />
                  <span style={{ color: "#374151", fontSize: "14px" }}>
                    {service.location || "Event Venue"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaUsers style={{ color: "#a2783a" }} />
                  <span style={{ color: "#374151", fontSize: "14px" }}>
                    {availableTickets} / {totalTickets} attendees
                  </span>
                </div>
              </div>

              {/* 3. Ticket Type Selection with Quantities */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaTicketAlt style={{ color: "#a2783a" }} />
                  Select Tickets
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {ticketTypes.map((ticket) => {
                    const currentQuantity = selectedTickets[ticket.name] || 0;
                    
                    // Safe calculation of available tickets with NaN protection
                    let available;
                    if (ticket.quantityAvailable !== undefined) {
                      available = parseInt(ticket.quantityAvailable) || 0;
                    } else {
                      const total = parseInt(ticket.quantityTotal || ticket.quantity) || 0;
                      const sold = parseInt(ticket.quantitySold) || 0;
                      available = total - sold;
                    }
                    const maxAvailable = Math.max(0, isNaN(available) ? 0 : available);
                    
                    return (
                      <div
                        key={ticket.name}
                        style={{
                          padding: "16px",
                          backgroundColor: currentQuantity > 0 ? "#fef3e6" : "white",
                          border: "2px solid",
                          borderColor: currentQuantity > 0 ? "#a2783a" : "#e5e7eb",
                          borderRadius: "12px",
                          transition: "all 0.2s",
                        }}
                      >
                        {/* Ticket Type Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <div>
                            <div style={{ color: "#374151", fontWeight: "600", fontSize: "16px" }}>{ticket.name}</div>
                            <div style={{ color: "#6b7280", fontSize: "12px" }}>
                              {maxAvailable} tickets available
                            </div>
                          </div>
                          <div style={{ color: "#a2783a", fontWeight: "700", fontSize: "18px" }}>
                            ₹{(parseInt(ticket.price) || 0).toLocaleString("en-IN")}
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <button
                              type="button"
                              onClick={() => decrementTicket(ticket.name)}
                              disabled={currentQuantity <= 0}
                              style={{
                                width: "36px",
                                height: "36px",
                                backgroundColor: currentQuantity <= 0 ? "#f3f4f6" : "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                color: currentQuantity <= 0 ? "#9ca3af" : "#374151",
                                cursor: currentQuantity <= 0 ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                              }}
                            >
                              <FaMinus size={10} />
                            </button>
                            
                            <span style={{ 
                              fontSize: "18px", 
                              fontWeight: "600", 
                              minWidth: "30px", 
                              textAlign: "center", 
                              color: "#374151" 
                            }}>
                              {currentQuantity}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => incrementTicket(ticket.name)}
                              disabled={currentQuantity >= maxAvailable}
                              style={{
                                width: "36px",
                                height: "36px",
                                backgroundColor: currentQuantity >= maxAvailable ? "#f3f4f6" : "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                color: currentQuantity >= maxAvailable ? "#9ca3af" : "#374151",
                                cursor: currentQuantity >= maxAvailable ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                              }}
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>

                          {/* Subtotal for this ticket type */}
                          {currentQuantity > 0 && (
                            <div style={{ color: "#6b7280", fontSize: "14px" }}>
                              ₹{((parseInt(ticket.price) || 0) * currentQuantity).toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Apply Promo Code (Optional) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaPercent style={{ color: "#fbbf24" }} />
                  Apply Promo Code (Optional)
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code (optional)"
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: "#374151",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={!promoCode || !promoCode.trim()}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: (!promoCode || !promoCode.trim()) ? "#9ca3af" : "#374151",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: (!promoCode || !promoCode.trim()) ? "not-allowed" : "pointer",
                    }}
                  >
                    Apply
                  </button>
                  {discount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDiscount(0);
                        setPromoCode("");
                        toast.success("Promo code removed");
                      }}
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#ef4444",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {discount > 0 && (
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "#16a34a" }}>
                    ✅ Promo code applied! Saved ₹{discount.toLocaleString("en-IN")}
                  </div>
                )}
              </div>

              {/* 5. Total Price Calculation */}
              {totalSelectedTickets > 0 && (
                <div style={{ 
                  backgroundColor: "#f9fafb", 
                  padding: "16px", 
                  borderRadius: "8px", 
                  marginBottom: "20px",
                  border: "1px solid #e5e7eb"
                }}>
                  {/* Breakdown by ticket type */}
                  {Object.entries(selectedTickets).map(([ticketName, quantity]) => {
                    const ticket = ticketTypes.find(t => t.name === ticketName);
                    if (!ticket || quantity === 0) return null;
                    
                    return (
                      <div key={ticketName} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>
                          {ticketName} × {quantity}
                        </span>
                        <span style={{ color: "#374151", fontSize: "14px" }}>
                          ₹{((parseInt(ticket.price) || 0) * quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
                  
                  {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "#6b7280", fontSize: "14px" }}>Discount:</span>
                      <span style={{ color: "#16a34a", fontSize: "14px" }}>-₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  
                  <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#374151", fontSize: "16px", fontWeight: "600" }}>Total:</span>
                    <span style={{ color: "#a2783a", fontSize: "24px", fontWeight: "700" }}>
                      ₹{ticketedTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              {/* 6. Book Now Button */}
              <button
                type="submit"
                disabled={loading || totalSelectedTickets === 0 || availableTickets === 0}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  backgroundColor: loading || totalSelectedTickets === 0 || availableTickets === 0 ? "#9ca3af" : "#a2783a",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading || totalSelectedTickets === 0 || availableTickets === 0 ? "not-allowed" : "pointer",
                  marginBottom: "12px",
                }}
              >
                {loading 
                  ? "Processing..." 
                  : availableTickets === 0 
                    ? "Sold Out"
                    : totalSelectedTickets === 0
                      ? "Select Tickets"
                      : `Book Now – ₹${ticketedTotal.toLocaleString("en-IN")}`
                }
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  backgroundColor: "transparent",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: "#6b7280",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {/* FULL SERVICE EVENT FORM */}
              
              {/* 1. Select Date */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px", display: "block" }}>
                  Select Date
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    min={today}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      paddingRight: "40px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: "#374151",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <FaCalendarAlt style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                </div>
              </div>

              {/* 2. Select Time - 24 Hour Format */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px", display: "block" }}>
                  Select Time (24-hour format)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      paddingRight: "40px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: "#374151",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <FaClock style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
                </div>
              </div>

              {/* 3. Optional Add-ons */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "12px", display: "block" }}>
                  Optional Add-ons
                </label>
                {availableAddons.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {availableAddons.map((addon, idx) => {
                      const isSelected = selectedAddons.find(a => a.name === addon.name);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleAddon(addon)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            backgroundColor: isSelected ? "#fef3e6" : "white",
                            border: "1px solid",
                            borderColor: isSelected ? "#a2783a" : "#e5e7eb",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {isSelected ? (
                              <FaCheckSquare style={{ color: "#a2783a", fontSize: "20px" }} />
                            ) : (
                              <FaSquare style={{ color: "#d1d5db", fontSize: "20px" }} />
                            )}
                            <span style={{ color: "#374151", fontSize: "14px" }}>{addon.name}</span>
                          </div>
                          <span style={{ color: "#a2783a", fontWeight: "600", fontSize: "14px" }}>
                            +₹{addon.price?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ 
                    padding: "16px", 
                    backgroundColor: "#f9fafb", 
                    border: "1px dashed #d1d5db",
                    borderRadius: "8px",
                    color: "#9ca3af",
                    fontSize: "14px",
                    textAlign: "center"
                  }}>
                    No add-ons available for this event
                  </div>
                )}
              </div>

              {/* 4. Service Location */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaMapMarkerAlt style={{ color: "#ef4444" }} />
                  Service Location
                </label>
                
                <button
                  type="button"
                  onClick={() => {
                    setUseCurrentLocation(!useCurrentLocation);
                    if (!useCurrentLocation) {
                      setAddress("");
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: useCurrentLocation ? "#fef3e6" : "white",
                    border: "1px solid",
                    borderColor: useCurrentLocation ? "#a2783a" : "#e5e7eb",
                    borderRadius: "8px",
                    color: useCurrentLocation ? "#a2783a" : "#374151",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <FaMapMarkerAlt />
                  Use My Current Location
                </button>

                {!useCurrentLocation && (
                  <div style={{ marginBottom: "8px" }}>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter complete address (street, city, state, pincode)"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: "#374151",
                        fontSize: "14px",
                        outline: "none",
                        marginBottom: "8px",
                      }}
                    />
                    <button 
                      type="button" 
                      style={{ 
                        fontSize: "13px", 
                        color: "#a2783a", 
                        background: "none", 
                        border: "none", 
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Pick location on map
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Apply Promo Code */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaPercent style={{ color: "#fbbf24" }} />
                  Apply Promo Code
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      color: "#374151",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: "#374151",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ 
                backgroundColor: "#f9fafb", 
                padding: "16px", 
                borderRadius: "8px", 
                marginBottom: "20px",
                border: "1px solid #e5e7eb"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#6b7280", fontSize: "14px" }}>Base Price:</span>
                  <span style={{ color: "#374151", fontSize: "14px" }}>₹{basePrice.toLocaleString("en-IN")}</span>
                </div>
                {addonsTotal > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#6b7280", fontSize: "14px" }}>Add-ons:</span>
                    <span style={{ color: "#374151", fontSize: "14px" }}>+₹{addonsTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#6b7280", fontSize: "14px" }}>Discount:</span>
                    <span style={{ color: "#16a34a", fontSize: "14px" }}>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#374151", fontSize: "16px", fontWeight: "600" }}>Total:</span>
                  <span style={{ color: "#a2783a", fontSize: "24px", fontWeight: "700" }}>
                    ₹{fullServiceTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "16px 24px",
                    backgroundColor: loading ? "#9ca3af" : "#a2783a",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "600",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Sending Request..." : "Request Booking"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "16px 24px",
                    backgroundColor: "transparent",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: "#6b7280",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
