// Test User Dashboard Overview APIs
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function testSearchAPI() {
  console.log('\n🔍 Testing Search Events API...');
  
  try {
    // Test 1: Search by keyword
    console.log('\n1. Search by keyword "wedding"');
    const searchResponse = await axios.get(`${API_BASE}/events/search`, {
      headers,
      params: { keyword: 'wedding' }
    });
    
    console.log(`✅ Found ${searchResponse.data.count} events`);
    if (searchResponse.data.events.length > 0) {
      console.log('First result:', searchResponse.data.events[0].title);
    }
    
    // Test 2: Search by category
    console.log('\n2. Search by category "Party"');
    const categoryResponse = await axios.get(`${API_BASE}/events/search`, {
      headers,
      params: { keyword: 'party' }
    });
    
    console.log(`✅ Found ${categoryResponse.data.count} events`);
    
    // Test 3: Empty search (should return all)
    console.log('\n3. Empty search (returns all events)');
    const allResponse = await axios.get(`${API_BASE}/events/search`, {
      headers,
      params: { keyword: '' }
    });
    
    console.log(`✅ Total events: ${allResponse.data.count}`);
    
  } catch (error) {
    console.error('❌ Search API Error:', error.response?.data || error.message);
  }
}

async function testRecentBookingsAPI() {
  console.log('\n📅 Testing Recent Bookings API...');
  
  try {
    // Test 1: Get recent bookings (default limit 3)
    console.log('\n1. Get recent bookings (limit=3)');
    const bookingsResponse = await axios.get(`${API_BASE}/events/recent-bookings`, {
      headers,
      params: { limit: 3 }
    });
    
    console.log(`✅ Found ${bookingsResponse.data.count} recent bookings`);
    
    if (bookingsResponse.data.bookings.length > 0) {
      console.log('\nRecent Bookings:');
      bookingsResponse.data.bookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. ${booking.serviceTitle}`);
        console.log(`   Date: ${new Date(booking.eventDate).toLocaleDateString()}`);
        console.log(`   Amount: ₹${booking.totalPrice}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Has Image: ${booking.eventImage ? '✅' : '❌'}`);
      });
    } else {
      console.log('ℹ️  No bookings found for this user');
    }
    
    // Test 2: Get different limit
    console.log('\n2. Get recent bookings (limit=1)');
    const singleResponse = await axios.get(`${API_BASE}/events/recent-bookings`, {
      headers,
      params: { limit: 1 }
    });
    
    console.log(`✅ Found ${singleResponse.data.count} booking(s)`);
    
  } catch (error) {
    console.error('❌ Recent Bookings API Error:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🧪 USER DASHBOARD OVERVIEW - API TESTS');
  console.log('='.repeat(60));
  
  await testSearchAPI();
  await testRecentBookingsAPI();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ ALL TESTS COMPLETED');
  console.log('='.repeat(60));
  console.log('\n📝 Next Steps:');
  console.log('1. Open http://localhost:5173/dashboard/user');
  console.log('2. Test search bar functionality');
  console.log('3. Verify recent bookings table displays correctly');
  console.log('4. Check responsive design on mobile');
  console.log('');
}

// Run tests
runAllTests().catch(console.error);
