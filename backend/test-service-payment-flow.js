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

const testMerchant = {
  email: 'merchant@test.com',
  password: 'Merchant@123'
};

async function testServicePaymentFlow() {
  try {
    console.log('🧪 Testing Full-Service Event Payment Flow...\n');

    // Step 1: Login as user
    console.log('1️⃣ Logging in as user...');
    const userLoginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
    
    if (!userLoginResponse.data.success) {
      throw new Error('User login failed');
    }
    
    const userToken = userLoginResponse.data.token;
    const userHeaders = { Authorization: `Bearer ${userToken}` };
    console.log('✅ User logged in successfully\n');

    // Step 2: Login as merchant
    console.log('2️⃣ Logging in as merchant...');
    const merchantLoginResponse = await axios.post(`${API_BASE}/auth/login`, testMerchant);
    
    if (!merchantLoginResponse.data.success) {
      throw new Error('Merchant login failed');
    }
    
    const merchantToken = merchantLoginResponse.data.token;
    const merchantHeaders = { Authorization: `Bearer ${merchantToken}` };
    console.log('✅ Merchant logged in successfully\n');

    // Step 3: Create a full-service event
    console.log('3️⃣ Creating a full-service event...');
    const eventData = {
      title: 'Wedding Planning Service 2026',
      description: 'Complete wedding planning and management service',
      category: 'Wedding',
      eventType: 'full-service',
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      time: '10:00',
      location: 'Client Location (TBD)',
      price: 50000,
      features: ['Complete planning', 'Venue decoration', 'Catering coordination', 'Photography arrangement']
    };

    const eventResponse = await axios.post(`${API_BASE}/events`, eventData, { headers: merchantHeaders });
    
    if (!eventResponse.data.success) {
      throw new Error('Failed to create event');
    }
    
    const event = eventResponse.data.event;
    console.log(`✅ Full-service event created: ${event.title} (ID: ${event._id})\n`);

    // Step 4: User books the service
    console.log('4️⃣ User booking the service...');
    const bookingData = {
      eventId: event._id,
      serviceDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      notes: 'Looking for a complete wedding planning service for 150 guests',
      guestCount: 150
    };

    const bookingResponse = await axios.post(`${API_BASE}/event-bookings/full-service`, bookingData, { headers: userHeaders });
    
    if (!bookingResponse.data.success) {
      throw new Error(`Booking failed: ${bookingResponse.data.message}`);
    }
    
    const booking = bookingResponse.data.booking;
    console.log('✅ Service booking created successfully!');
    console.log(`   Booking ID: ${booking._id}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Payment Status: ${booking.paymentStatus}\n`);

    // Step 5: Merchant approves the booking
    console.log('5️⃣ Merchant approving the booking...');
    const approvalResponse = await axios.put(`${API_BASE}/event-bookings/${booking._id}/approve`, {}, { headers: merchantHeaders });
    
    if (!approvalResponse.data.success) {
      throw new Error('Failed to approve booking');
    }
    
    console.log('✅ Booking approved by merchant');
    console.log(`   Updated Status: ${approvalResponse.data.booking.status}\n`);

    // Step 6: User pays for the service
    console.log('6️⃣ User paying for the service...');
    const paymentData = {
      bookingId: booking._id,
      paymentMethod: 'Card',
      paymentAmount: booking.totalPrice
    };

    const paymentResponse = await axios.post(`${API_BASE}/payments/pay-service`, paymentData, { headers: userHeaders });
    
    if (!paymentResponse.data.success) {
      throw new Error(`Payment failed: ${paymentResponse.data.message}`);
    }
    
    console.log('✅ Service payment successful!');
    console.log(`   Payment ID: ${paymentResponse.data.paymentId}`);
    console.log(`   Booking Status: ${paymentResponse.data.booking.status}`);
    console.log(`   Payment Status: ${paymentResponse.data.booking.paymentStatus}\n`);

    // Step 7: Verify booking in user's dashboard
    console.log('7️⃣ Verifying booking in user dashboard...');
    const userBookingsResponse = await axios.get(`${API_BASE}/payments/user/bookings`, { headers: userHeaders });
    
    if (!userBookingsResponse.data.success) {
      throw new Error('Failed to fetch user bookings');
    }
    
    const userBookings = userBookingsResponse.data.bookings;
    const paidBooking = userBookings.find(b => b._id === booking._id);
    
    if (!paidBooking) {
      throw new Error('Paid booking not found in user dashboard');
    }
    
    console.log('✅ Booking verified in user dashboard');
    console.log(`   Event: ${paidBooking.eventTitle}`);
    console.log(`   Status: ${paidBooking.status}`);
    console.log(`   Payment Status: ${paidBooking.paymentStatus}`);
    console.log(`   Service Date: ${paidBooking.serviceDate ? new Date(paidBooking.serviceDate).toLocaleDateString() : 'TBD'}\n`);

    console.log('🎉 All tests passed! Full-service payment flow is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✓ Event created by merchant');
    console.log('   ✓ Service booked by user (pending status)');
    console.log('   ✓ Booking approved by merchant');
    console.log('   ✓ Payment processed successfully');
    console.log('   ✓ Booking confirmed and visible in dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testServicePaymentFlow();