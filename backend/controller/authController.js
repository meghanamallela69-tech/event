import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import { uploadSingleImage, deleteImage } from "../util/cloudinary.js";

const issueToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log("Registration attempt:", { name, email, role });
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    
    // Validate role
    const validRoles = ["user", "merchant"];
    const selectedRole = role && validRoles.includes(role) ? role : "user";
    
    console.log("Validated role:", selectedRole);
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hash, 
      role: selectedRole 
    });
    const token = issueToken(user._id, user.role);
    
    console.log("Registration successful:", user.email, "Role:", user.role);
    
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login attempt:", { email, passwordLength: password?.length });
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    
    // Find user with password
    const user = await User.findOne({ email }).select("+password");
    
    console.log("User found:", !!user, "Role:", user?.role);
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("Password match:", isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    
    // Generate JWT token
    const token = issueToken(user._id, user.role);
    
    console.log("Login successful for:", user.email, "Role:", user.role);
    
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during login", 
      error: error.message 
    });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch {
    return res.status(500).json({ success: false, message: "Unknown Error" });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to get profile" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, businessName, address, bio } = req.body;
    const userId = req.user.userId;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Validate fields
    if (name && name.trim().length < 3) {
      return res.status(400).json({ success: false, message: "Name must be at least 3 characters" });
    }
    
    if (email && email !== user.email) {
      // Check if email already exists
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }
    }
    
    // Handle image upload if present
    let profileImage = user.profileImage || null;
    if (req.file) {
      // Delete old image if exists
      if (user.profileImagePublicId) {
        await deleteImage(user.profileImagePublicId);
      }
      
      // Upload new image
      const uploadResult = await uploadSingleImage(req.file.path);
      profileImage = uploadResult.url;
      user.profileImagePublicId = uploadResult.public_id;
    }
    
    // Update fields
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone.trim();
    if (businessName !== undefined) user.businessName = businessName.trim();
    if (address !== undefined) user.address = address.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (profileImage) user.profileImage = profileImage;
    
    await user.save();
    
    return res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        address: user.address,
        bio: user.bio,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update profile" });
  }
};
