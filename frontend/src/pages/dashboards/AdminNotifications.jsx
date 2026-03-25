import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaBell, FaEnvelope, FaCheck, FaTrash, FaEye, FaSearch, FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...filters
      });

      const response = await axios.get(
        `${API_BASE}/admin-profile/notifications?${queryParams}`, 
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalCount(response.data.total || 0);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error(error.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, filters]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadNotifications();
  };

  const markAsRead = async (id) => {
    try {
      const response = await axios.put(
        `${API_BASE}/admin-profile/notifications/${id}/read`,
        {},
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Notification marked as read");
        loadNotifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    if (!confirm("Mark all notifications as read?")) return;

    try {
      const response = await axios.post(
        `${API_BASE}/admin-profile/notifications/read-all`,
        {},
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("All notifications marked as read");
        loadNotifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    if (!confirm("Delete this notification?")) return;

    try {
      const response = await axios.delete(
        `${API_BASE}/admin-profile/notifications/${id}`,
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Notification deleted");
        loadNotifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete notification");
    }
  };

  const filteredNotifications = notifications.filter(notif =>
    notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (notif.type && notif.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeBadgeColor = (type) => {
    const colors = {
      booking: 'bg-blue-100 text-blue-700',
      payment: 'bg-green-100 text-green-700',
      general: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Notifications</h2>
            <p className="text-gray-600 mt-1">Manage your alerts and messages</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaCheck /> Mark All Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaBell className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Unread</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaEnvelope className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Read</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalCount - unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheck className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="booking">Booking</option>
                <option value="payment">Payment</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaSearch /> Search
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({ type: '', status: '' });
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">All Notifications</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaBell className="mx-auto text-6xl text-gray-300 mb-4" />
            <p>{searchTerm || filters.type || filters.status ? 'No notifications found' : 'No notifications'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notif.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 ${
                      !notif.read ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      <FaBell />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-medium ${
                          !notif.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notif.message}
                        </p>
                        {!notif.read && (
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(notif.type)}`}>
                          {notif.type}
                        </span>
                        <span>{new Date(notif.createdAt).toLocaleString('en-IN')}</span>
                        {notif.bookingId && (
                          <span className="text-xs">
                            Booking: {notif.bookingId.serviceTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="text-green-600 hover:text-green-800 p-2"
                        title="Mark as read"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif._id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
