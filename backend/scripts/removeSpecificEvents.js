import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from '../models/eventSchema.js';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const removeSpecificEvents = async () => {
    try {
        console.log('🗑️  Removing specific dummy events from database...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Define the specific events to remove
        const eventsToRemove = [
            "Tech Expo 2026",
            "Food Carnival", 
            "Design Summit"
        ];
        
        console.log('\n📋 Target events to remove:');
        eventsToRemove.forEach((title, index) => {
            console.log(`   ${index + 1}. ${title}`);
        });
        
        // Find and remove only these specific events
        const result = await Event.deleteMany({
            title: { $in: eventsToRemove }
        });
        
        console.log(`\n✅ Successfully removed ${result.deletedCount} events`);
        
        // Show remaining events
        const remainingEvents = await Event.find({});
        console.log(`\n📊 Remaining events in database: ${remainingEvents.length}`);
        
        if (remainingEvents.length > 0) {
            console.log('\n📋 Remaining events:');
            remainingEvents.forEach((event, index) => {
                console.log(`   ${index + 1}. ${event.title} (${event.category})`);
            });
        }
        
        console.log('\n🎯 Specific dummy events removed successfully');
        
    } catch (error) {
        console.error('❌ Error removing specific events:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

removeSpecificEvents();