import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaListAlt, FaCheck, FaTimes, FaTicketAlt, FaClock, FaCreditCard } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import toast from "react-hot-toast";

const MerchantBookings = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/bookings/merchant/my-bookings`, { 
        headers: authHeaders(token) 
      });
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleAccept = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await axios.put(
        `${API_BASE}/bookings/merchant/${bookingId}/respond`,
        { action: "accept" },
        { headers: authHeaders(token) }
      );
      toast.success("Booking accepted");
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept booking");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    const message = prompt("Enter reason for rejection (optional):");
    if (message === null) return; // User cancelled
    
    setProcessingId(bookingId);
    try {
      await axios.put(
        `${API_BASE}/bookings/merchant/${bookingId}/respond`,
        { action: "reject", message },
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

  const handleConfirm = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await axios.put(
        `${API_BASE}/bookings/merchant/${bookingId}/confirm`,
        {},
        { headers: authHeaders(token) }
      );
      toast.success("Booking confirmed and ticket generated");
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm booking");
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setProcessingId(bookingId);
    try {
      await axios.put(
        `${API_BASE}/bookings/merchant/${bookingId}/status`,
        { status: newStatus },
        { headers: authHeaders(token) }
      );
      toast.success(`Booking status updated to ${newStatus}`);
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setProcessingId(null);
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

  const formatPrice = (price) => {
    if (!price || price === 0) return "Free";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { icon: <FaClock />, color: "bg-amber-100 text-amber-700", label: "Pending Approval" };
      case "accepted":
        return { icon: <FaCheck />, color: "bg-blue-100 text-blue-700", label: "Accepted - Awaiting Payment" };
      case "paid":
        return { icon: <FaCreditCard />, color: "bg-purple-100 text-purple-700", label: "Paid - Confirm to Generate Ticket" };
      case "confirmed":
        return { icon: <FaTicketAlt />, color: "bg-green-100 text-green-700", label: "Confirmed" };
      case "rejected":
        return { icon: <FaTimes />, color: "bg-red-100 text-red-700", label: "Rejected" };
      case "cancelled":
        return { icon: <FaTimes />, color: "bg-gray-100 text-gray-700", label: "Cancelled" };
      case "completed":
        return { icon: <FaCheck />, color: "bg-green-100 text-green-700", label: "Completed" };
      default:
        return { icon: <FaClock />, color: "bg-gray-100 text-gray-700", label: status || "Unknown" };
    }
  };

  const getActionButtons = (booking) => {
    const status = booking.status?.toLowerCase();
    const buttons = [];

    // Accept/Reject for pending full-service bookings
    if (status === "pending" && booking.eventType === "full-service") {
      buttons.push(
        <button
          key="accept"
          onClick={() => handleAccept(booking._id)}
          disabled={processingId === booking._id}
          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-1"
        >
          {processingId === booking._id ? "..." : <><FaCheck size={12} /> Accept</>}
        </button>,
        <button
          key="reject"
          onClick={() => handleReject(booking._id)}
          disabled={processingId === booking._id}
          className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium flex items-center gap-1"
        >
          {processingId === booking._id ? "..." : <><FaTimes size={12} /> Reject</>}
        </button>
      );
    }

    // Confirm for paid bookings (generate ticket)
    if (status === "paid") {
      buttons.push(
        <button
          key="confirm"
          onClick={() => handleConfirm(booking._id)}
          disabled={processingId === booking._id}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-1"
        >
          {processingId === booking._id ? "..." : <><FaTicketAlt size={12} /> Confirm & Generate Ticket</>}
        </button>
      );
    }

    // Status Update Dropdown for confirmed/paid/processing bookings
    if (["confirmed", "paid", "processing"].includes(status) && booking.eventType === "full-service") {
      const currentStatus = booking.status?.toLowerCase();
      buttons.push(
        <div key="status-dropdown" className="relative inline-block">
          <select
            value={currentStatus}
            onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
            disabled={processingId === booking._id}
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-8"
            style={{ minWidth: '140px' }}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
          <FiChevronDown 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" 
            size={14} 
          />
        </div>
      );
    }

    return buttons;
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return ["pending", "accepted"].includes(booking.status);
    if (activeTab === "paid") return booking.status === "paid";
    if (activeTab === "confirmed") return ["confirmed", "completed"].includes(booking.status);
    if (activeTab === "rejected") return ["rejected", "cancelled"].includes(booking.status);
    return true;
  });

  const tabs = [
    { id: "all", label: "All", count: bookings.length },
    { id: "pending", label: "Pending", count: bookings.filter(b => ["pending", "accepted"].includes(b.status)).length },
    { id: "paid", label: "Paid", count: bookings.filter(b => b.status === "paid").length },
    { id: "confirmed", label: "Confirmed", count: bookings.filter(b => ["confirmed", "completed"].includes(b.status)).length },
  ];

  return (
    <MerchantLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Booking Requests</h2>
        <p className="text-gray-600 mt-1">Manage customer bookings for your events</p>
      </section>

      {/* Stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-600">
            {bookings.filter((b) => b.status === "pending" && b.eventType === "full-service").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Awaiting Confirmation</p>
          <p className="text-2xl font-bold text-purple-600">
            {bookings.filter((b) => b.status === "paid").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">
            {bookings.filter((b) => ["confirmed", "completed"].includes(b.status)).length}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white rounded-xl shadow-sm p-2 mb-6">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </section>

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
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const actionButtons = getActionButtons(booking);
            
            return (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{booking.serviceTitle}</h3>
                        <p className="text-sm text-gray-500">{booking.serviceCategory}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p className="font-medium">{booking.user?.name || "N/A"}</p>
                        <p className="text-gray-400 text-xs">{booking.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Event Date & Time</p>
                        <p className="font-medium">{formatDate(booking.eventDate)}</p>
                        <p className="text-gray-400 text-xs">{formatTime(booking.eventTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-medium">{formatPrice(booking.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Guests</p>
                        <p className="font-medium">{booking.guestCount || 1}</p>
                      </div>
                    </div>

                    {/* Location & Notes */}
                    {(booking.location || booking.eventLocation) && (
                      <div className="mb-2 text-sm">
                        <span className="text-gray-500">Location: </span>
                        <span className="font-medium">{booking.location || booking.eventLocation}</span>
                        <span className="text-gray-400 text-xs ml-2">({booking.locationType === "custom" ? "Custom" : "Event Location"})</span>
                      </div>
                    )}
                    {booking.notes && (
                      <div className="mb-2 text-sm">
                        <span className="text-gray-500">Notes: </span>
                        <span className="text-gray-700">{booking.notes}</span>
                      </div>
                    )}

                    {/* Ticket Info */}
                    {booking.ticket?.ticketNumber && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          <strong>Ticket:</strong> {booking.ticket.ticketNumber}
                          {booking.ticket.ticketType && <span className="ml-2">({booking.ticket.ticketType})</span>}
                        </p>
                      </div>
                    )}

                    {/* Rejection Message */}
                    {booking.status === "rejected" && booking.merchantResponse?.message && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {booking.merchantResponse.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {actionButtons.length > 0 && (
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:justify-start">
                      {actionButtons}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MerchantLayout>
  );
};

export default MerchantBookings;
