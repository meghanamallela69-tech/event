import { dbConnection } from "./database/dbConnection.js";
import { Event } from "./models/eventSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const debugEventsStructure = async () => {
  try {
    console.log("🔍 Debugging Events Structure");
    console.log("=============================");
    
    await dbConnection();
    
    // Get a few sample events
    const events = await Event.find().limit(3).populate("createdBy", "name email");
    
    console.log(`Found ${events.length} events to analyze:`);
    
    events.forEach((event, index) => {
      console.log(`\n--- Event ${index + 1}: ${event.title} ---`);
      console.log(`ID: ${event._id}`);
      console.log(`Event Type: ${event.eventType || "NOT SET"}`);
      console.log(`Category: ${event.category || "NOT SET"}`);
      console.log(`Price: ₹${event.price || 0}`);
      console.log(`Location: ${event.location || "NOT SET"}`);
      console.log(`Date: ${event.date || "NOT SET"}`);
      console.log(`Time: ${event.time || "NOT SET"}`);
      console.log(`Status: ${event.status || "NOT SET"}`);
      console.log(`Created By: ${event.createdBy?.name || "Unknown"} (${event.createdBy?.email || "No email"})`);
      
      if (event.eventType === "ticketed") {
        console.log(`Ticket Types: ${event.ticketTypes?.length || 0}`);
        console.log(`Available Tickets: ${event.availableTickets || 0}`);
        if (event.ticketTypes && event.ticketTypes.length > 0) {
          event.ticketTypes.forEach((ticket, i) => {
            console.log(`  Ticket ${i + 1}: ${ticket.name} - ₹${ticket.price} (${ticket.quantityTotal - ticket.quantitySold}/${ticket.quantityTotal} available)`);
          });
        }
      }
      
      console.log(`Images: ${event.images?.length || 0}`);
      console.log(`Description: ${event.description ? event.description.substring(0, 100) + "..." : "NOT SET"}`);
    });
    
    // Check for events without eventType
    const eventsWithoutType = await Event.countDocuments({ 
      $or: [
        { eventType: { $exists: false } },
        { eventType: null },
        { eventType: "" }
      ]
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`Total events: ${await Event.countDocuments()}`);
    console.log(`Events without eventType: ${eventsWithoutType}`);
    console.log(`Full-service events: ${await Event.countDocuments({ eventType: "full-service" })}`);
    console.log(`Ticketed events: ${await Event.countDocuments({ eventType: "ticketed" })}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Debug error:", error);
    process.exit(1);
  }
};

debugEventsStructure();