import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from './models/eventSchema.js';
import { User } from './models/userSchema.js';
import { Booking } from './models/bookingSchema.js';

dotenv.config({ path: './config/config.env' });

const populateAtlas = async () => {
  try {
    console.log('🚀 Populating MongoDB Atlas with Local Data');
    console.log('===========================================');
    
    // Step 1: Connect to LOCAL and export data
    console.log('\n📥 Step 1: Exporting from Local MongoDB...');
    const localURI = 'mongodb://localhost:27017/mern-stack-event-project';
    await mongoose.connect(localURI);
    console.log('✅ Connected to local MongoDB');
    
    const localEvents = await Event.find().lean();
    const localUsers = await User.find().lean();
    const localBookings = await Booking.find().lean();
    
    console.log(`📋 Exported ${localEvents.length} events`);
    console.log(`👥 Exported ${localUsers.length} users`);
    console.log(`🎫 Exported ${localBookings.length} bookings`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from local');
    
    // Step 2: Connect to ATLAS and import data
    console.log('\n📤 Step 2: Importing to MongoDB Atlas...');
    
    // Updated Atlas connection string with correct format
    const atlasURI = 'mongodb+srv://meghana123:meghana1234@cluster0.gfbrfcg.mongodb.net/eventhub?retryWrites=true&w=majority';
    
    console.log('Connecting to Atlas...');
    await mongoose.connect(atlasURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas');
    
    // Clear existing Atlas data
    console.log('\n🧹 Clearing existing Atlas data...');
    await Event.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Atlas cleared');
    
    // Import data to Atlas
    console.log('\n📥 Importing data to Atlas...');
    
    if (localUsers.length > 0) {
      await User.insertMany(localUsers);
      console.log(`✅ Imported ${localUsers.length} users`);
    }
    
    if (localEvents.length > 0) {
      await Event.insertMany(localEvents);
      console.log(`✅ Imported ${localEvents.length} events`);
    }
    
    if (localBookings.length > 0) {
      await Booking.insertMany(localBookings);
      console.log(`✅ Imported ${localBookings.length} bookings`);
    }
    
    // Verify Atlas data
    console.log('\n🔍 Verifying Atlas data...');
    const atlasEventCount = await Event.countDocuments();
    const atlasUserCount = await User.countDocuments();
    const atlasBookingCount = await Booking.countDocuments();
    
    console.log(`📋 Atlas Events: ${atlasEventCount}`);
    console.log(`👥 Atlas Users: ${atlasUserCount}`);
    console.log(`🎫 Atlas Bookings: ${atlasBookingCount}`);
    
    // Show events in Atlas
    if (atlasEventCount > 0) {
      console.log('\n📋 Events now in Atlas:');
      const events = await Event.find().select('title eventType');
      events.forEach((event, i) => {
        console.log(`   ${i+1}. ${event.title} (${event.eventType})`);
      });
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from Atlas');
    
    console.log('\n🎉 SUCCESS! Data is now in MongoDB Atlas');
    console.log('✅ You can now view your data in the Atlas dashboard');
    console.log('✅ Database: eventhub');
    console.log('✅ Collections: events, users, bookings');
    
    console.log('\n📍 To switch your app to Atlas:');
    console.log('1. Update config.env MONGO_URI to Atlas');
    console.log('2. Restart your server');
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('\n💡 Atlas Connection Issue:');
      console.log('1. Go to https://cloud.mongodb.com');
      console.log('2. Navigate to Network Access');
      console.log('3. Add IP Address: 0.0.0.0/0');
      console.log('4. Check if cluster is paused → Resume');
      console.log('5. Wait 2-3 minutes and try again');
    } else if (error.message.includes('Authentication')) {
      console.log('\n💡 Authentication Issue:');
      console.log('1. Check username: meghana123');
      console.log('2. Check password: meghana1234');
      console.log('3. Verify database user permissions');
    }
  }
};

populateAtlas();