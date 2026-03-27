import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

// Test the findOrCreateChat endpoint
async function testFindOrCreateChat() {
  try {
    console.log('=== Testing Find or Create Chat API ===\n');
    
    // You need to replace these with actual user IDs from your database
    const testUserId = 'YOUR_USER_ID'; // Replace with a real user ID
    const testMerchantId = 'YOUR_MERCHANT_ID'; // Replace with a real merchant ID
    
    // Get token from login (you'll need to login first)
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com', // Replace with test user email
      password: 'password123'     // Replace with test user password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received\n');
    
    // Test find or create chat
    const chatResponse = await axios.post(
      `${API_BASE}/message/find-or-create`,
      { merchantId: testMerchantId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Chat response:', chatResponse.data);
    console.log('\n=== Test Complete ===\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testFindOrCreateChat();
