import mongoose from "mongoose";
import { config } from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";

// Load environment variables
config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

async function debugCoupons() {
  try {
    console.log("\n=== DEBUG COUPON VISIBILITY ===\n");

    // Get the Wedding event
    const weddingEvent = await Event.findById("69b799063ddecddff43583f5");
    console.log("📋 Wedding Event:");
    console.log(`   ID: ${weddingEvent._id}`);
    console.log(`   Title: ${weddingEvent.title}`);
    console.log(`   Created By: ${weddingEvent.createdBy}\n`);

    // Get the Summer event
    const summerEvent = await Event.findById("69b799843ddecddff4358402");
    console.log("📋 Summer Event:");
    console.log(`   ID: ${summerEvent._id}`);
    console.log(`   Title: ${summerEvent.title}`);
    console.log(`   Created By: ${summerEvent.createdBy}\n`);

    // Get all active coupons
    const allCoupons = await Coupon.find({ isActive: true });
    console.log(`🎫 All Active Coupons (${allCoupons.length}):\n`);

    allCoupons.forEach((coupon, idx) => {
      console.log(`${idx + 1}. ${coupon.code}`);
      console.log(`   _id: ${coupon._id}`);
      console.log(`   createdBy: ${coupon.createdBy}`);
      console.log(`   merchantId: ${coupon.merchantId || 'N/A'}`);
      console.log(`   eventId: ${coupon.eventId || 'N/A'}`);
      console.log(`   applicableEvents: ${coupon.applicableEvents?.length || 0}`);
      if (coupon.applicableEvents && coupon.applicableEvents.length > 0) {
        console.log(`     Events: ${coupon.applicableEvents.join(', ')}`);
      }
      console.log(`   isActive: ${coupon.isActive}`);
      console.log(`   expiryDate: ${coupon.expiryDate}`);
      console.log(`   usedCount: ${coupon.usedCount}/${coupon.usageLimit}`);
      console.log(`   minAmount: ${coupon.minAmount}`);
      console.log();
    });

    // Test the exact query that getAvailableCoupons uses
    console.log("\n🔍 Testing Query for Wedding Event:\n");
    const eventId = weddingEvent._id;
    const merchantId = weddingEvent.createdBy;

    const testCoupons = await Coupon.find({
      $or: [
        { eventId: eventId, merchantId: merchantId },
        { applicableEvents: eventId, merchantId: merchantId }
      ],
      isActive: true,
      expiryDate: { $gt: new Date() },
      minAmount: { $lte: 1000 }
    });

    console.log(`Found ${testCoupons.length} coupons matching the query`);
    
    if (testCoupons.length === 0) {
      console.log("\n❌ QUERY RETURNED NO RESULTS!");
      console.log("\nTrying alternative queries...\n");

      // Try without merchantId filter
      const noMerchantFilter = await Coupon.find({
        $or: [
          { eventId: eventId },
          { applicableEvents: eventId }
        ],
        isActive: true,
        expiryDate: { $gt: new Date() }
      });
      console.log(`Without merchantId filter: ${noMerchantFilter.length} coupons`);

      // Try with createdBy filter
      const withCreatedBy = await Coupon.find({
        $or: [
          { eventId: eventId },
          { applicableEvents: eventId }
        ],
        createdBy: merchantId,
        isActive: true,
        expiryDate: { $gt: new Date() }
      });
      console.log(`With createdBy filter: ${withCreatedBy.length} coupons`);
    } else {
      testCoupons.forEach(c => {
        console.log(`✅ Found: ${c.code}`);
      });
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

debugCoupons();
