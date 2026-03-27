import axios from "axios";

const API_BASE = "http://localhost:5000/api";

async function testCoupons() {
  try {
    console.log("\n=== TESTING COUPON FIX ===\n");

    // Login as user
    console.log("1. Logging in as user...");
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: "user@gmail.com",
      password: "password"
    });
    
    const token = loginRes.data.token;
    console.log("✅ Logged in successfully\n");

    // Get events
    console.log("2. Fetching events...");
    const eventsRes = await axios.get(`${API_BASE}/events`);
    const events = eventsRes.data.events;
    
    console.log(`✅ Found ${events.length} events\n`);

    // Check each event for coupons
    for (const event of events) {
      if (event.coupons && event.coupons.length > 0) {
        console.log(`📋 Event: ${event.title}`);
        console.log(`   Merchant ID: ${event.createdBy?._id || event.createdBy}`);
        console.log(`   Coupons: ${event.coupons.length}`);
        
        event.coupons.forEach((coupon, idx) => {
          console.log(`   ${idx + 1}. ${coupon.code}`);
          console.log(`      Discount: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}`);
          console.log(`      Created By: ${coupon.createdBy?.name || 'N/A'}`);
          console.log(`      eventId: ${coupon.eventId || 'N/A'}`);
          console.log(`      merchantId: ${coupon.merchantId || 'N/A'}`);
        });
        console.log();
      }
    }

    // Test available coupons endpoint
    console.log("3. Testing /coupons/available endpoint...");
    const eventWithCoupon = events.find(e => e.coupons && e.coupons.length > 0);
    
    if (eventWithCoupon) {
      console.log(`   Testing with event: ${eventWithCoupon.title}`);
      
      const couponRes = await axios.get(
        `${API_BASE}/coupons/available?eventId=${eventWithCoupon._id}&totalAmount=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(`   ✅ Available coupons: ${couponRes.data.coupons.length}`);
      
      if (couponRes.data.coupons.length > 0) {
        couponRes.data.coupons.forEach(c => {
          console.log(`   - ${c.code} (${c.discountType}: ${c.discountValue})`);
        });
      }
    } else {
      console.log("   ⚠️  No events with coupons found");
    }

    console.log("\n✅ Test completed!\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
  }
}

testCoupons();
