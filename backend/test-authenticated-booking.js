import fetch from 'node-fetch';

const testAuthenticatedBooking = async () => {
  try {
    console.log('🧪 Testing Authenticated Booking Flow');
    console.log('====================================');
    
    // Step 1: Login to get token
    console.log('\n1. Logging in as test user...');
    const loginResponse = await fetch('http://localhost:4001/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'user@test.com',
        password: 'User@123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }
    
    console.log('✅ Login successful');
    console.log('   User:', loginData.user.name);
    console.log('   Role:', loginData.user.role);
    console.log('   Token:', loginData.token.substring(0, 20) + '...');
    
    const token = loginData.token;
    
    // Step 2: Get events to find a ticketed event
    console.log('\n2. Getting events...');
    const eventsResponse = await fetch('http://localhost:4001/api/v1/events', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const eventsData = await eventsResponse.json();
    
    if (!eventsData.success) {
      console.error('❌ Failed to get events:', eventsData.message);
      return;
    }
    
    const ticketedEvent = eventsData.events.find(e => e.eventType === 'ticketed');
    
    if (!ticketedEvent) {
      console.error('❌ No ticketed events found');
      return;
    }
    
    console.log('✅ Found ticketed event:', ticketedEvent.title);
    console.log('   Event ID:', ticketedEvent._id);
    console.log('   Ticket Types:', ticketedEvent.ticketTypes?.length || 0);
    
    if (ticketedEvent.ticketTypes && ticketedEvent.ticketTypes.length > 0) {
      ticketedEvent.ticketTypes.forEach((ticket, i) => {
        console.log(`   ${i+1}. ${ticket.name}: ₹${ticket.price} (${ticket.quantityTotal - ticket.quantitySold} available)`);
      });
    }
    
    // Step 3: Create booking
    console.log('\n3. Creating ticket booking...');
    const bookingResponse = await fetch('http://localhost:4001/api/v1/bookings/ticket-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        eventId: ticketedEvent._id,
        ticketType: ticketedEvent.ticketTypes?.[0]?.name || 'Regular',
        quantity: 1,
        totalPrice: ticketedEvent.ticketTypes?.[0]?.price || 500
      })
    });
    
    const bookingData = await bookingResponse.json();
    
    if (!bookingData.success) {
      console.error('❌ Booking failed:', bookingData.message);
      return;
    }
    
    console.log('✅ Booking created successfully!');
    console.log('   Booking ID:', bookingData.booking._id);
    console.log('   Status:', bookingData.booking.status);
    console.log('   Payment Status:', bookingData.booking.paymentStatus);
    console.log('   Total Price:', bookingData.booking.totalPrice);
    
    // Step 4: Process payment
    console.log('\n4. Processing payment...');
    const paymentResponse = await fetch('http://localhost:4001/api/v1/bookings/ticket-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bookingId: bookingData.booking._id,
        paymentMethod: 'Card',
        paymentId: `PAY-${Date.now()}-TEST`
      })
    });
    
    const paymentData = await paymentResponse.json();
    
    if (!paymentData.success) {
      console.error('❌ Payment failed:', paymentData.message);
      return;
    }
    
    console.log('✅ Payment processed successfully!');
    console.log('   Payment Status:', paymentData.booking.paymentStatus);
    console.log('   Booking Status:', paymentData.booking.status);
    console.log('   Ticket Generated:', paymentData.booking.ticketGenerated);
    
    console.log('\n🎉 COMPLETE BOOKING FLOW TEST SUCCESSFUL!');
    console.log('✅ Authentication: Working');
    console.log('✅ Booking Creation: Working');
    console.log('✅ Payment Processing: Working');
    console.log('✅ All endpoints functional');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAuthenticatedBooking();