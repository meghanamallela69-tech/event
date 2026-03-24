import mongoose from "mongoose";
import dns from "dns";
import { Event } from "./models/eventSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

// Force Node.js to use Google and Cloudflare DNS
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);

const debugAddons = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    
    // Use the same connection string as the main app
    const ATLAS_USER = "meghana123";
    const ATLAS_PASS = "meghana1234";
    const ATLAS_CLUSTER = "cluster0.gfbrfcg.mongodb.net";
    const DB_NAME = "eventhub";
    
    const srvUri = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASS}@${ATLAS_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
    
    await mongoose.connect(srvUri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    
    console.log("✅ Connected to MongoDB\n");

    const events = await Event.find({ eventType: "full-service" });
    
    console.log(`📊 Found ${events.length} Full Service events:\n`);
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   ID: ${event._id}`);
      console.log(`   Event Type: ${event.eventType}`);
      console.log(`   Price: ₹${event.price || 0}`);
      console.log(`   Add-ons: ${event.addons?.length || 0} items`);
      
      if (event.addons && event.addons.length > 0) {
        event.addons.forEach((addon, i) => {
          console.log(`     ${i + 1}. ${addon.name} - ₹${addon.price}`);
        });
      } else {
        console.log(`     ⚠️  No add-ons defined`);
      }
      console.log("");
    });

    console.log("\n💡 To fix: Merchant needs to create events with add-ons in the dashboard");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
};

debugAddons();
