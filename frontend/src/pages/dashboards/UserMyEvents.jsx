import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FiCalendar, FiMapPin, FiCheckCircle, FiClock, FiXCircle, FiCreditCard, FiDownload, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import PaymentModal from "../../components/PaymentModal";
import TicketModal from "../../components/TicketModal";
import RatingModal from "../../components/RatingModal";

const UserMyEvents = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // Modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/bookings/my-bookings`, {
        headers: authHeaders(token),
      });
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
      toast.error("Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await axios.put(`${API_BASE}/bookings/${bookingId}/cancel`, {}, {
        headers: authHeaders(token),
      });
      toast.success("Booking cancelled successfully");
      fetchMyBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handlePayNow = (booking) => {
    setSelectedBooking(booking);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    fetchMyBookings();
  };

  const handleViewTicket = (booking) => {
    setSelectedBooking(booking);
    setTicketModalOpen(true);
  };

  const handleRateEvent = (booking) => {
    setSelectedBooking(booking);
    setRatingModalOpen(true);
  };

  const handleRatingSuccess = () => {
    setRatingModalOpen(false);
    fetchMyBookings();
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
        return { icon: <FiCheckCircle />, color: "bg-green-100 text-green-700", label: "Confirmed" };
      case "pending":
        return { icon: <FiClock />, color: "bg-amber-100 text-amber-700", label: "Pending Approval" };
      case "accepted":
        return { icon: <FiCheckCircle />, color: "bg-blue-100 text-blue-700", label: "Accepted - Pay Now" };
      case "paid":
        return { icon: <FiCreditCard />, color: "bg-purple-100 text-purple-700", label: "Paid - Confirming" };
      case "rejected":
        return { icon: <FiXCircle />, color: "bg-red-100 text-red-700", label: "Rejected" };
      case "cancelled":
        return { icon: <FiXCircle />, color: "bg-gray-100 text-gray-700", label: "Cancelled" };
      default:
        return { icon: <FiClock />, color: "bg-amber-100 text-amber-700", label: status || "Pending" };
    }
  };

  const getActionButtons = (booking) => {
    const status = booking.status?.toLowerCase();
    const eventDate = new Date(booking.eventDate);
    const isPast = eventDate < new Date();

    const buttons = [];

    // Pay Now button for accepted bookings
    if (status === "accepted") {
      buttons.push(
        <button
          key="pay"
          onClick={() => handlePayNow(booking)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
        >
          Pay Now
        </button>
      );
    }

    // View Ticket button for confirmed/completed bookings with ticket
    if ((status === "confirmed" || status === "completed") && booking.ticket?.ticketNumber) {
      buttons.push(
        <button
          key="ticket"
          onClick={() => handleViewTicket(booking)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
        >
          <FiDownload size={14} />
          View Ticket
        </button>
      );
    }

    // Cancel button for pending/accepted bookings
    if (["pending", "accepted"].includes(status)) {
      buttons.push(
        <button
          key="cancel"
          onClick={() => handleCancelBooking(booking._id)}
          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
        >
          Cancel
        </button>
      );
    }

    // Rate button for completed bookings without rating
    if (status === "completed" && !booking.rating?.score && isPast) {
      buttons.push(
        <button
          key="rate"
          onClick={() => handleRateEvent(booking)}
          className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition text-sm font-medium flex items-center gap-2"
        >
          <FiStar size={14} />
          Rate Event
        </button>
      );
    }

    return buttons;
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "TBD") return "Date TBD";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date TBD";
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
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

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") {
      const eventDate = new Date(booking.eventDate);
      return eventDate >= new Date() && !["cancelled", "rejected"].includes(booking.status);
    }
    if (activeTab === "past") {
      const eventDate = new Date(booking.eventDate);
      return eventDate < new Date();
    }
    return true;
  });

  return (
    <UserLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">My Bookings</h2>
        <p className="text-gray-600 mt-1">Manage your event bookings and tickets</p>
      </section>

      {/* Stats Summary */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-amber-600">
            {bookings.filter((b) => ["pending", "accepted"].includes(b.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">
            {bookings.filter((b) => ["confirmed", "completed"].includes(b.status)).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">To Rate</p>
          <p className="text-2xl font-bold text-blue-600">
            {bookings.filter((b) => b.status === "completed" && !b.rating?.score).length}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white rounded-xl shadow-sm p-2 mb-6">
        <div className="flex gap-2">
          {["all", "upcoming", "past"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500 text-lg">No bookings found</p>
          <p className="text-gray-400 mt-2">You haven't booked any events yet</p>
          <button
            onClick={() => navigate("/dashboard/user/browse")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <section className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const actionButtons = getActionButtons(booking);
            
            return (
              <article
                key={booking._id}
                className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.serviceTitle}
                        </h3>
                        <p className="text-sm text-gray-500">{booking.serviceCategory}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiCalendar className="text-gray-400" />
                        <span className="text-sm">{formatDate(booking.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiClock className="text-gray-400" />
                        <span className="text-sm">{formatTime(booking.eventTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMapPin className="text-gray-400" />
                        <span className="text-sm">{booking.location || "Location TBD"}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm font-medium">{formatPrice(booking.totalPrice)}</span>
                        {booking.ticket?.ticketType && (
                          <span className="text-xs text-gray-400">({booking.ticket.ticketType})</span>
                        )}
                      </div>
                    </div>

                    {/* Show merchant response message if rejected */}
                    {booking.status === "rejected" && booking.merchantResponse?.message && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                        <strong>Merchant message:</strong> {booking.merchantResponse.message}
                      </div>
                    )}

                    {/* Show rating if exists */}
                    {booking.rating?.score && (
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-amber-500">{"⭐".repeat(booking.rating.score)}</span>
                        <span className="text-sm text-gray-600">{booking.rating.review}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Booked on {formatDate(booking.createdAt)}
                        {booking.ticket?.ticketNumber && (
                          <span className="ml-2 text-blue-600">• Ticket: {booking.ticket.ticketNumber}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {actionButtons}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && selectedBooking && (
        <PaymentModal
          booking={selectedBooking}
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Ticket Modal */}
      {ticketModalOpen && selectedBooking && (
        <TicketModal
          booking={selectedBooking}
          isOpen={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
        />
      )}

      {/* Rating Modal */}
      {ratingModalOpen && selectedBooking && (
        <RatingModal
          booking={selectedBooking}
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          onSuccess={handleRatingSuccess}
        />
      )}
    </UserLayout>
  );
};

export default UserMyEvents;
