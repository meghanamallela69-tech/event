import { Event } from "../models/eventSchema.js";
import { Registration } from "../models/registrationSchema.js";
import { Booking } from "../models/bookingSchema.js";

export const listEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .select('title description price category date time location eventType addons ticketTypes availableTickets totalTickets images createdBy status')
      .sort({ date: 1 });
    
    // Enhance events with default dates/times if missing
    const enhancedEvents = events.map(event => {
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
      
      return eventObj;
    });
    
    // Debug: Log first event to check addons
    if (enhancedEvents.length > 0) {
      console.log('First event addons:', enhancedEvents[0].addons);
      console.log('First event date/time:', enhancedEvents[0].date, enhancedEvents[0].time);
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
