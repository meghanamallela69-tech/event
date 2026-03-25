import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaListAlt, FaCheck, FaTimes, FaTicketAlt, FaClock, FaCreditCard, FaSearch, FaFilter, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import useNotificationBadges from "../../context/useNotificationBadges";

const MerchantBookings = () => {
  const { token } = useAuth();
  const { resetBookingBadge } = useNotificationBadges();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  // Filters and search
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // View details modal
  const [viewingBooking, setViewingBooking] = useState(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/merchant/bookings`, { 
        headers: authHeaders(token) 
      });
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBookings();
    // Reset booking badge when viewing bookings page (only once)
    const timer = setTimeout(() => {
      resetBookingBadge();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadBookings]);

  const handleAccept = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await axios.put(
        `${API_BASE}/merchant/bookings/${bookingId}/status`,
        { status: "accepted" },
        { headers: authHeaders(token) }
      );
      toast.success("Booking accepted successfully!");
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept booking");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    const message = prompt("Enter reason for rejection (optional):", "");
    if (message === null) return;
    
    setProcessingId(bookingId);
    try {
      await axios.put(
        `${API_BASE}/merchant/bookings/${bookingId}/status`,
        { status: "rejected", message },
        { headers: authHeaders(token) }
      );
      toast.success("Booking rejected");
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject booking");
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      const { data } = await axios.get(`${API_BASE}/merchant/bookings/${bookingId}/details`, {
        headers: authHeaders(token)
      });
      if (data.success) {
        setViewingBooking(data.booking);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load booking details");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "TBD") return "Date TBD";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date TBD";
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Date TBD";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === "TBD" || timeString === "") return "Time TBD";
    return timeString;
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "₹0";
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-amber-100 text-amber-700", label: "Pending" },
      accepted: { color: "bg-blue-100 text-blue-700", label: "Accepted" },
      rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
      cancelled: { color: "bg-gray-100 text-gray-700", label: "Cancelled" },
      confirmed: { color: "bg-green-100 text-green-700", label: "Confirmed" },
      completed: { color: "bg-green-600 text-white", label: "Completed" },
      paid: { color: "bg-purple-100 text-purple-700", label: "Paid" },
      pending_payment: { color: "bg-yellow-100 text-yellow-700", label: "Awaiting Payment" }
    };
    
    const config = statusConfig[status?.toLowerCase()] || { color: "bg-gray-100 text-gray-700", label: status || "Unknown" };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const isPaid = paymentStatus === 'paid';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {isPaid ? 'Paid' : 'Pending'}
      </span>
    );
  };

  // Filter and search logic
  const filteredBookings = bookings.filter((booking) => {
    if (eventTypeFilter !== "all" && booking.eventType !== eventTypeFilter) {
      return false;
    }
    
    if (statusFilter !== "all" && booking.bookingStatus !== statusFilter) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const userName = booking.userName?.toLowerCase() || "";
      const eventName = booking.eventName?.toLowerCase() || "";
      const userEmail = booking.userEmail?.toLowerCase() || "";
      
      return userName.includes(query) || eventName.includes(query) || userEmail.includes(query);
    }
    
    return true;
  });

  return (
    <MerchantLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">All Bookings</h2>
        <p className="text-gray-600 mt-1">Manage all customer bookings for ticketed and full-service events</p>
      </section>

      {/* Stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Full Service</p>
          <p className="text-2xl font-bold text-blue-600">
            {bookings.filter((b) => b.eventType === "full-service").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Ticketed Events</p>
          <p className="text-2xl font-bold text-purple-600">
            {bookings.filter((b) => b.eventType === "ticketed").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-600">
            {bookings.filter((b) => b.bookingStatus === "pending" && b.eventType === "full-service").length}
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Event Types</option>
              <option value="full-service">Full Service</option>
              <option value="ticketed">Ticketed</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user name, email, or event name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Bookings Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <FaListAlt className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No bookings found</p>
          <p className="text-gray-400 mt-2">Bookings will appear here when customers register</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AddOns</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-600">
                      {booking._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900">{booking.userName}</div>
                      <div className="text-xs text-gray-500">{booking.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.eventName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.eventType === 'full-service' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {booking.eventType === 'full-service' ? 'Full Service' : 'Ticketed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(booking.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatTime(booking.time)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate" title={booking.location}>
                      {booking.location || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {booking.quantity || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {booking.addons && booking.addons.length > 0 ? (
                        <div className="space-y-1">
                          {booking.addons.map((addon, idx) => (
                            <div key={idx} className="text-xs">
                              {addon.name}: {formatCurrency(addon.price)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(booking.bookingStatus)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(booking.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {booking.eventType === 'full-service' && booking.bookingStatus === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(booking._id)}
                            disabled={processingId === booking._id}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs disabled:opacity-50"
                            title="Approve"
                          >
                            <FaCheck size={12} />
                          </button>
                          <button
                            onClick={() => handleReject(booking._id)}
                            disabled={processingId === booking._id}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs disabled:opacity-50"
                            title="Reject"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ) : booking.eventType === 'ticketed' ? (
                        <button
                          onClick={() => handleViewDetails(booking._id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs"
                          title="View Details"
                        >
                          <FaEye size={12} />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Booking Details</h3>
              <p className="text-sm text-gray-500">{viewingBooking._id}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">{viewingBooking.user?.name}</p>
                  <p className="text-sm text-gray-600">{viewingBooking.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Event</p>
                  <p className="font-medium">{viewingBooking.serviceTitle}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Event Type</p>
                  <p className="font-medium capitalize">{viewingBooking.eventType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div>{getStatusBadge(viewingBooking.status)}</div>
                </div>
              </div>
              {viewingBooking.ticket && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Ticket Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Ticket Number</p>
                      <p className="font-medium">{viewingBooking.ticket.ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ticket Type</p>
                      <p className="font-medium">{viewingBooking.ticket.ticketType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">{viewingBooking.ticket.quantity}</p>
                    </div>
                  </div>
                </div>
              )}
              {viewingBooking.addons && viewingBooking.addons.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Add-Ons</h4>
                  <div className="space-y-2">
                    {viewingBooking.addons.map((addon, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{addon.name}</span>
                        <span className="font-medium">{formatCurrency(addon.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setViewingBooking(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MerchantLayout>
  );
};

export default MerchantBookings;
