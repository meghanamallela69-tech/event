import axios from "axios";

const API_BASE = "http://localhost:5000/api/v1";

async function testMerchantEndpoints() {
  try {
    console.log("🧪 Testing Merchant Endpoints...\n");

    // Login as merchant
    console.log("📝 Logging in as merchant...");
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: "merchant@test.com",
      password: "Merchant@123"
    });

    if (!loginRes.data.success) {
      console.log("❌ Login failed!");
      return;
    }

    const token = loginRes.data.token;
    console.log("✅ Logged in successfully!\n");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    // Test 1: Earnings endpoint
    console.log("💰 Test 1: GET /merchant/earnings");
    try {
      const earningsRes = await axios.get(`${API_BASE}/merchant/earnings`, { headers });
      console.log("✅ Earnings endpoint working!");
      console.log(`   Status: ${earningsRes.status}`);
      console.log(`   Total Earnings: ₹${earningsRes.data.data?.totalEarnings || 0}`);
      console.log(`   Available Balance: ₹${earningsRes.data.data?.availableBalance || 0}`);
      console.log(`   Transactions: ${earningsRes.data.data?.transactionList?.length || 0}\n`);
    } catch (error) {
      console.log("❌ Earnings endpoint failed!");
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 2: Payments endpoint
    console.log("💳 Test 2: GET /merchant/payments");
    try {
      const paymentsRes = await axios.get(`${API_BASE}/merchant/payments`, { headers });
      console.log("✅ Payments endpoint working!");
      console.log(`   Status: ${paymentsRes.status}`);
      console.log(`   Total Payments: ₹${paymentsRes.data.stats?.total || 0}`);
      console.log(`   Payment Count: ${paymentsRes.data.stats?.count || 0}`);
      console.log(`   Payments Array Length: ${paymentsRes.data.payments?.length || 0}\n`);
    } catch (error) {
      console.log("❌ Payments endpoint failed!");
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 3: Withdrawals endpoint
    console.log("📜 Test 3: GET /merchant/withdrawals");
    try {
      const withdrawalsRes = await axios.get(`${API_BASE}/merchant/withdrawals`, { headers });
      console.log("✅ Withdrawals endpoint working!");
      console.log(`   Status: ${withdrawalsRes.status}`);
      console.log(`   Withdrawals Count: ${withdrawalsRes.data.withdrawals?.length || 0}\n`);
    } catch (error) {
      console.log("❌ Withdrawals endpoint failed!");
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    console.log("✅ All tests completed!\n");
  } catch (error) {
    console.error("\n❌ Tests failed:", error.response?.data?.message || error.message);
    console.log("\n💡 Make sure:");
    console.log("   1. Backend server is running on port 5000");
    console.log("   2. Merchant account exists (run scripts/setupTestUsers.js)");
  }
}

testMerchantEndpoints();
