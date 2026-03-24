import { Booking } from "../models/bookingSchema.js";
import { Event } from "../models/eventSchema.js";
import { v4 as uuidv4 } from "uuid";

// Helper function to generate ticket
const generateTicket = (booking, eventType) => {
  const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const qrData = JSON.stringify({
    ticketNumber,
    bookingId: booking._id,
    userId: booking.user,
    eventId: booking.serviceId,
    eventType: eventType
  });
  return {
    ticketNumber,
    qrCode: qrData,
    generatedAt: new Date()
  };
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { 
      serviceId, 
      serviceTitle, 
      serviceCategory, 
      servicePrice,
      eventType,
      eventDate,
      eventTime, // Add eventTime field
      notes,
      guestCount,
      location,
      locationType,
      selectedTickets, // New: { "Regular": 2, "VIP": 1 }
      totalAmount,
      discount,
      promoCode,
      addons,
      timeSlot
    } = req.body;

    const userId = req.user.userId;

    // Validate required fields - make validation more flexible
    if (!serviceId) {
      return res.status(400).json({ 
        success: false, 
        message: "Service ID is required" 
      });
    }

    if (!serviceTitle) {
      return res.status(400).json({ 
        success: false, 
        message: "Service title is required" 
      });
    }

    // Set default category if not provided
    const finalServiceCategory = serviceCategory || "event";

    // Check if user already has a pending/accepted/paid booking for this service
    const existingBooking = await Booking.findOne({ 
      user: userId, 
      serviceId: serviceId,
      status: { $in: ["pending", "accepted", "paid", "confirmed"] }
    });

    if (existingBooking) {
      return res.status(409).json({ 
        success: false, 
        message: "You already have an active booking for this event" 
      });
    }

    // Get event details to determine workflow
    const event = await Event.findById(serviceId);
    const evtType = eventType || (event?.eventType) || "full-service";

    // Calculate total price and guest count
    let finalTotalPrice = totalAmount || servicePrice;
    let totalGuests = 0;
    
    if (evtType === "ticketed" && selectedTickets) {
      // For ticketed events with multiple ticket types
      totalGuests = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
      
      // Use provided totalAmount or calculate from selectedTickets
      if (!totalAmount && event?.ticketTypes) {
        finalTotalPrice = 0;
        Object.entries(selectedTickets).forEach(([ticketName, quantity]) => {
          const ticketType = event.ticketTypes.find(t => t.name === ticketName);
          if (ticketType) {
            finalTotalPrice += ticketType.price * quantity;
          }
        });
      }
      
      // Apply discount if provided
      if (discount && discount > 0) {
        finalTotalPrice = Math.max(0, finalTotalPrice - discount);
      }
    } else {
      // For full-service events
      totalGuests = parseInt(guestCount) || 1;
      finalTotalPrice = servicePrice * totalGuests;
      
      // Add addon prices
      if (addons && Array.isArray(addons) && addons.length > 0) {
        addons.forEach(addon => {
          if (addon.price) {
            finalTotalPrice += parseFloat(addon.price);
          }
        });
      }
      
      // Apply discount if provided
      if (discount && discount > 0) {
        finalTotalPrice = Math.max(0, finalTotalPrice - discount);
      }
    }

    // Create booking object
    const bookingData = {
      user: userId,
      serviceId,
      serviceTitle,
      serviceCategory: finalServiceCategory,
      servicePrice: servicePrice || 0,
      eventType: evtType,
      eventDate: eventDate || (event?.date) || new Date(),
      eventTime: eventTime || timeSlot || (event?.time) || "06:00 PM",
      notes: notes || "",
      guestCount: totalGuests,
      totalPrice: finalTotalPrice,
      bookingDate: new Date(),
      status: evtType === "ticketed" ? "pending_payment" : "pending",
      location: location || (event?.location) || "",
      locationType: locationType || "event",
    };

    // Add event-specific fields
    if (evtType === "ticketed") {
      // Store selected tickets information
      bookingData.selectedTickets = selectedTickets;
      
      // Add discount and promo code info (both optional)
      if (discount && discount > 0) {
        bookingData.discount = discount;
      }
      if (promoCode && promoCode.trim()) {
        bookingData.promoCode = promoCode.trim();
      }
      
      // Set payment status for ticketed events
      bookingData.payment = {
        paid: false,
        amount: finalTotalPrice
      };
    } else {
      // Full service addons
      if (addons && Array.isArray(addons)) {
        bookingData.addons = addons;
      }
    }

    // Create booking
    const booking = await Booking.create(bookingData);

    return res.status(201).json({ 
      success: true, 
      message: evtType === "ticketed" 
        ? "Booking created. Proceed to payment." 
        : "Booking request sent to merchant.",
      booking,
      eventType: evtType
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to create booking" 
    });
  }
};

