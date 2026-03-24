import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, authHeaders } from "../lib/http";
import useAuth from "../context/useAuth";
import toast from "react-hot-toast";

const BookingDebug = () => {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/events`);
      if (response.data.success) {
        setEvents(response.data.events);
        console.log("Events loaded:", response.data.events.length);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  };

  const testBooking = async () => {
    if (!selectedEvent) {
      toast.error("Please select an event first");
      return;
    }

    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      console.log("=== BOOKING DEBUG TEST ===");
      console.log("User:", user);
      console.log("Token:", token ? "Present" : "Missing");
      console.log("Selected Event:", selectedEvent);

      const payload = {
        eventId: selectedEvent._id,
        serviceDate: "2024-04-01",
        guestCount: 2,
        notes: "Debug test booking"
      };

      console.log("Payload:", payload);
      console.log("URL:", `${API_BASE}/event-bookings/create`);
      console.log("Headers:", authHeaders(token));

      const response = await axios.post(
        `${API_BASE}/event-bookings/create`,
        payload,
        { headers: authHeaders(token) }
      );

      console.log("✅ Success:", response.data);
      toast.success("Booking created successfully!");

    } catch (error) {
      console.error("❌ Error:", error);
      console.error("Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const testMyBookings = async () => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      console.log("=== FETCHING MY BOOKINGS ===");
      const response = await axios.get(
        `${API_BASE}/event-bookings/my-bookings`,
        { headers: authHeaders(token) }
      );

      console.log("My bookings response:", response.data);
      toast.success(`Found ${response.data.bookings?.length || 0} bookings`);

    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      toast.error("Failed to fetch bookings");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Booking Debug Page</h1>
      
      {/* Auth Status */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        <p><strong>User:</strong> {user ? `${user.name} (${user.email})` : "Not logged in"}</p>
        <p><strong>Token:</strong> {token ? "Present" : "Missing"}</p>
        <p><strong>API Base:</strong> {API_BASE}</p>
      </div>

      {/* Events List */}
      <div className="bg-white p-4 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Events ({events.length})</h2>
        <div className="space-y-2">
          {events.map(event => (
            <div 
              key={event._id} 
              className={`p-3 border rounded cursor-pointer ${
                selectedEvent?._id === event._id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedEvent(event)}
            >
              <h3 className="font-medium">{event.title}</h3>
              <p className="text-sm text-gray-600">Type: {event.eventType} | ID: {event._id}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-x-4">
        <button
          onClick={testBooking}
          disabled={loading || !selectedEvent || !token}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Booking"}
        </button>

        <button
          onClick={testMyBookings}
          disabled={!token}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test My Bookings
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure you're logged in (check auth status above)</li>
          <li>Select an event from the list</li>
          <li>Click "Test Booking" to create a test booking</li>
          <li>Click "Test My Bookings" to fetch your bookings</li>
          <li>Check the browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default BookingDebug;