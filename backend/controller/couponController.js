import { Coupon } from "../models/couponSchema.js";
import { Booking } from "../models/bookingSchema.js";
import { Event } from "../models/eventSchema.js";

// Validate coupon without applying it
export const validateCoupon = async (req, res) => {
  try {
    const { couponCode, eventId, amount } = req.body;
    const userId = req.user.userId || req.user._id;

    console.log(`=== VALIDATE COUPON ===`);
    console.log(`Code: ${couponCode}`);
    console.log(`Amount: ${amount}`);
    console.log(`User ID: ${userId}`);

    // Validate input
    if (!couponCode || !amount) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and amount are required"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    // Find coupon by code
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code"
      });
    }

    // Check if coupon is expired
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired"
      });
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded"
      });
    }

    // Check minimum amount
    if (amount < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minAmount} required`
      });
    }

    // Check if user has already used this coupon
    const existingUsage = coupon.usageHistory.find(
      usage => usage.user.toString() === userId.toString()
    );

    if (existingUsage) {
      return res.status(400).json({
        success: false,
        message: "You have already used this coupon"
      });
    }

    // Check event restrictions (if any)
    if (eventId && coupon.applicableEvents.length > 0) {
      const isEventApplicable = coupon.applicableEvents.some(
        eventObjId => eventObjId.toString() === eventId.toString()
      );
      
      if (!isEventApplicable) {
        return res.status(400).json({
          success: false,
          message: "Coupon not applicable for this event"
        });
      }
    }

    // Check user restrictions (if any)
    if (coupon.applicableUsers.length > 0) {
      const isUserApplicable = coupon.applicableUsers.some(
        userObjId => userObjId.toString() === userId.toString()
      );
      
      if (!isUserApplicable) {
        return res.status(400).json({
          success: false,
          message: "Coupon not applicable for your account"
        });
      }
    }

    console.log(`✅ Coupon validated successfully`);

    return res.status(200).json({
      success: true,
      message: "Coupon is valid",
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountPercentage: coupon.discountValue, // For frontend compatibility
        maxDiscount: coupon.maxDiscount,
        description: coupon.description
      }
    });

  } catch (error) {
    console.error("Validate coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate coupon"
    });
  }
};

// Apply coupon and calculate discount
export const applyCoupon = async (req, res) => {
  try {
    const { code, totalAmount, eventId } = req.body;
    const userId = req.user.userId || req.user._id;

    console.log(`=== APPLY COUPON ===`);
    console.log(`Code: ${code}`);
    console.log(`Total Amount: ${totalAmount}`);
    console.log(`User ID: ${userId}`);

    // Validate input
    if (!code || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and total amount are required"
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid total amount"
      });
    }

    // Find coupon by code
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code"
      });
    }

    // Check if coupon is expired
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired"
      });
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded"
      });
    }

    // Check minimum amount
    if (totalAmount < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minAmount} required`
      });
    }

    // Check if user has already used this coupon
    const existingUsage = coupon.usageHistory.find(
      usage => usage.user.toString() === userId.toString()
    );

    if (existingUsage) {
      return res.status(400).json({
        success: false,
        message: "You have already used this coupon"
      });
    }

    // Check event restrictions (if any)
    if (eventId && coupon.applicableEvents.length > 0) {
      const isEventApplicable = coupon.applicableEvents.some(
        eventObjId => eventObjId.toString() === eventId.toString()
      );
      
      if (!isEventApplicable) {
        return res.status(400).json({
          success: false,
          message: "Coupon not applicable for this event"
        });
      }
    }

    // Check user restrictions (if any)
    if (coupon.applicableUsers.length > 0) {
      const isUserApplicable = coupon.applicableUsers.some(
        userObjId => userObjId.toString() === userId.toString()
      );
      
      if (!isUserApplicable) {
        return res.status(400).json({
          success: false,
          message: "Coupon not applicable for your account"
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
      
      // Apply maximum discount cap if specified
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "flat") {
      discountAmount = coupon.discountValue;
      
      // Ensure discount doesn't exceed total amount
      if (discountAmount > totalAmount) {
        discountAmount = totalAmount;
      }
    }

    // Round discount to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = totalAmount - discountAmount;

    console.log(`✅ Coupon applied successfully`);
    console.log(`Discount: ₹${discountAmount}`);
    console.log(`Final Amount: ₹${finalAmount}`);

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description
      },
      originalAmount: totalAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      savings: discountAmount
    });

  } catch (error) {
    console.error("Apply coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply coupon"
    });
  }
};

// Remove applied coupon
export const removeCoupon = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    return res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
      originalAmount: totalAmount,
      discountAmount: 0,
      finalAmount: totalAmount,
      savings: 0
    });

  } catch (error) {
    console.error("Remove coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove coupon"
    });
  }
};

