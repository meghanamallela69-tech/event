import { dbConnection } from "./database/dbConnection.js";
import { Coupon } from "./models/couponSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const debugCoupons = async () => {
  try {
    console.log("🔗 Connecting to database...");
    await dbConnection();
    
    console.log("📊 Checking coupons in database...");
    
    // Get all coupons
    const allCoupons = await Coupon.find({});
    console.log(`Total coupons: ${allCoupons.length}`);
    
    allCoupons.forEach(coupon => {
      console.log(`- ${coupon.code}: ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '₹'} off, Active: ${coupon.isActive}, Expires: ${coupon.expiryDate}`);
    });
    
    // Test the query used in getAvailableCoupons
    console.log("\n🔍 Testing available coupons query...");
    
    const query = {
      isActive: true,
      expiryDate: { $gt: new Date() },
      $expr: { $lt: ["$usedCount", "$usageLimit"] }
    };
    
    // Add minimum amount filter
    query.minAmount = { $lte: 200 };
    
    console.log("Query:", JSON.stringify(query, null, 2));
    
    const availableCoupons = await Coupon.find(query)
      .select('code discountType discountValue maxDiscount minAmount expiryDate description usedCount usageLimit usageHistory');
    
    console.log(`Available coupons found: ${availableCoupons.length}`);
    
    availableCoupons.forEach(coupon => {
      console.log(`- ${coupon.code}: ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '₹'} off, Min: ₹${coupon.minAmount}, Used: ${coupon.usedCount}/${coupon.usageLimit}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Debug error:", error);
    process.exit(1);
  }
};

debugCoupons();