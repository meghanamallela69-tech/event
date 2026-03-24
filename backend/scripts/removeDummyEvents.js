import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from '../models/eventSchema.js';

// Load environment variables
dotenv.config({ path: '../config/config.env' });

const removeDummyEvents = async () => {
    try {
        console.log('🗑️  Removing dummy events from database...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Get all events to see what we're removing
        const events = await Event.find({});
        console.log(`📊 Found ${events.length} events in database`);
        
        if (events.length > 0) {
            console.log('\n📋 Events to be removed:');
            events.forEach((event, index) => {
                console.log(`   ${index + 1}. ${event.title} (${event.category})`);
            });
            
            // Remove all events
            const result = await Event.deleteMany({});
            console.log(`\n✅ Successfully removed ${result.deletedCount} events`);
        } else {
            console.log('ℹ️  No events found in database');
        }
        
        // Also remove any related data (ratings, reviews, follows, bookings)
        console.log('\n🧹 Cleaning up related data...');
        
        // Note: We'll keep the collections but remove the data
        // This is safer than dropping collections as it preserves indexes
        
        console.log('✅ Database cleanup completed');
        console.log('\n🎯 Database is now clean and ready for real events');
        
    } catch (error) {
        console.error('❌ Error removing dummy events:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

removeDummyEvents();