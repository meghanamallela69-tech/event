// Create a test event for the merchant
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

const createTestEvent = async (merchantToken) => {
  try {
    console.log("📝 Creating test event...");
    
    const eventData = {
      title: "Test Event for Booking",
      description: "This is a test event to verify booking functionality",
      category: "Test",
      price: 500,
      location: "Test Location",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      tickets: 100,
      features: ["Test Feature 1", "Test Feature 2"],
      rating: 4.5
    };
    
    const response = await fetch(`${API_BASE}/merchant/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${merchantToken}`
      },
      body: JSON.stringify(eventData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log("✅ Test event created successfully!");
      console.log(`   Event ID: ${data.event._id}`);
      console.log(`   Title: ${data.event.title}`);
      console.log(`   Price: ₹${data.event.price}`);
      return data.event._id;
    } else {
      console.log(`❌ Failed to create test event: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating test event: ${error.message}`);
    return null;
  }
};

const runEventCreation = async () => {
  console.log("=".repeat(50));
  console.log("🎪 CREATE TEST EVENT");
  console.log("=".repeat(50));
  
  const merchantToken = await login("merchant@test.com", "Merchant@123");
  
  if (!merchantToken) {
    console.log("❌ Merchant login failed");
    return;
  }
  
  console.log("✅ Merchant login successful");
  
  const eventId = await createTestEvent(merchantToken);
  
  if (eventId) {
    console.log("\n🎉 Test event created successfully!");
    console.log("You can now test the booking functionality.");
  } else {
    console.log("\n❌ Failed to create test event");
  }
  
  console.log("=".repeat(50));
};

runEventCreation();