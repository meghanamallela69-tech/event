import { Category } from "../models/categorySchema.js";
import { uploadSingleImage, deleteImage } from "../util/cloudinary.js";

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const merchantId = req.user.userId;

    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Category description is required" });
    }

    // Check if category with same name already exists for this merchant
    const existing = await Category.findOne({ 
      merchant: merchantId, 
      name: new RegExp(`^${name.trim()}$`, 'i') 
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "Category with this name already exists" });
    }

    // Handle image upload if present
    let imageData = {};
    if (req.file) {
      const uploadResult = await uploadSingleImage(req.file.path);
      imageData = {
        image: uploadResult.url,
        imagePublicId: uploadResult.public_id
      };
    }

    // Create category
    const category = await Category.create({
      name: name.trim(),
      description: description.trim(),
      merchant: merchantId,
      ...imageData
    });

    return res.status(201).json({ 
      success: true, 
      message: "Category created successfully",
      category 
    });
  } catch (error) {
    console.error("Create category error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create category" });
  }
};

// Get all categories for merchant
export const getMerchantCategories = async (req, res) => {
  try {
    const merchantId = req.user.userId;
    
    const categories = await Category.find({ merchant: merchantId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      categories,
      count: categories.length
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch categories" });
  }
};

// Get single category
export const getCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const merchantId = req.user.userId;

    const category = await Category.findOne({ 
      _id: categoryId, 
      merchant: merchantId 
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({ 
      success: true, 
      category 
    });
  } catch (error) {
    console.error("Get category error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch category" });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;
    const merchantId = req.user.userId;

    // Find category
    const category = await Category.findOne({ 
      _id: categoryId, 
      merchant: merchantId 
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Validate input
    if (name && name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Category name must be at least 2 characters" });
    }

    if (description && description.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Description must be at least 10 characters" });
    }

    // Check if name is taken by another category
    if (name && name.trim() !== category.name) {
      const existing = await Category.findOne({ 
        merchant: merchantId, 
        name: new RegExp(`^${name.trim()}$`, 'i'),
        _id: { $ne: categoryId }
      });

      if (existing) {
        return res.status(409).json({ success: false, message: "Category with this name already exists" });
      }
    }

    // Handle image upload if present
    if (req.file) {
      // Delete old image if exists
      if (category.imagePublicId) {
        await deleteImage(category.imagePublicId);
      }

      // Upload new image
      const uploadResult = await uploadSingleImage(req.file.path);
      category.image = uploadResult.url;
      category.imagePublicId = uploadResult.public_id;
    }

    // Update fields
    if (name) category.name = name.trim();
    if (description) category.description = description.trim();

    await category.save();

    return res.status(200).json({ 
      success: true, 
      message: "Category updated successfully",
      category 
    });
  } catch (error) {
    console.error("Update category error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update category" });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const merchantId = req.user.userId;

    const category = await Category.findOne({ 
      _id: categoryId, 
      merchant: merchantId 
    });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Delete image from Cloudinary if exists
    if (category.imagePublicId) {
      await deleteImage(category.imagePublicId);
    }

    await Category.findByIdAndDelete(categoryId);

    return res.status(200).json({ 
      success: true, 
      message: "Category deleted successfully" 
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete category" });
  }
};