// Process payment for a booking
export const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentId, amount } = req.body;
    const userId = req.user.userId;

    const booking = await Booking.findOne({ 
      _id: id, 
      user: userId 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    // Check if booking can be paid
    if (booking.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Cannot pay for a rejected booking"
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot pay for a cancelled booking"
      });
    }

    if (booking.payment?.paid) {
      return res.status(400).json({
        success: false,
        message: "Payment already completed"
      });
    }

    // For full-service events, must be accepted first
    if (booking.eventType === "full-service" && booking.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Booking must be accepted by merchant before payment"
      });
    }

    // Update payment details
    booking.payment = {
      paid: true,
      paymentId: paymentId || `PAY-${Date.now()}`,
      paymentDate: new Date(),
      amount: amount || booking.totalPrice
    };

    // Update status to paid
    booking.status = "paid";

    // Generate ticket for ticketed events immediately
    // For full-service, ticket generated after merchant confirms
    if (booking.eventType === "ticketed") {
      // Generate tickets for multiple ticket types
      const ticketInfo = generateTicket(booking, booking.eventType);
      
      // Create ticket summary for multiple types
      let ticketSummary = "";
      if (booking.selectedTickets && Object.keys(booking.selectedTickets).length > 0) {
        const ticketEntries = Object.entries(booking.selectedTickets);
        ticketSummary = ticketEntries.map(([type, qty]) => `${qty}x ${type}`).join(", ");
      } else {
        ticketSummary = `${booking.guestCount}x Standard`;
      }
      
      booking.ticket = {
        ...booking.ticket,
        ...ticketInfo,
        ticketType: ticketSummary
      };
      booking.status = "confirmed";
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      booking
    });
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process payment"
    });
  }
};

// Get all bookings for the logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log(`=== GET USER BOOKINGS ===`);
    console.log(`User ID: ${userId}`);
    
    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 });

    console.log(`Found ${bookings.length} bookings for user ${userId}`);

    // Enhance bookings with event data if missing date/time
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        
        // Try to get event data to enhance the booking
        if (bookingObj.serviceId) {
          try {
            const event = await Event.findById(bookingObj.serviceId);
            if (event) {
              console.log(`Enhancing booking ${booking._id} with event data`);
              
              // Update the booking in database with proper date/time if missing
              const updateData = {};
              if (event.date && !bookingObj.eventDate) {
                updateData.eventDate = event.date;
              }
              if (event.time && (!bookingObj.eventTime || bookingObj.eventTime === "TBD")) {
                updateData.eventTime = event.time;
              }
              
              if (Object.keys(updateData).length > 0) {
                await Booking.findByIdAndUpdate(booking._id, updateData);
                // Update the object we're returning
                Object.assign(bookingObj, updateData);
              }
              
              // Add event images to the booking object for frontend
              bookingObj.eventImages = event.images || [];
              bookingObj.eventImage = event.images && event.images.length > 0 ? event.images[0].url : null;
            }
          } catch (error) {
            console.error(`Error enhancing booking ${booking._id}:`, error.message);
          }
        }
        
        return bookingObj;
      })
    );

    return res.status(200).json({ 
      success: true, 
      bookings: enhancedBookings
    });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch bookings" 
    });
  }
};

