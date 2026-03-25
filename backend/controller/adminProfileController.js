import { User } from "../models/userSchema.js";
import { Notification } from "../models/notificationSchema.js";
import bcrypt from "bcrypt";

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    return res.status(200).json({ 
      success: true, 
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        status: admin.status,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch profile" });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const admin = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully",
      admin 
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update profile" });
  }
};

// Change admin password
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const admin = await User.findById(req.user._id);
    
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    admin.password = hashedPassword;
    await admin.save();

    return res.status(200).json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to change password" });
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      user: req.user._id, 
      read: false 
    });

    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch unread count" });
  }
};

// Get admin notifications
export const getAdminNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    
    const query = { user: req.user._id };
    
    if (type) query.type = type;
    if (status !== undefined) query.read = status === 'read';

    const notifications = await Notification.find(query)
      .populate('bookingId', 'serviceTitle')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      read: false 
    });

    return res.status(200).json({
      success: true,
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      unreadCount
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch notifications" });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Notification marked as read",
      notification 
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to mark as read" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    return res.status(200).json({ 
      success: true, 
      message: "All notifications marked as read" 
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to mark all as read" });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Notification deleted successfully" 
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete notification" });
  }
};
