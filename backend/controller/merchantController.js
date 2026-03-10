import { Event } from "../models/eventSchema.js";
import { Registration } from "../models/registrationSchema.js";
import { uploadMultipleImages, deleteMultipleImages } from "../util/cloudinary.js";

export const createEvent = async (req, res) => {
  try {
    console.log("=== CREATE EVENT REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("User:", req.user);
    
    // Check if there's any unexpected field in the request
    console.log("All fields in req.body:", Object.keys(req.body));
    
    const { title, description, category, price, rating, features } = req.body;
    
    console.log("Extracted fields:", { 
      title: title ? `"${title}"` : "undefined/empty",
      description: description ? `"${description}"` : "undefined/empty",
      category: category ? `"${category}"` : "undefined/empty",
      price: price !== undefined ? price : "undefined",
      rating: rating !== undefined ? rating : "undefined",
      features: features ? features : "undefined/empty"
    });
    
    // Check for any 'date' field that might have been sent
    if (req.body.date !== undefined) {
      console.warn("⚠️ WARNING: 'date' field was sent in request but is not part of schema!");
      console.warn("Value:", req.body.date);
    }
    
    // Validate title - check for empty or whitespace only
    if (!title || !title.trim()) {
      console.error("❌ VALIDATION FAILED: Title is required");
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    
    console.log("✅ Title validation passed:", `"${title.trim()}"`);

    // Handle image upload
    let images = [];
    if (req.files && req.files.length > 0) {
      console.log(`📸 Processing ${req.files.length} uploaded images`);
      const imagePaths = req.files.map(file => file.path);
      console.log("Image paths:", imagePaths);
      const uploadedImages = await uploadMultipleImages(imagePaths);
      console.log("Uploaded images to Cloudinary:", uploadedImages);
      images = uploadedImages;
    } else {
      console.log("⚠️ No images uploaded");
    }

    // Parse features if it's a string
    let parsedFeatures = features || [];
    if (typeof features === 'string') {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = features.split(',').map(f => f.trim()).filter(f => f);
      }
    }
    console.log("Parsed features:", parsedFeatures);

    console.log("📝 Creating event with data:", {
      title: title.trim(),
      description: description || "",
      category: category || "",
      price: Number(price) || 0,
      rating: Number(rating) || 0,
      imagesCount: images.length,
      featuresCount: parsedFeatures.length
    });

    const event = await Event.create({
      title: title.trim(),
      description: description || "",
      category: category || "",
      price: Number(price) || 0,
      rating: Number(rating) || 0,
      images,
      features: parsedFeatures,
      createdBy: req.user.userId,
    });
    
    console.log("✅ Created event successfully:", event._id);
    console.log("Event object:", JSON.stringify(event, null, 2));
    return res.status(201).json({ success: true, event });
  } catch (error) {
    console.error("❌ ERROR creating event:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      console.error("Mongoose Validation Error:");
      for (let field in error.errors) {
        console.error(`  - ${field}: ${error.errors[field].message}`);
      }
      return res.status(400).json({ 
        success: false, 
        message: error.message,
        errors: error.errors
      });
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
