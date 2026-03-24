import { dbConnection } from "./database/dbConnection.js";
import { Coupon } from "./models/couponSchema.js";
import { User } from "./models/userSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const createTestCoupons = async () => {
  try {
    console.log("🔗 Connecting to database...");
    await dbConnection();
    
    // Find admin user
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.error("❌ No admin user found");
      process.exit(1);
    }
    
    console.log(`✅ Found admin: ${admin.email}`);
    
    // Clear existing test coupons
    await Coupon.deleteMany({ code: { $in: ["SAVE20", "FLAT100", "WELCOME10"] } });
    console.log("🧹 Cleared existing test coupons");
    
    // Create test coupons
    const testCoupons = [
      {
        code: "SAVE20",
        discountType: "percentage",
        discountValue: 20,
        maxDiscount: 500,
        minAmount: 100,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usageLimit: 100,
        description: "Get 20% off on all events (max ₹500)",
        createdBy: admin._id,
        isActive: true
      },
      {
        code: "FLAT100",
        discountType: "flat",
        discountValue: 100,
        minAmount: 500,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usageLimit: 50,
        description: "Flat ₹100 off on orders above ₹500",
        createdBy: admin._id,
        isActive: true
      },
      {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10,
        maxDiscount: 200,
        minAmount: 50,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        usageLimit: 200,
        description: "Welcome offer - 10% off for new users",
        createdBy: admin._id,
        isActive: true
      }
    ];
    
    const createdCoupons = await Coupon.insertMany(testCoupons);
    
    console.log("✅ Test coupons created successfully:");
    createdCoupons.forEach(coupon => {
      console.log(`  - ${coupon.code}: ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '₹'} off`);
    });
    
    console.log("\n📊 Coupon Summary:");
    console.log(`Total coupons in database: ${await Coupon.countDocuments()}`);
    console.log(`Active coupons: ${await Coupon.countDocuments({ isActive: true, expiryDate: { $gt: new Date() } })}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error creating test coupons:", error);
    process.exit(1);
  }
};

createTestCoupons();