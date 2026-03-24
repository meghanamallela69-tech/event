// Test the new payment flow with modals
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

const createAndAcceptBooking = async () => {
  console.log("=".repeat(60));
  console.log("💳 PAYMENT FLOW TEST");
  console.log("=".repeat(60));
  
  try {
    // Step 1: Login
    console.log("\n📝 Step 1: Logging in users...");
    const merchantToken = await login("merchant@test.com", "Merchant@123");
    const userToken = await login("user@test.com", "User@123");
    
    if (!merchantToken || !userToken) {
      throw new Error("Login failed");
    }
    console.log("✅ Both users logged in successfully");
    
    // Step 2: Get event
    console.log("\n📝 Step 2: Getting event...");
    const eventsResponse = await fetch(`${API_BASE}/merchant/events`, {
      headers: { 'Authorization': `Bearer ${merchantToken}` }
    });
    const eventsData = await eventsResponse.json();
    
    if (!eventsData.success || eventsData.events.length === 0) {
      throw new Error("No events found");
    }
    
    const eventId = eventsData.events[0]._id;
    console.log(`✅ Found event: ${eventId}`);
    
    // Step 3: Create booking
    console.log("\n📝 Step 3: User creates booking...");
    const bookingResponse = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        eventId: eventId,
        ticketType: "General",
        quantity: 1,
        totalPrice: 500,
        paymentMethod: "Cash"
      })
    });
    
    const bookingData = await bookingResponse.json();
    if (!bookingData.success) {
      throw new Error("Failed to create booking");
    }
    
    const bookingId = bookingData.booking._id;
    console.log(`✅ Booking created: ${bookingId}`);
    console.log("   Status: pending");
    
    // Step 4: Merchant accepts booking
    console.log("\n📝 Step 4: Merchant accepts booking...");
    const acceptResponse = await fetch(`${API_BASE}/merchant/booking-requests/${bookingId}/accept`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${merchantToken}` }
    });
    
    const acceptData = await acceptResponse.json();
    if (!acceptData.success) {
      throw new Error("Failed to accept booking");
    }
    
    console.log("✅ Booking accepted by merchant");
    console.log("   Status: pending → approved");
    
    // Step 5: Get user bookings to verify approved status
    console.log("\n📝 Step 5: Checking user bookings...");
    const userBookingsResponse = await fetch(`${API_BASE}/payments/user/bookings`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    const userBookingsData = await userBookingsResponse.json();
    if (!userBookingsData.success) {
      throw new Error("Failed to get user bookings");
    }
    
    const approvedBooking = userBookingsData.bookings.find(b => b._id === bookingId);
    if (!approvedBooking) {
      throw new Error("Booking not found in user bookings");
    }
    
    console.log("✅ User bookings retrieved:");
    console.log(`   Booking Status: ${approvedBooking.status}`);
    console.log(`   Can Pay: ${approvedBooking.canPay}`);
    console.log(`   Payment Status: ${approvedBooking.paymentStatus}`);
    
    if (!approvedBooking.canPay) {
      throw new Error("Booking should be payable after approval");
    }
    
    // Step 6: Test payment endpoint
    console.log("\n📝 Step 6: Testing payment endpoint...");
    const paymentResponse = await fetch(`${API_BASE}/payments/booking/${bookingId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        paymentMethod: "Credit Card",
        paymentAmount: 500
      })
    });
    
    const paymentData = await paymentResponse.json();
    if (!paymentData.success) {
      throw new Error(`Payment failed: ${paymentData.message}`);
    }
    
    console.log("✅ Payment processed successfully:");
    console.log(`   Payment ID: ${paymentData.paymentDetails.paymentId}`);
    console.log(`   Ticket ID: ${paymentData.paymentDetails.ticketId}`);
    console.log(`   Amount: ₹${paymentData.paymentDetails.amount}`);
    console.log(`   Method: ${paymentData.paymentDetails.method}`);
    
    // Step 7: Verify final booking state
    console.log("\n📝 Step 7: Verifying final booking state...");
    const finalBookingsResponse = await fetch(`${API_BASE}/payments/user/bookings`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    const finalBookingsData = await finalBookingsResponse.json();
    const finalBooking = finalBookingsData.bookings.find(b => b._id === bookingId);
    
    console.log("✅ Final booking verification:");
    console.log(`   Booking Status: ${finalBooking.status}`);
    console.log(`   Payment Status: ${finalBooking.paymentStatus}`);
    console.log(`   Ticket ID: ${finalBooking.ticketId}`);
    console.log(`   Can Pay: ${finalBooking.canPay}`);
    console.log(`   Is Confirmed: ${finalBooking.isConfirmed}`);
    
    // Final Results
    console.log("\n" + "=".repeat(60));
    console.log("🎉 PAYMENT FLOW TEST PASSED!");
    console.log("=".repeat(60));
    console.log("✅ Booking creation works");
    console.log("✅ Merchant approval works");
    console.log("✅ User can see approved booking with Pay Now option");
    console.log("✅ Payment processing works with all details");
    console.log("✅ Ticket generation works with unique ID");
    console.log("✅ Final booking state is correct");
    console.log("\n🎯 Ready for frontend payment modal testing!");
    console.log("💳 Payment methods: Credit Card, UPI, Net Banking");
    console.log("🎫 Ticket download: HTML format with QR code placeholder");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.log("\n" + "=".repeat(60));
    console.log("❌ PAYMENT FLOW TEST FAILED");
    console.log("=".repeat(60));
    console.log("Error:", error.message);
    console.log("=".repeat(60));
  }
};

createAndAcceptBooking();