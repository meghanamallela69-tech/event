import { User } from "../models/userSchema.js";
import { Event } from "../models/eventSchema.js";
import { Registration } from "../models/registrationSchema.js";
import { Booking } from "../models/bookingSchema.js";
import { Payment } from "../models/paymentSchema.js";
import bcrypt from "bcrypt";
import { sendMail } from "../util/mailer.js";

// Get all transactions for admin
export const getAllTransactions = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('bookingId', 'serviceTitle user')
      .populate('merchantId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate totals
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCommission = payments.reduce((sum, p) => sum + (p.adminCommission || 0), 0);
    const totalMerchantPayout = payments.reduce((sum, p) => sum + (p.merchantAmount || 0), 0);

    return res.status(200).json({ 
      success: true, 
      transactions: payments,
      summary: {
        totalAmount,
        totalCommission,
        totalMerchantPayout,
        count: payments.length
      }
    });
  } catch (error) {
    console.error("Get all transactions error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch transactions" });
  }
};

// Get commission details
export const getCommissionDetails = async (req, res) => {
  try {
    const payments = await Payment.find()
      .select('amount adminCommission merchantAmount createdAt')
      .sort({ createdAt: -1 });

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCommission = payments.reduce((sum, p) => sum + (p.adminCommission || 0), 0);
    const commissionRate = payments.length > 0 
      ? ((totalCommission / totalAmount) * 100).toFixed(2) 
      : 0;

    return res.status(200).json({ 
      success: true, 
      data: {
        totalAmount,
        totalCommission,
        commissionRate: parseFloat(commissionRate),
        transactionCount: payments.length
      }
    });
  } catch (error) {
    console.error("Get commission details error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch commission details" });
  }
};

// Get payout details
export const getPayoutDetails = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('merchantId', 'name email')
      .select('merchantId merchantAmount amount adminCommission createdAt')
      .sort({ createdAt: -1 });

    // Group by merchant
    const merchantPayouts = {};
    payments.forEach(payment => {
      const merchantId = payment.merchantId?._id?.toString() || 'unknown';
      if (!merchantPayouts[merchantId]) {
        merchantPayouts[merchantId] = {
          merchant: payment.merchantId,
          totalPayout: 0,
          totalBookings: 0,
          totalCommission: 0,
          transactions: []
        };
      }
      merchantPayouts[merchantId].totalPayout += payment.merchantAmount || 0;
      merchantPayouts[merchantId].totalBookings += 1;
      merchantPayouts[merchantId].totalCommission += payment.adminCommission || 0;
      merchantPayouts[merchantId].transactions.push(payment);
    });

    const payoutsArray = Object.values(merchantPayouts);
    const totalPayout = payoutsArray.reduce((sum, m) => sum + m.totalPayout, 0);

    return res.status(200).json({ 
      success: true, 
      payouts: payoutsArray,
      summary: {
        totalPayout,
        merchantCount: payoutsArray.length
      }
    });
  } catch (error) {
    console.error("Get payout details error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch payout details" });
  }
};

// Handle refund request
export const handleRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const payment = await Payment.findById(paymentId)
      .populate('bookingId');
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (action === 'approve') {
      // Update payment status to refunded
      payment.paymentStatus = 'refunded';
      payment.refundReason = reason || '';
      payment.refundedAt = new Date();
      
      // Update booking status if exists
      if (payment.bookingId) {
        const booking = await import("../models/bookingSchema.js");
        await booking.Booking.findByIdAndUpdate(payment.bookingId._id, {
          status: 'cancelled'
        });
      }
    } else {
      // Reject refund
      payment.refundRejected = true;
      payment.rejectionReason = reason || '';
    }

    await payment.save();

    return res.status(200).json({ 
      success: true, 
      message: `Refund ${action}d successfully`,
      payment 
    });
  } catch (error) {
    console.error("Handle refund error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to handle refund" });
  }
};

// Get refund requests
export const getRefundRequests = async (req, res) => {
  try {
    const refundPayments = await Payment.find({
      paymentStatus: 'refund_requested'
    })
    .populate('bookingId', 'serviceTitle user')
    .populate('merchantId', 'name email')
    .sort({ createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      refunds: refundPayments,
      count: refundPayments.length
    });
  } catch (error) {
    console.error("Get refund requests error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch refund requests" });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ success: true, users });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

// Enhanced user management with status update
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'blocked'
    
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: `User ${status} successfully`,
      user 
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update user status" });
  }
};

