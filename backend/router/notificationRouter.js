import express from "express";
import { Notification } from "../models/notificationSchema.js";
import { auth } from "../middleware/authMiddleware.js";
import {
  getUnreadCounts,
  markAllAsRead,
  markAsRead,
  getRecentNotifications,
  markBookingNotificationsAsRead
} from "../controller/notificationController.js";

const router = express.Router();

// Get all notifications for current user
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get unread counts
router.get("/unread-counts", auth, getUnreadCounts);

// Mark all as read
router.post("/mark-all-read", auth, markAllAsRead);

// Mark specific notification as read
router.patch("/:notificationId/read", auth, markAsRead);

// Get recent notifications
router.get("/recent", auth, getRecentNotifications);

// Mark booking notifications as read
router.post("/mark-booking-read", auth, markBookingNotificationsAsRead);

// Mark notification as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "Not found" });
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete notification
router.delete("/:id", auth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
