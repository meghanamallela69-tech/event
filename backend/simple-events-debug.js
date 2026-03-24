import mongoose from "mongoose";
import { Event } from "./models/eventSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const debugEvents = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const events = await Event.find({}).select('title eventType price ticketTypes availableTickets totalTickets');
    
    console.log(`\n📊 Found ${events.length} events:`);
    console.log("=" .repeat(50));
    
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.title}`);
      console.log(`   Event Type: ${event.eventType || 'NOT SET'}`);
      console.log(`   Price: ₹${event.price || 0}`);
      console.log(`   Total Tickets: ${event.totalTickets || 0}`);
      console.log(`   Available Tickets: ${event.availableTickets || 0}`);
      console.log(`   Ticket Types: ${event.ticketTypes?.length || 0} types`);
      
      if (event.ticketTypes && event.ticketTypes.length > 0) {
        event.ticketTypes.forEach((ticket, i) => {
          console.log(`     ${i + 1}. ${ticket.name} - ₹${ticket.price} (${ticket.quantityTotal - ticket.quantitySold}/${ticket.quantityTotal} available)`);
        });
      }
    });

    console.log("\n🔍 Events missing eventType:");
    const missingEventType = events.filter(e => !e.eventType);
    if (missingEventType.length > 0) {
      missingEventType.forEach(event => {
        console.log(`   - ${event.title} (ID: ${event._id})`);
      });
    } else {
      console.log("   ✅ All events have eventType set");
    }

    await mongoose.disconnect();
    console.log("\n✅ Debug completed");
  } catch (error) {
    console.error("❌ Debug error:", error.message);
    process.exit(1);
  }
};

debugEvents();