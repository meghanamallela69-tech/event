import { Event } from "../models/eventSchema.js";
import { User } from "../models/userSchema.js";
import { dbConnection } from "../database/dbConnection.js";
import dotenv from "dotenv";

dotenv.config({ path: "../config/config.env" });

const testEventTypes = async () => {
  try {
    await dbConnection();
    console.log("Connected to database");

    // Find a merchant user
    const merchant = await User.findOne({ role: "merchant" });
    if (!merchant) {
      console.log("No merchant found. Please create a merchant user first.");
      return;
    }

    console.log(`Using merchant: ${merchant.name} (${merchant.email})`);

    // Create a Full Service Event
    const fullServiceEvent = await Event.create({
      title: "Luxury Wedding Package",
      description: "Complete wedding planning and execution service with premium features",
      category: "Wedding",
      eventType: "full-service",
      price: 150000,
      location: "Grand Palace Hotel, Mumbai",
      date: new Date("2026-06-15"),
      time: "18:00",
      duration: 8,
      features: [
        "Decoration & Lighting",
        "Photography & Videography", 
        "Catering for 200 guests",
        "DJ & Sound System",
        "Bridal Makeup",
        "Wedding Coordination"
      ],
      bannerImage: "/wedding.jpg",
      galleryImages: ["/party.jpg", "/restaurant.jpg"],
      status: "active",
      createdBy: merchant._id
    });

    console.log("✅ Created Full Service Event:", fullServiceEvent.title);

    // Create a Ticketed Event
    const ticketedEvent = await Event.create({
      title: "Tech Conference 2026",
      description: "Annual technology conference featuring industry leaders and innovative startups",
      category: "Tech",
      eventType: "ticketed",
      price: 0, // No single price for ticketed events
      location: "Convention Center, Bangalore",
      date: new Date("2026-04-20"),
      time: "09:00",
      duration: 10,
      ticketTypes: [
        {
          name: "Early Bird",
          price: 2500,
          quantityTotal: 100,
          quantitySold: 0
        },
        {
          name: "Regular",
          price: 3500,
          quantityTotal: 300,
          quantitySold: 0
        },
        {
          name: "VIP",
          price: 7500,
          quantityTotal: 50,
          quantitySold: 0
        }
      ],
      totalTickets: 450,
      availableTickets: 450,
      bannerImage: "/gamenight.jpg",
      galleryImages: ["/party.jpg"],
      status: "active",
      createdBy: merchant._id
    });

    console.log("✅ Created Ticketed Event:", ticketedEvent.title);

    // Display summary
    console.log("\n=== EVENT TYPES TEST SUMMARY ===");
    console.log(`Full Service Event ID: ${fullServiceEvent._id}`);
    console.log(`- Type: ${fullServiceEvent.eventType}`);
    console.log(`- Price: ₹${fullServiceEvent.price.toLocaleString()}`);
    console.log(`- Features: ${fullServiceEvent.features.length} features`);
    
    console.log(`\nTicketed Event ID: ${ticketedEvent._id}`);
    console.log(`- Type: ${ticketedEvent.eventType}`);
    console.log(`- Ticket Types: ${ticketedEvent.ticketTypes.length} types`);
    console.log(`- Total Tickets: ${ticketedEvent.totalTickets}`);
    
    ticketedEvent.ticketTypes.forEach(ticket => {
      console.log(`  - ${ticket.name}: ₹${ticket.price} (${ticket.quantityTotal} available)`);
    });

    console.log("\n✅ Event types test completed successfully!");
    
  } catch (error) {
    console.error("❌ Error testing event types:", error);
  } finally {
    process.exit(0);
  }
};

testEventTypes();