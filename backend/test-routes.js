import axios from "axios";

const API_BASE = "http://localhost:5000/api/v1";

async function testEndpointsAvailability() {
  try {
    console.log("🧪 Testing Endpoint Availability (No Auth)...\n");

    // Test if routes are registered (will return 401 Unauthorized if route exists)
    const endpoints = [
      "/merchant/earnings",
      "/merchant/payments",
      "/merchant/withdrawals"
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing: GET ${endpoint}`);
      try {
        await axios.get(`${API_BASE}${endpoint}`);
        console.log(`   ✅ Route exists and accessible\n`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`   ✅ Route EXISTS (requires authentication)\n`);
        } else if (error.response?.status === 404) {
          console.log(`   ❌ Route NOT FOUND (404)\n`);
        } else {
          console.log(`   ⚠️  Error: ${error.response?.status || 'Unknown'}\n`);
        }
      }
    }

    console.log("✅ Test completed!\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  }
}

testEndpointsAvailability();
