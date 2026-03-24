import { User } from "../models/userSchema.js";
import { Event } from "../models/eventSchema.js";
import { Registration } from "../models/registrationSchema.js";
import { Booking } from "../models/bookingSchema.js";
import { Payment } from "../models/paymentSchema.js";
import bcrypt from "bcrypt";
import { sendMail } from "../util/mailer.js";

export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ success: true, users });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
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
    return res.status(500).json({ success: false, message: "Unknown Error" });
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
