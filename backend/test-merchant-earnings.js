import axios from "axios";

const API_BASE = "http://localhost:5000/api/v1";

async function testEarningsAPI() {
  try {
    console.log("🧪 Testing Merchant Earnings API...\n");

    // Step 1: Login as merchant
    console.log("📝 Step 1: Logging in as merchant...");
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: "merchant@test.com",
      password: "Merchant@123"
    });

    if (!loginRes.data.success) {
      console.log("❌ Login failed. Make sure merchant account exists.");
      console.log("💡 Run: node scripts/setupTestUsers.js");
      return;
    } else {
      var token = loginRes.data.token;
      console.log("✅ Logged in successfully!");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    // Step 2: Get earnings data
    console.log("\n💰 Step 2: Fetching earnings data...");
    const earningsRes = await axios.get(`${API_BASE}/merchant/earnings`, { headers });
    
    if (earningsRes.data.success) {
      console.log("✅ Earnings data fetched successfully!");
      const data = earningsRes.data.data;
      console.log("\n📊 Earnings Summary:");
      console.log(`   Total Earnings: ₹${data.totalEarnings?.toFixed(2) || "0.00"}`);
      console.log(`   Available Balance: ₹${data.availableBalance?.toFixed(2) || "0.00"}`);
      console.log(`   Pending Amount: ₹${data.pendingAmount?.toFixed(2) || "0.00"}`);
      console.log(`   Commission Deducted: ₹${data.commissionDeducted?.toFixed(2) || "0.00"}`);
      console.log(`   Transactions Count: ${data.transactionList?.length || 0}`);
      
      if (data.transactionList && data.transactionList.length > 0) {
        console.log("\n📋 Recent Transactions:");
        data.transactionList.slice(0, 3).forEach((t, i) => {
          console.log(`   ${i+1}. Booking: ${t.bookingId?._id || t.bookingId}`);
          console.log(`      Amount: ₹${t.amount?.toFixed(2)}, Commission: ₹${t.commission?.toFixed(2)}`);
          console.log(`      Status: ${t.status}, Date: ${new Date(t.date).toLocaleDateString()}`);
        });
      }
    }

    // Step 3: Request withdrawal
    console.log("\n💸 Step 3: Testing withdrawal request...");
    
    // First check available balance
    const testAmount = Math.min(100, data.availableBalance);
    
    if (testAmount <= 0) {
      console.log("⚠️  No available balance for withdrawal test");
    } else {
      try {
        const withdrawalRes = await axios.post(
          `${API_BASE}/merchant/withdrawal`,
          { amount: testAmount },
          { headers }
        );

        if (withdrawalRes.data.success) {
          console.log("✅ Withdrawal request submitted successfully!");
          console.log(`   Amount: ₹${testAmount.toFixed(2)}`);
          console.log(`   Status: ${withdrawalRes.data.withdrawal.status}`);
          console.log(`   Request ID: ${withdrawalRes.data.withdrawal._id}`);
        }
      } catch (error) {
        console.log("❌ Withdrawal request failed:", error.response?.data?.message || error.message);
      }
    }

    // Step 4: Get withdrawal history
    console.log("\n📜 Step 4: Fetching withdrawal history...");
    const withdrawalsRes = await axios.get(`${API_BASE}/merchant/withdrawals`, { headers });
    
    if (withdrawalsRes.data.success) {
      console.log("✅ Withdrawal history fetched!");
      const withdrawals = withdrawalsRes.data.withdrawals;
      console.log(`   Total Withdrawals: ${withdrawals.length}`);
      
      if (withdrawals.length > 0) {
        console.log("\n📋 Recent Withdrawals:");
        withdrawals.slice(0, 3).forEach((w, i) => {
          console.log(`   ${i+1}. Amount: ₹${w.amount?.toFixed(2)}`);
          console.log(`      Status: ${w.status}`);
          console.log(`      Date: ${new Date(w.createdAt).toLocaleDateString()}`);
        });
      }
    }

    console.log("\n✅ All tests completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      console.log("💡 Tip: Make sure you have a merchant account. Login with merchant credentials.");
    }
  }
}

testEarningsAPI();
