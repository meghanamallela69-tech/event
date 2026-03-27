import axios from 'axios';

// Test coupon API for Wedding event
const testWeddingCoupons = async () => {
  try {
    console.log('\n=== TESTING WEDDING EVENT COUPONS ===\n');
    
    // First, login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user@gmail.com',
      password: 'password'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully\n');
    
    // Test Wedding Event coupons
    console.log('Testing Wedding Event (69b799063ddecddff43583f5)...');
    const weddingResponse = await axios.get(
      'http://localhost:5000/api/coupons/available?eventId=69b799063ddecddff43583f5&totalAmount=50000',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Wedding Event Response:');
    console.log(JSON.stringify(weddingResponse.data, null, 2));
    
    if (weddingResponse.data.coupons && weddingResponse.data.coupons.length > 0) {
      console.log('\n✅ SUCCESS! Found', weddingResponse.data.coupons.length, 'coupon(s)');
      weddingResponse.data.coupons.forEach(c => {
        console.log(`  - ${c.code}: ${c.discountValue}% off (min: ₹${c.minAmount})`);
      });
    } else {
      console.log('\n❌ NO COUPONS FOUND for Wedding event!');
    }
    
    // Test Music Event coupons
    console.log('\nTesting Music Event (69b799843ddecddff4358402)...');
    const musicResponse = await axios.get(
      'http://localhost:5000/api/coupons/available?eventId=69b799843ddecddff4358402&totalAmount=5000',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Music Event Response:');
    console.log(JSON.stringify(musicResponse.data, null, 2));
    
    if (musicResponse.data.coupons && musicResponse.data.coupons.length > 0) {
      console.log('\n✅ SUCCESS! Found', musicResponse.data.coupons.length, 'coupon(s)');
      musicResponse.data.coupons.forEach(c => {
        console.log(`  - ${c.code}: ${c.discountValue}% off (min: ₹${c.minAmount})`);
      });
    } else {
      console.log('\n❌ NO COUPONS FOUND for Music event!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testWeddingCoupons();
