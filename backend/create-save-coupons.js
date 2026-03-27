import mongoose from "mongoose";
import { config } from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";

// Load environment variables
config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

async function createSaveCoupons() {
  try {
    console.log("\n=== CREATING SAVE10 AND SAVE30 COUPONS ===\n");

    // Get Wedding event
    const weddingEvent = await Event.findById("69b799063ddecddff43583f5");
    console.log(`📋 Found Wedding Event: ${weddingEvent.title}`);

    // Get Summer Music event
    const musicEvent = await Event.findById("69b799843ddecddff4358402");
    console.log(`📋 Found Music Event: ${musicEvent.title}`);

    const merchantId = weddingEvent.createdBy; // Same merchant for both
    console.log(`Merchant ID: ${merchantId}\n`);

    // Delete ALL existing coupons first
    console.log("Removing all old coupons...");
    await Coupon.deleteMany({});
    console.log("✅ Deleted all coupons\n");

    // Create SAVE30 for Wedding
    console.log("Creating SAVE30 for Wedding Planning...");
    const save30 = await Coupon.create({
      code: "SAVE30",
      discountType: "percentage",
      discountValue: 30,
      maxDiscount: 5000,
      minAmount: 1000,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
      description: "30% off on Wedding Planning services",
      createdBy: merchantId,
      merchantId: merchantId,
      eventId: weddingEvent._id,
      applicableEvents: [weddingEvent._id]
    });
    console.log(`✅ Created ${save30.code} (30% off, min ₹1000)\n`);

    // Create SAVE10 for Music
    console.log("Creating SAVE10 for Music Concert...");
    const save10 = await Coupon.create({
      code: "SAVE10",
      discountType: "percentage",
      discountValue: 10,
      maxDiscount: 500,
      minAmount: 500,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
      description: "10% off on Music Concert tickets",
      createdBy: merchantId,
      merchantId: merchantId,
      eventId: musicEvent._id,
      applicableEvents: [musicEvent._id]
    });
    console.log(`✅ Created ${save10.code} (10% off, min ₹500)\n`);

    // Verify creation
    console.log("\n=== VERIFYING COUPONS ===");
    const allCoupons = await Coupon.find({ 
      isActive: true,
      code: { $in: ["SAVE10", "SAVE30"] }
    });

    console.log(`Found ${allCoupons.length} new coupons:\n`);
    allCoupons.forEach(c => {
      console.log(`✅ ${c.code}`);
      console.log(`   Discount: ${c.discountValue}%`);
      console.log(`   Min Amount: ₹${c.minAmount}`);
      console.log(`   Max Discount: ₹${c.maxDiscount}`);
      console.log(`   Event ID: ${c.eventId}`);
      console.log(`   Merchant ID: ${c.merchantId}`);
      console.log();
    });

    console.log("✅ All done! SAVE10 and SAVE30 are now active.\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

createSaveCoupons();
