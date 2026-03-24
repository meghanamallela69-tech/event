import axios from 'axios';

const testTicketBookingEndpoint = async () => {
  try {
    console.log('🧪 Testing Ticket Booking Endpoint');
    console.log('==================================');
    
    // First, let's test without authentication to see the error
    console.log('\n1. Testing without authentication...');
    try {
      const response = await axios.post('http://localhost:4001/api/v1/bookings/ticket-booking', {
        eventId: '69b799843ddecddff4358402',
        ticketType: 'Regular',
        quantity: 1,
        totalPrice: 600
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.log('Expected auth error:', error.response?.status, error.response?.data?.message);
    }
    
    // Test with a mock token (this will fail but show us the endpoint structure)
    console.log('\n2. Testing with mock token...');
    try {
      const response = await axios.post('http://localhost:4001/api/v1/bookings/ticket-booking', {
        eventId: '69b799843ddecddff4358402',
        ticketType: 'Regular',
        quantity: 1,
        totalPrice: 600
      }, {
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.log('Auth error details:', error.response?.status, error.response?.data);
    }
    
    // Test the health endpoint to make sure server is responding
    console.log('\n3. Testing server health...');
    const healthResponse = await axios.get('http://localhost:4001/api/v1/health');
    console.log('Health check:', healthResponse.data);
    
    // Test events endpoint
    console.log('\n4. Testing events endpoint...');
    const eventsResponse = await axios.get('http://localhost:4001/api/v1/events');
    console.log('Events count:', eventsResponse.data.events?.length);
    
    if (eventsResponse.data.events?.length > 0) {
      const ticketedEvent = eventsResponse.data.events.find(e => e.eventType === 'ticketed');
      if (ticketedEvent) {
        console.log('Found ticketed event:', ticketedEvent.title);
        console.log('Ticket types:', ticketedEvent.ticketTypes?.length || 0);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testTicketBookingEndpoint();