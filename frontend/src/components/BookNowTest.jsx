import { useState } from "react";
import axios from "axios";
import { API_BASE, authHeaders } from "../lib/http";
import useAuth from "../context/useAuth";
import toast from "react-hot-toast";

const BookNowTest = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const testBookNow = async () => {
    setLoading(true);
    try {
      console.log("Testing Book Now functionality...");
      console.log("Token:", token ? "Present" : "Missing");
      console.log("API_BASE:", API_BASE);

      // Test API connection
      const healthResponse = await axios.get(`${API_BASE}/health`);
      console.log("Health check:", healthResponse.data);

      // Test events endpoint
      const eventsResponse = await axios.get(`${API_BASE}/events`, { 
        headers: authHeaders(token) 
      });
      console.log("Events response:", eventsResponse.data);

      if (eventsResponse.data.success && eventsResponse.data.events.length > 0) {
        const testEvent = eventsResponse.data.events[0];
        console.log("Test event:", testEvent);

        // Test booking creation
        if (testEvent.eventType === "full-service") {
          const bookingPayload = {
            eventId: testEvent._id,
            serviceDate: "2026-04-15",
            guestCount: 2,
            notes: "Test booking from Book Now button"
          };

          console.log("Creating booking with payload:", bookingPayload);

          const bookingResponse = await axios.post(
            `${API_BASE}/event-bookings/create`,
            bookingPayload,
            { headers: authHeaders(token) }
          );

          console.log("Booking response:", bookingResponse.data);
          
          if (bookingResponse.data.success) {
            toast.success("✅ Book Now functionality is working!");
          } else {
            toast.error("❌ Booking creation failed: " + bookingResponse.data.message);
          }
        } else {
          toast.info("First event is ticketed type - would open ticket modal");
        }
      } else {
        toast.error("No events found to test with");
      }

    } catch (error) {
      console.error("Book Now test error:", error);
      toast.error("❌ Book Now test failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Book Now Functionality Test</h3>
      <button
        onClick={testBookNow}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Book Now"}
      </button>
      <p className="text-sm text-gray-600 mt-2">
        This will test the Book Now button functionality and log results to console.
      </p>
    </div>
  );
};

export default BookNowTest;