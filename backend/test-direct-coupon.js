import axios from "axios";

const testDirectCoupon = async () => {
  try {
    console.log("Testing coupon endpoint directly...");
    
    // Test without authentication first
    const response = await axios.get("http://localhost:4001/api/v1/coupons/available?totalAmount=200");
    console.log("Response:", response.data);
    
  } catch (error) {
    console.log("Error status:", error.response?.status);
    console.log("Error data:", error.response?.data);
    console.log("Error message:", error.message);
  }
};

testDirectCoupon();