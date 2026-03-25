import { Booking } from "../models/bookingSchema.js";
import { Event } from "../models/eventSchema.js";
import { Notification } from "../models/notificationSchema.js";
import { Coupon } from "../models/couponSchema.js";
import { v4 as uuidv4 } from "uuid";

// Generic create booking endpoint that routes to appropriate handler
export const createBooking = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    
    console.log("=== CREATE BOOKING REQUEST ===");
    console.log("REQ BODY:", JSON.stringify(req.body, null, 2));
    console.log("USER:", JSON.stringify(req.user, null, 2));
    console.log("Headers:", JSON.stringify(req.headers, null, 2));

    if (!eventId) {
      console.log("❌ Missing eventId");
      return res.status(400).json({
        success: false,
        message: "Event ID is required"
      });
    }

    console.log("🔍 Looking for event with ID:", eventId);

    // Find the event to determine type
    const event = await Event.findById(eventId);
    if (!event) {
      console.log("❌ Event not found with ID:", eventId);
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    console.log("✅ Event found:", event.title, "Type:", event.eventType);

    // Route to appropriate handler based on event type
    if (event.eventType === "full-service") {
      console.log("🔄 Routing to full-service booking handler");
      // For full-service events, we need additional fields
      const { serviceDate, notes, guestCount, couponCode } = req.body;
      req.body = { eventId, serviceDate, notes, guestCount, couponCode };
      return createFullServiceBooking(req, res);
    } else if (event.eventType === "ticketed") {
      console.log("🔄 Routing to ticketed booking handler");
      // For ticketed events, use default ticket type if not specified
      const { ticketType, paymentMethod, couponCode } = req.body;
      req.body = { 
        eventId, 
        ticketType: ticketType || (event.ticketTypes && event.ticketTypes[0]?.name), 
        quantity: quantity || 1,
        paymentMethod: paymentMethod || "Cash",
        couponCode
      };
      return createTicketedBooking(req, res);
    } else {
      console.log("❌ Invalid event type:", event.eventType);
      return res.status(400).json({
        success: false,
        message: "Invalid event type"
      });
    }

  } catch (error) {
    console.error("❌ Create booking error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking"
    });
  }
};

