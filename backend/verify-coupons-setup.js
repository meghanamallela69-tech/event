import mongoose from "mongoose";
import { config } from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";
import { User } from "./models/userSchema.js";

// Load environment variables
config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

async function verifyCoupons() {
  try {
    console.log("\n=== VERIFYING COUPON SETUP ===\n");

    // Get all events
    const events = await Event.find({}).select('title createdBy');
    
    if (events.length === 0) {
      console.log("❌ No events found!");
      return;
    }

    console.log(`Found ${events.length} events. Checking coupons...\n`);

    for (const event of events) {
      console.log(`📋 Event: ${event.title}`);
      console.log(`   Event ID: ${event._id}`);
      console.log(`   Merchant ID: ${event.createdBy}\n`);

      // Find coupons for this event
      const coupons = await Coupon.find({
        $or: [
          { eventId: event._id },
          { applicableEvents: { $in: [event._id] } }
        ],
        merchantId: event.createdBy,
        isActive: true,
        expiryDate: { $gt: new Date() }
      }).populate('merchantId', 'name email');

      if (coupons.length === 0) {
        console.log(`   ❌ No valid coupons found for this event\n`);
      } else {
        console.log(`   ✅ Found ${coupons.length} valid coupon(s):\n`);
        
        coupons.forEach((coupon, index) => {
          console.log(`   ${index + 1}. ${coupon.code}`);
          console.log(`      Discount: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}`);
          console.log(`      Min Amount: ₹${coupon.minAmount}`);
          console.log(`      Expiry: ${new Date(coupon.expiryDate).toLocaleDateString()}`);
          console.log(`      Used: ${coupon.usedCount}/${coupon.usageLimit}`);
          console.log(`      Merchant: ${coupon.merchantId?.name || 'N/A'}`);
          console.log(`      Has eventId: ${!!coupon.eventId}`);
          console.log(`      Has merchantId: ${!!coupon.merchantId}`);
          console.log();
        });
      }
      
      console.log("---\n");
    }

    // Also check for orphaned coupons
    console.log("\n🔍 Checking for orphaned coupons...\n");
    const allCoupons = await Coupon.find({ isActive: true }).populate('merchantId', 'name email');
    
    for (const coupon of allCoupons) {
      const hasValidEvent = coupon.eventId || (coupon.applicableEvents && coupon.applicableEvents.length > 0);
      const hasValidMerchant = coupon.merchantId;
      
      if (!hasValidEvent || !hasValidMerchant) {
        console.log(`⚠️  Coupon: ${coupon.code}`);
        console.log(`   Has eventId: ${!!coupon.eventId}`);
        console.log(`   Has merchantId: ${!!coupon.merchantId}`);
        console.log(`   createdBy: ${coupon.createdBy}`);
        console.log(`   Status: May need manual review\n`);
      }
    }

    console.log("\n✅ Verification completed!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

verifyCoupons();
