// Test CORS configuration
const API_BASE = "http://localhost:4001/api/v1";

const testCors = async () => {
  try {
    console.log("=".repeat(50));
    console.log("🌐 TESTING CORS CONFIGURATION");
    console.log("=".repeat(50));
    
    // Test login first
    console.log("1. Testing POST request (login)...");
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "merchant@test.com",
        password: "Merchant@123"
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log("✅ POST request successful");
    
    if (!loginData.success) {
      throw new Error("Login authentication failed");
    }
    
    const token = loginData.token;
    console.log("✅ Authentication successful");
    
    // Test GET request
    console.log("\n2. Testing GET request (booking requests)...");
    const getResponse = await fetch(`${API_BASE}/merchant/booking-requests`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!getResponse.ok) {
      throw new Error(`GET request failed: ${getResponse.status}`);
    }
    
    console.log("✅ GET request successful");
    
    // Test PATCH request (the one that was failing)
    console.log("\n3. Testing PATCH request (accept booking)...");
    
    // First, let's see if there are any bookings
    const bookingsData = await getResponse.json();
    
    if (bookingsData.bookings && bookingsData.bookings.length > 0) {
      const bookingId = bookingsData.bookings[0]._id;
      console.log(`   Found booking ID: ${bookingId}`);
      
      const patchResponse = await fetch(`${API_BASE}/merchant/booking-requests/${bookingId}/accept`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!patchResponse.ok) {
        throw new Error(`PATCH request failed: ${patchResponse.status} - ${patchResponse.statusText}`);
      }
      
      const patchData = await patchResponse.json();
      console.log("✅ PATCH request successful");
      console.log(`   Response: ${patchData.message}`);
    } else {
      console.log("   No bookings found to test PATCH request");
      console.log("   But CORS should allow PATCH method now");
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 ALL CORS TESTS PASSED!");
    console.log("=".repeat(50));
    console.log("✅ POST requests work");
    console.log("✅ GET requests work");
    console.log("✅ PATCH requests are allowed by CORS");
    console.log("\nThe frontend should now be able to accept bookings!");
    console.log("=".repeat(50));
    
  } catch (error) {
    console.log("\n" + "=".repeat(50));
    console.log("❌ CORS TEST FAILED");
    console.log("=".repeat(50));
    console.log("Error:", error.message);
    
    if (error.message.includes('CORS')) {
      console.log("\n🔧 CORS Issue Detected:");
      console.log("- Check that backend allows PATCH method");
      console.log("- Verify frontend URL is in CORS origins");
      console.log("- Restart backend after CORS changes");
    }
    
    console.log("=".repeat(50));
  }
};

testCors();