// Create booking for full-service events (requires merchant approval)
export const createFullServiceBooking = async (req, res) => {
  try {
    console.log("=== FULL SERVICE BOOKING REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const { eventId, serviceDate, notes, guestCount, couponCode } = req.body;
    const userId = req.user.userId || req.user._id;

    console.log(`=== CREATE FULL SERVICE BOOKING ===`);
    console.log(`Event ID: ${eventId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Service Date: ${serviceDate}`);
    console.log(`Guest Count: ${guestCount}`);
    console.log(`Notes: ${notes}`);
    console.log(`Coupon Code: ${couponCode}`);

    if (!userId) {
      console.log("❌ No user ID found");
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Fetch user data for customer information
    const { User } = await import("../models/userSchema.js");
    const user = await User.findById(userId).select("name email");
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log(`✅ User found: ${user.name} (${user.email})`);

    // Find the event
    const event = await Event.findById(eventId).populate("createdBy", "name email");
    if (!event) {
      console.log("❌ Event not found in full-service handler");
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    console.log("✅ Event found for full-service booking:", event.title);

    // Verify it's a full-service event
    if (event.eventType !== "full-service") {
      console.log("❌ Event is not full-service type:", event.eventType);
      return res.status(400).json({ 
        success: false, 
        message: "This endpoint is only for full-service events" 
      });
    }

    console.log("🔄 Creating new booking...");

    // Calculate pricing with coupon if provided
    const originalAmount = event.price || 0;
    let discountAmount = 0;
    let finalAmount = originalAmount;
    let couponId = null;

    if (couponCode) {
      console.log("🎫 Processing coupon:", couponCode);
      
      // Find and validate coupon
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(),
        isActive: true 
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code"
        });
      }

      // Check if coupon is expired
      if (new Date() > coupon.expiryDate) {
        return res.status(400).json({
          success: false,
          message: "Coupon has expired"
        });
      }

      // Check usage limit
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "Coupon usage limit exceeded"
        });
      }

      // Check minimum amount
      if (originalAmount < coupon.minAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${coupon.minAmount} required`
        });
      }

      // Check if user has already used this coupon
      const existingUsage = coupon.usageHistory.find(
        usage => usage.user.toString() === userId.toString()
      );

      if (existingUsage) {
        return res.status(400).json({
          success: false,
          message: "You have already used this coupon"
        });
      }

      // Calculate discount
      if (coupon.discountType === "percentage") {
        discountAmount = (originalAmount * coupon.discountValue) / 100;
        
        // Apply maximum discount cap if specified
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon.discountType === "flat") {
        discountAmount = coupon.discountValue;
        
        // Ensure discount doesn't exceed total amount
        if (discountAmount > originalAmount) {
          discountAmount = originalAmount;
        }
      }

      // Round discount to 2 decimal places
      discountAmount = Math.round(discountAmount * 100) / 100;
      finalAmount = originalAmount - discountAmount;
      couponId = coupon._id;

      console.log(`✅ Coupon applied: ${couponCode}, Discount: ₹${discountAmount}, Final: ₹${finalAmount}`);
    }

    // Create booking with pending status
    const bookingData = {
      user: userId,
      merchant: event.createdBy._id,
      type: "event",
      eventType: "full-service",
      eventId: eventId,
      eventTitle: event.title,
      eventCategory: event.category,
      eventPrice: event.price,
      eventLocation: event.location || "Location TBD",
      eventTime: event.time || "06:00 PM",
      // Store customer information for easy access
      attendeeName: user.name || "Unknown User",
      attendeeEmail: user.email || "No email",
      serviceDate: serviceDate ? new Date(serviceDate) : (event.date || new Date()),
      serviceTime: "10:00 AM", // Default time, merchant can adjust
      bookingDate: new Date(),
      eventDate: event.date || new Date(),
      notes: notes || "",
      guestCount: guestCount || 1,
      totalPrice: originalAmount,
      originalAmount: originalAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      couponCode: couponCode ? couponCode.toUpperCase() : null,
      couponId: couponId,
      bookingStatus: "pending", // Full-service starts as pending
      status: "pending", // IMPORTANT: Full-service bookings start as pending
      paymentStatus: "pending", // Payment pending until merchant approves
      rating: null,
      review: null
    };

    console.log("📝 Booking data to save:", JSON.stringify(bookingData, null, 2));

    const booking = await Booking.create(bookingData);

    // If coupon was used, update coupon usage
    if (couponCode && couponId) {
      await Coupon.findByIdAndUpdate(couponId, {
        $inc: { usedCount: 1 },
        $push: {
          usageHistory: {
            user: userId,
            booking: booking._id,
            usedAt: new Date(),
            discountAmount: discountAmount
          }
        }
      });
      console.log("✅ Coupon usage updated");
    }

    console.log("✅ Booking created successfully:", booking._id);

    // Create notification for merchant
    try {
      await Notification.create({
        user: event.createdBy._id,
        message: `New service booking request for "${event.title}" from ${req.user.name || "User"}`,
        eventId: event._id,
        bookingId: booking._id,
        type: "booking"
      });
      console.log("✅ Notification created for merchant");
    } catch (notifError) {
      console.error("⚠️ Failed to create notification:", notifError);
    }

    console.log(`✅ Full service booking created successfully: ${booking._id}`);

    return res.status(201).json({
      success: true,
      message: "Service booking request sent to merchant",
      booking: {
        ...booking.toObject(),
        merchantName: event.createdBy.name
      }
    });

  } catch (error) {
    console.error("❌ Create full service booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create booking request"
    });
  }
};

// Create booking for ticketed events (immediate confirmation after payment)
export const createTicketedBooking = async (req, res) => {
  try {
    const { eventId, ticketType, quantity, paymentMethod, couponCode } = req.body;
    const userId = req.user.userId || req.user._id;

    console.log(`=== CREATE TICKETED BOOKING ===`);
    console.log(`Event ID: ${eventId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Ticket Type: ${ticketType}`);
    console.log(`Quantity: ${quantity}`);
    console.log(`Coupon Code: ${couponCode}`);

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket quantity"
      });
    }

    // Fetch user data for customer information
    const { User } = await import("../models/userSchema.js");
    const user = await User.findById(userId).select("name email");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log(`✅ User found: ${user.name} (${user.email})`);

    // Find the event
    const event = await Event.findById(eventId).populate("createdBy", "name email");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Verify it's a ticketed event
    if (event.eventType !== "ticketed") {
      return res.status(400).json({ 
        success: false, 
        message: "This endpoint is only for ticketed events" 
      });
    }

    // Find the specific ticket type
    const selectedTicketType = event.ticketTypes.find(t => t.name === ticketType);
    if (!selectedTicketType) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket type selected"
      });
    }

    // Check ticket availability
    const availableQuantity = selectedTicketType.quantityTotal - selectedTicketType.quantitySold;
    if (availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `${ticketType} tickets are sold out`
      });
    }

    if (quantity > availableQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableQuantity} ${ticketType} tickets available`
      });
    }

    // Calculate pricing with coupon if provided
    const originalAmount = selectedTicketType.price * quantity;
    let discountAmount = 0;
    let finalAmount = originalAmount;
    let couponId = null;

    if (couponCode) {
      console.log("🎫 Processing coupon:", couponCode);
      
      // Find and validate coupon
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(),
        isActive: true 
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code"
        });
      }

      // Check if coupon is expired
      if (new Date() > coupon.expiryDate) {
        return res.status(400).json({
          success: false,
          message: "Coupon has expired"
        });
      }

      // Check usage limit
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "Coupon usage limit exceeded"
        });
      }

      // Check minimum amount
      if (originalAmount < coupon.minAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${coupon.minAmount} required`
        });
      }

      // Check if user has already used this coupon
      const existingUsage = coupon.usageHistory.find(
        usage => usage.user.toString() === userId.toString()
      );

      if (existingUsage) {
        return res.status(400).json({
          success: false,
          message: "You have already used this coupon"
        });
      }

      // Calculate discount
      if (coupon.discountType === "percentage") {
        discountAmount = (originalAmount * coupon.discountValue) / 100;
        
        // Apply maximum discount cap if specified
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon.discountType === "flat") {
        discountAmount = coupon.discountValue;
        
        // Ensure discount doesn't exceed total amount
        if (discountAmount > originalAmount) {
          discountAmount = originalAmount;
        }
      }

      // Round discount to 2 decimal places
      discountAmount = Math.round(discountAmount * 100) / 100;
      finalAmount = originalAmount - discountAmount;
      couponId = coupon._id;

      console.log(`✅ Coupon applied: ${couponCode}, Discount: ₹${discountAmount}, Final: ₹${finalAmount}`);
    }

    // Generate payment and ticket IDs
    const paymentId = `PAY_${uuidv4().substring(0, 8).toUpperCase()}`;
    const ticketId = `TKT_${uuidv4().substring(0, 8).toUpperCase()}`;

    // Update ticket availability (CRITICAL: Update sold count)
    selectedTicketType.quantitySold += quantity;
    
    // Recalculate total available tickets across all ticket types
    event.availableTickets = event.ticketTypes.reduce((total, ticket) => {
      return total + (ticket.quantityTotal - ticket.quantitySold);
    }, 0);
    
    // Save the event with updated ticket counts
    await event.save();

    console.log(`✅ Updated ticket availability: ${ticketType} sold: ${selectedTicketType.quantitySold}/${selectedTicketType.quantityTotal}`);

    // Create confirmed booking with pending payment (user needs to pay)
    const booking = await Booking.create({
      user: userId,
      merchant: event.createdBy._id,
      type: "event",
      eventType: "ticketed",
      eventId: eventId,
      eventTitle: event.title,
      eventCategory: event.category,
      eventLocation: event.location || "Location TBD",
      eventDate: event.date || new Date(),
      eventTime: event.time || "06:00 PM",
      // Store customer information for easy access
      attendeeName: user.name || "Unknown User",
      attendeeEmail: user.email || "No email",
      ticketType: ticketType,
      ticketCount: quantity,
      bookingDate: new Date(),
      totalPrice: originalAmount,
      originalAmount: originalAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      couponCode: couponCode ? couponCode.toUpperCase() : null,
      couponId: couponId,
      bookingStatus: "confirmed", // Automatically confirmed for ticketed events
      status: "pending", // Will be completed after payment
      paymentStatus: "pending", // User needs to pay
      paymentId: paymentId,
      paymentAmount: finalAmount, // Use final amount for payment
      paymentMethod: paymentMethod || "Card",
      ticketId: ticketId,
      ticketGenerated: false, // Will be true after payment
      rating: null,
      review: null
    });

    // If coupon was used, update coupon usage
    if (couponCode && couponId) {
      await Coupon.findByIdAndUpdate(couponId, {
        $inc: { usedCount: 1 },
        $push: {
          usageHistory: {
            user: userId,
            booking: booking._id,
            usedAt: new Date(),
            discountAmount: discountAmount
          }
        }
      });
      console.log("✅ Coupon usage updated");
    }

    // Create notification for user
    try {
      await Notification.create({
        user: userId,
        message: `Ticket booking created for "${event.title}". Please complete payment to confirm your tickets.`,
        eventId: event._id,
        bookingId: booking._id,
        type: "booking"
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Ticketed booking created (payment pending): ${booking._id}`);

    return res.status(201).json({
      success: true,
      message: "Ticket booking created successfully. Please complete payment.",
      booking: {
        ...booking.toObject(),
        merchantName: event.createdBy.name
      },
      ticketDetails: {
        ticketId,
        paymentId,
        eventTitle: event.title,
        eventDate: event.date,
        location: event.location,
        ticketType,
        quantity,
        originalAmount,
        discountAmount,
        finalAmount,
        couponApplied: !!couponCode
      }
    });

  } catch (error) {
    console.error("Create ticketed booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create ticket booking"
    });
  }
};

