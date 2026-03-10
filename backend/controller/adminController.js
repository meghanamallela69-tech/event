import { User } from "../models/userSchema.js";
import { Event } from "../models/eventSchema.js";
import { Registration } from "../models/registrationSchema.js";
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
