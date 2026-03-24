import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from './models/eventSchema.js';
import { User } from './models/userSchema.js';
import { Booking } from './models/bookingSchema.js';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const testDataPersistence = async () => {
    console.log('🧪 Testing Data Persistence in MongoDB');
    console.log('=====================================');
    
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        // Test 1: Check existing data
        console.log('\n📊 Checking existing data...');
        const eventCount = await Event.countDocuments();
        const userCount = await User.countDocuments();
        const bookingCount = await Booking.countDocuments();
        
        console.log(`   Events: ${eventCount}`);
        console.log(`   Users: ${userCount}`);
        console.log(`   Bookings: ${bookingCount}`);
        
        // Test 2: Create a test event
        console.log('\n🎪 Creating test event...');
        
        // First, ensure we have a merchant user
        let merchant = await User.findOne({ role: 'merchant' });
        if (!merchant) {
            console.log('   Creating test merchant...');
            merchant = await User.create({
                name: 'Test Merchant',
                email: 'merchant@test.com',
                password: 'password123',
                role: 'merchant'
            });
            console.log('   ✅ Test merchant created:', merchant._id);
        } else {
            console.log('   ✅ Using existing merchant:', merchant._id);
        }
        
        // Create test event
        const testEvent = await Event.create({
            title: 'Test Event - Data Persistence Check',
            description: 'This is a test event to verify data persistence',
            category: 'Test',
            eventType: 'ticketed',
            price: 100,
            location: 'Test Location',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            time: '18:00',
            duration: 2,
            tickets: 50,
            totalTickets: 50,
            availableTickets: 50,
            status: 'active',
            rating: { average: 0, totalRatings: 0 },
            ticketTypes: [
                {
                    name: 'General',
                    price: 100,
                    quantityTotal: 50,
                    quantitySold: 0
                }
            ],
            createdBy: merchant._id
        });
        
        console.log('   ✅ Test event created:', testEvent._id);
        console.log('   📝 Event title:', testEvent.title);
        
        // Test 3: Verify the event was saved
        console.log('\n🔍 Verifying event was saved...');
        const savedEvent = await Event.findById(testEvent._id);
        
        if (savedEvent) {
            console.log('   ✅ Event found in database');
            console.log('   📝 Title:', savedEvent.title);
            console.log('   📅 Date:', savedEvent.date);
            console.log('   💰 Price:', savedEvent.price);
            console.log('   🎫 Tickets:', savedEvent.totalTickets);
        } else {
            console.log('   ❌ Event NOT found in database');
        }
        
        // Test 4: Create a test booking
        console.log('\n📋 Creating test booking...');
        
        // Ensure we have a user
        let user = await User.findOne({ role: 'user' });
        if (!user) {
            console.log('   Creating test user...');
            user = await User.create({
                name: 'Test User',
                email: 'user@test.com',
                password: 'password123',
                role: 'user'
            });
            console.log('   ✅ Test user created:', user._id);
        } else {
            console.log('   ✅ Using existing user:', user._id);
        }
        
        const testBooking = await Booking.create({
            user: user._id,
            type: 'event',
            eventType: 'ticketed',
            eventId: testEvent._id.toString(),
            merchant: merchant._id,
            eventTitle: testEvent.title,
            eventCategory: testEvent.category,
            eventPrice: testEvent.price,
            ticketType: 'General',
            ticketCount: 2,
            bookingDate: new Date(),
            eventDate: testEvent.date,
            totalPrice: testEvent.price * 2,
            status: 'confirmed',
            paymentMethod: 'Card',
            paymentStatus: 'Paid',
            qrCode: `TEST-${Date.now()}`,
            ticketId: `TKT-${Date.now()}`,
            ticketGenerated: true
        });
        
        console.log('   ✅ Test booking created:', testBooking._id);
        
        // Test 5: Verify booking was saved
        console.log('\n🔍 Verifying booking was saved...');
        const savedBooking = await Booking.findById(testBooking._id);
        
        if (savedBooking) {
            console.log('   ✅ Booking found in database');
            console.log('   🎫 Ticket count:', savedBooking.ticketCount);
            console.log('   💰 Total price:', savedBooking.totalPrice);
            console.log('   📊 Status:', savedBooking.status);
        } else {
            console.log('   ❌ Booking NOT found in database');
        }
        
        // Test 6: Check final counts
        console.log('\n📊 Final data counts...');
        const finalEventCount = await Event.countDocuments();
        const finalUserCount = await User.countDocuments();
        const finalBookingCount = await Booking.countDocuments();
        
        console.log(`   Events: ${finalEventCount} (was ${eventCount})`);
        console.log(`   Users: ${finalUserCount} (was ${userCount})`);
        console.log(`   Bookings: ${finalBookingCount} (was ${bookingCount})`);
        
        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await Event.deleteOne({ _id: testEvent._id });
        await Booking.deleteOne({ _id: testBooking._id });
        console.log('   ✅ Test data cleaned up');
        
        console.log('\n=====================================');
        console.log('🎉 DATA PERSISTENCE TEST COMPLETED!');
        console.log('✅ MongoDB is working correctly');
        console.log('✅ Data is being saved and retrieved');
        console.log('=====================================');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

testDataPersistence();