// Get available coupons for user
export const getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const { eventId, totalAmount } = req.query;

    console.log(`=== GET AVAILABLE COUPONS ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Event ID: ${eventId}`);
    console.log(`Total Amount: ${totalAmount}`);

    if (!userId) {
      console.error("❌ No user ID found in request");
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Build query
    const query = {
      isActive: true,
      expiryDate: { $gt: new Date() },
      $expr: { $lt: ["$usedCount", "$usageLimit"] }
    };

    // Add minimum amount filter if provided
    if (totalAmount) {
      query.minAmount = { $lte: parseFloat(totalAmount) };
    }

    // Add event filter if provided
    if (eventId) {
      query.$or = [
        { applicableEvents: { $size: 0 } }, // No event restrictions
        { applicableEvents: eventId } // Specific event
      ];
    }

    console.log("Query:", JSON.stringify(query, null, 2));

    const coupons = await Coupon.find(query)
      .select('code discountType discountValue maxDiscount minAmount expiryDate description usedCount usageLimit usageHistory')
      .sort({ discountValue: -1 });

    console.log(`Found ${coupons.length} coupons before user filtering`);

    // Filter out coupons already used by this user
    const availableCoupons = coupons.filter(coupon => {
      if (!coupon.usageHistory || coupon.usageHistory.length === 0) {
        return true; // Coupon not used by anyone
      }
      
      const hasUsed = coupon.usageHistory.some(
        usage => usage.user && usage.user.toString() === userId.toString()
      );
      return !hasUsed;
    });

    console.log(`Available coupons after user filtering: ${availableCoupons.length}`);

    return res.status(200).json({
      success: true,
      coupons: availableCoupons,
      total: availableCoupons.length
    });

  } catch (error) {
    console.error("Get available coupons error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available coupons",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create coupon (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxDiscount,
      minAmount,
      expiryDate,
      usageLimit,
      description,
      applicableEvents,
      applicableCategories,
      applicableUsers
    } = req.body;

    const adminId = req.user.userId || req.user._id;

    console.log(`=== CREATE COUPON ===`);
    console.log(`Code: ${code}`);
    console.log(`Type: ${discountType}`);
    console.log(`Value: ${discountValue}`);

    // Validate required fields
    if (!code || !discountType || !discountValue || !expiryDate || !usageLimit) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Validate discount type and value
    if (!["percentage", "flat"].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: "Discount type must be 'percentage' or 'flat'"
      });
    }

    if (discountType === "percentage" && (discountValue <= 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount must be between 1 and 100"
      });
    }

    if (discountType === "flat" && discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Flat discount must be greater than 0"
      });
    }

    // Validate expiry date
    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future"
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists"
      });
    }

    // Create coupon
    const couponData = {
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minAmount: minAmount || 0,
      expiryDate: new Date(expiryDate),
      usageLimit,
      description,
      createdBy: adminId
    };

    // Add optional fields
    if (maxDiscount && discountType === "percentage") {
      couponData.maxDiscount = maxDiscount;
    }

    if (applicableEvents && applicableEvents.length > 0) {
      couponData.applicableEvents = applicableEvents;
    }

    if (applicableCategories && applicableCategories.length > 0) {
      couponData.applicableCategories = applicableCategories;
    }

    if (applicableUsers && applicableUsers.length > 0) {
      couponData.applicableUsers = applicableUsers;
    }

    const coupon = await Coupon.create(couponData);

    console.log(`✅ Coupon created successfully: ${coupon.code}`);

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon
    });

  } catch (error) {
    console.error("Create coupon error:", error);
    return res.status(500).json({
      success: false,
      message: error.code === 11000 ? "Coupon code already exists" : "Failed to create coupon"
    });
  }
};

// Get all coupons (Admin only)
export const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    console.log(`=== GET ALL COUPONS ===`);

    // Build query
    const query = {};

    if (status === "active") {
      query.isActive = true;
      query.expiryDate = { $gt: new Date() };
    } else if (status === "inactive") {
      query.$or = [
        { isActive: false },
        { expiryDate: { $lte: new Date() } }
      ];
    } else if (status === "expired") {
      query.expiryDate = { $lte: new Date() };
    }

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Coupon.countDocuments(query);

    return res.status(200).json({
      success: true,
      coupons,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCoupons: total,
        hasNext: skip + coupons.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Get all coupons error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons"
    });
  }
};

// Update coupon (Admin only)
export const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const updateData = req.body;

    console.log(`=== UPDATE COUPON ===`);
    console.log(`Coupon ID: ${couponId}`);

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    // Prevent updating code if coupon has been used
    if (updateData.code && coupon.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot update code of a used coupon"
      });
    }

    // Update coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`✅ Coupon updated successfully: ${updatedCoupon.code}`);

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon: updatedCoupon
    });

  } catch (error) {
    console.error("Update coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update coupon"
    });
  }
};

// Delete coupon (Admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    console.log(`=== DELETE COUPON ===`);
    console.log(`Coupon ID: ${couponId}`);

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    // Check if coupon has been used
    if (coupon.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a coupon that has been used"
      });
    }

    await Coupon.findByIdAndDelete(couponId);

    console.log(`✅ Coupon deleted successfully: ${coupon.code}`);

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully"
    });

  } catch (error) {
    console.error("Delete coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon"
    });
  }
};

// Toggle coupon status (Admin only)
export const toggleCouponStatus = async (req, res) => {
  try {
    const { couponId } = req.params;

    console.log(`=== TOGGLE COUPON STATUS ===`);
    console.log(`Coupon ID: ${couponId}`);

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    console.log(`✅ Coupon status toggled: ${coupon.code} - ${coupon.isActive ? 'Active' : 'Inactive'}`);

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      coupon
    });

  } catch (error) {
    console.error("Toggle coupon status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle coupon status"
    });
  }
};

// Get coupon usage statistics (Admin only)
export const getCouponStats = async (req, res) => {
  try {
    console.log(`=== GET COUPON STATS ===`);

    const stats = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalCoupons: { $sum: 1 },
          activeCoupons: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isActive", true] },
                    { $gt: ["$expiryDate", new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          expiredCoupons: {
            $sum: {
              $cond: [{ $lte: ["$expiryDate", new Date()] }, 1, 0]
            }
          },
          totalUsage: { $sum: "$usedCount" },
          totalDiscountGiven: {
            $sum: {
              $reduce: {
                input: "$usageHistory",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.discountAmount"] }
              }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalCoupons: 0,
      activeCoupons: 0,
      expiredCoupons: 0,
      totalUsage: 0,
      totalDiscountGiven: 0
    };

    return res.status(200).json({
      success: true,
      stats: result
    });

  } catch (error) {
    console.error("Get coupon stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon statistics"
    });
  }
};