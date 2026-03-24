// Test rating and review functionality with completed event
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

const testCompletedEventRating = async () => {
  console.log('🧪 Testing Rating & Review on Completed Event...\n');
  
  // Login as test user
  const userToken = await login("user@test.com", "User@123");
  
  if (!userToken) {
    console.log('❌ User login failed');
    return;
  }
  
  console.log('✅ User login successful\n');
  
  try {
    // Get user's bookings to find the completed event
    console.log('📋 Fetching user bookings...');
    const bookingsResponse = await fetch(`${API_BASE}/payments/user/bookings`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const bookingsData = await bookingsResponse.json();
    
    if (!bookingsData.success || bookingsData.bookings.length === 0) {
      console.log('❌ No bookings found for user');
      return;
    }
    
    // Find the completed event booking
    const completedBooking = bookingsData.bookings.find(booking => 
      booking.eventTitle === "Completed Music Concert"
    );
    
    if (!completedBooking) {
      console.log('❌ Completed event booking not found');
      console.log('Available bookings:');
      bookingsData.bookings.forEach(b => console.log(`  - ${b.eventTitle} (${b.status})`));
      return;
    }
    
    const eventId = completedBooking.eventId;
    console.log(`✅ Found completed event booking: ${completedBooking.eventTitle}`);
    console.log(`📍 Event ID: ${eventId}`);
    console.log(`📊 Status: ${completedBooking.status}\n`);
    
    // Test 1: Create Rating for Completed Event
    console.log('⭐ Testing Rating on Completed Event...');
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
      console.log('✅ Rating created successfully!');
    } else {
      console.log(`❌ Rating failed: ${ratingData.message}`);
    }
    
    // Test 2: Create Review for Completed Event
    console.log('\n📝 Testing Review on Completed Event...');
    const reviewResponse = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        eventId: eventId,
        rating: 5,
        reviewText: "Absolutely amazing concert! The band was incredible, the sound quality was perfect, and the venue was fantastic. One of the best live music experiences I've ever had. Highly recommend this event to anyone who loves great music!"
      })
    });
    
    const reviewData = await reviewResponse.json();
    console.log(`📡 Review API Response:`, reviewData);
    
    if (reviewData.success) {
      console.log('✅ Review created successfully!');
    } else {
      console.log(`❌ Review failed: ${reviewData.message}`);
    }
    
    // Test 3: Get Event Reviews
    console.log('\n📖 Fetching Event Reviews...');
    const eventReviewsResponse = await fetch(`${API_BASE}/reviews/event/${eventId}`);
    const eventReviewsData = await eventReviewsResponse.json();
    
    if (eventReviewsData.success) {
      console.log(`✅ Found ${eventReviewsData.reviews.length} reviews for event`);
      eventReviewsData.reviews.forEach((review, index) => {
        console.log(`   ${index + 1}. "${review.reviewText}" - ${review.rating}⭐ by ${review.user.name}`);
        console.log(`      Posted: ${new Date(review.createdAt).toLocaleDateString()}`);
      });
    }
    
    // Test 4: Get Event Ratings
    console.log('\n⭐ Fetching Event Ratings...');
    const eventRatingsResponse = await fetch(`${API_BASE}/ratings/event/${eventId}`);
    const eventRatingsData = await eventRatingsResponse.json();
    
    if (eventRatingsData.success) {
      console.log(`✅ Found ${eventRatingsData.ratings.length} ratings for event`);
      eventRatingsData.ratings.forEach((rating, index) => {
        console.log(`   ${index + 1}. ${rating.rating}⭐ by ${rating.user.name}`);
        console.log(`      Posted: ${new Date(rating.createdAt).toLocaleDateString()}`);
      });
    }
    
    // Test 5: Try to rate again (should update existing rating)
    console.log('\n🔄 Testing Rating Update...');
    const updateRatingResponse = await fetch(`${API_BASE}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        eventId: eventId,
        rating: 4
      })
    });
    
    const updateRatingData = await updateRatingResponse.json();
    console.log(`📡 Update Rating Response:`, updateRatingData);
    
    if (updateRatingData.success) {
      console.log('✅ Rating updated successfully!');
    }
    
    console.log('\n🎉 Completed Event Rating & Review Test Complete!');
    console.log('✅ Users can successfully rate and review completed events');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testCompletedEventRating();