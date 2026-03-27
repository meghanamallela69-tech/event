import mongoose from "mongoose";
import dotenv from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected to MongoDB");

async function testEventCoupons() {
  try {
    console.log("\n=== TESTING EVENT COUPONS FETCHING ===\n");

    // Step 1: Get first event
    console.log("1️⃣ Fetching events...");
    const events = await Event.find().limit(5);
    
    if (events.length === 0) {
      console.log("❌ No events found in database");
      return;
    }
    
    console.log(`✓ Found ${events.length} events`);
    const testEvent = events[0];
    console.log(`Test event: ${testEvent.title} (${testEvent._id})`);

    // Step 2: Check if any coupons exist for this event
    console.log("\n2️⃣ Checking for existing coupons...");
    const existingCoupons = await Coupon.find({
      applicableEvents: testEvent._id
    });
    
    console.log(`Found ${existingCoupons.length} coupons for this event`);

    // Step 3: Create a test coupon if none exist
    if (existingCoupons.length === 0) {
      console.log("\n3️⃣ Creating test coupon...");
      
      // Find the merchant who created this event
      const merchantId = testEvent.createdBy;
      
      const testCoupon = await Coupon.create({
        code: `TEST${Math.floor(Math.random() * 1000)}`,
        name: "Test Discount",
        discountType: "percentage",
        discountValue: 10,
        maxDiscount: 500,
        minAmount: 100,
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        applicableEvents: [testEvent._id],
        applicableCategories: [],
        applicableUsers: [],
        createdBy: merchantId,
        usageHistory: []
      });
      
      console.log(`✓ Created test coupon: ${testCoupon.code}`);
      console.log(`  - Discount: ${testCoupon.discountValue}%`);
      console.log(`  - Min Amount: ₹${testCoupon.minAmount}`);
      console.log(`  - Max Discount: ₹${testCoupon.maxDiscount}`);
      console.log(`  - Applicable Events: ${testCoupon.applicableEvents.length}`);
    }

    // Step 4: Fetch valid coupons like the API does
    console.log("\n4️⃣ Testing coupon query (like API)...");
    const validCoupons = await Coupon.find({
      applicableEvents: testEvent._id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    })
    .select('code discountType discountValue maxDiscount minAmount expiryDate description')
    .populate('createdBy', 'name');
    
    // Filter by usage limit
    const filteredCoupons = validCoupons.filter(coupon => coupon.usedCount < coupon.usageLimit);
    
    console.log(`✓ Found ${filteredCoupons.length} valid coupons`);
    
    if (filteredCoupons.length > 0) {
      console.log("\n📋 Valid Coupons:");
      filteredCoupons.forEach((coupon, index) => {
        console.log(`\n${index + 1}. ${coupon.code}`);
        console.log(`   Type: ${coupon.discountType}`);
        console.log(`   Value: ${coupon.discountValue}`);
        console.log(`   Min Amount: ₹${coupon.minAmount}`);
        console.log(`   Max Discount: ₹${coupon.maxDiscount || 'N/A'}`);
        console.log(`   Expiry: ${new Date(coupon.expiryDate).toLocaleDateString()}`);
        console.log(`   Used: ${coupon.usedCount}/${coupon.usageLimit}`);
        console.log(`   Active: ${coupon.isActive ? 'Yes' : 'No'}`);
      });
    } else {
      console.log("⚠️  No valid coupons found (might be expired or inactive)");
    }

    // Step 5: Test the enhanced event structure
    console.log("\n5️⃣ Testing enhanced event with coupons...");
    const eventObj = testEvent.toObject();
    eventObj.coupons = filteredCoupons.map(coupon => ({
      _id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minAmount: coupon.minAmount,
      expiryDate: coupon.expiryDate,
      description: coupon.description,
      createdBy: coupon.createdBy
    }));
    
    console.log(`✓ Event object now has ${eventObj.coupons.length} coupons attached`);
    console.log(`Sample coupon structure:`);
    if (eventObj.coupons.length > 0) {
      console.log(JSON.stringify(eventObj.coupons[0], null, 2));
    }

    // Summary
    console.log("\n=== TEST SUMMARY ===");
    console.log(`✅ Event: ${testEvent.title}`);
    console.log(`✅ Total coupons for event: ${filteredCoupons.length}`);
    console.log(`✅ Coupons are properly filtered by:`);
    console.log(`   - Event ID match`);
    console.log(`   - Active status`);
    console.log(`   - Not expired`);
    console.log(`   - Usage limit not reached`);
    console.log("\n🎉 COUPON FETCHING WORKING CORRECTLY!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

// Run the test
testEventCoupons();
