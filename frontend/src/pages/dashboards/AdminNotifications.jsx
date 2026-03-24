import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import toast from "react-hot-toast";
import { FaBell, FaUser, FaCalendarAlt, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from "react-icons/fa";

const AdminNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/notifications`, {
        headers: authHeaders(token)
      });

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      } else {
        toast.error("Failed to load notifications");
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking_request":
        return <FaCalendarAlt className="text-blue-500" />;
      case "payment":
        return <FaCheckCircle className="text-green-500" />;
      case "warning":
        return <FaExclamationTriangle className="text-yellow-500" />;
      case "error":
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getNotificationBadge = (type) => {
    const badgeStyles = {
      "booking_request": "bg-blue-100 text-blue-800",
      "payment": "bg-green-100 text-green-800",
      "warning": "bg-yellow-100 text-yellow-800",
      "error": "bg-red-100 text-red-800",
      "general": "bg-gray-100 text-gray-800"
    };

    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${badgeStyles[type] || badgeStyles.general}`}>
        {type || "general"}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <p className="text-gray-600">System notifications and alerts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FaBell className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Booking Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.type === "booking_request").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FaCalendarAlt className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Payment Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.type === "payment").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <FaExclamationTriangle className="text-orange-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.type === "warning" || n.type === "error").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Notifications</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <FaBell className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">System notifications will appear here when events occur.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getNotificationBadge(notification.type)}
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {notification.userName && notification.userName !== "System" && (
                        <div className="flex items-center space-x-1">
                          <FaUser className="text-xs" />
                          <span>{notification.userName}</span>
                          {notification.userEmail && (
                            <span>({notification.userEmail})</span>
                          )}
                        </div>
                      )}
                      
                      {notification.eventTitle && notification.eventTitle !== "N/A" && (
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="text-xs" />
                          <span>{notification.eventTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;