// Get available ticket types for an event
export const getEventTicketTypes = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.eventType !== "ticketed") {
      return res.status(400).json({
        success: false,
        message: "This event does not have ticket types"
      });
    }

    const ticketTypesWithAvailability = event.ticketTypes.map(ticket => ({
      name: ticket.name,
      price: ticket.price,
      quantityTotal: ticket.quantityTotal,
      quantitySold: ticket.quantitySold,
      quantityAvailable: ticket.quantityTotal - ticket.quantitySold
    }));

    return res.status(200).json({
      success: true,
      ticketTypes: ticketTypesWithAvailability,
      eventDetails: {
        title: event.title,
        date: event.date,
        location: event.location
      }
    });

  } catch (error) {
    console.error("Get ticket types error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ticket types"
    });
  }
};

// Approve full-service booking (merchant only)
export const approveFullServiceBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const merchantId = req.user.userId;

    console.log(`=== APPROVE FULL SERVICE BOOKING ===`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`Merchant ID: ${merchantId}`);

    // Find the booking
    const booking = await Booking.findById(bookingId).populate("user", "name email");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify merchant owns this booking
    if (String(booking.merchant) !== String(merchantId)) {
      return res.status(403).json({
        success: false,
        message: "You can only approve your own event bookings"
      });
    }

    // Verify it's a full-service booking
    if (booking.eventType !== "full-service") {
      return res.status(400).json({
        success: false,
        message: "Only full-service bookings require approval"
      });
    }

    // Update booking status
    booking.bookingStatus = "confirmed";
    await booking.save();

    // Create notification for user
    try {
      await Notification.create({
        user: booking.user._id,
        message: `Your service booking for "${booking.eventTitle}" has been approved. Please proceed to payment.`,
        eventId: booking.eventId,
        bookingId: booking._id,
        type: "booking_approved"
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Booking approved: ${bookingId}`);

    return res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      booking
    });

  } catch (error) {
    console.error("Approve booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve booking"
    });
  }
};

// Reject full-service booking (merchant only)
export const rejectFullServiceBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const merchantId = req.user.userId;

    console.log(`=== REJECT FULL SERVICE BOOKING ===`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`Merchant ID: ${merchantId}`);

    // Find the booking
    const booking = await Booking.findById(bookingId).populate("user", "name email");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify merchant owns this booking
    if (String(booking.merchant) !== String(merchantId)) {
      return res.status(403).json({
        success: false,
        message: "You can only reject your own event bookings"
      });
    }

    // Update booking status
    booking.bookingStatus = "cancelled";
    if (reason) {
      booking.review = `Rejection reason: ${reason}`;
    }
    await booking.save();

    // Create notification for user
    try {
      await Notification.create({
        user: booking.user._id,
        message: `Your service booking for "${booking.eventTitle}" has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
        eventId: booking.eventId,
        bookingId: booking._id,
        type: "booking_rejected"
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Booking rejected: ${bookingId}`);

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      booking
    });

  } catch (error) {
    console.error("Reject booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject booking"
    });
  }
};

// Get merchant's service requests (full-service bookings only)
export const getMerchantServiceRequests = async (req, res) => {
  try {
    const merchantId = req.user.userId;

    console.log(`=== GET MERCHANT SERVICE REQUESTS ===`);
    console.log(`Merchant ID: ${merchantId}`);

    const bookings = await Booking.find({
      merchant: merchantId,
      eventType: "full-service",
      type: "event"
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    console.log(`Found ${bookings.length} service requests for merchant ${merchantId}`);

    return res.status(200).json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error("Get service requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service requests"
    });
  }
};

// Update event (merchant only)
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const merchantId = req.user.userId;
    const { title, description, category, location, date, time, price, ticketTypes, features } = req.body;

    console.log(`=== UPDATE EVENT ===`);
    console.log(`Event ID: ${eventId}`);
    console.log(`Merchant ID: ${merchantId}`);

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Verify merchant owns this event
    if (String(event.createdBy) !== String(merchantId)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own events"
      });
    }

    // Update basic fields
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (category) event.category = category;
    if (location !== undefined) event.location = location;
    if (date) event.date = new Date(date);
    if (time !== undefined) event.time = time;

    // Handle event type specific updates
    if (event.eventType === "full-service") {
      if (price !== undefined) event.price = Number(price) || 0;
      if (features) {
        event.features = Array.isArray(features) ? features : JSON.parse(features);
      }
    } else if (event.eventType === "ticketed") {
      if (ticketTypes) {
        const parsedTicketTypes = Array.isArray(ticketTypes) ? ticketTypes : JSON.parse(ticketTypes);
        
        // Update ticket types while preserving sold quantities
        parsedTicketTypes.forEach(newTicket => {
          const existingTicket = event.ticketTypes.find(t => t.name === newTicket.name);
          if (existingTicket) {
            // Update price and quantity, keep sold count
            existingTicket.price = Number(newTicket.price) || existingTicket.price;
            existingTicket.quantityTotal = Number(newTicket.quantityTotal) || existingTicket.quantityTotal;
            // quantitySold remains unchanged
          } else {
            // Add new ticket type
            event.ticketTypes.push({
              name: newTicket.name,
              price: Number(newTicket.price) || 0,
              quantityTotal: Number(newTicket.quantityTotal) || 0,
              quantitySold: 0
            });
          }
        });

        // Remove ticket types that are no longer in the update
        const newTicketNames = parsedTicketTypes.map(t => t.name);
        event.ticketTypes = event.ticketTypes.filter(ticket => 
          newTicketNames.includes(ticket.name)
        );

        // Recalculate total and available tickets
        event.totalTickets = event.ticketTypes.reduce((total, ticket) => {
          return total + ticket.quantityTotal;
        }, 0);
        
        event.availableTickets = event.ticketTypes.reduce((total, ticket) => {
          return total + (ticket.quantityTotal - ticket.quantitySold);
        }, 0);
      }
    }

    // Save the updated event
    await event.save();

    console.log(`✅ Event updated successfully: ${eventId}`);

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event
    });

  } catch (error) {
    console.error("Update event error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update event"
    });
  }
};

// Accept booking (merchant only) - for full-service events
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.userId;

    console.log(`=== ACCEPT BOOKING ===`);
    console.log(`Booking ID: ${id}`);
    console.log(`Merchant ID: ${merchantId}`);

    const booking = await Booking.findById(id).populate("user", "name email");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify merchant owns this booking
    if (String(booking.merchant) !== String(merchantId)) {
      return res.status(403).json({
        success: false,
        message: "You can only accept your own bookings"
      });
    }

    // Only pending bookings can be accepted
    if (booking.bookingStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be accepted"
      });
    }

    booking.bookingStatus = "confirmed";
    booking.status = "processing";
    await booking.save();

    // Create notification for user
    try {
      const { Notification } = await import("../models/notificationSchema.js");
      await Notification.create({
        user: booking.user._id,
        message: `Your booking for "${booking.eventTitle}" has been accepted. Please proceed to payment.`,
        eventId: booking.eventId,
        bookingId: booking._id,
        type: "booking_accepted"
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Booking accepted: ${id}`);

    return res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      booking
    });

  } catch (error) {
    console.error("Accept booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept booking"
    });
  }
};