// Get single booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findOne({ 
      _id: id, 
      user: userId 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      booking 
    });
  } catch (error) {
    console.error("Fetch booking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch booking" 
    });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findOne({ 
      _id: id, 
      user: userId 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking is already cancelled" 
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot cancel a completed booking" 
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({ 
      success: true, 
      message: "Booking cancelled successfully",
      booking 
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to cancel booking" 
    });
  }
};

// Get all bookings (Admin only)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      bookings 
    });
  } catch (error) {
    console.error("Fetch all bookings error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch bookings" 
    });
  }
};

// Update booking status (Admin/Merchant only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "rejected", "paid", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Booking status updated",
      booking 
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to update booking" 
    });
  }
};

// ==================== MERCHANT BOOKING MANAGEMENT ====================

// Get all bookings for merchant's events
export const getMerchantBookings = async (req, res) => {
  try {
    const merchantId = req.user.userId;
    
    // Get all events created by this merchant
    const merchantEvents = await Event.find({ createdBy: merchantId }).select('_id');
    const eventIds = merchantEvents.map(e => e._id.toString());

    // Get bookings for these events
    const bookings = await Booking.find({ 
      serviceId: { $in: eventIds }
    })
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error("Fetch merchant bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};

// Merchant accept/reject booking
export const respondToBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, message } = req.body; // action: "accept" or "reject"
    const merchantId = req.user.userId;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'accept' or 'reject'"
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify this booking belongs to merchant's event
    const event = await Event.findOne({ 
      _id: booking.serviceId,
      createdBy: merchantId 
    });

    if (!event) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this booking"
      });
    }

    // Only allow response for full-service events in pending status
    if (booking.eventType !== "full-service") {
      return res.status(400).json({
        success: false,
        message: "This action is only for full-service events"
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot ${action} booking with status: ${booking.status}`
      });
    }

    // Update booking
    booking.status = action === "accept" ? "accepted" : "rejected";
    booking.merchantResponse = {
      accepted: action === "accept",
      responseDate: new Date(),
      message: message || null
    };

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking ${action}ed successfully`,
      booking
    });
  } catch (error) {
    console.error("Respond to booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to respond to booking"
    });
  }
};

// Merchant confirm booking after payment (generate ticket for full-service)
export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.userId;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify this booking belongs to merchant's event
    const event = await Event.findOne({ 
      _id: booking.serviceId,
      createdBy: merchantId 
    });

    if (!event) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this booking"
      });
    }

    // Only confirm paid bookings
    if (booking.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Booking must be paid before confirmation"
      });
    }

    // Generate ticket
    booking.ticket = {
      ...booking.ticket,
      ...generateTicket(booking, booking.eventType)
    };
    booking.status = "confirmed";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking confirmed and ticket generated",
      booking
    });
  } catch (error) {
    console.error("Confirm booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to confirm booking"
    });
  }
};

// Mark booking as completed (after event date)
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findOne({
      _id: id,
      user: userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be marked as completed"
      });
    }

    booking.status = "completed";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking marked as completed",
      booking
    });
  } catch (error) {
    console.error("Complete booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete booking"
    });
  }
};

// Submit rating and review for completed booking
export const submitRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, review } = req.body;
    const userId = req.user.userId;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating score must be between 1 and 5"
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      user: userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only rate completed events"
      });
    }

    if (booking.rating?.score) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this event"
      });
    }

    booking.rating = {
      score,
      review: review || "",
      createdAt: new Date()
    };

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      booking
    });
  } catch (error) {
    console.error("Submit rating error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit rating"
    });
  }
};
