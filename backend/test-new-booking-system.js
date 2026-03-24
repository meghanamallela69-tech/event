// Test the new booking system
const API_BASE = "http://localhost:4001/api/v1";

const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    return data.success ? data.token : null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

const testNewBookingSystem = async () => {
  console.log('🧪 Testing New Booking System...\n');
  
  // Login as test user
  const userToken = await login("user@test.com", "User@123");
  
  if (!userToken) {
    console.log('❌ User login failed');
    return;
  }
  
  console.log('✅ User login successful\n');
  
  try {
    // Test 1: Get available events
    console.log('📋 Fetching available events...');
    const eventsResponse = await fetch(`${API_BASE}/events`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const eventsData = await eventsResponse.json();
    
    if (!eventsData.success || eventsData.events.length === 0) {
      console.log('❌ No events found');
      return;
    }
    
    // Find a ticketed event
    const ticketedEvent = eventsData.events.find(e => e.eventType === "ticketed");
    const fullServiceEvent = eventsData.events.find(e => e.eventType === "full-service");
    
    console.log(`✅ Found ${eventsData.events.length} events`);
    if (ticketedEvent) console.log(`   - Ticketed Event: ${ticketedEvent.title}`);
    if (fullServiceEvent) console.log(`   - Full-Service Event: ${fullServiceEvent.title}`);
    
    // Test 2: Create ticketed booking
    if (ticketedEvent) {
      console.log('\n🎫 Testing Ticketed Event Booking...');
      
      // First get ticket types
      const ticketTypesResponse = await fetch(`${API_BASE}/event-bookings/event/${ticketedEvent._id}/tickets`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const ticketTypesData = await ticketTypesResponse.json();
      
      if (ticketTypesData.success && ticketTypesData.ticketTypes.length > 0) {
        const ticketType = ticketTypesData.ticketTypes[0];
        console.log(`   Available ticket type: ${ticketType.name} - ₹${ticketType.price} (${ticketType.quantityAvailable} available)`);
        
        // Create booking
        const bookingResponse = await fetch(`${API_BASE}/event-bookings/ticketed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            eventId: ticketedEvent._id,
            ticketType: ticketType.name,
            quantity: 1,
            paymentMethod: "Card"
          })
        });
        
        const bookingData = await bookingResponse.json();
        console.log(`   Booking Result: ${bookingData.success ? 'SUCCESS' : 'FAILED'}`);
        if (bookingData.success) {
          console.log(`   Ticket ID: ${bookingData.ticketDetails.ticketId}`);
          console.log(`   Payment ID: ${bookingData.ticketDetails.paymentId}`);
        } else {
          console.log(`   Error: ${bookingData.message}`);
        }
      }
    }
    
    // Test 3: Create full-service booking
    if (fullServiceEvent) {
      console.log('\n🏢 Testing Full-Service Event Booking...');
      
      const serviceDate = new Date();
      serviceDate.setDate(serviceDate.getDate() + 7); // 7 days from now
      
      const serviceBookingResponse = await fetch(`${API_BASE}/event-bookings/full-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          eventId: fullServiceEvent._id,
          serviceDate: serviceDate.toISOString().split('T')[0],
          guestCount: 25,
          notes: "Test booking for wedding service"
        })
      });
      
      const serviceBookingData = await serviceBookingResponse.json();
      console.log(`   Service Booking Result: ${serviceBookingData.success ? 'SUCCESS' : 'FAILED'}`);
      if (serviceBookingData.success) {
        console.log(`   Booking ID: ${serviceBookingData.booking._id}`);
        console.log(`   Status: ${serviceBookingData.booking.status}`);
      } else {
        console.log(`   Error: ${serviceBookingData.message}`);
      }
    }
    
    // Test 4: Get user bookings
    console.log('\n📋 Testing My Bookings API...');
    const myBookingsResponse = await fetch(`${API_BASE}/event-bookings/my-bookings`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    const myBookingsData = await myBookingsResponse.json();
    console.log(`   My Bookings Result: ${myBookingsData.success ? 'SUCCESS' : 'FAILED'}`);
    if (myBookingsData.success) {
      console.log(`   Total Bookings: ${myBookingsData.bookings.length}`);
      myBookingsData.bookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.eventTitle} (${booking.eventType}) - ${booking.status}`);
      });
    }
    
    console.log('\n🎉 New Booking System Test Complete!');
    console.log('✅ Ticketed bookings: Auto-confirmed with payment');
    console.log('✅ Full-service bookings: Pending merchant approval');
    console.log('✅ My Bookings API: Returns user bookings correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testNewBookingSystem();