import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaUser, FaCalendarAlt, FaClock, FaTicketAlt, FaCreditCard, FaCheckCircle, FaHourglassHalf, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminBookings = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Loading admin bookings from:", `${API_BASE}/admin/bookings`);
      const response = await axios.get(`${API_BASE}/admin/bookings`, { headers: authHeaders(token) });
      console.log("Admin bookings response:", response.data);
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to load bookings: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setActionLoading(bookingId);
      
      const response = await axios.put(
        `${API_BASE}/event-bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success(`Booking status updated to ${newStatus} successfully!`);
        await loadBookings();
      } else {
        toast.error(response.data.message || "Failed to update booking status");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(error.response?.data?.message || "Failed to update booking status");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (booking) => {
    const status = booking.bookingStatus?.toLowerCase() || "pending";

    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            <FaCheckCircle className="text-xs" />
            Completed
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <FaCheckCircle className="text-xs" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <FaClock className="text-xs" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    const status = paymentStatus?.toLowerCase() || "pending";
    
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <FaCreditCard className="text-xs" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <FaClock className="text-xs" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return booking.bookingStatus === "pending";
    if (activeTab === "confirmed") return booking.bookingStatus === "confirmed";
    if (activeTab === "completed") return booking.bookingStatus === "completed";
    if (activeTab === "paid") return booking.paymentStatus === "paid";
    return true;
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">All Bookings</h2>
        <p className="text-gray-600">Manage all event bookings across the platform ({bookings.length} total)</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {bookings.filter(b => b.bookingStatus === "pending").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">
            {bookings.filter(b => b.bookingStatus === "confirmed").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="text-2xl font-bold text-purple-600">
            {bookings.filter(b => b.bookingStatus === "completed").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Paid</p>
          <p className="text-2xl font-bold text-blue-600">
            {bookings.filter(b => b.paymentStatus === "paid").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-gray-500 text-sm">Avg Rating</p>
          <p className="text-2xl font-bold text-orange-600">
            {bookings.filter(b => b.rating).length > 0 
              ? (bookings.filter(b => b.rating).reduce((sum, b) => sum + b.rating, 0) / bookings.filter(b => b.rating).length).toFixed(1)
              : "N/A"
            }
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 mb-6 border">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "confirmed", label: "Confirmed" },
            { key: "completed", label: "Completed" },
            { key: "paid", label: "Paid" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <FaTicketAlt className="mx-auto text-4xl text-gray-400 mb-3" />
          <p className="text-gray-500 text-lg">No bookings found</p>
          <p className="text-gray-400 mt-2">
            {activeTab === "all" 
              ? "Event bookings will appear here once users start booking events" 
              : `No ${activeTab} bookings found`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Event Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Merchant</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Booking Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Payment Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Rating</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{booking.eventTitle || "Event"}</p>
                      <p className="text-xs text-gray-500">{formatDate(booking.eventDate)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{booking.merchant?.name || booking.merchantName || "Unknown"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.attendeeName || booking.user?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{booking.attendeeEmail || booking.user?.email || "No email"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking)}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(booking.paymentStatus)}
                    </td>
                    <td className="px-6 py-4">
                      {booking.rating ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium text-gray-900">{booking.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">/5</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">₹{(booking.totalPrice || 0).toLocaleString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;