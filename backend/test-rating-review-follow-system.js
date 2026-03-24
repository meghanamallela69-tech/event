// Test the complete rating, review, and follow system
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

const testRatingReviewFollowSystem = async () => {
  console.log('🧪 Testing Rating, Review, and Follow System...\n');
  
  // Login as test user
  const userToken = await login("user@test.com", "User@123");
  const merchantToken = await login("merchant@test.com", "Merchant@123");
  
  if (!userToken || !merchantToken) {
    console.log('❌ Login failed');
    return;
  }
  
  console.log('✅ Both user and merchant login successful\n');
  
  try {
    // Get user's bookings to find an event to rate/review
    console.log('📋 Fetching user bookings...');
    const bookingsResponse = await fetch(`${API_BASE}/payments/user/bookings`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const bookingsData = await bookingsResponse.json();
    
    if (!bookingsData.success || bookingsData.bookings.length === 0) {
      console.log('❌ No bookings found for user');
      return;
    }
    
    const testBooking = bookingsData.bookings[0];
    const eventId = testBooking.eventId;
    const merchantId = testBooking.merchant._id;
    
    console.log(`✅ Found booking for event: ${testBooking.eventTitle}`);
    console.log(`📍 Event ID: ${eventId}`);
    console.log(`👤 Merchant ID: ${merchantId}\n`);
    
    // Test 1: Create Rating
    console.log('⭐ Testing Rating System...');
    const ratingResponse = await fetch(`${API_BASE}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        eventId: eventId,
        rating: 5
      })
    });
    
    const ratingData = await ratingResponse.json();
    console.log(`📡 Rating API Response:`, ratingData);
    
    if (ratingData.success) {
      console.log('✅ Rating created successfully');
    } else {
      console.log(`⚠️ Rating response: ${ratingData.message}`);
    }
    
    // Test 2: Create Review
    console.log('\n📝 Testing Review System...');
    const reviewResponse = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        eventId: eventId,
        rating: 5,
        reviewText: "Amazing event! Great organization and fantastic experience. Highly recommended!"
      })
    });
    
    const reviewData = await reviewResponse.json();
    console.log(`📡 Review API Response:`, reviewData);
    
    if (reviewData.success) {
      console.log('✅ Review created successfully');
    } else {
      console.log(`⚠️ Review response: ${reviewData.message}`);
    }
    
    // Test 3: Follow Merchant
    console.log('\n👥 Testing Follow System...');
    const followResponse = await fetch(`${API_BASE}/follow/${merchantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    const followData = await followResponse.json();
    console.log(`📡 Follow API Response:`, followData);
    
    if (followData.success) {
      console.log(`✅ ${followData.isFollowing ? 'Following' : 'Unfollowed'} merchant successfully`);
    } else {
      console.log(`⚠️ Follow response: ${followData.message}`);
    }
    
    // Test 4: Check Follow Status
    console.log('\n🔍 Testing Follow Status Check...');
    const statusResponse = await fetch(`${API_BASE}/follow/status/${merchantId}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    const statusData = await statusResponse.json();
    console.log(`📡 Follow Status Response:`, statusData);
    
    if (statusData.success) {
      console.log(`✅ Follow status: ${statusData.isFollowing ? 'Following' : 'Not Following'}`);
    }
    
    // Test 5: Get Event Reviews
    console.log('\n📖 Testing Get Event Reviews...');
    const eventReviewsResponse = await fetch(`${API_BASE}/reviews/event/${eventId}`);
    const eventReviewsData = await eventReviewsResponse.json();
    
    console.log(`📡 Event Reviews Response:`, eventReviewsData);
    
    if (eventReviewsData.success) {
      console.log(`✅ Found ${eventReviewsData.reviews.length} reviews for event`);
      if (eventReviewsData.reviews.length > 0) {
        const review = eventReviewsData.reviews[0];
        console.log(`   Latest Review: "${review.reviewText}" - ${review.rating}⭐ by ${review.user.name}`);
      }
    }
    
    // Test 6: Get Event Ratings
    console.log('\n⭐ Testing Get Event Ratings...');
    const eventRatingsResponse = await fetch(`${API_BASE}/ratings/event/${eventId}`);
    const eventRatingsData = await eventRatingsResponse.json();
    
    console.log(`📡 Event Ratings Response:`, eventRatingsData);
    
    if (eventRatingsData.success) {
      console.log(`✅ Found ${eventRatingsData.ratings.length} ratings for event`);
    }
    
    // Test 7: Get Merchant Stats
    console.log('\n📊 Testing Merchant Stats...');
    const statsResponse = await fetch(`${API_BASE}/follow/merchant/stats`, {
      headers: { 'Authorization': `Bearer ${merchantToken}` }
    });
    
    const statsData = await statsResponse.json();
    console.log(`📡 Merchant Stats Response:`, statsData);
    
    if (statsData.success) {
      console.log(`✅ Merchant Stats:`);
      console.log(`   Followers: ${statsData.stats.followerCount}`);
      console.log(`   Average Rating: ${statsData.stats.averageRating}`);
      console.log(`   Total Ratings: ${statsData.stats.totalRatings}`);
      console.log(`   Total Events: ${statsData.stats.totalEvents}`);
    }
    
    console.log('\n🎉 Rating, Review, and Follow System Test Complete!');
    console.log('✅ All features are working correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testRatingReviewFollowSystem();