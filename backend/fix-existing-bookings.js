import mongoose from 'mongoose';
import { Booking } from './models/bookingSchema.js';
import { Event } from './models/eventSchema.js';
import { dbConnection } from './database/dbConnection.js';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const fixExistingBookings = async () => {
  try {
    await dbConnection();
    console.log('Connected to database');

    // Find all bookings that need fixing
    const bookings = await Booking.find({
      $or: [
        { eventTime: { $exists: false } },
        { eventTime: null },
        { eventTime: "TBD" },
        { eventDate: null }
      ]
    });

    console.log(`Found ${bookings.length} bookings that need fixing`);

    for (const booking of bookings) {
      console.log(`\nFixing booking: ${booking.serviceTitle}`);
      
      try {
        // Find the corresponding event
        const event = await Event.findById(booking.serviceId);
        
        if (event) {
          console.log(`Found event: ${event.title}`);
          console.log(`Event date: ${event.date}`);
          console.log(`Event time: ${event.time}`);
          
          // Update the booking with proper date/time
          const updateData = {};
          
          if (event.date) {
            updateData.eventDate = event.date;
          }
          
          if (event.time) {
            updateData.eventTime = event.time;
          } else {
            updateData.eventTime = "06:00 PM"; // Default time
          }
          
          await Booking.findByIdAndUpdate(booking._id, updateData);
          console.log(`✅ Updated booking with date: ${updateData.eventDate}, time: ${updateData.eventTime}`);
        } else {
          console.log(`⚠️ Event not found for booking ${booking._id}`);
          
          // Set default values if event not found
          await Booking.findByIdAndUpdate(booking._id, {
            eventDate: new Date('2026-04-15T18:00:00.000Z'),
            eventTime: "06:00 PM"
          });
          console.log(`✅ Set default date/time for booking`);
        }
      } catch (error) {
        console.error(`❌ Error fixing booking ${booking._id}:`, error.message);
      }
    }

    console.log('\n🎉 Finished fixing existing bookings!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixExistingBookings();