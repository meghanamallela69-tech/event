import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const debugAuth = async () => {
  try {
    console.log("🔐 Debugging Authentication");
    console.log("===========================");
    
    // Step 1: Login
    console.log("\n1. Logging in...");
    const loginResponse = await axios.post("http://localhost:5000/api/v1/auth/login", {
      email: "user@test.com",
      password: "User@123"
    });
    
    console.log("Login response:", loginResponse.data);
    
    const token = loginResponse.data.token;
    console.log("Token:", token);
    
    // Step 2: Decode token
    console.log("\n2. Decoding token...");
    const decoded = jwt.decode(token);
    console.log("Decoded token:", decoded);
    
    // Step 3: Test authenticated endpoint
    console.log("\n3. Testing authenticated endpoint...");
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const response = await axios.get("http://localhost:5000/api/v1/coupons/available", {
        headers
      });
      console.log("Coupons response:", response.data);
    } catch (error) {
      console.log("Coupons error:", error.response?.data);
    }
    
  } catch (error) {
    console.error("Debug error:", error.response?.data || error.message);
  }
};

debugAuth();