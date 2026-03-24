import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const API_BASE = "http://localhost:4001/api/v1";

// Test user credentials
const testUser = {
  email: "user@test.com",
  password: "User@123"
};

const testCouponAPI = async () => {
  try {
    console.log("🧪 Testing Coupon API Endpoints");
    console.log("================================");
    
    // Step 1: Login to get token
    console.log("\n1. Logging in as test user...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
    
    if (!loginResponse.data.success) {
      throw new Error("Login failed");
    }
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log("✅ Login successful");
    
    // Step 2: Get available coupons
    console.log("\n2. Fetching available coupons...");
    const couponsResponse = await axios.get(`${API_BASE}/coupons/available?totalAmount=200`, {
      headers
    });
    
    console.log("✅ Available coupons:", couponsResponse.data);
    
    if (couponsResponse.data.coupons && couponsResponse.data.coupons.length > 0) {
      const testCoupon = couponsResponse.data.coupons[0];
      
      // Step 3: Validate coupon
      console.log(`\n3. Validating coupon: ${testCoupon.code}`);
      const validateResponse = await axios.post(`${API_BASE}/coupons/validate`, {
        couponCode: testCoupon.code,
        amount: 200
      }, { headers });
      
      console.log("✅ Coupon validation:", validateResponse.data);
      
      // Step 4: Apply coupon
      console.log(`\n4. Applying coupon: ${testCoupon.code}`);
      const applyResponse = await axios.post(`${API_BASE}/coupons/apply`, {
        code: testCoupon.code,
        totalAmount: 200
      }, { headers });
      
      console.log("✅ Coupon application:", applyResponse.data);
    } else {
      console.log("⚠️ No available coupons found");
    }
    
    console.log("\n✅ All coupon API tests completed successfully!");
    
  } catch (error) {
    console.error("❌ Coupon API test failed:", error.response?.data || error.message);
  }
};

testCouponAPI();