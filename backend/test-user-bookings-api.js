// Test the user bookings API endpoint
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

const testUserBookingsAPI = async () => {
  console.log('🧪 Testing User Bookings API...\n');
  
  // Login as test user
  const userToken = await login("user@test.com", "User@123");
  
  if (!userToken) {
    console.log('❌ User login failed');
    return;
  }
  
  console.log('✅ User login successful\n');
  
  try {
    // Test the API endpoint that frontend calls
    const response = await fetch(`${API_BASE}/payments/user/bookings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`\n✅ API working correctly!`);
      console.log(`📊 Found ${data.bookings.length} bookings`);
      
      if (data.bookings.length > 0) {
        console.log('\n📋 Bookings Summary:');
        data.bookings.forEach((booking, index) => {
          console.log(`${index + 1}. ${booking.eventTitle}`);
          console.log(`   Type: ${booking.eventType}`);
          console.log(`   Status: ${booking.status}`);
          console.log(`   Payment: ${booking.paymentStatus}`);
          console.log(`   Can Pay: ${booking.canPay}`);
          console.log(`   Is Confirmed: ${booking.isConfirmed}`);
          console.log('');
        });
      }
    } else {
      console.log(`❌ API returned error: ${data.message}`);
    }
    
  } catch (error) {
    console.error('❌ API call failed:', error.message);
  }
};

testUserBookingsAPI();