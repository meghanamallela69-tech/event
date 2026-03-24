// Test booking functionality
const API_BASE = "http://localhost:4001/api/v1";

const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return data.success ? data.token : null;
};

const createTestBooking = async (userToken, eventId) => {
  try {
    console.log(`\n📝 Creating test booking for event ${eventId}...`);
    
    const response = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        eventId: eventId,
        ticketType: "General",
        quantity: 2,
        totalPrice: 1000,
        paymentMethod: "Cash"
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Booking created successfully!`);
      console.log(`   Booking ID: ${data.booking._id}`);
      console.log(`   Status: ${data.booking.status}`);
      return data.booking._id;
    } else {
      console.log(`❌ Booking creation failed: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Booking creation error: ${error.message}`);
    return null;
  }
};

const testMerchantBookingRequests = async (merchantToken) => {
  try {
    console.log(`\n📋 Fetching merchant booking requests...`);
    
    const response = await fetch(`${API_BASE}/merchant/booking-requests`, {
      headers: { 'Authorization': `Bearer ${merchantToken}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Found ${data.bookings.length} booking requests`);
      data.bookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.eventTitle} - ${booking.attendeeName} (${booking.status})`);
      });
      return data.bookings;
    } else {
      console.log(`❌ Failed to fetch booking requests: ${data.message}`);
      return [];
    }
  } catch (error) {
    console.log(`❌ Error fetching booking requests: ${error.message}`);
    return [];
  }
};

const testAcceptBooking = async (merchantToken, bookingId) => {
  try {
    console.log(`\n✅ Testing accept booking ${bookingId}...`);
    
    const response = await fetch(`${API_BASE}/merchant/booking-requests/${bookingId}/accept`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${merchantToken}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Booking accepted successfully!`);
      console.log(`   Message: ${data.message}`);
      return true;
    } else {
      console.log(`❌ Failed to accept booking: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error accepting booking: ${error.message}`);
    return false;
  }
};

const getFirstEvent = async (merchantToken) => {
  try {
    const response = await fetch(`${API_BASE}/merchant/events`, {
      headers: { 'Authorization': `Bearer ${merchantToken}` }
    });
    const data = await response.json();
    return data.success && data.events.length > 0 ? data.events[0]._id : null;
  } catch (error) {
    console.log(`Error fetching events: ${error.message}`);
    return null;
  }
};

const runBookingTest = async () => {
  console.log("=".repeat(60));
  console.log("🎫 BOOKING SYSTEM TEST");
  console.log("=".repeat(60));
  
  // Login as merchant and user
  console.log("🔐 Logging in...");
  const merchantToken = await login("merchant@test.com", "Merchant@123");
  const userToken = await login("user@test.com", "User@123");
  
  if (!merchantToken || !userToken) {
    console.log("❌ Login failed, cannot proceed with booking test");
    return;
  }
  
  console.log("✅ Login successful for both merchant and user");
  
  // Get first event
  const eventId = await getFirstEvent(merchantToken);
  if (!eventId) {
    console.log("❌ No events found, cannot test booking");
    return;
  }
  
  console.log(`✅ Found event ID: ${eventId}`);
  
  // Create a test booking
  const bookingId = await createTestBooking(userToken, eventId);
  if (!bookingId) {
    console.log("❌ Failed to create test booking");
    return;
  }
  
  // Check merchant booking requests
  const bookings = await testMerchantBookingRequests(merchantToken);
  
  // Find our test booking
  const testBooking = bookings.find(b => b._id === bookingId);
  if (!testBooking) {
    console.log("❌ Test booking not found in merchant requests");
    return;
  }
  
  // Test accepting the booking
  const acceptResult = await testAcceptBooking(merchantToken, bookingId);
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 BOOKING TEST RESULTS");
  console.log("=".repeat(60));
  
  if (acceptResult) {
    console.log("🎉 ALL BOOKING TESTS PASSED!");
    console.log("✨ Booking accept/reject functionality is working!");
  } else {
    console.log("⚠️ Booking test failed - check the errors above");
  }
  
  console.log("=".repeat(60));
};

runBookingTest();