import mongoose from "mongoose";
import { Notification } from "./models/notificationSchema.js";
import { User } from "./models/userSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const createSampleNotifications = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find a user to associate notifications with
    const user = await User.findOne({ role: "user" });
    if (!user) {
      console.log("No user found. Please create a user first.");
      return;
    }

    // Sample notifications
    const sampleNotifications = [
      {
        user: user._id,
        message: "Your booking for Tech Conference 2026 has been confirmed",
        type: "booking",
        eventId: "event123"
      },
      {
        user: user._id,
        message: "Payment of ₹2500 received for Wedding Photography service",
        type: "payment"
      },
      {
        user: user._id,
        message: "New event 'Music Festival' has been added to your area",
        type: "general"
      },
      {
        user: user._id,
        message: "Your booking request is pending merchant approval",
        type: "booking"
      },
      {
        user: user._id,
        message: "System maintenance scheduled for tonight 2:00 AM",
        type: "general"
      }
    ];

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log("Cleared existing notifications");

    // Create new notifications
    await Notification.insertMany(sampleNotifications);
    console.log("✅ Sample notifications created successfully!");

    // Display created notifications
    const notifications = await Notification.find().populate("user", "name email");
    console.log(`Created ${notifications.length} notifications:`);
    notifications.forEach(notif => {
      console.log(`- ${notif.message} (${notif.type})`);
    });

  } catch (error) {
    console.error("Error creating sample notifications:", error);
  } finally {
    mongoose.disconnect();
  }
};

createSampleNotifications();