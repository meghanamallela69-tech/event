import { Booking } from "../models/bookingSchema.js";
import { Event } from "../models/eventSchema.js";
import { Notification } from "../models/notificationSchema.js";
import { Payment } from "../models/paymentSchema.js";
import { User } from "../models/userSchema.js";
import { processPaymentDistribution, processRefund } from "../services/paymentDistributionService.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

// Process payment for a booking with commission distribution
export const processPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod, paymentAmount } = req.body;
    const userId = req.user.userId;

    console.log(`=== PROCESS PAYMENT ===`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Payment Method: ${paymentMethod}`);
    console.log(`Payment Amount: ${paymentAmount}`);

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify the booking belongs to the user
    if (String(booking.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not authorized to pay for this booking" });
    }

    // Check if booking is in correct status for payment
    if (!["pending", "confirmed"].includes(booking.bookingStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be confirmed before payment" 
      });
    }

    // Check if already paid
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking is already paid" 
      });
    }

    // Get event details
    const event = await Event.findById(booking.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Determine payment amount (use finalAmount if available, otherwise totalPrice)
    const totalAmount = paymentAmount || booking.finalAmount || booking.totalPrice;
    
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment amount" 
      });
    }

    // Generate transaction ID
    const transactionId = `TXN_${uuidv4().substring(0, 12).toUpperCase()}`;
    const ticketId = `TKT_${uuidv4().substring(0, 8).toUpperCase()}`;

    // Process payment distribution
    const distributionResult = await processPaymentDistribution({
      userId: booking.user,
      merchantId: booking.merchant || event.createdBy,
      bookingId: booking._id,
      eventId: event._id,
      totalAmount,
      paymentMethod: paymentMethod || "Cash",
      transactionId,
      paymentGateway: "manual",
      description: `Payment for ${event.title}`
    });

    // Update booking with additional details
    await Booking.findByIdAndUpdate(bookingId, {
      ticketId,
      ticketGenerated: true
    });

    // Create notification for user
    try {
      await Notification.create({
        user: booking.user,
        message: `Payment successful! Your booking for "${event.title}" is confirmed. Ticket ID: ${ticketId}`,
        eventId: event._id,
        bookingId: booking._id,
        type: "payment"
      });
    } catch (notifError) {
      console.error("Failed to create payment notification:", notifError);
    }

    // Create notification for merchant
    try {
      await Notification.create({
        user: booking.merchant || event.createdBy,
        message: `Payment received for "${event.title}" booking. Amount: ₹${distributionResult.distribution.merchantAmount}`,
        eventId: event._id,
        bookingId: booking._id,
        type: "payment"
      });
    } catch (notifError) {
      console.error("Failed to create merchant notification:", notifError);
    }

    console.log(`✅ Payment processed successfully for booking ${bookingId}`);

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      payment: distributionResult.payment,
      distribution: distributionResult.distribution,
      paymentDetails: {
        transactionId,
        ticketId,
        totalAmount,
        adminCommission: distributionResult.distribution.adminCommission,
        merchantAmount: distributionResult.distribution.merchantAmount,
        method: paymentMethod || "Cash",
        date: new Date()
      }
    });

  } catch (error) {
    console.error("Payment processing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message
    });
  }
};

// Get user's bookings with payment status
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log(`=== GET USER BOOKINGS ===`);
    console.log(`User ID: ${userId}`);

    const bookings = await Booking.find({
      user: userId,
      type: "event"
    })
      .populate("merchant", "name email")
      .sort({ createdAt: -1 });

    console.log(`Found ${bookings.length} bookings for user ${userId}`);

    // Format bookings with additional info
    const formattedBookings = bookings.map(booking => ({
      ...booking.toObject(),
      canPay: booking.status === "approved" && booking.paymentStatus !== "Paid",
      isConfirmed: booking.status === "confirmed" && booking.paymentStatus === "Paid",
      merchantName: booking.merchant?.name || "Unknown Merchant"
    }));

    return res.status(200).json({
      success: true,
      bookings: formattedBookings
    });

  } catch (error) {
    console.error("Get user bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};

// Get booking details for payment
export const getBookingForPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findById(bookingId)
      .populate("merchant", "name email");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify the booking belongs to the user
    if (String(booking.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Get event details
    const event = await Event.findById(booking.eventId);

    return res.status(200).json({
      success: true,
      booking: {
        ...booking.toObject(),
        eventDetails: event,
        canPay: booking.status === "approved" && booking.paymentStatus !== "Paid"
      }
    });

  } catch (error) {
    console.error("Get booking for payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking details"
    });
  }
};

// Process refund for a booking
export const processBookingRefund = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { refundReason } = req.body;
    const userId = req.user.userId;

    console.log(`=== PROCESS REFUND ===`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Refund Reason: ${refundReason}`);

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Check if user is authorized (booking owner or admin)
    const user = await User.findById(userId);
    const isAuthorized = String(booking.user) === String(userId) || user.role === "admin";
    
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Not authorized to refund this booking" });
    }

    // Check if booking is paid
    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be paid to process refund" 
      });
    }

    // Check if already refunded
    if (booking.refundStatus === "refunded") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking is already refunded" 
      });
    }

    // Process refund
    const refundResult = await processRefund(bookingId, refundReason || "Booking cancelled");

    // Get event details for notification
    const event = await Event.findById(booking.eventId);

    // Create notification for user
    try {
      await Notification.create({
        user: booking.user,
        message: `Refund processed for "${event?.title || 'your booking'}". Amount: ₹${refundResult.refundAmount}`,
        eventId: event?._id,
        bookingId: booking._id,
        type: "refund"
      });
    } catch (notifError) {
      console.error("Failed to create refund notification:", notifError);
    }

    // Create notification for merchant
    try {
      await Notification.create({
        user: booking.merchant || event?.createdBy,
        message: `Refund processed for "${event?.title || 'booking'}". Your earnings adjusted accordingly.`,
        eventId: event?._id,
        bookingId: booking._id,
        type: "refund"
      });
    } catch (notifError) {
      console.error("Failed to create merchant refund notification:", notifError);
    }

    console.log(`✅ Refund processed successfully for booking ${bookingId}`);

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      refund: {
        refundAmount: refundResult.refundAmount,
        refundTransactionId: refundResult.refundTransactionId,
        merchantWalletBalance: refundResult.merchantWalletBalance
      }
    });

  } catch (error) {
    console.error("Refund processing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message
    });
  }
};

