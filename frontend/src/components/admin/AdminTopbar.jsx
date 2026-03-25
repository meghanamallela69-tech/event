import { useState, useRef, useEffect } from "react";
import { SITE_NAME } from "../../config/site";
import { BsCalendarEvent, BsInbox } from "react-icons/bs";
import { FiBell, FiSearch, FiChevronDown } from "react-icons/fi";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import axios from "axios";
import { API_BASE, authHeaders } from "../../lib/http";

const AdminTopbar = ({ onToggleSidebar, profileName = "Admin", onLogout }) => {
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Refs for click outside detection
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load notifications from API
  useEffect(() => {
    loadNotifications();
  }, [token]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/notifications`, {
        headers: authHeaders(token)
      });
      const notifs = response.data.notifications || [];
      setNotifications(notifs.slice(0, 5)); // Get latest 5 for dropdown
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };
  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={onToggleSidebar}>☰</button>
        <div className="font-semibold flex items-center gap-2">
          <BsCalendarEvent />
          <span>{SITE_NAME}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded px-3 py-1.5">
            <FiSearch className="text-gray-500" />
            <input
              className="bg-transparent outline-none text-sm"
              placeholder="Search..."
            />
          </div>
          <div className="relative" ref={notificationRef}>
            <button 
              type="button"
              className="p-2 rounded hover:bg-gray-100 relative"
              onClick={(e) => {
                e.stopPropagation();
                setNotificationOpen(prev => !prev);
                setOpen(false);
                if (!notificationOpen) {
                  loadNotifications(); // Refresh when opening
                }
              }}
            >
              <FiBell />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown Menu */}
            {notificationOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl border border-gray-200"
                style={{ zIndex: 9999 }}
              >
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-2">Loading...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      <BsInbox className="mx-auto text-3xl mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif._id} className={`p-3 hover:bg-gray-50 border-b ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notif.type === 'booking' ? 'bg-green-500' :
                            notif.type === 'payment' ? 'bg-blue-500' : 'bg-amber-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t">
                  <button 
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      setNotificationOpen(false);
                      navigate("/dashboard/admin/notifications");
                    }}
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className="flex items-center gap-2 p-1 rounded hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(prev => !prev);
                setNotificationOpen(false);
              }}
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">{user?.name?.[0] || profileName[0]}</div>
              <span className="text-sm">{user?.name || profileName}</span>
              <FiChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Profile Dropdown Menu */}
            {open && (
              <div
                className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-xl border border-gray-200"
                style={{ zIndex: 9999 }}
              >
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => {
                    setOpen(false);
                    navigate("/dashboard/admin/profile");
                  }}
                >
                  <FiSearch className="text-gray-500" />
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => {
                    setOpen(false);
                    navigate("/dashboard/admin/settings");
                  }}
                >
                  <FiBell className="text-gray-500" />
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
AdminTopbar.propTypes = {
  onToggleSidebar: PropTypes.func,
  profileName: PropTypes.string,
  onLogout: PropTypes.func,
};
