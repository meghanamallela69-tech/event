import { Event } from "../models/eventSchema.js";
import { Registration } from "../models/registrationSchema.js";

export const listEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .select('title description price category date time location eventType addons ticketTypes availableTickets totalTickets images createdBy status')
      .sort({ date: 1 });
    
    // Debug: Log first event to check addons
    if (events.length > 0) {
      console.log('First event addons:', events[0].addons);
    }
    
    return res.status(200).json({ success: true, events });
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
