import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from './models/eventSchema.js';
import { User } from './models/userSchema.js';
import { Booking } from './models/bookingSchema.js';

dotenv.config({ path: './config/config.env' });

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const events = await Event.find().populate('createdBy', 'name email role');
    const users = await User.find();
    const bookings = await Booking.find();
    
    console.log('\n=== CURRENT DATABASE STATE ===');
    console.log('Events:', events.length);
    events.forEach((event, i) => {
      console.log(`  ${i+1}. ${event.title} (Type: ${event.eventType}, Status: ${event.status}, Created by: ${event.createdBy?.name || 'Unknown'})`);
    });
    
    console.log('\nUsers:', users.length);
    users.forEach((user, i) => {
      console.log(`  ${i+1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    console.log('\nBookings:', bookings.length);
    bookings.forEach((booking, i) => {
      console.log(`  ${i+1}. ${booking.eventTitle || 'N/A'} - Status: ${booking.status}, Type: ${booking.type}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

checkData();