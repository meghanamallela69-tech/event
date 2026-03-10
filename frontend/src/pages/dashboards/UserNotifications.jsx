import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaBell, FaCalendarCheck, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";

const UserNotifications = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/events/my-registrations`, {
        headers: authHeaders(token),
      });
      const regs = response.data.registrations || [];
      setRegistrations(regs);
      
      // Generate notifications from upcoming events
      const upcomingRegs = regs.filter(r => new Date(r.event?.date) >= new Date());
      const notifs = upcomingRegs.map(r => ({
        id: r._id,
        type: "upcoming",
        title: r.event?.title || "Event",
        message: `Your event "${r.event?.title}" is scheduled for ${new Date(r.event?.date).toLocaleDateString()}`,
        date: r.event?.date,
        eventId: r.event?._id,
        read: false,
      }));
      
      // Add some system notifications
      if (regs.length > 0) {
        notifs.unshift({
          id: "welcome",
          type: "system",
          title: "Welcome!",
          message: "You'll receive notifications about your upcoming events here.",
          date: new Date().toISOString(),
          read: true,
        });
      }
      
      setNotifications(notifs);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        return `In ${diffDays} days`;
      }
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const markAsRead = (notifId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  };

  return (
    <UserLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Notifications</h2>
        <p className="text-gray-600 mt-1">Stay updated on your upcoming events</p>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
          <FaBell className="mx-auto text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No notifications yet</p>
          <p className="text-gray-400 mt-2">Book some events to receive notifications!</p>
          <button
            onClick={() => navigate("/dashboard/user/browse")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-xl p-4 shadow-sm border transition cursor-pointer ${
                notif.read ? "border-gray-200" : "border-blue-300 bg-blue-50/50"
              }`}
              onClick={() => {
                markAsRead(notif.id);
                if (notif.eventId) {
                  navigate(`/dashboard/user/events/${notif.eventId}`);
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notif.type === "upcoming" ? "bg-blue-100" : "bg-green-100"
                }`}>
                  {notif.type === "upcoming" ? (
                    <FaCalendarCheck className="text-blue-600" />
                  ) : (
                    <FaBell className="text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                    <span className="text-xs text-gray-500">{formatDate(notif.date)}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </UserLayout>
  );
};

export default UserNotifications;
