import { Event } from "../models/eventSchema.js";
import { Registration } from "../models/registrationSchema.js";
import { uploadMultipleImages, deleteMultipleImages } from "../util/cloudinary.js";

export const createEvent = async (req, res) => {
  try {
    const {
      title, description, category, price, rating, features,
      eventType, location, date, time, duration,
      totalTickets, ticketPrice, addons,
    } = req.body;

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    // Handle image upload
    let images = [];
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => file.path);
      images = await uploadMultipleImages(imagePaths);
    }

    // Parse features
    let parsedFeatures = features || [];
    if (typeof features === 'string') {
      try { parsedFeatures = JSON.parse(features); }
      catch { parsedFeatures = features.split(',').map(f => f.trim()).filter(f => f); }
    }

    // Parse addons [{name, price}]
    let parsedAddons = [];
    if (addons) {
      try {
        const raw = typeof addons === 'string' ? JSON.parse(addons) : addons;
        parsedAddons = raw
          .filter(a => a.name && a.name.trim())
          .map(a => ({ name: a.name.trim(), price: Number(a.price) || 0 }));
      } catch { parsedAddons = []; }
    }

    const isTicketed = eventType === "ticketed";

    // Parse ticketTypes for ticketed events
    let parsedTicketTypes = [];
    if (isTicketed && req.body.ticketTypes) {
      try {
        parsedTicketTypes = JSON.parse(req.body.ticketTypes);
      } catch {
        parsedTicketTypes = [];
      }
      // Ensure available = quantity on creation
      parsedTicketTypes = parsedTicketTypes.map((t) => ({
        name: t.name || "General",
        price: Number(t.price) || 0,
        quantity: Number(t.quantity) || 0,
        available: Number(t.quantity) || 0,
      }));
    }

    // Calculate totals from ticket types
    const totalFromTypes = parsedTicketTypes.reduce((sum, t) => sum + t.quantity, 0);
    const lowestTicketPrice = parsedTicketTypes.length
      ? Math.min(...parsedTicketTypes.map((t) => t.price))
      : Number(ticketPrice) || 0;

    const tickets = isTicketed ? (totalFromTypes || Number(totalTickets) || 0) : 0;

    const event = await Event.create({
      title: title.trim(),
      description: description || "",
      category: category || "",
      eventType: eventType || "full-service",
      price: isTicketed ? lowestTicketPrice : (Number(price) || 0),
      rating: Number(rating) || 0,
      location: location || "",
      date: date ? new Date(date) : null,
      time: time || "",
      duration: Number(duration) || 1,
      totalTickets: tickets,
      availableTickets: tickets,
      ticketPrice: lowestTicketPrice,
      ticketTypes: parsedTicketTypes,
      images,
      features: parsedFeatures,
      addons: parsedAddons,
      createdBy: req.user.userId,
    });

    return res.status(201).json({ success: true, event });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    return res.status(500).json({ success: false, message: error.message || "Unknown Error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (String(event.createdBy) !== String(req.user.userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    
    const { title, description, category, price, rating, features } = req.body;
    
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category = category;
    if (price !== undefined) event.price = price;
    if (rating !== undefined) event.rating = rating;
    if (features !== undefined) {
      let parsedFeatures = features;
      if (typeof features === 'string') {
        try {
          parsedFeatures = JSON.parse(features);
        } catch (e) {
          parsedFeatures = features.split(',').map(f => f.trim()).filter(f => f);
        }
      }
      event.features = parsedFeatures;
    }

    // Handle image upload if new images are provided
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (event.images && event.images.length > 0) {
        const oldPublicIds = event.images.map(img => img.public_id);
        await deleteMultipleImages(oldPublicIds);
      }
      
      // Upload new images
      const imagePaths = req.files.map(file => file.path);
      const uploadedImages = await uploadMultipleImages(imagePaths);
      event.images = uploadedImages;
    }
    
    await event.save();
    return res.status(200).json({ success: true, event });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const listMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.userId });
    console.log("Listing events:", events);
    return res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Error listing events:", error);
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (String(event.createdBy) !== String(req.user.userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return res.status(200).json({ success: true, event });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const participantsForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (String(event.createdBy) !== String(req.user.userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const regs = await Registration.find({ event: id }).populate("user", "name email role");
    return res.status(200).json({ success: true, participants: regs });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (String(event.createdBy) !== String(req.user.userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    // Delete images from Cloudinary first
    if (event.images && event.images.length > 0) {
      const { deleteMultipleImages } = await import("../util/cloudinary.js");
      const publicIds = event.images.map(img => img.public_id);
      await deleteMultipleImages(publicIds);
    }
    await Event.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Unknown Error" });
  }
};
