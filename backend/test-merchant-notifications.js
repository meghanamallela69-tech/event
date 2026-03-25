import axios from "axios";
import { Notification } from "./models/notificationSchema.js";
import { User } from "./models/userSchema.js";

const API_BASE = "http://localhost:5000/api/v1";

const testMerchantNotifications = async () => {
  try {
    console.log("=== Testing Merchant Notifications ===\n");

    // Step 0: Check database directly
    console.log("0. Checking database for merchants...");
    const merchants = await User.find({ role: "merchant" }).select("name email");
    console.log(`Found ${merchants.length} merchants:`);
    merchants.forEach(m => console.log(`   - ${m.name} (${m.email})`));

    if (merchants.length === 0) {
      console.log("\n⚠️ No merchants found in database!");
      return;
    }

    const merchantId = merchants[0]._id;
    console.log(`\n📋 Checking notifications for merchant: ${merchants[0].name}`);
    
    const existingNotifs = await Notification.find({ user: merchantId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Found ${existingNotifs.length} notifications in database\n`);

    if (existingNotifs.length > 0) {
      console.log("📋 Latest notifications:");
      existingNotifs.forEach((n, i) => {
        console.log(`${i + 1}. ${n.message} [${n.type}] ${n.read ? '(read)' : '(unread)'}`);
      });
    } else {
      console.log("💡 Creating sample notifications for testing...\n");
      
      await Notification.create([
        {
          user: merchantId,
          message: `New booking request from John Doe`,
          type: "booking",
          read: false
        },
        {
          user: merchantId,
          message: `Payment received of ₹5,000 for Wedding Photography`,
          type: "payment",
          read: false
        },
        {
          user: merchantId,
          message: `Your event "Birthday Bash" is approved`,
          type: "general",
          read: true
        }
      ]);
      
      console.log("✅ Created 3 sample notifications\n");
    }

    // Step 1: Login as merchant
    console.log("1. Logging in as merchant...");
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: merchants[0].email,
      password: "Test123!"
    });

    const token = loginRes.data.token;
    const userId = loginRes.data.user._id;
    console.log(`✅ Logged in as merchant: ${loginRes.data.user.name}`);
    console.log(`User ID: ${userId}\n`);

    // Step 2: Get notifications
    console.log("2. Fetching notifications via API...");
    const notifRes = await axios.get(`${API_BASE}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(`✅ Found ${notifRes.data.notifications.length} notifications`);
    
    if (notifRes.data.notifications.length > 0) {
      console.log("\n📋 Notifications:");
      notifRes.data.notifications.forEach((n, i) => {
        console.log(`\n${i + 1}. ${n.message}`);
        console.log(`   Type: ${n.type}`);
        console.log(`   Read: ${n.read ? 'Yes' : 'No'}`);
        console.log(`   Created: ${new Date(n.createdAt).toLocaleString()}`);
      });
    } else {
      console.log("\n⚠️ No notifications found via API");
    }

    console.log("\n=== Test Complete ===");

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error("\n💡 Make sure the backend server is running on port 5000");
    }
  }
};

testMerchantNotifications();
