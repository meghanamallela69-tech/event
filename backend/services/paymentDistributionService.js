import { Payment } from "../models/paymentSchema.js";
import { Booking } from "../models/bookingSchema.js";
import { User } from "../models/userSchema.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

// Configuration
const ADMIN_COMMISSION_PERCENT = 5; // 5% commission for admin

/**
 * Calculate commission distribution
 * @param {number} totalAmount - Total payment amount
 * @param {number} commissionPercent - Commission percentage (default: 5%)
 * @returns {object} - Commission breakdown
 */
export const calculateCommission = (totalAmount, commissionPercent = ADMIN_COMMISSION_PERCENT) => {
  const adminCommission = Math.round((totalAmount * commissionPercent) / 100 * 100) / 100; // Round to 2 decimal places
  const merchantAmount = Math.round((totalAmount - adminCommission) * 100) / 100; // Round to 2 decimal places
  
  return {
    totalAmount,
    adminCommission,
    merchantAmount,
    adminCommissionPercent: commissionPercent
  };
};

/**
 * Process payment distribution after successful payment
 * @param {object} paymentData - Payment information
 * @returns {object} - Payment distribution result
 */
export const processPaymentDistribution = async (paymentData) => {
  const {
    userId,
    merchantId,
    bookingId,
    eventId,
    totalAmount,
    paymentMethod,
    transactionId,
    paymentGateway = "manual",
    description = ""
  } = paymentData;

  console.log("=== PROCESSING PAYMENT DISTRIBUTION ===");
  console.log(`Total Amount: ₹${totalAmount}`);
  console.log(`User ID: ${userId}`);
  console.log(`Merchant ID: ${merchantId}`);
  console.log(`Booking ID: ${bookingId}`);

  try {
    // Step 1: Calculate commission distribution
    const distribution = calculateCommission(totalAmount);
    console.log(`Admin Commission (${distribution.adminCommissionPercent}%): ₹${distribution.adminCommission}`);
    console.log(`Merchant Amount: ₹${distribution.merchantAmount}`);

    // Step 2: Check if payment already exists (prevent duplicates)
    const existingPayment = await Payment.findOne({ 
      bookingId,
      paymentStatus: "success" 
    });

    if (existingPayment) {
      throw new Error("Payment already processed for this booking");
    }

    // Step 3: Create payment record
    const payment = await Payment.create({
      userId,
      merchantId,
      bookingId,
      eventId,
      totalAmount: distribution.totalAmount,
      adminCommission: distribution.adminCommission,
      merchantAmount: distribution.merchantAmount,
      adminCommissionPercent: distribution.adminCommissionPercent,
      paymentStatus: "success",
      paymentMethod,
      transactionId,
      paymentGateway,
      description,
      currency: "INR"
    });

    console.log(`✅ Payment record created: ${payment._id}`);

    // Step 4: Update booking with commission details
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        status: "completed",
        paymentAmount: totalAmount,
        adminCommission: distribution.adminCommission,
        merchantAmount: distribution.merchantAmount,
        adminCommissionPercent: distribution.adminCommissionPercent,
        commissionCalculated: true,
        paymentDate: new Date(),
        paymentId: transactionId
      },
      { new: true }
    );

    if (!booking) {
      throw new Error("Booking not found");
    }

    console.log(`✅ Booking updated with commission details`);

    // Step 5: Update merchant wallet
    const merchant = await User.findByIdAndUpdate(
      merchantId,
      {
        $inc: {
          walletBalance: distribution.merchantAmount,
          totalEarnings: distribution.merchantAmount
        }
      },
      { new: true }
    );

    if (!merchant) {
      throw new Error("Merchant not found");
    }

    console.log(`✅ Merchant wallet updated: +₹${distribution.merchantAmount}`);
    console.log(`   New wallet balance: ₹${merchant.walletBalance}`);

    // Step 6: Update admin commission tracking
    const admin = await User.findOneAndUpdate(
      { role: "admin" },
      {
        $inc: {
          totalCommissionEarned: distribution.adminCommission
        }
      },
      { new: true }
    );

    if (admin) {
      console.log(`✅ Admin commission updated: +₹${distribution.adminCommission}`);
      console.log(`   Total admin commission: ₹${admin.totalCommissionEarned}`);
    }

    // Step 7: Return success result
    return {
      success: true,
      payment,
      distribution,
      merchantWalletBalance: merchant.walletBalance,
      adminTotalCommission: admin?.totalCommissionEarned || 0
    };

  } catch (error) {
    console.error("❌ Payment distribution error:", error);
    throw error;
  }
};

/**
 * Process refund and reverse commission distribution
 * @param {string} bookingId - Booking ID to refund
 * @param {string} refundReason - Reason for refund
 * @returns {object} - Refund result
 */
