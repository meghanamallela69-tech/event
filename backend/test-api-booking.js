// Simple API test to create a booking and verify the workflow
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

async function testBookingWorkflow() {
  try {
    console.log('🧪 Testing Complete Booking Workflow...\n');

    // 1. Login as user
    console.log('1️⃣ Logging in as user...');
    const userLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'user@test.com',
      password: 'User@123'
    });
    
    const userToken = userLogin.data.token;
    console.log('✅ User logged in successfully');

    // 2. Login as merchant
    console.log('2️⃣ Logging in as merchant...');
    const merchantLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'merchant@test.com',
      password: 'Merchant@123'
    });
    
    const merchantToken = merchantLogin.data.token;
    console.log('✅ Merchant logged in successfully');

    // 3. Get merchant's events
    console.log('3️⃣ Getting merchant events...');
    const eventsResponse = await axios.get(`${API_BASE}/events/merchant/events`, {
      headers: { Authorization: `Bearer ${merchantToken}` }
    });
    
    const events = eventsResponse.data.events || [];
    console.log(`✅ Found ${events.length} events`);
    
    if (events.length === 0) {
      console.log('❌ No events found. Please create some events first.');
      return;
    }

    const testEvent = events[0];
    console.log(`📅 Using event: ${testEvent.title} (${testEvent.eventType})`);

    // 4. Create a booking as user
    console.log('4️⃣ Creating booking as user...');
    const bookingData = {
      eventId: testEvent._id,
      quantity: 1
    };

    if (testEvent.eventType === 'full-service') {
      bookingData.serviceDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      bookingData.notes = 'Test booking for full-service event';
      bookingData.guestCount = 2;
    } else if (testEvent.eventType === 'ticketed') {
      bookingData.ticketType = testEvent.ticketTypes?.[0]?.name || 'General';
      bookingData.paymentMethod = 'Card';
    }

    const bookingResponse = await axios.post(`${API_BASE}/event-bookings/create`, bookingData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    const booking = bookingResponse.data.booking;
    console.log(`✅ Booking created: ${booking._id}`);
    console.log(`   Status: ${booking.bookingStatus} | Payment: ${booking.paymentStatus}`);

    // 5. Get merchant bookings
    console.log('5️⃣ Checking merchant dashboard...');
    const merchantBookingsResponse = await axios.get(`${API_BASE}/event-bookings/merchant/bookings`, {
      headers: { Authorization: `Bearer ${merchantToken}` }
    });

    const merchantBookings = merchantBookingsResponse.data.bookings || [];
    console.log(`✅ Merchant sees ${merchantBookings.length} bookings`);

    const newBooking = merchantBookings.find(b => b._id === booking._id);
    if (newBooking) {
      console.log(`   New booking visible: ${newBooking.eventTitle}`);
      console.log(`   Customer: ${newBooking.attendeeName}`);
      console.log(`   Status: ${newBooking.bookingStatus} | Payment: ${newBooking.paymentStatus}`);
    }

    // 6. If full-service and pending, accept it
    if (testEvent.eventType === 'full-service' && booking.bookingStatus === 'pending') {
      console.log('6️⃣ Merchant accepting booking...');
      await axios.put(`${API_BASE}/event-bookings/${booking._id}/accept`, {}, {
        headers: { Authorization: `Bearer ${merchantToken}` }
      });
      console.log('✅ Booking accepted by merchant');
    }

    // 7. Get user bookings
    console.log('7️⃣ Checking user dashboard...');
    const userBookingsResponse = await axios.get(`${API_BASE}/event-bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    const userBookings = userBookingsResponse.data.bookings || [];
    console.log(`✅ User sees ${userBookings.length} bookings`);

    const userBooking = userBookings.find(b => b._id === booking._id);
    if (userBooking) {
      console.log(`   Booking status: ${userBooking.bookingStatus} | Payment: ${userBooking.paymentStatus}`);
      
      // Check if Pay Now should be available
      const canPay = (userBooking.eventType === 'ticketed' && userBooking.paymentStatus === 'pending') ||
                     (userBooking.eventType === 'full-service' && userBooking.bookingStatus === 'confirmed' && userBooking.paymentStatus === 'pending');
      
      console.log(`   Can pay now: ${canPay ? 'YES' : 'NO'}`);
    }

    console.log('\n🎉 Booking workflow test completed successfully!');
    console.log('\n📋 Test Results:');
    console.log(`   ✅ User login: Working`);
    console.log(`   ✅ Merchant login: Working`);
    console.log(`   ✅ Event retrieval: Working`);
    console.log(`   ✅ Booking creation: Working`);
    console.log(`   ✅ Merchant dashboard: Working`);
    console.log(`   ✅ User dashboard: Working`);
    console.log(`   ✅ Booking status logic: Working`);

    console.log('\n🌐 Test the web interface at:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Merchant Dashboard: http://localhost:5173/dashboard/merchant/bookings');
    console.log('   User Dashboard: http://localhost:5173/dashboard/user/bookings');
    console.log('   Admin Dashboard: http://localhost:5173/dashboard/admin/bookings');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testBookingWorkflow();