export const listMerchants = async (req, res) => {
  try {
    const merchants = await User.find({ role: "merchant" }).select("-password");
    return res.status(200).json({ success: true, merchants });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const createMerchant = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields: name and email" });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Merchant email already exists" });
    }
    const tempPassword = password && String(password).trim().length >= 6
      ? password
      : Math.random().toString(36).slice(-8) + "A1";
    const hash = await bcrypt.hash(tempPassword, 10);
    const user = await User.create({
      name,
      email,
      phone: phone || "",
      password: hash,
      role: "merchant",
    });

    const loginUrl = "http://localhost:5173/login";
    const mailText =
`Hello ${name},
Your merchant account has been created by the admin in the Event Management System.
Merchant login email: ${email}
Merchant password: ${tempPassword}
Please login and change your password after first login.
Login here: ${loginUrl}`;

    await sendMail({
      to: email,
      subject: "Your Merchant Account Details",
      text: mailText,
    });

    return res.status(201).json({
      success: true,
      message: "Merchant created and credentials sent to email",
      merchant: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status },
    });
  } catch (error) {
    console.error("Create merchant error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create merchant" });
  }
};

// Update merchant (edit)
export const updateMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const merchant = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!merchant) {
      return res.status(404).json({ success: false, message: "Merchant not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Merchant updated successfully",
      merchant 
    });
  } catch (error) {
    console.error("Update merchant error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update merchant" });
  }
};

// Suspend/Activate merchant
export const suspendMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'suspended'

    const merchant = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!merchant) {
      return res.status(404).json({ success: false, message: "Merchant not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Merchant ${status} successfully`,
      merchant 
    });
  } catch (error) {
    console.error("Suspend merchant error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update merchant status" });
  }
};

// Reset merchant password
export const resetMerchantPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const newPassword = Math.random().toString(36).slice(-8) + "A1";
    const hash = await bcrypt.hash(newPassword, 10);

    const merchant = await User.findByIdAndUpdate(
      id,
      { password: hash },
      { new: true, runValidators: true }
    ).select('-password');

    if (!merchant) {
      return res.status(404).json({ success: false, message: "Merchant not found" });
    }

    // Send email with new password
    const mailText =
