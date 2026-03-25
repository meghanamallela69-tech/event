import express from "express";
import { 
  getAuditLogs,
  getAuditLog,
  createAuditLog,
  getComplaints,
  getComplaint,
  addAdminNote,
  updateComplaintStatus,
  resolveComplaint,
  deleteComplaint
} from "../controller/adminManagementController.js";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Audit Logs routes
router.get("/audit-logs", auth, ensureRole("admin"), getAuditLogs);
router.get("/audit-logs/:id", auth, ensureRole("admin"), getAuditLog);
router.post("/audit-logs", auth, ensureRole("admin"), createAuditLog);

// Complaints routes
router.get("/complaints", auth, ensureRole("admin"), getComplaints);
router.get("/complaints/:id", auth, ensureRole("admin"), getComplaint);
router.post("/complaints/:id/note", auth, ensureRole("admin"), addAdminNote);
router.put("/complaints/:id/status", auth, ensureRole("admin"), updateComplaintStatus);
router.post("/complaints/:id/resolve", auth, ensureRole("admin"), resolveComplaint);
router.delete("/complaints/:id", auth, ensureRole("admin"), deleteComplaint);

export default router;
