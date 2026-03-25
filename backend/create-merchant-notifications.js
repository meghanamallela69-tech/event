// Simple script to create sample notifications for all merchants
import mongoose from "mongoose";
import { Notification } from "./models/notificationSchema.js";
import { User } from "./models/userSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const createMerchantNotifications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all merchants
    const merchants = await User.find({ role: "merchant" });
    console.log(`\n📊 Found ${merchants.length} merchants\n`);

    if (merchants.length === 0) {
      console.log("❌ No merchants found in database!");
      process.exit(0);
    }

    // Create sample notifications for each merchant
    for (const merchant of merchants) {
      console.log(`Creating notifications for: ${merchant.name}`);
      
      const sampleNotifications = [
        {
          user: merchant._id,
          message: `New booking request from John Doe for "Wedding Photography"`,
          type: "booking",
          read: false
        },
        {
          user: merchant._id,
          message: `Payment received of ₹15,000 for Corporate Event`,
          type: "payment",
          read: false
        },
        {
          user: merchant._id,
          message: `Your event "Birthday Bash" has been approved`,
          type: "general",
          read: true
        },
        {
          user: merchant._id,
          message: `Sarah Smith booked your "Event Planning" service`,
          type: "booking",
          read: false
        },
        {
          user: merchant._id,
          message: `New review received: 5 stars from Happy Customer`,
          type: "general",
          read: false
        }
      ];

      await Notification.insertMany(sampleNotifications);
      console.log(`✅ Created 5 notifications\n`);
    }

    console.log("🎉 All merchant notifications created successfully!");
    
    // Verify
    const totalNotifs = await Notification.countDocuments();
    console.log(`\n📊 Total notifications in database: ${totalNotifs}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

createMerchantNotifications();
