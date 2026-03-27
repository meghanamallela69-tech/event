import mongoose from "mongoose";
import { Event } from "../models/eventSchema.js";
import { Registration } from "../models/registrationSchema.js";
import { Booking } from "../models/bookingSchema.js";
import { Coupon } from "../models/couponSchema.js";

export const listEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .select('title description price category date time location eventType addons ticketTypes availableTickets totalTickets images createdBy status')
      .populate('createdBy', 'name email profileImage')
      .sort({ date: 1 });
    
    // Enhance events with default dates/times if missing
    const enhancedEvents = await Promise.all(events.map(async (event) => {
      const eventObj = event.toObject();
      
      // If no date, set a default future date
      if (!eventObj.date) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
        eventObj.date = futureDate;
      }
      
      // If no time, set a default time
      if (!eventObj.time || eventObj.time === "") {
        eventObj.time = "18:00"; // 6:00 PM
      }
      
      // Fetch valid coupons for this event (merchant-created coupons with new applyTo logic)
      const validCoupons = await Coupon.find({
        merchantId: event.createdBy, // Must match event merchant
        isActive: true,
        expiryDate: { $gt: new Date() },
        $or: [
          { applyTo: "ALL" }, // Applies to all events
          { applyTo: "EVENT", eventId: event._id } // Applies to this specific event
        ]
      })
      .select('code discountType discountValue maxDiscount minAmount expiryDate description usedCount usageLimit')
      .populate('createdBy', 'name');
      
      console.log(`\n🎫  Event: ${event.title}`);
      console.log(`   Event ID: ${event._id}`);
      console.log(`   Event Merchant ID: ${event.createdBy}`);
      console.log(`   Coupons Query: $or=[{applyTo:"ALL"}, {applyTo:"EVENT", eventId:${event._id}}]`);
      console.log(`   Found ${validCoupons.length} raw coupons from DB`);
      
      // Log each coupon with its applyTo type
      validCoupons.forEach((coupon, index) => {
        console.log(`   [${index}] ${coupon.code} | applyTo: ${coupon.applyTo || 'N/A'} | eventId: ${coupon.eventId || 'null'}`);
      });
      
      // Filter coupons that haven't reached usage limit
      const filteredCoupons = validCoupons.filter(coupon => {
        const withinLimit = coupon.usedCount < coupon.usageLimit;
        console.log(`   Coupon "${coupon.code}" (${coupon.applyTo}): used=${coupon.usedCount}, limit=${coupon.usageLimit}, withinLimit=${withinLimit}`);
        return withinLimit;
      });
      
      console.log(`   ✅ Final coupons after filtering: ${filteredCoupons.length}`);
      console.log(`      - applyTo ALL: ${filteredCoupons.filter(c => c.applyTo === 'ALL').length}`);
      console.log(`      - applyTo EVENT: ${filteredCoupons.filter(c => c.applyTo === 'EVENT').length}\n`);
      
      // Convert to plain object and add coupons
      eventObj.coupons = filteredCoupons.map(coupon => ({
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minAmount: coupon.minAmount,
        expiryDate: coupon.expiryDate,
        description: coupon.description,
        createdBy: coupon.createdBy
      }));
      
      return eventObj;
    }));
    
    // Debug: Log first event to check addons
    if (enhancedEvents.length > 0) {
      console.log('First event addons:', enhancedEvents[0].addons);
      console.log('First event date/time:', enhancedEvents[0].date, enhancedEvents[0].time);
      console.log('First event createdBy:', enhancedEvents[0].createdBy);
      console.log('First event coupons:', enhancedEvents[0].coupons);
      
      // Log coupon count for all events
      const totalCoupons = enhancedEvents.reduce((sum, event) => sum + (event.coupons?.length || 0), 0);
      console.log(`\n📊 COUPON SUMMARY:`);
      console.log(`Total events: ${enhancedEvents.length}`);
      console.log(`Total coupons across all events: ${totalCoupons}`);
      enhancedEvents.forEach(event => {
        const couponCodes = event.coupons?.map(c => c.code).join(', ') || 'None';
        console.log(`Event "${event.title}": ${event.coupons?.length || 0} coupons [${couponCodes}]`);
      });
    }
    
    return res.status(200).json({ success: true, events: enhancedEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const exists = await Event.findById(eventId);
    if (!exists) return res.status(404).json({ success: false, message: "Event not found" });
    const already = await Registration.findOne({ user: req.user.userId, event: eventId });
    if (already) return res.status(409).json({ success: false, message: "Already registered" });
    await Registration.create({ user: req.user.userId, event: eventId });
    return res.status(201).json({ success: true, message: "Registered successfully" });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const userRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ user: req.user.userId }).populate("event");
    return res.status(200).json({ success: true, registrations: regs });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

// Search events by keyword (name, category, or location)
export const searchEvents = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword || keyword.trim() === '') {
      // If no keyword, return all events
      return listEvents(req, res);
    }

    const searchRegex = new RegExp(keyword, 'i'); // Case-insensitive regex
    
    const events = await Event.find({
      $or: [
        { title: searchRegex },
        { category: searchRegex },
        { location: searchRegex }
      ]
    })
    .select('title description price category date time location eventType addons ticketTypes availableTickets totalTickets images createdBy status')
    .populate('createdBy', 'name email profileImage')
    .sort({ date: 1 });
    
    // Enhance events with default dates/times if missing
    const enhancedEvents = events.map(event => {
      const eventObj = event.toObject();
      
      if (!eventObj.date) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        eventObj.date = futureDate;
      }
      
      if (!eventObj.time || eventObj.time === "") {
        eventObj.time = "18:00";
      }
      
      return eventObj;
    });
    
    return res.status(200).json({ 
      success: true, 
      events: enhancedEvents,
      count: enhancedEvents.length
    });
  } catch (error) {
    console.error('Error searching events:', error);
    return res.status(500).json({ success: false, message: "Error searching events" });
  }
};

// Get recent bookings for user dashboard (limit 3)
export const getRecentBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 3; // Default to 3 bookings
    
    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    // Enhance bookings with event data
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        
        if (bookingObj.serviceId) {
          try {
            const event = await Event.findById(bookingObj.serviceId);
            if (event) {
              // Add event images
              bookingObj.eventImages = event.images || [];
              bookingObj.eventImage = event.images && event.images.length > 0 ? event.images[0].url : null;
              
              // Update missing date/time
              if (event.date && !bookingObj.eventDate) {
                bookingObj.eventDate = event.date;
              }
              if (event.time && (!bookingObj.eventTime || bookingObj.eventTime === "TBD")) {
                bookingObj.eventTime = event.time;
              }
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
      bookings: enhancedBookings,
      count: enhancedBookings.length
    });
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    return res.status(500).json({ success: false, message: "Error fetching recent bookings" });
  }
};
