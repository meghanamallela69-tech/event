import mongoose from "mongoose";
import { config } from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";
import { User } from "./models/userSchema.js";

config();
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

async function checkMerchantCoupons() {
  try {
    console.log("🔍 CHECKING MERCHANT COUPONS STATUS\n");

    // Find Dileep (merchant user)
    const dileep = await User.findOne({ email: "mmeghana@speshway.com" });
    
    if (!dileep) {
      console.log("❌ Dileep user not found!");
      return;
    }
    
    console.log(`Merchant: ${dileep.name} (${dileep.email})`);
    console.log(`User ID: ${dileep._id}\n`);
    
    // Find all coupons created by Dileep
    const merchantCoupons = await Coupon.find({ createdBy: dileep._id })
      .populate('applicableEvents', 'title');
    
    console.log(`Found ${merchantCoupons.length} coupon(s) created by Dileep:\n`);
    
    merchantCoupons.forEach((coupon, idx) => {
      console.log(`${idx + 1}. ${coupon.code}`);
      console.log(`   Discount: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}`);
      console.log(`   Min Amount: ₹${coupon.minAmount}`);
      console.log(`   Max Discount: ₹${coupon.maxDiscount || 'N/A'}`);
      console.log(`   Active: ${coupon.isActive ? '✅' : '❌'}`);
      console.log(`   Expired: ${new Date(coupon.expiryDate) < new Date() ? '❌ YES' : '✅ NO'} (${new Date(coupon.expiryDate).toLocaleDateString()})`);
      console.log(`   Usage: ${coupon.usedCount}/${coupon.usageLimit}`);
      console.log(`   Applicable Events: ${coupon.applicableEvents.map(e => e.title).join(', ') || '❌ NONE'}`);
      console.log(`   Event IDs: ${coupon.applicableEvents.map(e => String(e._id)).join(', ') || 'NONE'}\n`);
    });
    
    // Now check if these coupons would show up for each event
    console.log("=".repeat(60));
    console.log("🔄 CHECKING IF COUPONS SHOW IN BOOKING MODAL\n");
    
    const dileepsEvents = await Event.find({ createdBy: dileep._id })
      .select('title _id');
    
    for (const event of dileepsEvents) {
      console.log(`Event: ${event.title} (${event._id})`);
      
      // This is the EXACT query from eventController.js line 31 (FIXED VERSION)
      const validCoupons = await Coupon.find({
        applicableEvents: event._id,
        isActive: true,
        expiryDate: { $gt: new Date() }
      })
      .select('code discountType discountValue maxDiscount minAmount expiryDate description usedCount usageLimit')
      .populate('createdBy', 'name');
      
      // Filter by usage limit (line 45-48)
      const filteredCoupons = validCoupons.filter(coupon => {
        return coupon.usedCount < coupon.usageLimit;
      });
      
      console.log(`  Raw coupons from DB: ${validCoupons.length}`);
      console.log(`  After usage filter: ${filteredCoupons.length}`);
      
      if (filteredCoupons.length > 0) {
        console.log(`  ✅ Coupons that will show:`);
        filteredCoupons.forEach(c => {
          console.log(`    - ${c.code} (${c.discountValue}${c.discountType === 'percentage' ? '%' : ''}) - Used: ${c.usedCount}/${c.usageLimit}`);
        });
      } else {
        console.log(`  ❌ NO COUPONS WILL SHOW!`);
      }
      console.log();
    }
    
    // Check for any issues
    console.log("=".repeat(60));
    console.log("🔍 POTENTIAL ISSUES CHECK\n");
    
    for (const coupon of merchantCoupons) {
      const issues = [];
      
      if (!coupon.isActive) issues.push("❌ Not active");
      if (new Date(coupon.expiryDate) < new Date()) issues.push("❌ Expired");
      if (coupon.usedCount >= coupon.usageLimit) issues.push("❌ Usage limit reached");
      if (coupon.applicableEvents.length === 0) issues.push("❌ No events linked");
      
      if (issues.length > 0) {
        console.log(`⚠️  ${coupon.code} has issues:`);
        issues.forEach(issue => console.log(`    ${issue}`));
        console.log();
      }
    }
    
    const allGood = merchantCoupons.every(c => 
      c.isActive && 
      new Date(c.expiryDate) > new Date() && 
      c.usedCount < c.usageLimit && 
      c.applicableEvents.length > 0
    );
    
    if (allGood) {
      console.log("✅ All coupons look good! They should show in booking modal.\n");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

checkMerchantCoupons();
