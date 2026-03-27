import mongoose from "mongoose";
import { config } from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";
import { User } from "./models/userSchema.js";

// Load environment variables
config();

console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Set" : "❌ NOT SET");
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

async function debugSaveCoupons() {
  try {
    console.log("🔍 DEBUGGING SAVE30 & SAVE10 COUPONS\n");

    // Find the SAVE30 and SAVE10 coupons
    const saveCoupons = await Coupon.find({ 
      code: { $in: ['SAVE30', 'SAVE10'] }
    })
    .populate('applicableEvents', 'title')
    .populate('createdBy', 'name email role');
    
    if (saveCoupons.length === 0) {
      console.log("❌ SAVE30 and SAVE10 coupons NOT FOUND in database!\n");
      return;
    }
    
    console.log(`Found ${saveCoupons.length} SAVE coupon(s):\n`);
    
    saveCoupons.forEach((coupon, idx) => {
      console.log(`${idx + 1}. ${coupon.code}`);
      console.log(`   Created By: ${coupon.createdBy?.name} (${coupon.createdBy?.email})`);
      console.log(`   Role: ${coupon.createdBy?.role}`);
      console.log(`   Discount: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}`);
      console.log(`   Min Amount: ₹${coupon.minAmount}`);
      console.log(`   Max Discount: ₹${coupon.maxDiscount || 'N/A'}`);
      console.log(`   Active: ${coupon.isActive ? '✅' : '❌'}`);
      console.log(`   Expired: ${new Date(coupon.expiryDate) < new Date() ? '❌ YES' : '✅ NO'} (${new Date(coupon.expiryDate).toLocaleDateString()})`);
      console.log(`   Usage: ${coupon.usedCount}/${coupon.usageLimit}`);
      console.log(`   Applicable Events: ${coupon.applicableEvents.map(e => e.title).join(', ') || '❌ NONE'}`);
      console.log(`   Event IDs: ${coupon.applicableEvents.map(e => String(e._id)).join(', ') || 'NONE'}\n`);
      
      // Check validation
      const isActive = coupon.isActive === true;
      const isExpired = new Date(coupon.expiryDate) < new Date();
      const hasUsageLeft = coupon.usedCount < coupon.usageLimit;
      const hasEvents = coupon.applicableEvents.length > 0;
      
      console.log(`   VALIDATION CHECK:`);
      console.log(`   - Is Active: ${isActive ? '✅' : '❌'}`);
      console.log(`   - Not Expired: ${!isExpired ? '✅' : '❌'}`);
      console.log(`   - Has Usage Left: ${hasUsageLeft ? '✅' : '❌'}`);
      console.log(`   - Has Events Linked: ${hasEvents ? '✅' : '❌'}`);
      console.log(`   = PASSES ALL FILTERS: ${(isActive && !isExpired && hasUsageLeft && hasEvents) ? '✅ YES' : '❌ NO'}\n`);
    });
    
    // Now simulate what the API does
    console.log("=".repeat(60));
    console.log("🔄 SIMULATING API CALL (like frontend sees it)\n");
    
    for (const coupon of saveCoupons) {
      if (coupon.applicableEvents.length === 0) {
        console.log(`⚠️  ${coupon.code}: No events linked - won't show in ANY booking modal\n`);
        continue;
      }
      
      // For each event this coupon applies to
      for (const event of coupon.applicableEvents) {
        console.log(`Event: ${event.title} (${event._id})`);
        
        // Simulate the query from eventController.js
        const validCoupons = await Coupon.find({
          applicableEvents: event._id,
          isActive: true,
          expiryDate: { $gt: new Date() }
        })
        .select('code discountType discountValue maxDiscount minAmount expiryDate description')
        .populate('createdBy', 'name');
        
        const filteredCoupons = validCoupons.filter(c => c.usedCount < c.usageLimit);
        
        console.log(`  Coupons returned by API: ${filteredCoupons.length}`);
        filteredCoupons.forEach(c => {
          console.log(`    - ${c.code} (${c.discountValue}${c.discountType === 'percentage' ? '%' : ''})`);
        });
        
        const includesSaveCoupon = filteredCoupons.some(c => ['SAVE30', 'SAVE10'].includes(c.code));
        console.log(`  Includes SAVE30/SAVE10: ${includesSaveCoupon ? '✅ YES' : '❌ NO'}\n`);
      }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

debugSaveCoupons();
