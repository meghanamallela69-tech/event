import { Service } from "../models/serviceSchema.js";
import { deleteImage, deleteMultipleImages } from "../util/cloudinary.js";

// Create a new service (Admin only)
export const createService = async (req, res) => {
  try {
    const { title, description, category, price, rating } = req.body;

    console.log("Create service request received");
    console.log("Request body:", { title, description, category, price, rating });
    console.log("Request files:", req.files);
    console.log("User:", req.user);

    // Validate required fields
    if (!title || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "All fields (title, description, category, price) are required",
      });
    }

    // Check if images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Check if Cloudinary upload was successful
    const failedUploads = req.files.filter(file => !file.path || !file.filename);
    if (failedUploads.length > 0) {
      console.error("Some images failed to upload:", failedUploads);
      return res.status(500).json({
        success: false,
        message: "Image upload to Cloudinary failed. Please check Cloudinary configuration.",
      });
    }

    // Format images from multer-cloudinary
    const images = req.files.map((file) => ({
      public_id: file.filename,
      url: file.path,
    }));

    console.log("Images to be saved:", images);

    const service = await Service.create({
      title,
      description,
      category,
      price: Number(price),
      rating: rating ? Number(rating) : 0,
      images,
      createdBy: req.user.userId,
    });

    console.log("Service created successfully:", service._id);

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create service",
    });
  }
};

// Get all services (Public)
export const getAllServices = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;

    // Build query
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort
    let sortOption = {};
    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;
    else if (sort === "rating") sortOption.rating = -1;
    else if (sort === "newest") sortOption.createdAt = -1;
    else sortOption.createdAt = -1; // Default: newest first

    const services = await Service.find(query).sort(sortOption);

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get all services error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

// Get single service by ID (Public)
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get service by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service",
    });
  }
};

// Update service (Admin only)
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, price, rating, isActive, existingImages } = req.body;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Update fields
    if (title) service.title = title;
    if (description) service.description = description;
    if (category) service.category = category;
    if (price) service.price = Number(price);
    if (rating !== undefined) service.rating = Number(rating);
    if (isActive !== undefined) service.isActive = isActive;

    // Parse existing images that should be kept
    let imagesToKeep = [];
    if (existingImages) {
      try {
        imagesToKeep = JSON.parse(existingImages);
      } catch (e) {
        console.error("Failed to parse existingImages:", e);
      }
    }

    // Find images that were removed (exist in DB but not in imagesToKeep)
    const currentPublicIds = service.images.map(img => img.public_id);
    const keepPublicIds = imagesToKeep.map(img => img.public_id);
    const removedPublicIds = currentPublicIds.filter(id => !keepPublicIds.includes(id));
    
    // Delete removed images from Cloudinary
    if (removedPublicIds.length > 0) {
      await deleteMultipleImages(removedPublicIds);
    }

    // Start with kept images
    let updatedImages = [...imagesToKeep];

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        public_id: file.filename,
        url: file.path,
      }));
      updatedImages = [...updatedImages, ...newImages];
    }

    // Validate total images
    if (updatedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }
    
    if (updatedImages.length > 4) {
      return res.status(400).json({
        success: false,
        message: "Maximum 4 images allowed",
      });
    }

    service.images = updatedImages;
    await service.save();

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update service",
    });
  }
};

// Delete service (Admin only)
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Delete images from Cloudinary
    const publicIds = service.images.map((img) => img.public_id);
    await deleteMultipleImages(publicIds);

    // Delete service from database
    await Service.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};

// Get all services for admin (including inactive)
export const getAllServicesAdmin = async (req, res) => {
  try {
    console.log("=== ADMIN SERVICES REQUEST ===");
    console.log("User:", req.user);
    console.log("Request headers:", req.headers);
    
    const services = await Service.find().sort({ createdAt: -1 });
    
    console.log(`Found ${services.length} services in database`);
    if (services.length === 0) {
      console.log("⚠️ WARNING: No services exist in database!");
      console.log("You need to create services first.");
    } else {
      console.log("Services:", services.map(s => ({ id: s._id, title: s.title, isActive: s.isActive })));
    }

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get all services admin error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch services",
    });
  }
};

// Get services by category
export const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const services = await Service.find({
      category,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get services by category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};
