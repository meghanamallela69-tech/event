// Create a test booking without accepting it
const API_BASE = "http://localhost:5000/api/v1";

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
    console.log(`📝 Creating test booking for event ${eventId}...`);
    
    const response = await fetch(`${API_BASE}/bookings/create`, {
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

const runBookingCreation = async () => {
  console.log("=".repeat(50));
  console.log("🎫 CREATE TEST BOOKING");
  console.log("=".repeat(50));
  
  // Login as merchant and user
  console.log("🔐 Logging in...");
  const merchantToken = await login("merchant@test.com", "Merchant@123");
  const userToken = await login("user@test.com", "User@123");
  
  if (!merchantToken || !userToken) {
    console.log("❌ Login failed, cannot proceed");
    return;
  }
  
  console.log("✅ Login successful for both merchant and user");
  
  // Get first event
  const eventId = await getFirstEvent(merchantToken);
  if (!eventId) {
    console.log("❌ No events found, cannot create booking");
    return;
  }
  
  console.log(`✅ Found event ID: ${eventId}`);
  
  // Create a test booking
  const bookingId = await createTestBooking(userToken, eventId);
  if (!bookingId) {
    console.log("❌ Failed to create test booking");
    return;
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("🎉 TEST BOOKING CREATED!");
  console.log("=".repeat(50));
  console.log(`Booking ID: ${bookingId}`);
  console.log("Status: pending");
  console.log("\nYou can now test the Accept Booking functionality in the frontend:");
  console.log("1. Visit: http://localhost:5173/dashboard/merchant/booking-requests");
  console.log("2. Login as: merchant@test.com / Merchant@123");
  console.log("3. Click 'Accept Booking' to test the functionality");
  console.log("=".repeat(50));
};

runBookingCreation();