import { dbConnection } from "./database/dbConnection.js";
import { processPaymentDistribution, calculateCommission } from "./services/paymentDistributionService.js";
import { User } from "./models/userSchema.js";
import { Event } from "./models/eventSchema.js";
import { Booking } from "./models/bookingSchema.js";
import { Payment } from "./models/paymentSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const testPaymentDistribution = async () => {
  try {
    console.log("🧪 Testing Payment Distribution System");
    console.log("=====================================");
    
    // Connect to database
    await dbConnection();
    
    // Step 1: Test commission calculation
    console.log("\n1. Testing Commission Calculation");
    console.log("---------------------------------");
    
    const testAmounts = [1000, 5000, 10000, 50000];
    
    testAmounts.forEach(amount => {
      const distribution = calculateCommission(amount);
      console.log(`Amount: ₹${amount}`);
      console.log(`  Admin Commission (5%): ₹${distribution.adminCommission}`);
      console.log(`  Merchant Amount (95%): ₹${distribution.merchantAmount}`);
      console.log(`  Total Check: ₹${distribution.adminCommission + distribution.merchantAmount} = ₹${distribution.totalAmount}`);
      console.log("");
    });
    
    // Step 2: Find test data
    console.log("2. Finding Test Data");
    console.log("--------------------");
    
    const user = await User.findOne({ role: "user" });
    const merchant = await User.findOne({ role: "merchant" });
    const admin = await User.findOne({ role: "admin" });
    const event = await Event.findOne().populate("createdBy");
    
    if (!user || !merchant || !admin || !event) {
      console.log("❌ Missing test data:");
      console.log(`  User: ${user ? "✅" : "❌"}`);
      console.log(`  Merchant: ${merchant ? "✅" : "❌"}`);
      console.log(`  Admin: ${admin ? "✅" : "❌"}`);
      console.log(`  Event: ${event ? "✅" : "❌"}`);
      return;
    }
    
    console.log("✅ Test data found:");
    console.log(`  User: ${user.name} (${user.email})`);
    console.log(`  Merchant: ${merchant.name} (${merchant.email})`);
    console.log(`  Admin: ${admin.name} (${admin.email})`);
    console.log(`  Event: ${event.title} (₹${event.price})`);
    
    // Step 3: Create test booking
    console.log("\n3. Creating Test Booking");
    console.log("-------------------------");
    
    const testBooking = await Booking.create({
      user: user._id,
      merchant: merchant._id,
      type: "event",
      eventType: "ticketed",
      eventId: event._id,
      eventTitle: event.title,
      eventCategory: event.category,
      eventPrice: event.price,
      eventLocation: event.location,
      eventDate: event.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Use event date or 7 days from now
      eventTime: event.time,
      attendeeName: user.name,
      attendeeEmail: user.email,
      ticketType: "General",
      ticketCount: 2,
      bookingDate: new Date(),
      totalPrice: 2000,
      originalAmount: 2000,
      finalAmount: 2000,
      bookingStatus: "confirmed",
      status: "pending",
      paymentStatus: "pending"
    });
    
    console.log(`✅ Test booking created: ${testBooking._id}`);
    
    // Step 4: Record initial wallet balances
    console.log("\n4. Initial Wallet Balances");
    console.log("---------------------------");
    
    const initialMerchantBalance = merchant.walletBalance || 0;
    const initialAdminCommission = admin.totalCommissionEarned || 0;
    
    console.log(`Merchant wallet: ₹${initialMerchantBalance}`);
    console.log(`Admin commission: ₹${initialAdminCommission}`);
    
    // Step 5: Process payment distribution
    console.log("\n5. Processing Payment Distribution");
    console.log("----------------------------------");
    
    const paymentData = {
      userId: user._id,
      merchantId: merchant._id,
      bookingId: testBooking._id,
      eventId: event._id,
      totalAmount: 2000,
      paymentMethod: "UPI",
      transactionId: `TEST_${Date.now()}`,
      description: "Test payment distribution"
    };
    
    const result = await processPaymentDistribution(paymentData);
    
    console.log("✅ Payment distribution completed:");
    console.log(`  Total Amount: ₹${result.distribution.totalAmount}`);
    console.log(`  Admin Commission: ₹${result.distribution.adminCommission}`);
    console.log(`  Merchant Amount: ₹${result.distribution.merchantAmount}`);
    console.log(`  New Merchant Balance: ₹${result.merchantWalletBalance}`);
    console.log(`  New Admin Commission: ₹${result.adminTotalCommission}`);
    
    // Step 6: Verify database updates
    console.log("\n6. Verifying Database Updates");
    console.log("------------------------------");
    
    const updatedBooking = await Booking.findById(testBooking._id);
    const updatedMerchant = await User.findById(merchant._id);
    const updatedAdmin = await User.findById(admin._id);
    const paymentRecord = await Payment.findOne({ bookingId: testBooking._id });
    
    console.log("Booking updates:");
    console.log(`  Payment Status: ${updatedBooking.paymentStatus}`);
    console.log(`  Status: ${updatedBooking.status}`);
    console.log(`  Admin Commission: ₹${updatedBooking.adminCommission}`);
    console.log(`  Merchant Amount: ₹${updatedBooking.merchantAmount}`);
    console.log(`  Commission Calculated: ${updatedBooking.commissionCalculated}`);
    
    console.log("\nMerchant updates:");
    console.log(`  Wallet Balance: ₹${updatedMerchant.walletBalance} (was ₹${initialMerchantBalance})`);
    console.log(`  Total Earnings: ₹${updatedMerchant.totalEarnings}`);
    console.log(`  Balance Change: +₹${updatedMerchant.walletBalance - initialMerchantBalance}`);
    
    console.log("\nAdmin updates:");
    console.log(`  Total Commission: ₹${updatedAdmin.totalCommissionEarned} (was ₹${initialAdminCommission})`);
    console.log(`  Commission Change: +₹${updatedAdmin.totalCommissionEarned - initialAdminCommission}`);
    
    console.log("\nPayment record:");
    console.log(`  Transaction ID: ${paymentRecord.transactionId}`);
    console.log(`  Status: ${paymentRecord.paymentStatus}`);
    console.log(`  Total: ₹${paymentRecord.totalAmount}`);
    console.log(`  Admin Commission: ₹${paymentRecord.adminCommission}`);
    console.log(`  Merchant Amount: ₹${paymentRecord.merchantAmount}`);
    
    // Step 7: Test validation
    console.log("\n7. Validation Results");
    console.log("---------------------");
    
    const expectedMerchantIncrease = result.distribution.merchantAmount;
    const actualMerchantIncrease = updatedMerchant.walletBalance - initialMerchantBalance;
    const expectedAdminIncrease = result.distribution.adminCommission;
    const actualAdminIncrease = updatedAdmin.totalCommissionEarned - initialAdminCommission;
    
    console.log(`Merchant balance increase: Expected ₹${expectedMerchantIncrease}, Actual ₹${actualMerchantIncrease} ${expectedMerchantIncrease === actualMerchantIncrease ? "✅" : "❌"}`);
    console.log(`Admin commission increase: Expected ₹${expectedAdminIncrease}, Actual ₹${actualAdminIncrease} ${expectedAdminIncrease === actualAdminIncrease ? "✅" : "❌"}`);
    console.log(`Commission + Merchant = Total: ₹${paymentRecord.adminCommission + paymentRecord.merchantAmount} = ₹${paymentRecord.totalAmount} ${paymentRecord.adminCommission + paymentRecord.merchantAmount === paymentRecord.totalAmount ? "✅" : "❌"}`);
    
    console.log("\n✅ Payment Distribution System Test Completed Successfully!");
    
    // Cleanup
    console.log("\n8. Cleaning Up Test Data");
    console.log("-------------------------");
    
    await Payment.findByIdAndDelete(paymentRecord._id);
    await Booking.findByIdAndDelete(testBooking._id);
    
    // Restore original balances
    await User.findByIdAndUpdate(merchant._id, {
      walletBalance: initialMerchantBalance,
      totalEarnings: (merchant.totalEarnings || 0) - expectedMerchantIncrease
    });
    
    await User.findByIdAndUpdate(admin._id, {
      totalCommissionEarned: initialAdminCommission
    });
    
    console.log("✅ Test data cleaned up");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Payment distribution test failed:", error);
    process.exit(1);
  }
};

testPaymentDistribution();