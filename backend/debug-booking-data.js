import mongoose from 'mongoose';
import { Booking } from './models/bookingSchema.js';
import { Event } from './models/eventSchema.js';
import { dbConnection } from './database/dbConnection.js';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const debugBookingData = async () => {
  try {
    await dbConnection();
    console.log('Connected to database');

    // Find all bookings
    const bookings = await Booking.find().limit(5);
    console.log('\n=== BOOKING DATA DEBUG ===');
    
    bookings.forEach((booking, index) => {
      console.log(`\nBooking ${index + 1}:`);
      console.log('ID:', booking._id);
      console.log('Service Title:', booking.serviceTitle);
      console.log('Event Date:', booking.eventDate);
      console.log('Event Time:', booking.eventTime);
      console.log('Service ID:', booking.serviceId);
      console.log('Status:', booking.status);
      console.log('Created At:', booking.createdAt);
    });

    // Find the corresponding events
    console.log('\n=== EVENT DATA DEBUG ===');
    const events = await Event.find().limit(5);
    
    events.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log('ID:', event._id);
      console.log('Title:', event.title);
      console.log('Date:', event.date);
      console.log('Time:', event.time);
      console.log('Event Type:', event.eventType);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

debugBookingData();