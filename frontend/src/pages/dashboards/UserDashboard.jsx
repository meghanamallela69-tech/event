import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import UserLayout from "../../components/user/UserLayout";
import SummaryCard from "../../components/admin/SummaryCard";
import { BsCalendar2Event, BsBookmarkHeart, BsSearch } from "react-icons/bs";
import { FaTicketAlt, FaBell, FaCalendarCheck, FaMapMarkerAlt, FaEye } from "react-icons/fa";
import { API_BASE, authHeaders } from "../../lib/http";

const UserDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load saved events from localStorage
  const loadSavedEvents = useCallback(() => {
    const saved = localStorage.getItem('savedEvents');
    if (saved) {
      setSavedEvents(JSON.parse(saved));
    }
  }, []);

  const loadData = useCallback(async () => {
    const headers = authHeaders(token);
    try {
      // Get user's bookings (new booking system) - backend now includes event images
      const bookingsRes = await axios.get(`${API_BASE}/bookings/my-bookings`, { headers });
      const bookings = bookingsRes.data.bookings || [];
      setRegistrations(bookings); // Using same state variable for consistency
      
      // Get recent bookings for dashboard (limit 3)
      const recentBookingsRes = await axios.get(`${API_BASE}/events/recent-bookings`, { 
        headers,
        params: { limit: 3 }
      });
      setRecentBookings(recentBookingsRes.data.bookings || []);
      
      // Extract events from bookings - create event-like objects from booking data
      const eventsFromBookings = bookings.map(booking => ({
        _id: booking.serviceId || booking._id,
        title: booking.serviceTitle,
        category: booking.serviceCategory,
        location: booking.location,
        date: booking.eventDate,
        time: booking.eventTime,
        price: booking.totalPrice,
        image: booking.eventImage // Backend now provides this
      }));
      setEvents(eventsFromBookings);
      
      // Generate notifications based on upcoming events
      const upcomingBookings = bookings.filter(
        b => new Date(b.eventDate) >= new Date()
      );
      const notifs = upcomingBookings.slice(0, 5).map(b => ({
        id: b._id,
        message: `"${b.serviceTitle}" is coming up on ${new Date(b.eventDate).toLocaleDateString()}`,
        date: b.eventDate
      }));
      setNotifications(notifs);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    }
  }, [token]);

  // Search events by keyword
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const headers = authHeaders(token);
      const response = await axios.get(`${API_BASE}/events/search`, {
        headers,
        params: { keyword: query }
      });
      
      if (response.data.success) {
        setSearchResults(response.data.events || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
    loadSavedEvents();
  }, [loadData, loadSavedEvents]);

  const stats = {
    bookings: registrations.length,
    upcoming: registrations.filter(b => new Date(b.eventDate) >= new Date()).length,
    saved: savedEvents.length,
    notifications: notifications.length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusColor = (date) => {
    if (!date) return { bg: "bg-gray-100", text: "text-gray-700", label: "Unknown" };
    const eventDate = new Date(date);
    const today = new Date();
    if (eventDate < today) {
      return { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" };
    } else if (eventDate.toDateString() === today.toDateString()) {
      return { bg: "bg-green-100", text: "text-green-700", label: "Today" };
    } else {
      return { bg: "bg-blue-100", text: "text-blue-700", label: "Upcoming" };
    }
  };

  return (
    <UserLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Welcome back, {user?.name || "User"}</h2>
        <p className="text-gray-600 mt-1">Here is an overview of your activity today</p>
      </section>

      {/* Search Bar */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <BsSearch className="text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search events by name, category, or location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 outline-none text-gray-700 text-base"
            />
            {isSearching && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Search Results ({searchResults.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {searchResults.map((event) => (
                <div
                  key={event._id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => navigate(`/dashboard/user/events/${event._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BsCalendar2Event className="text-blue-500" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-red-500" />
                          {event.location || "TBD"}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {event.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">
                        {event.price 
                          ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(event.price)
                          : "Free"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Recent Bookings Table */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Recent Bookings</h3>
            <button 
              onClick={() => navigate("/dashboard/user/bookings")}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </button>
          </div>
          
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaTicketAlt className="mx-auto text-4xl text-gray-300 mb-3" />
              <p>No recent bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking) => {
                    const statusColor = getStatusColor(booking.eventDate);
                    return (
                      <tr 
                        key={booking._id}
                        className="hover:bg-gray-50 cursor-pointer transition"
                        onClick={() => navigate(`/dashboard/user/bookings`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 font-mono">
                            #{booking._id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {booking.eventImage && (
                              <img 
                                src={booking.eventImage} 
                                alt={booking.serviceTitle}
                                className="h-10 w-10 rounded-full object-cover mr-3"
                              />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {booking.serviceTitle}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                            {booking.eventType || booking.serviceCategory || "Event"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(booking.eventDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {booking.quantity || booking.guestCount || booking.selectedTickets 
                            ? Object.values(booking.selectedTickets || {}).reduce((sum, qty) => sum + qty, 0) || 1
                            : 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {booking.totalPrice 
                              ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(booking.totalPrice)
                              : "Free"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor.bg} ${statusColor.text}`}>
                            {statusColor.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Summary Cards - Side by Side (4 per row) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }} className="mb-8">
        <SummaryCard title="Total Bookings" value={stats.bookings} icon={FaTicketAlt} color="bg-blue-600" />
        <SummaryCard title="Upcoming Events" value={stats.upcoming} icon={BsCalendar2Event} color="bg-emerald-600" />
        <SummaryCard title="Saved Events" value={stats.saved} icon={BsBookmarkHeart} color="bg-pink-600" />
        <SummaryCard title="Notifications" value={stats.notifications} icon={FaBell} color="bg-amber-600" />
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Reminders</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <FaBell className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">Don't forget!</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </UserLayout>
  );
};

export default UserDashboard;
