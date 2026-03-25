import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";
import { 
  createCategory, 
  getMerchantCategories, 
  getCategory, 
  updateCategory, 
  deleteCategory 
} from "../controller/categoryController.js";
import { upload } from "../util/cloudinary.js";

const router = express.Router();

// Create category
router.post("/", auth, ensureRole("merchant"), upload.single('image'), createCategory);

// Get all categories for merchant
router.get("/", auth, ensureRole("merchant"), getMerchantCategories);

// Get single category
router.get("/:categoryId", auth, ensureRole("merchant"), getCategory);

// Update category
router.put("/:categoryId", auth, ensureRole("merchant"), upload.single('image'), updateCategory);

// Delete category
router.delete("/:categoryId", auth, ensureRole("merchant"), deleteCategory);

export default router;
