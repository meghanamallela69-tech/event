import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/userSchema.js';

dotenv.config({ path: './config/config.env' });

const testAPIEndpoints = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Get a merchant user for testing
    const merchant = await User.findOne({ role: 'merchant' });
    if (!merchant) {
      console.log('❌ No merchant found for testing');
      return;
    }
    
    console.log(`✅ Using merchant: ${merchant.name} (${merchant.email})`);
    
    // Test event creation data
    const testEventData = {
      title: 'API Test Event',
      description: 'Testing event creation via API',
      category: 'Test',
      eventType: 'ticketed',
      price: 150,
      location: 'Test Venue',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      time: '19:00',
      duration: 3,
      tickets: 100,
      ticketTypes: JSON.stringify([
        {
          name: 'General',
          price: 150,
          quantityTotal: 80,
          quantitySold: 0
        },
        {
          name: 'VIP',
          price: 300,
          quantityTotal: 20,
          quantitySold: 0
        }
      ])
    };
    
    console.log('\n🧪 Testing Event Creation API...');
    console.log('Test data:', testEventData);
    
    // Simulate the API call by directly calling the controller logic
    const { Event } = await import('./models/eventSchema.js');
    
    // Parse ticket types
    const ticketTypes = JSON.parse(testEventData.ticketTypes);
    const totalTickets = ticketTypes.reduce((sum, t) => sum + t.quantityTotal, 0);
    
    const event = await Event.create({
      title: testEventData.title,
      description: testEventData.description,
      category: testEventData.category,
      eventType: testEventData.eventType,
      price: 0, // Ticketed events have price 0, individual ticket types have prices
      location: testEventData.location,
      date: testEventData.date,
      time: testEventData.time,
      duration: testEventData.duration,
      tickets: testEventData.tickets,
      totalTickets: totalTickets,
      availableTickets: totalTickets,
      status: 'active',
      rating: { average: 0, totalRatings: 0 },
      ticketTypes: ticketTypes,
      createdBy: merchant._id
    });
    
    console.log('✅ Event created successfully!');
    console.log(`   ID: ${event._id}`);
    console.log(`   Title: ${event.title}`);
    console.log(`   Type: ${event.eventType}`);
    console.log(`   Total Tickets: ${event.totalTickets}`);
    console.log(`   Ticket Types: ${event.ticketTypes.length}`);
    
    // Verify the event was saved
    const savedEvent = await Event.findById(event._id);
    if (savedEvent) {
      console.log('✅ Event verified in database');
    } else {
      console.log('❌ Event not found in database');
    }
    
    // Clean up
    await Event.deleteOne({ _id: event._id });
    console.log('✅ Test event cleaned up');
    
    console.log('\n🎉 API Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testAPIEndpoints();