// Reject booking (merchant only) - for full-service events
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const merchantId = req.user.userId;

    console.log(`=== REJECT BOOKING ===`);
    console.log(`Booking ID: ${id}`);
    console.log(`Merchant ID: ${merchantId}`);

    const booking = await Booking.findById(id).populate("user", "name email");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify merchant owns this booking
    if (String(booking.merchant) !== String(merchantId)) {
      return res.status(403).json({
        success: false,
        message: "You can only reject your own bookings"
      });
    }

    // Only pending bookings can be rejected
    if (booking.bookingStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be rejected"
      });
    }

    booking.bookingStatus = "cancelled";
    if (reason) {
      booking.review = `Rejection reason: ${reason}`;
    }
    await booking.save();

    // Create notification for user
    try {
      const { Notification } = await import("../models/notificationSchema.js");
      await Notification.create({
        user: booking.user._id,
        message: `Your booking for "${booking.eventTitle}" has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
        eventId: booking.eventId,
        bookingId: booking._id,
        type: "booking_rejected"
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Booking rejected: ${id}`);

    return res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      booking
    });

  } catch (error) {
    console.error("Reject booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject booking"
    });
  }
};

// Complete booking (merchant only)
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.userId;

    console.log(`=== COMPLETE BOOKING ===`);
    console.log(`Booking ID: ${id}`);
    console.log(`Merchant ID: ${merchantId}`);

    const booking = await Booking.findById(id).populate("user", "name email");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify merchant owns this booking
    if (String(booking.merchant) !== String(merchantId)) {
      return res.status(403).json({
        success: false,
        message: "You can only complete your own bookings"
      });
    }

    // Only confirmed and paid bookings can be completed
    if (booking.bookingStatus !== "confirmed" || booking.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed and paid bookings can be completed"
      });
    }

    booking.bookingStatus = "completed";
    booking.status = "completed";
    await booking.save();

    // Create notification for user
    try {
      const { Notification } = await import("../models/notificationSchema.js");
      await Notification.create({
        user: booking.user._id,
        message: `Your event "${booking.eventTitle}" has been completed. You can now rate and review this event.`,
        eventId: booking.eventId,
        bookingId: booking._id,
        type: "booking_completed"
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Booking completed: ${id}`);

    return res.status(200).json({
      success: true,
      message: "Booking completed successfully",
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

// Process payment for booking
export const processPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    console.log(`=== PROCESS PAYMENT ===`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`User ID: ${userId}`);

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify user owns this booking
    if (String(booking.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own bookings"
      });
    }

    // Only pending payments can be processed
    if (booking.paymentStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been paid"
      });
    }

    booking.paymentStatus = "paid";
    booking.paymentDate = new Date();
    await booking.save();

    // Create notification for merchant
    try {
      const { Notification } = await import("../models/notificationSchema.js");
      await Notification.create({
        user: booking.merchant,
        message: `Payment received for booking "${booking.eventTitle}" from ${booking.user?.name || "User"}`,
        eventId: booking.eventId,
        bookingId: booking._id,
        type: "payment_received"
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Payment processed: ${bookingId}`);

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      booking
    });

  } catch (error) {
    console.error("Process payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process payment"
    });
  }
};

