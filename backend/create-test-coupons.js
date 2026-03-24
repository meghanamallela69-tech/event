import mongoose from "mongoose";
import { Coupon } from "./models/couponSchema.js";
import { User } from "./models/userSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const createTestCoupons = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find an admin user to create coupons
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      process.exit(1);
    }

    console.log("👤 Using admin user:", adminUser.name);

    // Delete existing test coupons
    await Coupon.deleteMany({ code: { $in: ["SAVE10", "WELCOME20", "FLAT50"] } });
    console.log("🗑️ Deleted existing test coupons");

    // Create test coupons
    const testCoupons = [
      {
        code: "SAVE10",
        discountType: "percentage",
        discountValue: 10,
        maxDiscount: 500,
        minAmount: 100,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usageLimit: 100,
        description: "Get 10% off on orders above ₹100",
        createdBy: adminUser._id,
        isActive: true
      },
      {
        code: "WELCOME20",
        discountType: "percentage",
        discountValue: 20,
        maxDiscount: 1000,
        minAmount: 500,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        usageLimit: 50,
        description: "Welcome offer! Get 20% off on orders above ₹500",
        createdBy: adminUser._id,
        isActive: true
      },
      {
        code: "FLAT50",
        discountType: "flat",
        discountValue: 50,
        minAmount: 200,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        usageLimit: 200,
        description: "Flat ₹50 off on orders above ₹200",
        createdBy: adminUser._id,
        isActive: true
      }
    ];

    const createdCoupons = await Coupon.insertMany(testCoupons);
    console.log("✅ Created test coupons:");
    createdCoupons.forEach(coupon => {
      console.log(`  - ${coupon.code}: ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} off`);
    });

    console.log("\n🎫 Test coupons created successfully!");
    console.log("You can now test coupon functionality with these codes:");
    console.log("- SAVE10 (10% off, min ₹100)");
    console.log("- WELCOME20 (20% off, min ₹500)");
    console.log("- FLAT50 (₹50 off, min ₹200)");

  } catch (error) {
    console.error("❌ Error creating test coupons:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

createTestCoupons();