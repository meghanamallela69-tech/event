import mongoose from "mongoose";
import { Booking } from "./models/bookingSchema.js";
import { User } from "./models/userSchema.js";
import { Event } from "./models/eventSchema.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const testCompleteBookingWorkflow = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get users and events
    const merchant = await User.findOne({ role: "merchant" });
    const user = await User.findOne({ role: "user" });
    const admin = await User.findOne({ role: "admin" });

    if (!merchant || !user || !admin) {
      console.log("❌ Missing required users");
      console.log("Merchant:", merchant?._id);
      console.log("User:", user?._id);
      console.log("Admin:", admin?._id);
      process.exit(1);
    }

    // Find or create events
    let fullServiceEvent = await Event.findOne({ 
      createdBy: merchant._id, 
      eventType: "full-service" 
    });
    
    let ticketedEvent = await Event.findOne({ 
      createdBy: merchant._id, 
      eventType: "ticketed" 
    });

    // Create events if they don't exist
    if (!fullServiceEvent) {
      fullServiceEvent = await Event.create({
        title: "Wedding Photography Service",
        description: "Professional wedding photography service",
        category: "Photography",
        eventType: "full-service",
        price: 15000,
        location: "Mumbai, India",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdBy: merchant._id,
        status: "active"
      });
      console.log("✅ Created full-service event:", fullServiceEvent.title);
    }

    if (!ticketedEvent) {
      ticketedEvent = await Event.create({
        title: "Tech Conference 2024",
        description: "Annual technology conference",
        category: "Technology",
        eventType: "ticketed",
        price: 2500,
        location: "Bangalore, India",
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        createdBy: merchant._id,
        status: "active",
        ticketTypes: [
          {
            name: "General",
            price: 2500,
            quantityTotal: 100,
            quantitySold: 0
          }
        ],
        availableTickets: 100
      });
      console.log("✅ Created ticketed event:", ticketedEvent.title);
    }

    // Clear existing test bookings
    await Booking.deleteMany({
      user: user._id,
      merchant: merchant._id,
      $or: [
        { eventId: fullServiceEvent._id },
        { eventId: ticketedEvent._id }
      ]
    });
    console.log("🧹 Cleared existing test bookings");

    console.log("\n=== TESTING FULL-SERVICE BOOKING WORKFLOW ===");

    // 1. Create full-service booking (pending)
    const fullServiceBooking = await Booking.create({
      user: user._id,
      merchant: merchant._id,
      type: "event",
      eventType: "full-service",
      eventId: fullServiceEvent._id,
      eventTitle: fullServiceEvent.title,
      eventLocation: fullServiceEvent.location,
      eventDate: fullServiceEvent.date,
      serviceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      serviceTime: "10:00 AM",
      bookingDate: new Date(),
      bookingStatus: "pending",
      paymentStatus: "pending",
      totalPrice: fullServiceEvent.price,
      guestCount: 2,
      attendeeName: user.name,
      attendeeEmail: user.email,
      notes: "Test full-service booking"
    });
    console.log("1️⃣ Created full-service booking (pending):", fullServiceBooking._id);

    // 2. Merchant accepts booking
    fullServiceBooking.bookingStatus = "confirmed";
    await fullServiceBooking.save();
    console.log("2️⃣ Merchant accepted booking (confirmed)");

    // 3. User pays
    fullServiceBooking.paymentStatus = "paid";
    fullServiceBooking.paymentId = `PAY_${uuidv4().substring(0, 8).toUpperCase()}`;
    fullServiceBooking.paymentDate = new Date();
    fullServiceBooking.paymentAmount = fullServiceBooking.totalPrice;
    fullServiceBooking.paymentMethod = "UPI";
    await fullServiceBooking.save();
    console.log("3️⃣ User paid (payment completed)");

    // 4. Merchant marks as completed
    fullServiceBooking.bookingStatus = "completed";
    await fullServiceBooking.save();
    console.log("4️⃣ Merchant marked as completed");

    // 5. User rates the service
    fullServiceBooking.rating = 5;
    fullServiceBooking.review = "Excellent service! Highly recommended.";
    await fullServiceBooking.save();
    console.log("5️⃣ User rated the service (5 stars)");

    console.log("\n=== TESTING TICKETED BOOKING WORKFLOW ===");

    // 1. Create ticketed booking (auto-confirmed)
    const ticketedBooking = await Booking.create({
      user: user._id,
      merchant: merchant._id,
      type: "event",
      eventType: "ticketed",
      eventId: ticketedEvent._id,
      eventTitle: ticketedEvent.title,
      eventLocation: ticketedEvent.location,
      eventDate: ticketedEvent.date,
      bookingDate: new Date(),
      bookingStatus: "confirmed", // Auto-confirmed for ticketed events
      paymentStatus: "pending",
      totalPrice: ticketedEvent.price,
      ticketType: "General",
      ticketCount: 2,
      attendeeName: user.name,
      attendeeEmail: user.email,
      ticketId: `TKT_${uuidv4().substring(0, 8).toUpperCase()}`,
      paymentId: `PAY_${uuidv4().substring(0, 8).toUpperCase()}`
    });
    console.log("1️⃣ Created ticketed booking (auto-confirmed):", ticketedBooking._id);

    // 2. User pays (no merchant approval needed)
    ticketedBooking.paymentStatus = "paid";
    ticketedBooking.paymentDate = new Date();
    ticketedBooking.paymentAmount = ticketedBooking.totalPrice;
    ticketedBooking.paymentMethod = "Card";
    ticketedBooking.ticketGenerated = true;
    await ticketedBooking.save();
    console.log("2️⃣ User paid (tickets generated)");

    // 3. Merchant marks as completed (after event)
    ticketedBooking.bookingStatus = "completed";
    await ticketedBooking.save();
    console.log("3️⃣ Merchant marked as completed");

    // 4. User rates the event
    ticketedBooking.rating = 4;
    ticketedBooking.review = "Great conference with excellent speakers!";
    await ticketedBooking.save();
    console.log("4️⃣ User rated the event (4 stars)");

    console.log("\n=== CREATING ADDITIONAL TEST BOOKINGS ===");

    // Create some additional bookings in different states
    const additionalBookings = [
      {
        user: user._id,
        merchant: merchant._id,
        type: "event",
        eventType: "full-service",
        eventId: fullServiceEvent._id,
        eventTitle: fullServiceEvent.title,
        eventLocation: fullServiceEvent.location,
        eventDate: fullServiceEvent.date,
        serviceDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        serviceTime: "2:00 PM",
        bookingDate: new Date(),
        bookingStatus: "pending",
        paymentStatus: "pending",
        totalPrice: fullServiceEvent.price,
        guestCount: 1,
        attendeeName: user.name,
        attendeeEmail: user.email,
        notes: "Another test booking - pending approval"
      },
      {
        user: user._id,
        merchant: merchant._id,
        type: "event",
        eventType: "full-service",
        eventId: fullServiceEvent._id,
        eventTitle: fullServiceEvent.title,
        eventLocation: fullServiceEvent.location,
        eventDate: fullServiceEvent.date,
        serviceDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        serviceTime: "4:00 PM",
        bookingDate: new Date(),
        bookingStatus: "confirmed",
        paymentStatus: "pending",
        totalPrice: fullServiceEvent.price,
        guestCount: 3,
        attendeeName: user.name,
        attendeeEmail: user.email,
        notes: "Confirmed booking - awaiting payment"
      },
      {
        user: user._id,
        merchant: merchant._id,
        type: "event",
        eventType: "ticketed",
        eventId: ticketedEvent._id,
        eventTitle: ticketedEvent.title,
        eventLocation: ticketedEvent.location,
        eventDate: ticketedEvent.date,
        bookingDate: new Date(),
        bookingStatus: "confirmed",
        paymentStatus: "pending",
        totalPrice: ticketedEvent.price * 3,
        ticketType: "General",
        ticketCount: 3,
        attendeeName: user.name,
        attendeeEmail: user.email,
        ticketId: `TKT_${uuidv4().substring(0, 8).toUpperCase()}`,
        paymentId: `PAY_${uuidv4().substring(0, 8).toUpperCase()}`
      }
    ];

    const createdBookings = await Booking.insertMany(additionalBookings);
    console.log(`✅ Created ${createdBookings.length} additional test bookings`);

    console.log("\n=== SUMMARY ===");
    const allBookings = await Booking.find({
      merchant: merchant._id,
      type: "event"
    }).populate("user", "name email").populate("eventId", "title");

    console.log(`📊 Total bookings for merchant: ${allBookings.length}`);
    
    allBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.eventTitle} - ${booking.eventType}`);
      console.log(`   Status: ${booking.bookingStatus} | Payment: ${booking.paymentStatus}`);
      console.log(`   Customer: ${booking.user?.name || booking.attendeeName}`);
      console.log(`   Rating: ${booking.rating ? `${booking.rating}/5` : 'Not rated'}`);
      console.log(`   Amount: ₹${booking.totalPrice?.toLocaleString()}`);
      console.log("");
    });

    console.log("✅ Test data created successfully!");
    console.log("\n🔗 Now test the dashboards:");
    console.log("1. Merchant Dashboard: http://localhost:5173/dashboard/merchant/bookings");
    console.log("2. User Dashboard: http://localhost:5173/dashboard/user/bookings");
    console.log("3. Admin Dashboard: http://localhost:5173/dashboard/admin/bookings");
    console.log("\n📧 Login credentials:");
    console.log("- User: user@test.com / User@123");
    console.log("- Merchant: merchant@test.com / Merchant@123");
    console.log("- Admin: admin@gmail.com / Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error in test workflow:", error);
    process.exit(1);
  }
};

testCompleteBookingWorkflow();