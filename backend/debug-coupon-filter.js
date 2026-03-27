import mongoose from "mongoose";
import { config } from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";
import { User } from "./models/userSchema.js";

config();
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

async function debugCouponFilter() {
  try {
    console.log("🔍 DEBUGGING COUPON FILTER ISSUE\n");

    // Find Dileep (merchant user)
    const dileep = await User.findOne({ email: "mmeghana@speshway.com" });
    
    if (!dileep) {
      console.log("❌ Dileep user not found!");
      return;
    }
    
    // Get first event
    const event = await Event.findOne({ createdBy: dileep._id });
    
    if (!event) {
      console.log("❌ No events found!");
      return;
    }
    
    console.log(`Testing with event: ${event.title}`);
    console.log(`Event ID: ${event._id}\n`);
    
    // Step 1: Raw query without any filtering
    console.log("1️⃣ RAW QUERY - No filters:");
    const rawCoupons = await Coupon.find({
      applicableEvents: event._id
    });
    console.log(`   Found: ${rawCoupons.length} coupons\n`);
    
    rawCoupons.forEach(c => {
      console.log(`   - ${c.code}`);
      console.log(`     isActive: ${c.isActive}`);
      console.log(`     expiryDate: ${new Date(c.expiryDate).toLocaleString()}`);
      console.log(`     Now: ${new Date().toLocaleString()}`);
      console.log(`     Is expired: ${new Date(c.expiryDate) < new Date()}`);
      console.log(`     usedCount: ${c.usedCount}`);
      console.log(`     usageLimit: ${c.usageLimit}`);
      console.log(`     Within limit: ${c.usedCount < c.usageLimit}`);
      console.log();
    });
    
    // Step 2: Add isActive filter
    console.log("2️⃣ WITH isActive: true FILTER:");
    const activeCoupons = await Coupon.find({
      applicableEvents: event._id,
      isActive: true
    });
    console.log(`   Found: ${activeCoupons.length} coupons\n`);
    
    // Step 3: Add expiry filter
    console.log("3️⃣ WITH expiryDate: { $gt: new Date() } FILTER:");
    const nonExpiredCoupons = await Coupon.find({
      applicableEvents: event._id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    console.log(`   Found: ${nonExpiredCoupons.length} coupons\n`);
    
    // Step 4: Check what the select is doing
    console.log("4️⃣ WITH SELECT (like in eventController):");
    const selectedCoupons = await Coupon.find({
      applicableEvents: event._id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    })
    .select('code discountType discountValue maxDiscount minAmount expiryDate description')
    .populate('createdBy', 'name');
    console.log(`   Found: ${selectedCoupons.length} coupons\n`);
    
    selectedCoupons.forEach(c => {
      console.log(`   - ${c.code}`);
      console.log(`     usedCount: ${c.usedCount}`);
      console.log(`     usageLimit: ${c.usageLimit}`);
      console.log(`     usedCount < usageLimit: ${c.usedCount < c.usageLimit}`);
      console.log(`     typeof usedCount: ${typeof c.usedCount}`);
      console.log(`     typeof usageLimit: ${typeof c.usageLimit}`);
      console.log();
    });
    
    // Step 5: Manual filter
    console.log("5️⃣ MANUAL FILTER (like line 45-48):");
    const filteredCoupons = selectedCoupons.filter(coupon => {
      const withinLimit = coupon.usedCount < coupon.usageLimit;
      console.log(`   Coupon "${coupon.code}": used=${coupon.usedCount}, limit=${coupon.usageLimit}, withinLimit=${withinLimit}`);
      return withinLimit;
    });
    console.log(`   Result: ${filteredCoupons.length} coupons\n`);
    
    // Step 6: Check schema defaults
    console.log("6️⃣ CHECKING SCHEMA DEFAULTS:");
    const fullCoupon = await Coupon.findOne({ applicableEvents: event._id });
    console.log(`   Full coupon data:`);
    console.log(`     code: ${fullCoupon.code}`);
    console.log(`     usedCount: ${fullCoupon.usedCount} (type: ${typeof fullCoupon.usedCount})`);
    console.log(`     usageLimit: ${fullCoupon.usageLimit} (type: ${typeof fullCoupon.usageLimit})`);
    console.log(`     isActive: ${fullCoupon.isActive} (type: ${typeof fullCoupon.isActive})`);
    console.log(`     expiryDate: ${fullCoupon.expiryDate} (type: ${typeof fullCoupon.expiryDate})`);
    console.log();
    
    // Step 7: Try direct comparison
    console.log("7️⃣ DIRECT COMPARISON TEST:");
    console.log(`   usedCount: ${fullCoupon.usedCount}`);
    console.log(`   usageLimit: ${fullCoupon.usageLimit}`);
    console.log(`   usedCount < usageLimit: ${fullCoupon.usedCount < fullCoupon.usageLimit}`);
    console.log(`   Number(usedCount): ${Number(fullCoupon.usedCount)}`);
    console.log(`   Number(usageLimit): ${Number(fullCoupon.usageLimit)}`);
    console.log(`   Number(usedCount) < Number(usageLimit): ${Number(fullCoupon.usedCount) < Number(fullCoupon.usageLimit)}`);
    console.log();

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

debugCouponFilter();
