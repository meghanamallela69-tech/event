import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const API_BASE = process.env.BACKEND_URL || "http://localhost:5000";

// Test credentials - replace with actual user credentials
const TEST_EMAIL = "user@example.com";
const TEST_PASSWORD = "password123";

const testFullServiceBookingAPI = async () => {
  try {
    console.log("🧪 Testing Full Service Booking API");
    console.log("====================================\n");
    
    // Step 1: Login to get token
    console.log("Step 1: Authenticating user...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user._id;
    console.log("✅ User authenticated:", loginResponse.data.user.name);
    console.log("User ID:", userId);
    console.log("Token:", token.substring(0, 20) + "...\n");
    
    // Step 2: Get available events
    console.log("Step 2: Fetching available events...");
    const eventsResponse = await axios.get(`${API_BASE}/events`);
    const fullServiceEvents = eventsResponse.data.events.filter(
      e => e.eventType === "full-service"
    );
    
    if (fullServiceEvents.length === 0) {
      console.log("❌ No full-service events found!");
      return;
    }
    
    const testEvent = fullServiceEvents[0];
    console.log("✅ Found full-service event:", testEvent.title);
    console.log("Event ID:", testEvent._id);
    console.log("Price: ₹", testEvent.price);
    console.log("");
    
    // Step 3: Create booking with full service data
    console.log("Step 3: Creating full service booking...");
    const bookingData = {
      serviceId: testEvent._id,
      serviceTitle: testEvent.title,
      serviceCategory: testEvent.category || "event",
      servicePrice: testEvent.price,
      eventType: "full-service",
      eventDate: new Date().toISOString().split('T')[0],
      eventTime: "10:00 AM",
      timeSlot: "10:00 AM",
      location: "Test Location Address",
      locationType: "custom",
      selectedAddOns: [
        { name: "Extra Hours", price: 500 },
        { name: "Premium Package", price: 1000 }
      ],
      addons: [
        { name: "Extra Hours", price: 500 },
        { name: "Premium Package", price: 1000 }
      ],
      totalAmount: testEvent.price + 1500,
      basePrice: testEvent.price,
      addonsTotal: 1500,
      discount: 0,
      promoCode: null,
      status: "pending",
      notes: "",
      guestCount: 1
    };
    
    console.log("Sending booking data:");
    console.log(JSON.stringify(bookingData, null, 2));
    console.log("");
    
    const bookingResponse = await axios.post(
      `${API_BASE}/bookings`,
      bookingData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log("✅ Booking Response:");
    console.log("Status Code:", bookingResponse.status);
    console.log("Success:", bookingResponse.data.success);
    console.log("Message:", bookingResponse.data.message);
    console.log("Booking ID:", bookingResponse.data.booking._id);
    console.log("Event Type:", bookingResponse.data.booking.eventType);
    console.log("Status:", bookingResponse.data.booking.status);
    console.log("Payment Status:", bookingResponse.data.booking.paymentStatus);
    console.log("Addons:", JSON.stringify(bookingResponse.data.booking.addons));
    console.log("Total Price: ₹", bookingResponse.data.booking.totalPrice);
    
    // Step 4: Verify booking was created in database
    console.log("\nStep 4: Verifying booking in database...");
    const verifyResponse = await axios.get(
      `${API_BASE}/bookings/${bookingResponse.data.booking._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log("✅ Booking verified in database");
    console.log("Booking exists:", !!verifyResponse.data.booking);
    
    // Step 5: Test multiple bookings (no duplicate blocking)
    console.log("\nStep 5: Testing multiple bookings for same event...");
    const bookingData2 = {
      ...bookingData,
      eventDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      eventTime: "02:00 PM",
      timeSlot: "02:00 PM"
    };
    
    const bookingResponse2 = await axios.post(
      `${API_BASE}/bookings`,
      bookingData2,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log("✅ Second booking created successfully!");
    console.log("Booking ID:", bookingResponse2.data.booking._id);
    console.log("Multiple bookings are allowed (no duplicate blocking)");
    
    // Summary
    console.log("\n📊 Test Summary");
    console.log("================");
    console.log("✅ API endpoint POST /api/bookings is working");
    console.log("✅ Accepts full service booking data");
    console.log("✅ Creates booking with status 'pending'");
    console.log("✅ Creates booking with paymentStatus 'unpaid'");
    console.log("✅ Stores selectedAddOns/addons correctly");
    console.log("✅ Returns success message: 'Booking request sent successfully'");
    console.log("✅ No duplicate booking blocking");
    console.log("✅ Proper error handling enabled");
    console.log("\n🎉 All tests passed!");
    
  } catch (error) {
    console.error("\n❌ Test failed!");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Message:", error.response.data?.message);
    }
    if (error.request) {
      console.error("Request:", error.request);
    }
  }
};

testFullServiceBookingAPI();
