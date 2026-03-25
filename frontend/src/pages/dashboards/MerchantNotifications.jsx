import { useEffect, useState } from "react";
import axios from "axios";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaBell, FaTrash, FaCheck, FaInbox, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import { API_BASE, authHeaders } from "../../lib/http";
import { toast } from "react-hot-toast";
import useAuth from "../../context/useAuth";

const MerchantNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [token]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/notifications`, {
        headers: authHeaders(token)
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${API_BASE}/notifications/${id}/read`,
        {},
        { headers: authHeaders(token) }
      );
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_BASE}/notifications/${id}`, {
        headers: authHeaders(token)
      });
      toast.success("Notification deleted");
      loadNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      await Promise.all(unreadIds.map(id => 
        axios.patch(
          `${API_BASE}/notifications/${id}/read`,
          {},
          { headers: authHeaders(token) }
        )
      ));
      toast.success("All notifications marked as read");
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await Promise.all(notifications.map(n => 
        axios.delete(`${API_BASE}/notifications/${n._id}`, {
          headers: authHeaders(token)
        })
      ));
      toast.success("All notifications deleted");
      setNotifications([]);
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
      toast.error("Failed to delete all notifications");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking":
        return <FaCalendarAlt className="text-green-600" />;
      case "payment":
        return <FaDollarSign className="text-blue-600" />;
      default:
        return <FaBell className="text-amber-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "booking":
        return "bg-green-100";
      case "payment":
        return "bg-blue-100";
      default:
        return "bg-amber-100";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <MerchantLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Notifications</h2>
            <p className="text-gray-600 mt-1">Booking requests and payment updates</p>
          </div>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  Mark All Read
                </button>
                <button
                  onClick={deleteAllNotifications}
                  className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  Delete All
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">
            {notifications.length} {notifications.length === 1 ? "Notification" : "Notifications"}
          </h3>
          {notifications.some(n => !n.read) && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
              {notifications.filter(n => !n.read).length} unread
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <FaInbox className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No notifications yet</h3>
            <p className="text-gray-500 mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-4 hover:bg-gray-50 transition flex items-start gap-4 ${
                  !notif.read ? "bg-blue-50/50" : ""
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notif.type)}`}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${!notif.read ? "text-gray-900" : "text-gray-700"}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{formatDate(notif.createdAt)}</span>
                    {!notif.read && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                      title="Mark as read"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MerchantLayout>
  );
};

export default MerchantNotifications;
