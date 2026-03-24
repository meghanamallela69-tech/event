import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/userSchema.js";

dotenv.config({ path: "./config/config.env" });

const resetAdminPassword = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    console.log("\n🔍 Looking for admin user:", adminEmail);
    
    const admin = await User.findOne({ email: adminEmail }).select("+password");

    if (!admin) {
      console.log("❌ Admin user not found. Creating new admin...");
      const hash = await bcrypt.hash(adminPassword, 10);
      const newAdmin = await User.create({
        name: process.env.ADMIN_NAME || "Admin",
        email: adminEmail,
        password: hash,
        role: "admin"
      });
      console.log("✅ Admin user created successfully!");
      console.log("📧 Email:", newAdmin.email);
      console.log("🔑 Password:", adminPassword);
    } else {
      console.log("✅ Admin user found");
      console.log("🔄 Resetting password...");
      
      const hash = await bcrypt.hash(adminPassword, 10);
      admin.password = hash;
      admin.role = "admin";
      await admin.save();
      
      console.log("✅ Admin password reset successfully!");
      console.log("📧 Email:", admin.email);
      console.log("🔑 Password:", adminPassword);
      
      // Verify the password works
      const testMatch = await bcrypt.compare(adminPassword, hash);
      console.log("🔍 Password verification:", testMatch ? "✅ PASS" : "❌ FAIL");
    }

    console.log("\n✅ Admin reset complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

resetAdminPassword();
