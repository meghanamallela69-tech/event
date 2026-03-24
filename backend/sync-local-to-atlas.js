import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from './models/eventSchema.js';
import { User } from './models/userSchema.js';
import { Booking } from './models/bookingSchema.js';

dotenv.config({ path: './config/config.env' });

const syncLocalToAtlas = async () => {
  try {
    console.log('🔄 Syncing Local MongoDB Data to Atlas...');
    
    // Step 1: Connect to local MongoDB and export data
    console.log('\n📥 Connecting to local MongoDB...');
    const localURI = 'mongodb://localhost:27017/mern-stack-event-project';
    await mongoose.connect(localURI);
    console.log('✅ Connected to local MongoDB');
    
    // Export all data from local
    console.log('\n📊 Exporting data from local database...');
    const localEvents = await Event.find().lean();
    const localUsers = await User.find().lean();
    const localBookings = await Booking.find().lean();
    
    console.log(`   📋 Events: ${localEvents.length}`);
    console.log(`   👥 Users: ${localUsers.length}`);
    console.log(`   🎫 Bookings: ${localBookings.length}`);
    
    // Show sample data
    if (localEvents.length > 0) {
      console.log('\n📝 Sample Events:');
      localEvents.forEach((event, i) => {
        console.log(`   ${i+1}. ${event.title} (${event.eventType})`);
      });
    }
    
    // Disconnect from local
    await mongoose.disconnect();
    console.log('🔌 Disconnected from local MongoDB');
    
    // Step 2: Connect to Atlas
    console.log('\n📤 Connecting to MongoDB Atlas...');
    
    // Try the corrected Atlas URI
    const atlasURI = 'mongodb+srv://meghana123:meghana1234@cluster0.gfbrfcg.mongodb.net/eventhub?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(atlasURI, {
      serverSelectionTimeoutMS: 20000, // 20 second timeout
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas');
    
    // Check current Atlas data
    console.log('\n🔍 Checking current Atlas data...');
    const atlasEventCount = await Event.countDocuments();
    const atlasUserCount = await User.countDocuments();
    const atlasBookingCount = await Booking.countDocuments();
    
    console.log(`   Current Atlas Events: ${atlasEventCount}`);
    console.log(`   Current Atlas Users: ${atlasUserCount}`);
    console.log(`   Current Atlas Bookings: ${atlasBookingCount}`);
    
    // Clear existing Atlas data
    if (atlasEventCount > 0 || atlasUserCount > 0 || atlasBookingCount > 0) {
      console.log('\n🧹 Clearing existing Atlas data...');
      await Event.deleteMany({});
      await User.deleteMany({});
      await Booking.deleteMany({});
      console.log('✅ Atlas database cleared');
    }
    
    // Import data to Atlas
    console.log('\n📥 Importing data to Atlas...');
    
    if (localUsers.length > 0) {
      await User.insertMany(localUsers);
      console.log(`✅ Imported ${localUsers.length} users to Atlas`);
    }
    
    if (localEvents.length > 0) {
      await Event.insertMany(localEvents);
      console.log(`✅ Imported ${localEvents.length} events to Atlas`);
    }
    
    if (localBookings.length > 0) {
      await Booking.insertMany(localBookings);
      console.log(`✅ Imported ${localBookings.length} bookings to Atlas`);
    }
    
    // Verify the sync
    console.log('\n🔍 Verifying sync to Atlas...');
    const finalEventCount = await Event.countDocuments();
    const finalUserCount = await User.countDocuments();
    const finalBookingCount = await Booking.countDocuments();
    
    console.log(`   ✅ Atlas Events: ${finalEventCount}`);
    console.log(`   ✅ Atlas Users: ${finalUserCount}`);
    console.log(`   ✅ Atlas Bookings: ${finalBookingCount}`);
    
    // Show Atlas events
    if (finalEventCount > 0) {
      console.log('\n📋 Events now in Atlas:');
      const atlasEvents = await Event.find().select('title eventType status');
      atlasEvents.forEach((event, i) => {
        console.log(`   ${i+1}. ${event.title} (${event.eventType}, ${event.status})`);
      });
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from Atlas');
    
    console.log('\n🎉 SYNC COMPLETED SUCCESSFULLY!');
    console.log('✅ All local data has been synced to MongoDB Atlas');
    console.log('✅ You can now view your data in the Atlas dashboard');
    console.log('✅ Database: eventhub');
    console.log('✅ Collections: events, users, bookings');
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('\n💡 Atlas connection failed. Solutions:');
      console.log('1. Check internet connection');
      console.log('2. Go to MongoDB Atlas → Network Access');
      console.log('3. Add IP Address: 0.0.0.0/0 (Allow access from anywhere)');
      console.log('4. Wait 2-3 minutes for changes to take effect');
      console.log('5. Verify cluster is running (not paused)');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Authentication failed. Check:');
      console.log('1. Username: meghana123');
      console.log('2. Password: meghana1234');
      console.log('3. Database name: eventhub');
    }
  }
};

syncLocalToAtlas();