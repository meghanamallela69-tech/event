import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const API_BASE = 'http://localhost:4001/api/v1';

// Test credentials
const testUser = {
  email: 'user@test.com',
  password: 'User@123'
};

async function testTicketedPaymentFlow() {
  try {
    console.log('🧪 Testing Ticketed Event Payment Flow...\n');

    // Step 1: Login as user
    console.log('1️⃣ Logging in as user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ User logged in successfully\n');

    // Step 2: Get available events
    console.log('2️⃣ Fetching available events...');
    const eventsResponse = await axios.get(`${API_BASE}/events`, { headers });
    
    if (!eventsResponse.data.success || !eventsResponse.data.events.length) {
      throw new Error('No events found');
    }

    // Find a ticketed event
    const ticketedEvent = eventsResponse.data.events.find(event => event.eventType === 'ticketed');
    
    if (!ticketedEvent) {
      console.log('❌ No ticketed events found. Creating a test ticketed event...');
      
      // Login as merchant to create a ticketed event
      const merchantLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'merchant@test.com',
        password: 'Merchant@123'
      });
      
      const merchantToken = merchantLogin.data.token;
      const merchantHeaders = { Authorization: `Bearer ${merchantToken}` };
      
      // Create a test ticketed event
      const newEventResponse = await axios.post(`${API_BASE}/events`, {
        title: 'Test Concert 2026',
        description: 'A test concert for payment flow testing',
        category: 'Music',
        eventType: 'ticketed',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        time: '19:00',
        location: 'Test Venue',
        ticketTypes: [
          { name: 'Regular', price: 500, quantityTotal: 100, quantitySold: 0 },
          { name: 'VIP', price: 1000, quantityTotal: 50, quantitySold: 0 }
        ]
      }, { headers: merchantHeaders });
      
      if (!newEventResponse.data.success) {
        throw new Error('Failed to create test event');
      }
      
      console.log('✅ Test ticketed event created\n');
      
      // Use the newly created event
      const createdEvent = newEventResponse.data.event;
      console.log(`📅 Using event: ${createdEvent.title} (ID: ${createdEvent._id})\n`);
      
      // Step 3: Test ticket booking
      console.log('3️⃣ Testing ticket booking...');
      const bookingData = {
        eventId: createdEvent._id,
        ticketType: 'Regular',
        quantity: 2,
        paymentMethod: 'Card'
      };
      
      const bookingResponse = await axios.post(`${API_BASE}/event-bookings/ticketed`, bookingData, { headers });
      
      if (!bookingResponse.data.success) {
        throw new Error(`Booking failed: ${bookingResponse.data.message}`);
      }
      
      const booking = bookingResponse.data.booking;
      console.log('✅ Ticket booking successful!');
      console.log(`   Booking ID: ${booking._id}`);
      console.log(`   Ticket ID: ${booking.ticketId}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Payment Status: ${booking.paymentStatus}`);
      console.log(`   Total Price: ₹${booking.totalPrice}\n`);
      
      // Step 4: Verify booking in user's bookings
      console.log('4️⃣ Verifying booking in user dashboard...');
      const userBookingsResponse = await axios.get(`${API_BASE}/payments/user/bookings`, { headers });
      
      if (!userBookingsResponse.data.success) {
        throw new Error('Failed to fetch user bookings');
      }
      
      const userBookings = userBookingsResponse.data.bookings;
      const createdBooking = userBookings.find(b => b._id === booking._id);
      
      if (!createdBooking) {
        throw new Error('Booking not found in user dashboard');
      }
      
      console.log('✅ Booking verified in user dashboard');
      console.log(`   Found booking: ${createdBooking.eventTitle}`);
      console.log(`   Status: ${createdBooking.status}`);
      console.log(`   Payment Status: ${createdBooking.paymentStatus}\n`);
      
      // Step 5: Check updated event ticket availability
      console.log('5️⃣ Checking updated ticket availability...');
      const updatedEventResponse = await axios.get(`${API_BASE}/events/${createdEvent._id}`, { headers });
      
      if (!updatedEventResponse.data.success) {
        throw new Error('Failed to fetch updated event');
      }
      
      const updatedEvent = updatedEventResponse.data.event;
      const regularTicket = updatedEvent.ticketTypes.find(t => t.name === 'Regular');
      
      console.log('✅ Ticket availability updated');
      console.log(`   Regular tickets sold: ${regularTicket.quantitySold}/${regularTicket.quantityTotal}`);
      console.log(`   Available tickets: ${regularTicket.quantityTotal - regularTicket.quantitySold}\n`);
      
      console.log('🎉 All tests passed! Ticketed payment flow is working correctly.');
      
    } else {
      console.log(`📅 Found ticketed event: ${ticketedEvent.title} (ID: ${ticketedEvent._id})\n`);
      
      // Continue with existing event...
      console.log('3️⃣ Testing ticket booking...');
      const bookingData = {
        eventId: ticketedEvent._id,
        ticketType: ticketedEvent.ticketTypes[0].name,
        quantity: 1,
        paymentMethod: 'Card'
      };
      
      const bookingResponse = await axios.post(`${API_BASE}/event-bookings/ticketed`, bookingData, { headers });
      
      if (!bookingResponse.data.success) {
        throw new Error(`Booking failed: ${bookingResponse.data.message}`);
      }
      
      console.log('✅ Ticket booking successful!');
      console.log('🎉 Ticketed payment flow is working correctly.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testTicketedPaymentFlow();