// Get payment statistics for admin dashboard
export const getPaymentStatistics = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    // Get overall payment statistics
    const stats = await Payment.aggregate([
      {
        $facet: {
          successfulPayments: [
            { $match: { paymentStatus: "success" } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                totalCommission: { $sum: "$adminCommission" },
                totalMerchantPayouts: { $sum: "$merchantAmount" },
                totalTransactions: { $sum: 1 },
                avgTransactionValue: { $avg: "$totalAmount" }
              }
            }
          ],
          refundedPayments: [
            { $match: { paymentStatus: "refunded" } },
            {
              $group: {
                _id: null,
                totalRefunds: { $sum: "$refundAmount" },
                refundCount: { $sum: 1 }
              }
            }
          ],
          monthlyStats: [
            { $match: { paymentStatus: "success" } },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
                },
                revenue: { $sum: "$totalAmount" },
                commission: { $sum: "$adminCommission" },
                transactions: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 }
          ]
        }
      }
    ]);

    const successStats = stats[0].successfulPayments[0] || {};
    const refundStats = stats[0].refundedPayments[0] || {};
    const monthlyStats = stats[0].monthlyStats || [];

    return res.status(200).json({
      success: true,
      statistics: {
        totalRevenue: successStats.totalRevenue || 0,
        totalCommission: successStats.totalCommission || 0,
        totalMerchantPayouts: successStats.totalMerchantPayouts || 0,
        totalTransactions: successStats.totalTransactions || 0,
        avgTransactionValue: successStats.avgTransactionValue || 0,
        totalRefunds: refundStats.totalRefunds || 0,
        refundCount: refundStats.refundCount || 0,
        monthlyStats
      }
    });

  } catch (error) {
    console.error("Get payment statistics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment statistics",
      error: error.message
    });
  }
};

// Get merchant earnings and wallet info
export const getMerchantEarnings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Allow merchants to view their own earnings, admins to view any merchant
    let merchantId = userId;
    if (userRole === "admin" && req.params.merchantId) {
      merchantId = req.params.merchantId;
    } else if (userRole !== "merchant" && userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Merchant or admin access required" });
    }

    // Get merchant details
    const merchant = await User.findById(merchantId).select('name email walletBalance totalEarnings');
    if (!merchant) {
      return res.status(404).json({ success: false, message: "Merchant not found" });
    }

    // Get payment statistics for this merchant
    const earnings = await Payment.aggregate([
      {
        $match: { 
          merchantId: new mongoose.Types.ObjectId(merchantId),
          paymentStatus: "success"
        }
      },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalEarnings: { $sum: "$merchantAmount" },
                totalTransactions: { $sum: 1 },
                avgEarningsPerTransaction: { $avg: "$merchantAmount" }
              }
            }
          ],
          monthlyEarnings: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
                },
                earnings: { $sum: "$merchantAmount" },
                transactions: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 }
          ],
          recentTransactions: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "bookings",
                localField: "bookingId",
                foreignField: "_id",
                as: "booking"
              }
            },
            {
              $lookup: {
                from: "events",
                localField: "eventId",
                foreignField: "_id",
                as: "event"
              }
            }
          ]
        }
      }
    ]);

    const totalStats = earnings[0].totalStats[0] || {};
    const monthlyEarnings = earnings[0].monthlyEarnings || [];
    const recentTransactions = earnings[0].recentTransactions || [];

    return res.status(200).json({
      success: true,
      merchant: {
        id: merchant._id,
        name: merchant.name,
        email: merchant.email
      },
      earnings: {
        walletBalance: merchant.walletBalance || 0,
        lifetimeEarnings: merchant.totalEarnings || 0,
        totalEarnings: totalStats.totalEarnings || 0,
        totalTransactions: totalStats.totalTransactions || 0,
        avgEarningsPerTransaction: totalStats.avgEarningsPerTransaction || 0,
        monthlyEarnings,
        recentTransactions: recentTransactions.map(tx => ({
          transactionId: tx.transactionId,
          amount: tx.merchantAmount,
          totalAmount: tx.totalAmount,
          commission: tx.adminCommission,
          date: tx.createdAt,
          eventTitle: tx.event[0]?.title || "Unknown Event",
          bookingId: tx.bookingId
        }))
      }
    });

  } catch (error) {
    console.error("Get merchant earnings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch merchant earnings",
      error: error.message
    });
  }
};

// Get all payments (admin only)
export const getAllPayments = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { page = 1, limit = 20, status, merchantId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (status) {
      query.paymentStatus = status;
    }
    if (merchantId) {
      query.merchantId = merchantId;
    }

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate('merchantId', 'name email businessName')
      .populate({
        path: 'bookingId',
        select: 'eventTitle ticketType ticketCount'
      })
      .populate({
        path: 'eventId',
        select: 'title category date location'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    return res.status(200).json({
      success: true,
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPayments: total,
        hasNext: skip + payments.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Get all payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message
    });
  }
};