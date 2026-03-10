import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary configuration
console.log("Cloudinary Configuration:");
console.log("  Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Not Set");
console.log("  API Key:", process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Not Set");
console.log("  API Secret:", process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Not Set");

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✓ Cloudinary connection successful");
    return true;
  } catch (error) {
    console.error("✗ Cloudinary connection failed:", error.message);
    return false;
  }
};

testCloudinaryConnection();

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eventhub/services",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit" }],
  },
});

// Configure Multer Upload
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Upload single image
export const uploadSingleImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "eventhub/services",
    });
    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files) => {
  try {
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file, {
        folder: "eventhub/services",
      })
    );
    const results = await Promise.all(uploadPromises);
    return results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
};

// Delete image from Cloudinary
export const deleteImage = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

// Delete multiple images
export const deleteMultipleImages = async (public_ids) => {
  try {
    await cloudinary.api.delete_resources(public_ids);
  } catch (error) {
    console.error("Error deleting images:", error);
  }
};

export default cloudinary;
