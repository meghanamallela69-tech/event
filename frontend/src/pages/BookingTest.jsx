import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../lib/http";

const BookingTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAcceptBooking = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // First login as merchant
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: "merchant@test.com",
        password: "Merchant@123"
      });
      
      if (!loginResponse.data.success) {
        throw new Error("Login failed");
      }
      
      const token = loginResponse.data.token;
      const headers = { Authorization: `Bearer ${token}` };
      
      // Get booking requests
      const bookingsResponse = await axios.get(`${API_BASE}/merchant/booking-requests`, { headers });
      
      if (bookingsResponse.data.bookings.length === 0) {
        setResult({
          success: false,
          message: "No pending bookings found. Create a booking first using the booking test script."
        });
        return;
      }
      
      const bookingId = bookingsResponse.data.bookings[0]._id;
      
      // Test accept booking
      console.log("Testing accept booking with ID:", bookingId);
      console.log("API URL:", `${API_BASE}/merchant/booking-requests/${bookingId}/accept`);
      
      const acceptResponse = await axios.patch(
        `${API_BASE}/merchant/booking-requests/${bookingId}/accept`,
        {},
        { headers }
      );
      
      console.log("Accept response:", acceptResponse.data);
      
      setResult({
        success: true,
        message: "Booking accepted successfully!",
        data: acceptResponse.data
      });
      
    } catch (error) {
      console.error("Test error:", error);
      setResult({
        success: false,
        message: error.response?.data?.message || error.message,
        error: error.response?.data || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Booking Accept Test</h1>
          
          <div className="mb-6">
            <button
              onClick={testAcceptBooking}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Accept Booking"}
            </button>
          </div>
          
          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
              <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Success' : '❌ Error'}
              </h3>
              <p className={`mb-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
              {result.data && (
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
              {result.error && (
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              )}
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-600">
            <p><strong>API Base:</strong> {API_BASE}</p>
            <p><strong>Test Credentials:</strong> merchant@test.com / Merchant@123</p>
            <p><strong>Note:</strong> Make sure you have pending bookings by running the booking test script first.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTest;