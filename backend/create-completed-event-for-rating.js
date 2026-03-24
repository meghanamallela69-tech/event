import mongoose from 'mongoose';
import { Event } from './models/eventSchema.js';
import { Booking } from './models/bookingSchema.js';
import { User } from './models/userSchema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

async function createCompletedEventForRating() {
  try {
    console.log('🎪 Creating completed event for rating/review testing...\n');

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

    // Create a completed ticketed event (past date)
    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    const completedEventData = {
      title: "Completed Music Concert",
      description: "A fantastic music concert that already happened - ready for rating and reviews",
      category: "Music",
      eventType: "ticketed",
      price: 799,
      location: "City Concert Hall",
      date: pastDate,
      time: "8:00 PM",
      tickets: 100,
      totalTickets: 100,
      availableTickets: 95,
      features: ["Live Band", "VIP Seating", "Refreshments"],
      rating: { average: 0, totalRatings: 0 },
      status: "completed", // Mark as completed
      createdBy: testMerchant._id
    };

    const completedEvent = await Event.create(completedEventData);
    console.log(`✅ Created completed event: ${completedEvent.title} (ID: ${completedEvent._id})`);
    console.log(`📅 Event Date: ${completedEvent.date.toDateString()} (Past date)\n`);

    // Create a confirmed booking for this completed event
    const completedBookingData = {
      user: testUser._id,
      merchant: testMerchant._id,
      type: "event",
      eventType: "ticketed",
      eventId: completedEvent._id.toString(),
      eventTitle: completedEvent.title,
      eventCategory: completedEvent.category,
      eventPrice: completedEvent.price,
      eventDate: completedEvent.date,
      ticketType: "General Admission",
      ticketCount: 2,
      bookingDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // Booked 8 days ago
      totalPrice: completedEvent.price * 2,
      status: "completed", // Mark booking as completed
      paymentStatus: "Paid",
      paymentMethod: "UPI",
      paymentId: `PAY_COMPLETED_${Date.now()}`,
      paymentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      paymentAmount: completedEvent.price * 2,
      ticketId: `TKT_COMPLETED_${Date.now()}`,
      ticketGenerated: true
    };

    const completedBooking = await Booking.create(completedBookingData);
    console.log(`✅ Created completed booking: ${completedBooking._id}`);
    console.log(`   Event: ${completedBooking.eventTitle}`);
    console.log(`   Tickets: ${completedBooking.ticketCount}`);
    console.log(`   Status: ${completedBooking.status}`);
    console.log(`   Payment: ${completedBooking.paymentStatus}\n`);

    console.log('🎉 Completed event and booking created successfully!');
    console.log('📱 Now you can test rating and review functionality:');
    console.log(`   Event ID: ${completedEvent._id}`);
    console.log(`   Booking ID: ${completedBooking._id}`);
    console.log('   User can now rate and review this completed event.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createCompletedEventForRating();