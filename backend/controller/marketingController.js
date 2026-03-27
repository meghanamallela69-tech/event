import { Coupon } from "../models/couponSchema.js";
import { Event } from "../models/eventSchema.js";
import { Notification } from "../models/notificationSchema.js";

// Create a new promo code
export const createPromoCode = async (req, res) => {
  try {
    const merchantId = req.user.userId;
    const {
      code,
      discountType,
      discountValue,
      maxDiscount,
      minAmount,
      expiryDate,
      usageLimit,
      description,
      applyTo, // "ALL" or "EVENT"
      eventId, // Required when applyTo = "EVENT"
      applicableEvents,
      applicableCategories
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !expiryDate || !usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Validate applyTo field
    const validApplyToValues = ["ALL", "EVENT"];
    const couponApplyTo = applyTo || "ALL"; // Default to ALL if not provided
    
    if (!validApplyToValues.includes(couponApplyTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid applyTo value. Must be 'ALL' or 'EVENT'"
      });
    }

    // Validate eventId when applyTo is EVENT
    if (couponApplyTo === "EVENT" && !eventId) {
      return res.status(400).json({
        success: false,
        message: "eventId is required when applyTo is 'EVENT'"
      });
    }

    // Verify event exists and belongs to this merchant when applyTo is EVENT
    if (couponApplyTo === "EVENT" && eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found"
        });
      }
      if (event.createdBy.toString() !== merchantId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only create coupons for your own events"
        });
      }
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Promo code already exists"
      });
    }

    // Validate expiry date
    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future"
      });
    }

    // Create coupon with new schema
    const couponData = {
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxDiscount,
      minAmount: minAmount || 0,
      expiryDate,
      usageLimit,
      description,
      createdBy: merchantId,
      merchantId: merchantId,
      applyTo: couponApplyTo,
      eventId: couponApplyTo === "EVENT" ? eventId : null,
      applicableEvents: applicableEvents || [],
      applicableCategories: applicableCategories || []
    };

    // For backward compatibility - add eventId to applicableEvents array
    if (couponApplyTo === "EVENT" && eventId) {
      couponData.applicableEvents = [eventId];
    }

    const coupon = await Coupon.create(couponData);

    return res.status(201).json({
      success: true,
      message: "Promo code created successfully",
      coupon
    });
  } catch (error) {
    console.error("Create promo code error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create promo code"
    });
  }
};

// Get all promo codes for merchant
export const getMerchantPromoCodes = async (req, res) => {
  try {
    const merchantId = req.user.userId;

    const coupons = await Coupon.find({ createdBy: merchantId })
      .sort({ createdAt: -1 })
      .populate("applicableEvents", "title")
      .populate("eventId", "title");

    // Add computed fields
    const couponsWithStats = coupons.map(coupon => ({
      ...coupon.toObject(),
      remainingUsage: coupon.usageLimit - coupon.usedCount,
      isExpired: new Date(coupon.expiryDate) < new Date(),
      status: new Date(coupon.expiryDate) < new Date() ? "expired" : "active"
    }));

    return res.status(200).json({
      success: true,
      coupons: couponsWithStats
    });
  } catch (error) {
    console.error("Get promo codes error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch promo codes"
    });
  }
};

// Get single promo code by ID
export const getPromoCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.userId;

    const coupon = await Coupon.findOne({ 
      _id: id, 
      createdBy: merchantId 
    }).populate("applicableEvents", "title");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found"
      });
    }

    return res.status(200).json({
      success: true,
      coupon: {
        ...coupon.toObject(),
        remainingUsage: coupon.usageLimit - coupon.usedCount,
        isExpired: new Date(coupon.expiryDate) < new Date(),
        status: new Date(coupon.expiryDate) < new Date() ? "expired" : "active"
      }
    });
  } catch (error) {
    console.error("Get promo code error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch promo code"
    });
  }
};

// Update promo code
export const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.userId;
    const updateData = req.body;

    // Find and update
    const coupon = await Coupon.findOneAndUpdate(
      { _id: id, createdBy: merchantId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Promo code updated successfully",
      coupon: {
        ...coupon.toObject(),
        remainingUsage: coupon.usageLimit - coupon.usedCount,
        isExpired: new Date(coupon.expiryDate) < new Date(),
        status: new Date(coupon.expiryDate) < new Date() ? "expired" : "active"
      }
    });
  } catch (error) {
    console.error("Update promo code error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update promo code"
    });
  }
};

// Delete promo code
export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.userId;

    const coupon = await Coupon.findOneAndDelete({
      _id: id,
      createdBy: merchantId
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Promo code deleted successfully"
    });
  } catch (error) {
    console.error("Delete promo code error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete promo code"
    });
  }
};

// Send notification to users (for event promotion)
export const sendPromotionalNotification = async (req, res) => {
  try {
    const merchantId = req.user.userId;
    const { title, message, eventId, targetUsers } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    // If eventId provided, verify merchant owns it
    if (eventId) {
      const event = await Event.findOne({ 
        _id: eventId, 
        createdBy: merchantId 
      });
      
      if (!event) {
        return res.status(403).json({
          success: false,
          message: "Event not found or you don't own it"
        });
      }
    }

    // Create notifications
    const notifications = [];
    
    if (targetUsers && targetUsers.length > 0) {
      // Send to specific users
      for (const userId of targetUsers) {
        const notification = await Notification.create({
          user: userId,
          type: "promotional",
          title,
          message,
          relatedEvent: eventId || null,
          sender: merchantId
        });
        notifications.push(notification);
      }
    } else {
      // Send to all users (broadcast)
      const { User } = await import("../models/userSchema.js");
      const allUsers = await User.find({ _id: { $ne: merchantId } }).select("_id");
      
      for (const user of allUsers) {
        const notification = await Notification.create({
          user: user._id,
          type: "promotional",
          title,
          message,
          relatedEvent: eventId || null,
          sender: merchantId
        });
        notifications.push(notification);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Notification sent to ${notifications.length} user(s)`,
      count: notifications.length
    });
  } catch (error) {
    console.error("Send notification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send notification"
    });
  }
};

// Generate shareable link for event
export const generateShareableLink = async (req, res) => {
  try {
    const { eventId } = req.params;
    const merchantId = req.user.userId;

    // Verify merchant owns the event
    const event = await Event.findOne({
      _id: eventId,
      createdBy: merchantId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Generate shareable URL (in production, use actual domain)
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const shareableLink = `${baseUrl}/events/${eventId}`;

    // Generate social media share links
    const shareLinks = {
      direct: shareableLink,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out this event: ${event.title} - ${shareableLink}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${event.title}`)}&url=${encodeURIComponent(shareableLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`
    };

    return res.status(200).json({
      success: true,
      event: {
        id: event._id,
        title: event.title
      },
      shareLinks
    });
  } catch (error) {
    console.error("Generate share link error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate share link"
    });
  }
};
