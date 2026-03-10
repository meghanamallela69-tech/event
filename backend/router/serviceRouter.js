import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getAllServicesAdmin,
  getServicesByCategory,
} from "../controller/serviceController.js";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";
import { upload } from "../util/cloudinary.js";

const router = express.Router();

// Public routes
router.get("/", getAllServices);
router.get("/category/:category", getServicesByCategory);
router.get("/:id", getServiceById);

// Admin routes (require authentication and admin role)
router.post(
  "/admin/service",
  auth,
  ensureRole("admin"),
  upload.array("images", 4),
  createService
);

router.get("/admin/all", auth, ensureRole("admin"), getAllServicesAdmin);

router.put(
  "/admin/service/:id",
  auth,
  ensureRole("admin"),
  upload.array("images", 4),
  updateService
);

router.delete(
  "/admin/service/:id",
  auth,
  ensureRole("admin"),
  deleteService
);

export default router;