export const processRefund = async (bookingId, refundReason = "Booking cancelled") => {
  console.log("=== PROCESSING REFUND ===");
  console.log(`Booking ID: ${bookingId}`);

  try {
    // Step 1: Find the payment record
    const payment = await Payment.findOne({ 
      bookingId,
      paymentStatus: "success" 
    });

    if (!payment) {
      throw new Error("No successful payment found for this booking");
    }

    if (payment.paymentStatus === "refunded") {
      throw new Error("Payment already refunded");
    }

    console.log(`Found payment: ₹${payment.totalAmount}`);
    console.log(`Admin Commission: ₹${payment.adminCommission}`);
    console.log(`Merchant Amount: ₹${payment.merchantAmount}`);

    // Step 2: Update payment status to refunded
    payment.paymentStatus = "refunded";
    payment.refundAmount = payment.totalAmount;
    payment.refundReason = refundReason;
    payment.refundDate = new Date();
    payment.refundTransactionId = `REF_${uuidv4().substring(0, 8).toUpperCase()}`;
    await payment.save();

    // Step 3: Update booking status
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "pending",
      status: "cancelled",
      refundStatus: "refunded",
      refundAmount: payment.totalAmount,
      refundReason,
      refundDate: new Date()
    });

    // Step 4: Reverse merchant wallet (subtract the amount)
    const merchant = await User.findByIdAndUpdate(
      payment.merchantId,
      {
        $inc: {
          walletBalance: -payment.merchantAmount,
          totalEarnings: -payment.merchantAmount
        }
      },
      { new: true }
    );

    console.log(`✅ Merchant wallet reversed: -₹${payment.merchantAmount}`);
    console.log(`   New wallet balance: ₹${merchant.walletBalance}`);

    // Step 5: Reverse admin commission
    const admin = await User.findOneAndUpdate(
      { role: "admin" },
      {
        $inc: {
          totalCommissionEarned: -payment.adminCommission
        }
      },
      { new: true }
    );

    if (admin) {
      console.log(`✅ Admin commission reversed: -₹${payment.adminCommission}`);
      console.log(`   Total admin commission: ₹${admin.totalCommissionEarned}`);
    }

    return {
      success: true,
      refundAmount: payment.totalAmount,
      refundTransactionId: payment.refundTransactionId,
      merchantWalletBalance: merchant.walletBalance,
      adminTotalCommission: admin?.totalCommissionEarned || 0
    };

  } catch (error) {
    console.error("❌ Refund processing error:", error);
    throw error;
  }
};

/**
 * Get payment statistics for admin dashboard
 * @returns {object} - Payment statistics
 */
export const getPaymentStatistics = async () => {
  try {
    const stats = await Payment.aggregate([
      {
        $match: { paymentStatus: "success" }
      },
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
    ]);

    const refundStats = await Payment.aggregate([
      {
        $match: { paymentStatus: "refunded" }
      },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: "$refundAmount" },
          refundCount: { $sum: 1 }
        }
      }
    ]);

    return {
      totalRevenue: stats[0]?.totalRevenue || 0,
      totalCommission: stats[0]?.totalCommission || 0,
      totalMerchantPayouts: stats[0]?.totalMerchantPayouts || 0,
      totalTransactions: stats[0]?.totalTransactions || 0,
      avgTransactionValue: stats[0]?.avgTransactionValue || 0,
      totalRefunds: refundStats[0]?.totalRefunds || 0,
      refundCount: refundStats[0]?.refundCount || 0
    };
  } catch (error) {
    console.error("Error getting payment statistics:", error);
    throw error;
  }
};

/**
 * Get merchant earnings summary
 * @param {string} merchantId - Merchant ID
 * @returns {object} - Merchant earnings
 */
export const getMerchantEarnings = async (merchantId) => {
  try {
    const earnings = await Payment.aggregate([
      {
        $match: { 
          merchantId: new mongoose.Types.ObjectId(merchantId),
          paymentStatus: "success"
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$merchantAmount" },
          totalTransactions: { $sum: 1 },
          avgEarningsPerTransaction: { $avg: "$merchantAmount" }
        }
      }
    ]);

    const merchant = await User.findById(merchantId).select('walletBalance totalEarnings');

    return {
      totalEarnings: earnings[0]?.totalEarnings || 0,
      totalTransactions: earnings[0]?.totalTransactions || 0,
      avgEarningsPerTransaction: earnings[0]?.avgEarningsPerTransaction || 0,
      walletBalance: merchant?.walletBalance || 0,
      lifetimeEarnings: merchant?.totalEarnings || 0
    };
  } catch (error) {
    console.error("Error getting merchant earnings:", error);
    throw error;
  }
};