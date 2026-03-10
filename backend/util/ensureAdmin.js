import bcrypt from "bcrypt";
import { User } from "../models/userSchema.js";

export const ensureAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@eventhub.local";
    const password = process.env.ADMIN_PASSWORD || "Admin@123";
    const name = process.env.ADMIN_NAME || "Admin";
    
    console.log("Checking for admin user:", email);
    
    const existing = await User.findOne({ email }).select("+password");
    
    if (existing) {
      console.log("Admin user already exists");
      const force = String(process.env.ADMIN_FORCE_RESET || "").toLowerCase() === "true";
      if (force) {
        console.log("Force reset enabled, updating admin password");
        const hash = await bcrypt.hash(password, 10);
        await User.updateOne({ _id: existing._id }, { $set: { name, password: hash, role: "admin" } });
        console.log("Admin password updated");
      }
      return;
    }
    
    console.log("Creating new admin user...");
    const hash = await bcrypt.hash(password, 10);
    const admin = await User.create({ name, email, password: hash, role: "admin" });
    console.log("Admin user created successfully:", admin.email);
  } catch (error) {
    console.error("Error in ensureAdmin:", error);
    throw error;
  }
};
