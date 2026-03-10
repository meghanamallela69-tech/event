import bcrypt from "bcrypt";
import { User } from "../models/userSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const createTestMerchant = async () => {
  try {
    // Check if test merchant exists
    const existing = await User.findOne({ email: "testmerchant@example.com" });
    
    if (existing) {
      console.log("Test merchant already exists!");
      console.log("Email:", existing.email);
      console.log("Role:", existing.role);
      console.log("Status:", existing.status);
      
      // Update password to known value
      const hash = await bcrypt.hash("Merchant@123", 10);
      existing.password = hash;
      await existing.save();
      console.log("\nPassword updated to: Merchant@123");
    } else {
      // Create new test merchant
      const hash = await bcrypt.hash("Merchant@123", 10);
      const merchant = await User.create({
        name: "Test Merchant",
        email: "testmerchant@example.com",
        phone: "1234567890",
        businessName: "Test Business",
        serviceType: "Event Planning",
        password: hash,
        role: "merchant",
        status: "active"
      });
      console.log("Test merchant created!");
      console.log("Email:", merchant.email);
      console.log("Password: Merchant@123");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createTestMerchant();
