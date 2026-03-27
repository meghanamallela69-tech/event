import mongoose from "mongoose";
import { config } from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";

// Load environment variables
config();

console.log("Environment loaded:", !!process.env.MONGO_URI);

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

async function diagnoseCoupons() {
  try {
    console.log("🔍 COMPREHENSIVE COUPON DIAGNOSIS\n");
    console.log("=" .repeat(60));

    // Step 1: Check all events
    const events = await Event.find().select('title _id createdBy');
    console.log(`\n📋 STEP 1: Found ${events.length} events\n`);
    
    if (events.length === 0) {
      console.log("❌ NO EVENTS FOUND in database!");
      return;
    }

    // Step 2: Check each event for coupons
    for (const event of events) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`EVENT: ${event.title}`);
      console.log(`ID: ${String(event._id)}`);
      console.log(`${'='.repeat(60)}`);
      
      // Find ALL coupons that have this event in applicableEvents
      const allCouponsForEvent = await Coupon.find({
        applicableEvents: event._id
      }).populate('createdBy', 'name email');
      
      console.log(`\nTotal coupons with this event in applicableEvents: ${allCouponsForEvent.length}`);
      
      if (allCouponsForEvent.length > 0) {
        allCouponsForEvent.forEach((coupon, idx) => {
          const isExpired = new Date(coupon.expiryDate) < new Date();
          const isActive = coupon.isActive === true;
          const hasUsageLeft = coupon.usedCount < coupon.usageLimit;
          
          console.log(`\n  ${idx + 1}. COUPON: ${coupon.code}`);
          console.log(`     Active: ${isActive ? '✅ YES' : '❌ NO'}`);
          console.log(`     Expired: ${isExpired ? '❌ YES' : '✅ NO'}`);
          console.log(`     Usage Left: ${hasUsageLeft ? `✅ YES (${coupon.usedCount}/${coupon.usageLimit})` : '❌ NO'}`);
          console.log(`     Discount: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}`);
          console.log(`     Min Amount: ₹${coupon.minAmount}`);
          console.log(`     Created By: ${coupon.createdBy?.name || 'Unknown'}`);
          
          // Check if it passes all filters
          const passesAllFilters = isActive && !isExpired && hasUsageLeft;
          console.log(`     PASSES ALL FILTERS: ${passesAllFilters ? '✅ YES' : '❌ NO'}`);
          
          if (!passesAllFilters) {
            if (!isActive) console.log(`       → Issue: isActive=${coupon.isActive}`);
            if (isExpired) console.log(`       → Issue: Expired on ${new Date(coupon.expiryDate).toLocaleDateString()}`);
            if (!hasUsageLeft) console.log(`       → Issue: Usage limit reached (${coupon.usedCount}/${coupon.usageLimit})`);
          }
        });
      } else {
        console.log(`  ⚠️  NO COUPONS found for this event`);
      }
      
      // Check what's in applicableEvents array of existing coupons
      const anyCouponWithThisEvent = await Coupon.findOne({
        applicableEvents: { $exists: true, $ne: [] }
      });
      
      if (!anyCouponWithThisEvent) {
        console.log(`\n  ⚠️  WARNING: No coupons with applicableEvents array found in entire database!`);
      }
    }

    // Step 3: Check ALL coupons in database
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`📊 STEP 3: ALL COUPONS IN DATABASE`);
    console.log(`${'='.repeat(60)}\n`);
    
    const allCoupons = await Coupon.find()
      .populate('applicableEvents', 'title')
      .populate('createdBy', 'name email');
    
    console.log(`Total coupons in database: ${allCoupons.length}\n`);
    
    if (allCoupons.length === 0) {
      console.log("❌ NO COUPONS FOUND in database!");
      console.log("\n💡 SOLUTION: Run this command to create test coupons:");
      console.log("   node create-event-coupons.js\n");
      return;
    }
    
    allCoupons.forEach((coupon, idx) => {
      console.log(`${idx + 1}. ${coupon.code}`);
      console.log(`   Applicable Events: ${coupon.applicableEvents.map(e => e.title).join(', ') || '❌ NONE'}`);
      console.log(`   Applicable Event IDs: ${coupon.applicableEvents.map(e => String(e._id)).join(', ') || 'NONE'}`);
      console.log(`   Active: ${coupon.isActive ? '✅' : '❌'}`);
      console.log(`   Expired: ${new Date(coupon.expiryDate) < new Date() ? '❌ YES' : '✅ NO'}`);
      console.log(`   Usage: ${coupon.usedCount}/${coupon.usageLimit} ${coupon.usedCount >= coupon.usageLimit ? '❌ LIMIT REACHED' : '✅ OK'}`);
      console.log(`   Merchant: ${coupon.createdBy?.name || 'Unknown'}\n`);
    });

    // Step 4: Summary and recommendations
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 SUMMARY & RECOMMENDATIONS`);
    console.log(`${'='.repeat(60)}\n`);
    
    const validCoupons = allCoupons.filter(c => 
      c.isActive && 
      new Date(c.expiryDate) > new Date() &&
      c.usedCount < c.usageLimit &&
      c.applicableEvents.length > 0
    );
    
    console.log(`Valid coupons (active, not expired, has usage, linked to events): ${validCoupons.length}`);
    
    if (validCoupons.length === 0) {
      console.log("\n❌ NO VALID COUPONS FOUND!\n");
      console.log("Possible reasons:");
      console.log("  1. No coupons created yet");
      console.log("  2. Coupons exist but not linked to any events (applicableEvents is empty)");
      console.log("  3. Coupons are inactive (isActive=false)");
      console.log("  4. Coupons have expired (expiryDate in past)");
      console.log("  5. Coupons have reached usage limit");
      
      console.log("\n💡 SOLUTIONS:\n");
      console.log("Option 1: Create test coupons automatically");
      console.log("  Command: node create-event-coupons.js");
      console.log("  This will create a 10% discount coupon for EVERY event\n");
      
      console.log("Option 2: Manually create a coupon via API");
      console.log("  POST /api/coupon/create");
      console.log("  Body: {");
      console.log("    code: 'TEST10',");
      console.log("    discountType: 'percentage',");
      console.log("    discountValue: 10,");
      console.log("    expiryDate: '2025-12-31',");
      console.log("    usageLimit: 100,");
      console.log("    applicableEvents: ['EVENT_ID_HERE']");
      console.log("  }\n");
      
      console.log("Option 3: Fix existing coupons");
      console.log("  Use MongoDB Compass or CLI to update:");
      console.log("  db.coupons.updateMany(");
      console.log("    { applicableEvents: { $exists: false } },");
      console.log("    { $set: { applicableEvents: [EVENT_OBJECT_ID], isActive: true } }");
      console.log("  )\n");
    } else {
      console.log("✅ Valid coupons exist!");
      console.log("\nNext steps:");
      console.log("  1. Restart backend server: npm start");
      console.log("  2. Watch console logs when /events API is called");
      console.log("  3. Open browser DevTools → Console");
      console.log("  4. Click 'Book Now' on an event");
      console.log("  5. Look for '=== BOOKING MODAL DEBUG ===' logs");
      console.log("  6. Check if coupons array is populated\n");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

diagnoseCoupons();
