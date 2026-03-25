import { Notification } from "../models/notificationSchema.js";

// Get unread notification counts for merchant
export const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get total unread count using 'read' field
    const totalUnread = await Notification.countDocuments({ 
      user: userId, 
      read: false 
    });

    // Get unread booking notifications count
    const bookingUnread = await Notification.countDocuments({ 
      user: userId, 
      read: false, 
      type: "booking" 
    });

    // Get unread payment notifications count
    const paymentUnread = await Notification.countDocuments({ 
      user: userId, 
      read: false, 
      type: "payment" 
    });

    return res.status(200).json({ 
      success: true, 
      data: {
        bookings: Math.min(bookingUnread, 99),
        payments: Math.min(paymentUnread, 99),
        total: Math.min(totalUnread, 99),
        hasMore: totalUnread > 99
      }
    });
  } catch (error) {
    console.error("Get unread counts error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch unread counts" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({ 
      success: true, 
      message: "All notifications marked as read" 
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to mark notifications as read" });
  }
};

// Mark specific notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({ 
      _id: notificationId, 
      user: userId 
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({ 
      success: true, 
      message: "Notification marked as read" 
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to mark notification as read" });
  }
};

// Get recent notifications (for dropdown/modal)
export const getRecentNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('bookingId', 'serviceTitle date')
      .populate('eventId', 'title');

    return res.status(200).json({ 
      success: true, 
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error("Get recent notifications error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch notifications" });
  }
};

// Mark all booking notifications as read
export const markBookingNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { user: userId, type: "booking", read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({ 
      success: true, 
      message: "Booking notifications marked as read" 
    });
  } catch (error) {
    console.error("Mark booking notifications as read error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to mark booking notifications as read" });
  }
};
