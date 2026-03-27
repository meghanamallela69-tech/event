import mongoose from "mongoose";
import { config } from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";

// Load environment variables
config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

async function updateCoupons() {
  try {
    console.log("\n=== UPDATING COUPONS WITH eventId AND merchantId ===\n");

    // Get all coupons
    const coupons = await Coupon.find({});
    
    if (coupons.length === 0) {
      console.log("❌ No coupons found in database!");
      return;
    }

    console.log(`Found ${coupons.length} coupons. Updating...\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const coupon of coupons) {
      console.log(`Processing: ${coupon.code}`);
      
      // Check if already has eventId and merchantId
      if (coupon.eventId && coupon.merchantId) {
        console.log(`  ⚠️  Already has eventId and merchantId - SKIPPED\n`);
        skippedCount++;
        continue;
      }

      // Try to get event from applicableEvents array
      if (coupon.applicableEvents && coupon.applicableEvents.length > 0) {
        const eventId = coupon.applicableEvents[0]; // Use first event
        
        // Find the event to get the merchant
        const event = await Event.findById(eventId);
        
        if (event) {
          // Update coupon with eventId and merchantId
          coupon.eventId = eventId;
          coupon.merchantId = event.createdBy;
          await coupon.save();
          
          console.log(`  ✅ Updated:`);
          console.log(`     eventId: ${eventId}`);
          console.log(`     merchantId: ${event.createdBy}`);
          console.log(`     Event: ${event.title}\n`);
          updatedCount++;
        } else {
          console.log(`  ⚠️  Event not found - SKIPPED\n`);
          skippedCount++;
        }
      } else {
        // No applicable events, use createdBy as merchantId
        coupon.merchantId = coupon.createdBy;
        await coupon.save();
        
        console.log(`  ✅ Updated merchantId only (no event link): ${coupon.createdBy}\n`);
        updatedCount++;
      }
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Total coupons processed: ${coupons.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log("\n✅ Coupon update completed!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

updateCoupons();
