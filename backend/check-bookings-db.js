import mongoose from 'mongoose';
import { Booking } from './models/bookingSchema.js';
import { User } from './models/userSchema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

async function checkBookingsInDB() {
  try {
    console.log('🔍 Checking bookings in database...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find test user
    const testUser = await User.findOne({ email: 'user@test.com' });
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }
    console.log(`✅ Found test user: ${testUser.name} (ID: ${testUser._id})\n`);

    // Check all bookings for this user
    const allBookings = await Booking.find({ user: testUser._id });
    console.log(`📊 Total bookings for user: ${allBookings.length}`);

    if (allBookings.length > 0) {
      console.log('\n📋 All Bookings:');
      allBookings.forEach((booking, index) => {
        console.log(`${index + 1}. Event: ${booking.eventTitle || 'No Title'}`);
        console.log(`   ID: ${booking._id}`);
        console.log(`   Type: ${booking.type}`);
        console.log(`   Event Type: ${booking.eventType || 'Unknown'}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Payment Status: ${booking.paymentStatus}`);
        console.log(`   Created: ${booking.createdAt}`);
        console.log('');
      });
    }

    // Check event-type bookings specifically
    const eventBookings = await Booking.find({ 
      user: testUser._id, 
      type: "event" 
    });
    console.log(`📊 Event bookings for user: ${eventBookings.length}`);

    if (eventBookings.length > 0) {
      console.log('\n📋 Event Bookings:');
      eventBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.eventTitle || 'No Title'}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Payment: ${booking.paymentStatus}`);
        console.log(`   Event Type: ${booking.eventType || 'Unknown'}`);
      });
    } else {
      console.log('📝 No event bookings found for this user');
      console.log('💡 This explains why the bookings page is empty');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkBookingsInDB();