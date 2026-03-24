import axios from "axios";

const testAuth = async () => {
  try {
    console.log("🔐 Testing authentication flow...");

    // Test login
    const loginResponse = await axios.post("http://localhost:4001/api/v1/auth/login", {
      email: "user@test.com",
      password: "User@123"
    });

    if (loginResponse.data.success) {
      console.log("✅ Login successful");
      const token = loginResponse.data.token;
      console.log("🎫 Token received:", token.substring(0, 20) + "...");

      // Test getting events
      const eventsResponse = await axios.get("http://localhost:4001/api/v1/events", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (eventsResponse.data.success && eventsResponse.data.events.length > 0) {
        console.log("✅ Events fetched successfully");
        const event = eventsResponse.data.events[0];
        console.log("📅 First event:", event.title, "Type:", event.eventType, "ID:", event._id);

        // Test booking creation
        console.log("🔄 Testing booking creation...");
        const bookingResponse = await axios.post("http://localhost:4001/api/v1/event-bookings/create", {
          eventId: event._id,
          serviceDate: "2024-04-01",
          guestCount: 2,
          notes: "Test booking from script"
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        console.log("📋 Booking response:", bookingResponse.data);

      } else {
        console.log("❌ Failed to fetch events");
      }

    } else {
      console.log("❌ Login failed:", loginResponse.data);
    }

  } catch (error) {
    console.error("❌ Test error:", error.response?.data || error.message);
  }
};

testAuth();