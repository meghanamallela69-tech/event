import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import UserLayout from "../../components/user/UserLayout";
import SummaryCard from "../../components/admin/SummaryCard";
import { BsCalendar2Event, BsBookmarkHeart } from "react-icons/bs";
import { FaTicketAlt, FaBell, FaCalendarCheck, FaMapMarkerAlt, FaEye } from "react-icons/fa";
import { API_BASE, authHeaders } from "../../lib/http";

const UserDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

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

  const recentBookings = [...registrations]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

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

      {/* Summary Cards - Side by Side (4 per row) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <SummaryCard title="Total Bookings" value={stats.bookings} icon={FaTicketAlt} color="bg-blue-600" />
        <SummaryCard title="Upcoming Events" value={stats.upcoming} icon={BsCalendar2Event} color="bg-emerald-600" />
        <SummaryCard title="Saved Events" value={stats.saved} icon={BsBookmarkHeart} color="bg-pink-600" />
        <SummaryCard title="Notifications" value={stats.notifications} icon={FaBell} color="bg-amber-600" />
      </div>

      {/* My Bookings - Card Style Side by Side */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">My Bookings</h3>
          <button 
            onClick={() => navigate("/dashboard/user/bookings")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All
          </button>
        </div>
        
        {recentBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border">
            <FaTicketAlt className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500">No bookings yet</p>
            <button 
              onClick={() => navigate("/dashboard/user/browse")}
              className="mt-3 text-blue-600 hover:underline text-sm"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {recentBookings.map((booking) => {
              const status = getStatusColor(booking.eventDate);
              
              // Get image - prioritize real event image, then category-based fallback
              const getEventImage = (booking) => {
                // First, try to use the real event image
                if (booking.eventImage) {
                  return booking.eventImage;
                }
                
                // Fallback to category-based images
                const categoryImages = {
                  "Wedding": "/wedding.jpg",
                  "Party": "/party.jpg",
                  "Music": "/party.jpg",
                  "Conference": "/gamenight.jpg",
                  "Food": "/restaurant.jpg",
                  "Tech": "/gamenight.jpg",
                  "Outdoor": "/camping.jpg",
                  "Birthday": "/birthday.jpg",
                  "Anniversary": "/anniversary.jpg"
                };
                
                if (booking.serviceCategory && categoryImages[booking.serviceCategory]) {
                  return categoryImages[booking.serviceCategory];
                }
                
                // Fallback based on title keywords
                const title = (booking.serviceTitle || "").toLowerCase();
                if (title.includes("wedding") || title.includes("marriage")) return "/wedding.jpg";
                if (title.includes("music") || title.includes("concert") || title.includes("band")) return "/party.jpg";
                if (title.includes("party") || title.includes("celebration")) return "/party.jpg";
                if (title.includes("birthday")) return "/birthday.jpg";
                if (title.includes("conference") || title.includes("meeting")) return "/gamenight.jpg";
                if (title.includes("food") || title.includes("dinner")) return "/restaurant.jpg";
                if (title.includes("outdoor") || title.includes("camping")) return "/camping.jpg";
                if (title.includes("anniversary")) return "/anniversary.jpg";
                
                // Default fallback
                return "/party.jpg";
              };
              
              const eventImage = getEventImage(booking);
              
              return (
                <div 
                  key={booking._id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/dashboard/user/bookings`)}
                >
                  {/* Card Header with Event Image */}
                  <div className="relative h-32 overflow-hidden">
                    <img 
                      src={eventImage} 
                      alt={booking.serviceTitle || "Event"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="text-white font-semibold text-base truncate">{booking.serviceTitle || "Event"}</h4>
                      <p className="text-white/80 text-xs">{booking.serviceCategory || "Event"}</p>
                    </div>
                    {/* Status Badge on Image */}
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FaCalendarCheck className="text-blue-500 flex-shrink-0" />
                      <span>{formatDate(booking.eventDate)}{booking.eventTime ? ` at ${booking.eventTime}` : ""}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                      <span className="truncate">{booking.location || "Location TBD"}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-semibold text-blue-600">
                        {booking.totalPrice 
                          ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(booking.totalPrice)
                          : "Free"}
                      </span>
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                        <FaEye className="text-xs" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
