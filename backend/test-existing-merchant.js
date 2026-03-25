import axios from "axios";

const API_BASE = "http://localhost:5000/api/v1";

async function testWithExistingMerchant() {
  try {
    console.log("🧪 Testing with Existing Merchant...\n");

    // Try logging in with existing merchant
    console.log("📝 Logging in as mmeghana@speshway.com...");
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: "mmeghana@speshway.com",
      password: "Meghana@123"
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

    // Test Earnings endpoint
    console.log("💰 Testing GET /merchant/earnings");
    try {
      const earningsRes = await axios.get(`${API_BASE}/merchant/earnings`, { headers });
      console.log("✅ Earnings endpoint working!");
      console.log(`   Status: ${earningsRes.status}`);
      if (earningsRes.data.success) {
        const data = earningsRes.data.data;
        console.log(`   Total Earnings: ₹${data.totalEarnings || 0}`);
        console.log(`   Available Balance: ₹${data.availableBalance || 0}`);
        console.log(`   Pending Amount: ₹${data.pendingAmount || 0}`);
        console.log(`   Commission: ₹${data.commissionDeducted || 0}`);
        console.log(`   Transactions: ${data.transactionList?.length || 0}`);
      }
      console.log("");
    } catch (error) {
      console.log("❌ Earnings endpoint failed!");
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test Payments endpoint
    console.log("💳 Testing GET /merchant/payments");
    try {
      const paymentsRes = await axios.get(`${API_BASE}/merchant/payments`, { headers });
      console.log("✅ Payments endpoint working!");
      console.log(`   Status: ${paymentsRes.status}`);
      if (paymentsRes.data.success) {
        console.log(`   Total Payments: ₹${paymentsRes.data.stats?.total || 0}`);
        console.log(`   Payment Count: ${paymentsRes.data.stats?.count || 0}`);
        console.log(`   Payments Array Length: ${paymentsRes.data.payments?.length || 0}`);
      }
      console.log("");
    } catch (error) {
      console.log("❌ Payments endpoint failed!");
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test Withdrawals endpoint
    console.log("📜 Testing GET /merchant/withdrawals");
    try {
      const withdrawalsRes = await axios.get(`${API_BASE}/merchant/withdrawals`, { headers });
      console.log("✅ Withdrawals endpoint working!");
      console.log(`   Status: ${withdrawalsRes.status}`);
      if (withdrawalsRes.data.success) {
        console.log(`   Withdrawals Count: ${withdrawalsRes.data.withdrawals?.length || 0}`);
      }
      console.log("");
    } catch (error) {
      console.log("❌ Withdrawals endpoint failed!");
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    console.log("✅ All tests completed!\n");
  } catch (error) {
    console.error("\n❌ Tests failed:", error.response?.data?.message || error.message);
    console.log("\n💡 Backend server status:");
    console.log("   - Check terminal for errors");
    console.log("   - Verify port 5000 is not blocked");
  }
}

testWithExistingMerchant();
