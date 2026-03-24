import { Event } from "../models/eventSchema.js";
import { Registration } from "../models/registrationSchema.js";

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
