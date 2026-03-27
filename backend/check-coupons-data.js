import mongoose from "mongoose";
import dotenv from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected to MongoDB");

async function checkCoupons() {
  try {
    console.log("\n=== CHECKING COUPONS IN DATABASE ===\n");

    // Get all events
    const events = await Event.find().select('title createdBy');
    console.log(`📋 Found ${events.length} events:\n`);
    
    for (const event of events) {
      console.log(`Event: ${event.title}`);
      console.log(`ID: ${event._id}`);
      console.log(`Created By: ${event.createdBy}`);
      
      // Find coupons for this event
      const coupons = await Coupon.find({ 
        applicableEvents: event._id 
      }).populate('createdBy', 'name');
      
      console.log(`Coupons for this event: ${coupons.length}`);
      
      if (coupons.length > 0) {
        coupons.forEach((coupon, idx) => {
          console.log(`\n  ${idx + 1}. ${coupon.code}`);
          console.log(`     Active: ${coupon.isActive}`);
          console.log(`     Expiry: ${new Date(coupon.expiryDate).toLocaleDateString()}`);
          console.log(`     Used: ${coupon.usedCount}/${coupon.usageLimit}`);
          console.log(`     Discount: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}`);
          console.log(`     Merchant: ${coupon.createdBy?.name || 'Unknown'}`);
        });
      } else {
        console.log(`  ⚠️  No coupons found for this event\n`);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }

    // Also check all coupons
    const allCoupons = await Coupon.find().populate('applicableEvents', 'title');
    console.log(`\n📊 ALL COUPONS IN DATABASE (${allCoupons.length}):\n`);
    
    allCoupons.forEach((coupon, idx) => {
      console.log(`${idx + 1}. ${coupon.code}`);
      console.log(`   Applicable Events: ${coupon.applicableEvents.map(e => e.title).join(', ') || 'None'}`);
      console.log(`   Event IDs: ${coupon.applicableEvents.map(e => String(e._id)).join(', ')}`);
      console.log(`   Active: ${coupon.isActive}`);
      console.log(`   Expired: ${new Date(coupon.expiryDate) < new Date()}`);
      console.log(`   Usage: ${coupon.usedCount}/${coupon.usageLimit}\n`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

checkCoupons();
