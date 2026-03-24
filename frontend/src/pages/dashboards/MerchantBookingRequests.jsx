import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import toast from "react-hot-toast";
import { FaTicketAlt, FaUser, FaCalendarAlt, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const MerchantBookingRequests = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Track which booking is being processed

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/merchant/booking-requests`, { headers: authHeaders(token) });
      setRequests(data?.bookings || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (id, action) => {
    let loadingToast = null;
    
    try {
      console.log(`=== FRONTEND ${action.toUpperCase()} BOOKING ===`);
      console.log(`Booking ID: ${id}`);
      console.log(`Action: ${action}`);
      console.log(`API URL: ${API_BASE}/merchant/booking-requests/${id}/${action}`);
      console.log(`Token exists: ${!!token}`);
      
      // Set loading state for this specific booking
      setActionLoading(id);
      
      // Show loading toast
      loadingToast = toast.loading(`${action === "accept" ? "Accepting" : "Rejecting"} booking...`);
      
      const response = await axios.patch(
        `${API_BASE}/merchant/booking-requests/${id}/${action}`, 
        {}, 
        { headers: authHeaders(token) }
      );
      
      console.log(`✅ ${action} response received:`, response.data);
      console.log(`Response status: ${response.status}`);
      
      // Check if response is successful
      if (response.data.success) {
        console.log(`✅ ${action} successful, showing success message`);
        // Show success message
        toast.success(response.data.message || (action === "accept" ? "Booking accepted successfully" : "Booking rejected successfully"));
        
        console.log(`🔄 Reloading booking data...`);
        // Reload the data to reflect changes
        await load();
        console.log(`✅ Data reloaded successfully`);
      } else {
        console.log(`❌ ${action} failed:`, response.data.message);
        throw new Error(response.data.message || `Failed to ${action} booking`);
      }
    } catch (error) {
      console.error(`❌ Error ${action}ing booking:`, error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Get detailed error message
      let errorMessage = `Failed to ${action} booking`;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      console.log(`🏁 ${action} operation completed, resetting loading state`);
      // Always reset loading state and dismiss toast
      setActionLoading(null);
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "TBD") return "Date TBD";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date TBD";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (error) {
      return "Date TBD";
    }
  };

  const formatServiceDate = (dateString) => {
    if (!dateString || dateString === "TBD") return "Service Date TBD";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Service Date TBD";
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long", 
        day: "numeric",
        year: "numeric"
      });
    } catch (error) {
      return "Service Date TBD";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === "TBD" || timeString === "") return "Time TBD";
    return timeString;
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
          <p className="text-gray-600 mt-1">Review and approve pending event bookings</p>
        </div>

        {/* Booking Requests */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FaTicketAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending booking requests</h3>
            <p className="text-gray-500">New booking requests will appear here when customers book your events</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Event Details</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Location & Time</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Guests</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Request Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-blue-600 text-sm" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.attendeeName || request.user?.name || "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.attendeeEmail || request.user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.serviceTitle || request.eventTitle || "Event"}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FaCalendarAlt className="text-xs" />
                            {formatServiceDate(request.eventDate || request.serviceDate)}
                          </p>
                          <p className="text-xs text-blue-600">
                            Full-Service Event
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            📍 {request.location || request.eventLocation || "Location TBD"}
                          </p>
                          <p className="text-gray-600">
                            🕒 {formatTime(request.eventTime)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          <FaTicketAlt className="text-xs" />
                          {request.guestCount || request.ticketQuantity || request.ticketCount || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {formatDate(request.createdAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Approval
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(request._id, "accept")}
                            disabled={actionLoading === request._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: actionLoading === request._id ? '#6b7280' : '#10b981',
                              color: 'white',
                              border: 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (actionLoading !== request._id) {
                                e.target.style.backgroundColor = '#059669';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (actionLoading !== request._id) {
                                e.target.style.backgroundColor = '#10b981';
                              }
                            }}
                          >
                            {actionLoading === request._id ? (
                              <FaSpinner className="text-xs animate-spin" />
                            ) : (
                              <FaCheck className="text-xs" />
                            )}
                            <span style={{ color: 'white' }}>
                              {actionLoading === request._id ? "Accepting..." : "Accept Booking"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleAction(request._id, "reject")}
                            disabled={actionLoading === request._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: actionLoading === request._id ? '#6b7280' : '#ef4444',
                              color: 'white',
                              border: 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (actionLoading !== request._id) {
                                e.target.style.backgroundColor = '#dc2626';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (actionLoading !== request._id) {
                                e.target.style.backgroundColor = '#ef4444';
                              }
                            }}
                          >
                            {actionLoading === request._id ? (
                              <FaSpinner className="text-xs animate-spin" />
                            ) : (
                              <FaTimes className="text-xs" />
                            )}
                            <span style={{ color: 'white' }}>
                              {actionLoading === request._id ? "Rejecting..." : "Reject Booking"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
};

export default MerchantBookingRequests;

