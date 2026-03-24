import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from './models/eventSchema.js';
import { User } from './models/userSchema.js';
import { Booking } from './models/bookingSchema.js';
import bcrypt from 'bcryptjs';

dotenv.config({ path: './config/config.env' });

const populateAtlasDatabase = async () => {
  try {
    console.log('🚀 Populating Atlas Database with Sample Data...');
    
    // Connect to Atlas
    console.log('\n📤 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected to MongoDB Atlas');
    
    // Clear existing data
    console.log('\n🧹 Clearing existing data...');
    await Event.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Database cleared');
    
    // Create users
    console.log('\n👥 Creating users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: await bcrypt.hash('Admin@123', 10),
        role: 'admin'
      },
      {
        name: 'Dileep',
        email: 'mmeghana@speshway.com',
        password: hashedPassword,
        role: 'merchant'
      },
      {
        name: 'Surya',
        email: 'mmeghana@gmail.com',
        password: hashedPassword,
        role: 'merchant'
      },
      {
        name: 'Mounika',
        email: 'mounika@gmail.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        name: 'Test Merchant',
        email: 'merchant@test.com',
        password: hashedPassword,
        role: 'merchant'
      },
      {
        name: 'Test User',
        email: 'user@test.com',
        password: hashedPassword,
        role: 'user'
      }
    ]);
    
    console.log(`✅ Created ${users.length} users`);
    
    // Get merchants for events
    const merchants = users.filter(u => u.role === 'merchant');
    const regularUsers = users.filter(u => u.role === 'user');
    
    // Create events
    console.log('\n🎪 Creating events...');
    
    const events = await Event.insertMany([
      {
        title: 'Grand Luxury Wedding Planning',
        description: 'A complete luxury wedding planning service that covers everything from venue decoration to catering, photography, and entertainment. We ensure your special day is perfect in every detail.',
        category: 'Wedding',
        eventType: 'full-service',
        price: 150000,
        location: 'Various Venues Available',
        duration: 8,
        status: 'active',
        rating: { average: 0, totalRatings: 0 },
        features: [
          'Complete venue decoration',
          'Professional photography & videography',
          'Catering services',
          'Entertainment & music',
          'Bridal makeup & styling',
          'Guest coordination'
        ],
        createdBy: merchants[0]._id
      },
      {
        title: 'Summer Music Concert Night',
        description: 'An electrifying night of live music featuring top local bands and artists. Join us for an unforgettable evening of great music, food, and entertainment.',
        category: 'Music',
        eventType: 'ticketed',
        price: 0,
        location: 'City Concert Hall',
        date: new Date('2026-06-15T19:00:00'),
        time: '19:00',
        duration: 4,
        tickets: 500,
        totalTickets: 500,
        availableTickets: 500,
        status: 'active',
        rating: { average: 0, totalRatings: 0 },
        ticketTypes: [
          {
            name: 'General',
            price: 800,
            quantityTotal: 400,
            quantitySold: 0
          },
          {
            name: 'VIP',
            price: 1500,
            quantityTotal: 100,
            quantitySold: 0
          }
        ],
        createdBy: merchants[0]._id
      },
      {
        title: 'Birthday Party Event Management',
        description: 'Professional birthday party planning and management services. We handle everything from theme decoration to entertainment, catering, and photography to make your celebration memorable.',
        category: 'Birthday',
        eventType: 'full-service',
        price: 25000,
        location: 'Client Preferred Venue',
        duration: 6,
        status: 'active',
        rating: { average: 0, totalRatings: 0 },
        features: [
          'Theme-based decoration',
          'Birthday cake & catering',
          'Entertainment & games',
          'Photography services',
          'Party favors & gifts',
          'Complete event coordination'
        ],
        createdBy: merchants[1]._id
      },
      {
        title: 'Stand-Up Comedy Night',
        description: 'Get ready for a night full of laughter with our stand-up comedy show featuring hilarious comedians. Great food, drinks, and non-stop entertainment guaranteed!',
        category: 'Comedy',
        eventType: 'ticketed',
        price: 0,
        location: 'Comedy Club Downtown',
        date: new Date('2026-05-20T20:00:00'),
        time: '20:00',
        duration: 3,
        tickets: 200,
        totalTickets: 200,
        availableTickets: 200,
        status: 'active',
        rating: { average: 0, totalRatings: 0 },
        ticketTypes: [
          {
            name: 'Standard',
            price: 600,
            quantityTotal: 150,
            quantitySold: 0
          },
          {
            name: 'Premium',
            price: 1000,
            quantityTotal: 50,
            quantitySold: 0
          }
        ],
        createdBy: merchants[1]._id
      }
    ]);
    
    console.log(`✅ Created ${events.length} events`);
    
    // Create sample bookings
    console.log('\n📋 Creating sample bookings...');
    
    const bookings = await Booking.insertMany([
      {
        user: regularUsers[0]._id,
        merchant: merchants[0]._id,
        type: 'event',
        eventType: 'full-service',
        eventId: events[0]._id.toString(),
        eventTitle: events[0].title,
        eventCategory: events[0].category,
        eventPrice: events[0].price,
        serviceDate: new Date('2026-07-15'),
        serviceTime: '18:00',
        bookingDate: new Date(),
        guests: 150,
        specialRequirements: 'Vegetarian catering preferred',
        status: 'pending',
        totalPrice: events[0].price,
        paymentStatus: 'Pending'
      },
      {
        user: regularUsers[1]._id,
        merchant: merchants[1]._id,
        type: 'event',
        eventType: 'ticketed',
        eventId: events[3]._id.toString(),
        eventTitle: events[3].title,
        eventCategory: events[3].category,
        eventPrice: 600,
        ticketType: 'Standard',
        ticketCount: 2,
        eventDate: events[3].date,
        bookingDate: new Date(),
        status: 'pending',
        totalPrice: 1200,
        paymentStatus: 'Pending'
      }
    ]);
    
    console.log(`✅ Created ${bookings.length} bookings`);
    
    // Verify the data
    console.log('\n🔍 Verifying data in Atlas...');
    const eventCount = await Event.countDocuments();
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    console.log(`   Events: ${eventCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Bookings: ${bookingCount}`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from Atlas');
    
    console.log('\n🎉 ATLAS DATABASE POPULATED SUCCESSFULLY!');
    console.log('✅ Your Atlas database now has sample data');
    console.log('✅ You can view the data in MongoDB Atlas dashboard');
    console.log('✅ Restart your server to use Atlas database');
    
  } catch (error) {
    console.error('❌ Population failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('\n💡 Atlas connection issue. Please:');
      console.log('1. Go to MongoDB Atlas dashboard');
      console.log('2. Navigate to Network Access');
      console.log('3. Add IP Address: 0.0.0.0/0 (Allow access from anywhere)');
      console.log('4. Wait 2-3 minutes for changes to take effect');
      console.log('5. Run this script again');
    }
  }
};

populateAtlasDatabase();