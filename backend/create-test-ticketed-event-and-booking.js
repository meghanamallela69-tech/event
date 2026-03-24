import mongoose from 'mongoose';
import { Event } from './models/eventSchema.js';
import { Booking } from './models/bookingSchema.js';
import { User } from './models/userSchema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

async function createTestTicketedEventAndBooking() {
  try {
    console.log('🎪 Creating test ticketed event and booking...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find test users
    const testUser = await User.findOne({ email: 'user@test.com' });
    const testMerchant = await User.findOne({ email: 'merchant@test.com' });
    
    if (!testUser || !testMerchant) {
      console.log('❌ Test users not found');
      return;
    }
    
    console.log(`✅ Found test user: ${testUser.name} (ID: ${testUser._id})`);
    console.log(`✅ Found test merchant: ${testMerchant.name} (ID: ${testMerchant._id})\n`);

    // Create a ticketed event
    const eventData = {
      title: "Test Ticketed Event",
      description: "This is a test ticketed event for booking verification",
      category: "Entertainment",
      eventType: "ticketed", // Explicitly set as ticketed
      price: 299,
      location: "Test Venue, Test City",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      time: "7:00 PM", // Required for ticketed events
      tickets: 50,
      totalTickets: 50,
      availableTickets: 50,
      features: ["Live Music", "Food & Drinks", "Networking"],
      rating: { average: 4.2, totalRatings: 15 },
      createdBy: testMerchant._id
    };

    const event = await Event.create(eventData);
    console.log(`✅ Created ticketed event: ${event.title} (ID: ${event._id})\n`);

    // Create a booking for this event
    const bookingData = {
      user: testUser._id,
      merchant: testMerchant._id,
      type: "event",
      eventType: "ticketed",
      eventId: event._id.toString(),
      eventTitle: event.title,
      eventCategory: event.category,
      eventPrice: event.price,
      eventDate: event.date,
      ticketType: "General Admission",
      ticketCount: 2,
      bookingDate: new Date(),
      totalPrice: event.price * 2, // 2 tickets
      status: "confirmed", // Ticketed events are auto-confirmed
      paymentStatus: "Paid", // Simulate paid booking
      paymentMethod: "UPI",
      paymentId: `PAY_${Date.now()}`,
      paymentDate: new Date(),
      paymentAmount: event.price * 2,
      ticketId: `TKT_${Date.now()}`,
      ticketGenerated: true
    };

    const booking = await Booking.create(bookingData);
    console.log(`✅ Created booking: ${booking._id}`);
    console.log(`   Event: ${booking.eventTitle}`);
    console.log(`   Tickets: ${booking.ticketCount}`);
    console.log(`   Total: ₹${booking.totalPrice}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Payment: ${booking.paymentStatus}\n`);

    // Create another full-service event and booking
    const fullServiceEventData = {
      title: "Test Full-Service Event",
      description: "This is a test full-service event for booking verification",
      category: "Wedding",
      eventType: "full-service",
      price: 15000,
      location: "Custom Location (TBD)",
      features: ["Photography", "Catering", "Decoration", "Music"],
      rating: { average: 4.8, totalRatings: 25 },
      createdBy: testMerchant._id
    };

    const fullServiceEvent = await Event.create(fullServiceEventData);
    console.log(`✅ Created full-service event: ${fullServiceEvent.title} (ID: ${fullServiceEvent._id})\n`);

    // Create a full-service booking (approved but not paid)
    const fullServiceBookingData = {
      user: testUser._id,
      merchant: testMerchant._id,
      type: "event",
      eventType: "full-service",
      eventId: fullServiceEvent._id.toString(),
      eventTitle: fullServiceEvent.title,
      eventCategory: fullServiceEvent.category,
      eventPrice: fullServiceEvent.price,
      serviceDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      serviceTime: "10:00 AM",
      bookingDate: new Date(),
      guests: 50,
      specialRequirements: "Vegetarian catering preferred",
      totalPrice: fullServiceEvent.price,
      status: "approved", // Approved by merchant, waiting for payment
      paymentStatus: "Pending",
      paymentMethod: "Card"
    };

    const fullServiceBooking = await Booking.create(fullServiceBookingData);
    console.log(`✅ Created full-service booking: ${fullServiceBooking._id}`);
    console.log(`   Event: ${fullServiceBooking.eventTitle}`);
    console.log(`   Service Date: ${fullServiceBooking.serviceDate.toDateString()}`);
    console.log(`   Guests: ${fullServiceBooking.guests}`);
    console.log(`   Total: ₹${fullServiceBooking.totalPrice}`);
    console.log(`   Status: ${fullServiceBooking.status}`);
    console.log(`   Payment: ${fullServiceBooking.paymentStatus}\n`);

    console.log('🎉 Test data created successfully!');
    console.log('📱 You can now check the My Bookings page in the user dashboard.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
createTestTicketedEventAndBooking();