`Hello ${merchant.name},
Your password has been reset by the admin.
New temporary password: ${newPassword}
Please login and change your password immediately.
Login here: http://localhost:5173/login`;

    await sendMail({
      to: merchant.email,
      subject: "Password Reset - Admin Action",
      text: mailText,
    });

    return res.status(200).json({ 
      success: true, 
      message: "Password reset successfully. New password sent to email.",
      merchant 
    });
  } catch (error) {
    console.error("Reset merchant password error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to reset password" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const listEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email");
    return res.status(200).json({ success: true, events });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const deleteEventAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    await Registration.deleteMany({ event: id });
    return res.status(200).json({ success: true, message: "Event deleted" });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const listRegistrationsAdmin = async (req, res) => {
  try {
    const regs = await Registration.find().populate("user", "name email").populate("event", "title");
    return res.status(200).json({ success: true, registrations: regs });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

// Get all bookings for admin
export const getAllBookings = async (req, res) => {
  try {
    const allBookings = await Booking.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    // Format bookings for display
    const formattedBookings = allBookings.map(booking => {
      return {
        _id: booking._id,
        bookingId: booking._id,
        userName: booking.user?.name || 'Unknown',
        userEmail: booking.user?.email || '',
        eventName: booking.serviceTitle || 'N/A',
        eventType: booking.eventType || 'full-service',
        date: booking.eventDate || booking.bookingDate,
        time: booking.eventTime || 'N/A',
        location: booking.location || 'N/A',
        quantity: booking.ticket?.quantity || booking.guestCount || 1,
        totalAmount: booking.totalPrice || booking.servicePrice || 0,
        paymentStatus: booking.payment?.paid ? 'paid' : 'pending',
        bookingStatus: booking.status || 'pending',
        createdAt: booking.createdAt
      };
    });

    return res.status(200).json({ 
      success: true, 
      bookings: formattedBookings,
      count: formattedBookings.length
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch bookings" });
  }
};

export const getReports = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalMerchants,
      totalEvents,
      totalBookings,
      activeEvents,
      recentUsers,
      recentEvents,
      paidBookings,
      pendingBookings,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "merchant" }),
      Event.countDocuments(),
      Booking.countDocuments(),
      Event.countDocuments({ date: { $gte: now } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Event.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "pending" }),
    ]);

    // Revenue from payments
    const revenueAgg = await Payment.aggregate([
      { $match: { paymentStatus: "success" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const monthlyRevenueAgg = await Payment.aggregate([
      { $match: { paymentStatus: "success", createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;

    return res.status(200).json({
      success: true,
      reports: {
        totalUsers,
        totalMerchants,
        totalEvents,
        totalBookings,
        activeEvents,
        recentUsers,
        recentEvents,
        paidBookings,
        pendingBookings,
        totalRevenue,
        monthlyRevenue,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPublicStats = async (req, res) => {
  try {
    const [totalEvents, totalUsers, totalMerchants] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "merchant" }),
    ]);
    return res.status(200).json({
      success: true,
      stats: { totalEvents, totalUsers, totalMerchants },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Comprehensive Analytics for Admin Dashboard
export const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get current month start
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Revenue Analytics
    const [currentMonthPayments, lastMonthPayments] = await Promise.all([
      Payment.find({
        paymentDate: { $gte: currentMonthStart }
      }),
      Payment.find({
        paymentDate: { $gte: lastMonthStart, $lte: lastMonthEnd }
      })
    ]);

    const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const revenueGrowth = lastMonthRevenue > 0 
      ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(2)
      : 0;

    const currentMonthCommission = currentMonthPayments.reduce((sum, p) => sum + (p.adminCommission || 0), 0);
    const lastMonthCommission = lastMonthPayments.reduce((sum, p) => sum + (p.adminCommission || 0), 0);

    // Daily revenue for last 30 days
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$paymentDate" },
            month: { $month: "$paymentDate" },
            day: { $dayOfMonth: "$paymentDate" }
          },
          revenue: { $sum: "$amount" },
          commission: { $sum: "$adminCommission" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Bookings Analytics
    const totalBookings = await import("../models/bookingSchema.js");
    const allBookings = await totalBookings.Booking.find();
    const recentBookings = await totalBookings.Booking.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(50);

    const bookingsByStatus = allBookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    const bookingsByEventType = allBookings.reduce((acc, booking) => {
      acc[booking.eventType] = (acc[booking.eventType] || 0) + 1;
      return acc;
    }, {});

    // Top Merchants by Revenue
    const merchantRevenue = await Payment.aggregate([
      { $match: { paymentDate: { $gte: thirtyDaysAgo } } },
      { 
        $group: {
          _id: "$merchantId",
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          totalCommission: { $sum: "$adminCommission" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Populate merchant names
    const topMerchants = await Payment.populate(merchantRevenue, {
      path: '_id',
      select: 'name email',
      model: 'User'
    });

    const formattedTopMerchants = topMerchants.map(m => ({
      merchantId: m._id._id,
      name: m._id.name,
      email: m._id.email,
      revenue: m.totalRevenue,
      transactions: m.totalTransactions,
      commission: m.totalCommission
    }));

    // Platform Statistics
    const [totalUsers, totalMerchants, totalEvents] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'merchant' }),
      Event.countDocuments()
    ]);

    const activeUsers = await User.countDocuments({ 
      role: 'user', 
      status: 'active' 
    });

    const activeMerchants = await User.countDocuments({ 
      role: 'merchant', 
      status: 'active' 
    });

    const activeEvents = await Event.countDocuments({ 
      status: 'active' 
    });

    // Recent Activity
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentEvents = await Event.find()
      .select('title eventType date status')
      .sort({ createdAt: -1 })
      .limit(10);

    // Payment Status Distribution
    const paymentStatusDist = await Payment.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    // Category-wise Performance
    const categoryPerformance = await Payment.aggregate([
      { $match: { paymentDate: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: "$serviceCategory",
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        revenue: {
          currentMonth: currentMonthRevenue,
          lastMonth: lastMonthRevenue,
          growth: parseFloat(revenueGrowth),
          commission: currentMonthCommission,
          dailyTrend: dailyRevenue
        },
        bookings: {
          total: allBookings.length,
          byStatus: bookingsByStatus,
          byEventType: bookingsByEventType,
          recent: recentBookings,
          trend: recentBookings.length
        },
        merchants: {
          top: formattedTopMerchants,
          total: totalMerchants,
          active: activeMerchants
        },
        platform: {
          totalUsers,
          totalMerchants,
          totalEvents,
          activeUsers,
          activeMerchants,
          activeEvents
        },
        payments: {
          statusDistribution: paymentStatusDist
        },
        categories: {
          performance: categoryPerformance
        },
        recentActivity: {
          users: recentUsers,
          events: recentEvents
        }
      }
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to fetch analytics" 
    });
  }
};
