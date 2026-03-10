import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/userSchema.js";

dotenv.config({ path: "./config/config.env" });

const resetAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");

    const email = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "Admin@123";
    const name = process.env.ADMIN_NAME || "Admin";

    console.log("Resetting admin with email:", email);

    // Delete existing admin
    await User.deleteOne({ email });
    console.log("Deleted existing admin (if any)");

    // Create new admin
    const hash = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name,
      email,
      password: hash,
      role: "admin",
    });

    console.log("Admin created successfully:");
    console.log("  Email:", admin.email);
    console.log("  Name:", admin.name);
    console.log("  Role:", admin.role);

    await mongoose.disconnect();
    console.log("Disconnected from database");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

resetAdmin();
