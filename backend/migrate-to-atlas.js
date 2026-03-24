import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from './models/eventSchema.js';
import { User } from './models/userSchema.js';
import { Booking } from './models/bookingSchema.js';

dotenv.config({ path: './config/config.env' });

const migrateToAtlas = async () => {
  try {
    console.log('🚀 Starting Data Migration from Local to Atlas...');
    
    // Step 1: Connect to local MongoDB and export data
    console.log('\n📥 Connecting to local MongoDB...');
    const localURI = 'mongodb://localhost:27017/mern-stack-event-project';
    await mongoose.connect(localURI);
    console.log('✅ Connected to local MongoDB');
    
    // Export all data
    console.log('\n📊 Exporting data from local database...');
    const localEvents = await Event.find().lean();
    const localUsers = await User.find().lean();
    const localBookings = await Booking.find().lean();
    
    console.log(`   Events: ${localEvents.length}`);
    console.log(`   Users: ${localUsers.length}`);
    console.log(`   Bookings: ${localBookings.length}`);
    
    // Disconnect from local
    await mongoose.disconnect();
    console.log('🔌 Disconnected from local MongoDB');
    
    // Step 2: Connect to Atlas and import data
    console.log('\n📤 Connecting to MongoDB Atlas...');
    const atlasURI = 'mongodb+srv://meghana123:meghana%40123@cluster0.gfbrfcg.mongodb.net/mern-stack-event-project?retryWrites=true&w=majority&appName=EventApp';
    
    await mongoose.connect(atlasURI, {
      serverSelectionTimeoutMS: 15000, // 15 second timeout
    });
    console.log('✅ Connected to MongoDB Atlas');
    
    // Clear existing data in Atlas (if any)
    console.log('\n🧹 Clearing existing data in Atlas...');
    await Event.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Atlas database cleared');
    
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
    
    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const atlasEventCount = await Event.countDocuments();
    const atlasUserCount = await User.countDocuments();
    const atlasBookingCount = await Booking.countDocuments();
    
    console.log(`   Atlas Events: ${atlasEventCount}`);
    console.log(`   Atlas Users: ${atlasUserCount}`);
    console.log(`   Atlas Bookings: ${atlasBookingCount}`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from Atlas');
    
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('✅ All data has been migrated from local MongoDB to Atlas');
    console.log('✅ You can now view your data in MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('\n💡 Atlas connection issue. Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas cluster is running');
      console.log('3. Check if your IP address is whitelisted in Atlas');
      console.log('4. Go to Atlas dashboard and add 0.0.0.0/0 to IP whitelist for testing');
    }
  }
};

migrateToAtlas();