// Add rating and review to booking
export const addRating = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.userId;

    console.log(`=== ADD RATING ===`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Rating: ${rating}`);

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify user owns this booking
    if (String(booking.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only rate your own bookings"
      });
    }

    // Only completed and paid bookings can be rated
    // For ticketed events: just need to be paid (auto-completed after payment)
    // For full-service events: need to be completed by merchant AND paid
    const canRate = booking.paymentStatus === "paid" && 
      (booking.eventType === "ticketed" || booking.bookingStatus === "completed");
    
    if (!canRate) {
      return res.status(400).json({
        success: false,
        message: booking.eventType === "ticketed" 
          ? "Only paid ticketed bookings can be rated"
          : "Only completed and paid bookings can be rated"
      });
    }

    // Check if already rated
    if (booking.isRated) {
      return res.status(400).json({
        success: false,
        message: "This booking has already been rated"
      });
    }

    booking.rating = rating;
    booking.review = review || null;
    booking.isRated = true;
    await booking.save();

    // Update event average rating
    try {
      const { Event } = await import("../models/eventSchema.js");
      const event = await Event.findById(booking.eventId);
      if (event) {
        const currentTotal = event.rating.average * event.rating.totalRatings;
        const newTotalRatings = event.rating.totalRatings + 1;
        const newAverage = (currentTotal + rating) / newTotalRatings;
        
        event.rating.average = Math.round(newAverage * 10) / 10; // Round to 1 decimal
        event.rating.totalRatings = newTotalRatings;
        await event.save();
        
        console.log(`✅ Event rating updated: ${event.rating.average} (${newTotalRatings} ratings)`);
      }
    } catch (eventError) {
      console.error("Failed to update event rating:", eventError);
    }

    // Also create a rating record in Rating collection
    try {
      const { Rating } = await import("../models/ratingSchema.js");
      await Rating.findOneAndUpdate(
        { user: userId, event: booking.eventId },
        { rating, review },
        { upsert: true, new: true }
      );
    } catch (ratingError) {
      console.error("Failed to create rating record:", ratingError);
    }

    console.log(`✅ Rating added: ${bookingId}`);

    return res.status(200).json({
      success: true,
      message: "Rating added successfully",
      booking
    });

  } catch (error) {
    console.error("Add rating error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add rating"
    });
  }
};

// Get all bookings for merchant with ratings (CONFIRMED BOOKINGS)
export const getMerchantBookings = async (req, res) => {
  try {
    const merchantId = req.user.userId;

    console.log(`=== GET MERCHANT CONFIRMED BOOKINGS ===`);
    console.log(`Merchant ID: ${merchantId}`);

    // Get confirmed bookings: completed + paid (includes both full-service and ticketed)
    const bookings = await Booking.find({
      merchant: merchantId,
      type: "event",
      $or: [
        // Ticketed events: automatically completed after payment
        { eventType: "ticketed", paymentStatus: "paid" },
        // Full-service events: completed by merchant + paid
        { eventType: "full-service", bookingStatus: "completed", paymentStatus: "paid" }
      ]
    })
      .populate("user", "name email")
      .populate("eventId", "title date location time")
      .sort({ createdAt: -1 });

    console.log(`Found ${bookings.length} confirmed bookings for merchant`);

    // Format bookings with complete data
    const formattedBookings = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      
      return {
        ...bookingObj,
        // Use booking fields first, then fall back to populated event data
        eventTitle: bookingObj.eventTitle || booking.eventId?.title || "Event",
        eventDate: bookingObj.eventDate || booking.eventId?.date,
        eventLocation: bookingObj.eventLocation || booking.eventId?.location || "Location TBD",
        eventTime: bookingObj.eventTime || booking.eventId?.time || "Time TBD",
        
        // Customer information
        customerName: bookingObj.attendeeName || booking.user?.name || "Unknown Customer",
        customerEmail: bookingObj.attendeeEmail || booking.user?.email || "No email",
        
        // Rating information (from booking itself)
        rating: bookingObj.rating || null,
        review: bookingObj.review || null,
        isRated: bookingObj.isRated || false,
        
        // Ensure all status fields are present
        bookingStatus: bookingObj.bookingStatus || "pending",
        paymentStatus: bookingObj.paymentStatus || "pending",
        status: bookingObj.status || "pending",
        
        // Event type for conditional logic
        eventType: bookingObj.eventType || "full-service",
        
        // Pricing information
        totalPrice: bookingObj.totalPrice || bookingObj.finalAmount || 0,
        finalAmount: bookingObj.finalAmount || bookingObj.totalPrice || 0,
        
        // Booking metadata
        bookingDate: bookingObj.bookingDate,
        paymentDate: bookingObj.paymentDate,
        createdAt: bookingObj.createdAt,
        updatedAt: bookingObj.updatedAt
      };
    });

    console.log(`Returning ${formattedBookings.length} confirmed bookings`);
    
    // Debug: Log first booking to verify data structure
    if (formattedBookings.length > 0) {
      console.log("Sample confirmed booking data:", {
        eventTitle: formattedBookings[0].eventTitle,
        eventLocation: formattedBookings[0].eventLocation,
        eventTime: formattedBookings[0].eventTime,
        customerName: formattedBookings[0].customerName,
        rating: formattedBookings[0].rating,
        eventType: formattedBookings[0].eventType,
        bookingStatus: formattedBookings[0].bookingStatus,
        paymentStatus: formattedBookings[0].paymentStatus
      });
    }

    return res.status(200).json({
      success: true,
      bookings: formattedBookings
    });

  } catch (error) {
    console.error("Get merchant confirmed bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch confirmed bookings"
    });
  }
};

// Get user bookings
export const getBookingsByUserId = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    console.log(`=== GET USER BOOKINGS ===`);
    console.log(`User ID: ${userId}`);

    const bookings = await Booking.find({
      user: userId,
      type: "event"
    })
      .populate("merchant", "name email")
      .populate("eventId", "eventType title") // Populate event details including eventType
      .sort({ createdAt: -1 });

    console.log(`Found ${bookings.length} bookings for user ${userId}`);

    // Format bookings with additional info
    const formattedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      
      // Ensure eventType is set from the populated event if missing
      if (!bookingObj.eventType && bookingObj.eventId?.eventType) {
        bookingObj.eventType = bookingObj.eventId.eventType;
      }
      
      return {
        ...bookingObj,
        canPay: booking.bookingStatus === "confirmed" && booking.paymentStatus !== "paid",
        isConfirmed: booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid",
        merchantName: booking.merchant?.name || "Unknown Merchant"
      };
    });

    return res.status(200).json({
      success: true,
      bookings: formattedBookings
    });

  } catch (error) {
    console.error("Get user bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};

// Update booking status (merchant only) - for three-button system
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const merchantId = req.user.userId;

    console.log(`=== UPDATE BOOKING STATUS ===`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`New Status: ${status}`);
    console.log(`Merchant ID: ${merchantId}`);

    // Validate status
    const validStatuses = ["pending", "processing", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, processing, completed"
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate("user", "name email");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify merchant owns this booking
    if (String(booking.merchant) !== String(merchantId)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own event bookings"
      });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    // Create notification for user based on status
    let notificationMessage = "";
    let notificationType = "booking_status_update";

    switch (status) {
      case "pending":
        notificationMessage = `Your booking for "${booking.eventTitle}" is now pending review.`;
        break;
      case "processing":
        notificationMessage = `Your booking for "${booking.eventTitle}" is being processed. Event preparations are underway.`;
        break;
      case "completed":
        notificationMessage = `Your event "${booking.eventTitle}" has been completed. You can now rate and review this event.`;
        notificationType = "booking_completed";
        break;
    }

    // Create notification for user
    try {
      await Notification.create({
        user: booking.user._id,
        message: notificationMessage,
        eventId: booking.eventId,
        bookingId: booking._id,
        type: notificationType
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Booking status updated to ${status}: ${bookingId}`);

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status} successfully`,
      booking
    });

  } catch (error) {
    console.error("Update booking status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update booking status"
    });
  }
};

// Mark booking as completed (merchant only)
export const markBookingCompleted = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const merchantId = req.user.userId;

    console.log(`=== MARK BOOKING COMPLETED ===`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`Merchant ID: ${merchantId}`);

    // Find the booking
    const booking = await Booking.findById(bookingId).populate("user", "name email");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify merchant owns this booking
    if (String(booking.merchant) !== String(merchantId)) {
      return res.status(403).json({
        success: false,
        message: "You can only complete your own event bookings"
      });
    }

    // Verify booking is in a state that can be completed
    if (booking.bookingStatus !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be marked as completed"
      });
    }

    // Update booking status to completed
    booking.bookingStatus = "completed";
    booking.status = "completed";
    await booking.save();

    // Create notification for user
    try {
      await Notification.create({
        user: booking.user._id,
        message: `Your event "${booking.eventTitle}" has been completed. You can now rate and review this event.`,
        eventId: booking.eventId,
        bookingId: booking._id,
        type: "booking_completed"
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    console.log(`✅ Booking marked as completed: ${bookingId}`);

    return res.status(200).json({
      success: true,
      message: "Booking marked as completed successfully",
      booking
    });

  } catch (error) {
    console.error("Mark booking completed error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark booking as completed"
    });
  }
};

// Get bookings by user ID (for QR codes and admin purposes)
export const getBookingsByUserIdAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId || req.user._id;

    // Only allow users to access their own bookings or admin access
    if (userId !== requestingUserId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    console.log(`=== GET BOOKINGS BY USER ID ===`);
    console.log(`Requested User ID: ${userId}`);
    console.log(`Requesting User ID: ${requestingUserId}`);

    const bookings = await Booking.find({
      user: userId,
      type: "event"
    })
      .populate("merchant", "name email")
      .sort({ createdAt: -1 });

    console.log(`Found ${bookings.length} bookings for user ${userId}`);

    return res.status(200).json({
      success: true,
      bookings: bookings
    });

  } catch (error) {
    console.error("Get bookings by user ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};