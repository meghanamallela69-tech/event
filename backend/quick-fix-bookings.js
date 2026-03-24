import mongoose from 'mongoose';
import { Booking } from './models/bookingSchema.js';
import { dbConnection } from './database/dbConnection.js';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const quickFixBookings = async () => {
  try {
    await dbConnection();
    console.log('Connected to database');

    // Update all bookings that don't have proper eventTime
    const result = await Booking.updateMany(
      {
        $or: [
          { eventTime: { $exists: false } },
          { eventTime: null },
          { eventTime: "TBD" },
          { eventTime: "" }
        ]
      },
      {
        $set: {
          eventTime: "06:00 PM",
          eventDate: new Date('2026-04-15T18:00:00.000Z')
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} bookings with proper date/time`);

    // Show updated bookings
    const updatedBookings = await Booking.find().limit(5);
    console.log('\n=== UPDATED BOOKINGS ===');
    updatedBookings.forEach((booking, index) => {
      console.log(`\nBooking ${index + 1}:`);
      console.log('Title:', booking.serviceTitle);
      console.log('Event Date:', booking.eventDate);
      console.log('Event Time:', booking.eventTime);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

quickFixBookings();