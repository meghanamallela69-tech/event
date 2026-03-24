import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const API_BASE = "http://localhost:5000/api/v1";

const testAdminEndpoints = async () => {
  try {
    console.log("🧪 Testing Admin Endpoints...\n");

    // First login as admin to get token
    console.log("1. Logging in as admin...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@gmail.com",
      password: "Admin@123"
    });

    if (!loginResponse.data.success) {
      console.error("❌ Admin login failed");
      return;
    }

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("✅ Admin login successful\n");

    // Test all admin endpoints
    const endpoints = [
      { name: "Test Route", url: "/admin/test" },
      { name: "Get Users (existing)", url: "/admin/users" },
      { name: "Get All Payments", url: "/admin/payments/all" },
      { name: "Get Reports", url: "/admin/reports" },
      { name: "Get Notifications", url: "/admin/notifications" }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${endpoint.name}`);
        console.log(`URL: ${API_BASE}${endpoint.url}`);
        const response = await axios.get(`${API_BASE}${endpoint.url}`, { headers });
        
        if (response.data.success) {
          console.log(`✅ ${endpoint.name}: SUCCESS`);
          
          // Show some data details
          if (endpoint.url.includes("payments")) {
            console.log(`   - Found ${response.data.payments?.length || 0} payments`);
          } else if (endpoint.url.includes("reports")) {
            const reports = response.data.reports;
            console.log(`   - Users: ${reports?.totalUsers || 0}, Events: ${reports?.totalEvents || 0}, Revenue: ₹${reports?.totalRevenue || 0}`);
          } else if (endpoint.url.includes("notifications")) {
            console.log(`   - Found ${response.data.notifications?.length || 0} notifications`);
          }
        } else {
          console.log(`❌ ${endpoint.name}: FAILED - ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ERROR - ${error.response?.status} ${error.response?.statusText}`);
        console.log(`   Response: ${error.response?.data?.message || error.message}`);
      }
      console.log("");
    }

    console.log("🎉 Admin endpoints testing completed!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

testAdminEndpoints();