import { useState, useRef, useEffect } from "react";
import { SITE_NAME } from "../../config/site";
import { BsCalendarEvent } from "react-icons/bs";
import { FiBell, FiSearch, FiChevronDown } from "react-icons/fi";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

const UserTopbar = ({ onToggleSidebar, onLogout }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const profileName = user?.name || "User";
  
  // Refs for click outside detection
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
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
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
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
              placeholder="Search events..."
            />
          </div>
          
          {/* Notification Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button 
              className="p-2 rounded hover:bg-gray-100 relative"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setProfileOpen(false); // Close profile dropdown
              }}
            >
              <FiBell />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
            
            {/* Notification Dropdown Menu */}
            <div
              className={`absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border ${
                notificationOpen ? "block" : "hidden"
              }`}
              style={{ zIndex: 100 }}
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {/* Sample notifications */}
                <div className="p-3 hover:bg-gray-50 border-b">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Booking Confirmed</p>
                      <p className="text-xs text-gray-600">Your booking for "Music Festival" has been confirmed</p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50 border-b">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Payment Successful</p>
                      <p className="text-xs text-gray-600">Payment of ₹2,999 processed successfully</p>
                      <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">New Event Available</p>
                      <p className="text-xs text-gray-600">Check out "Tech Conference 2024" in your area</p>
                      <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t">
                <button 
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    setNotificationOpen(false);
                    navigate("/dashboard/user/notifications");
                  }}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-2 p-1 rounded hover:bg-gray-100"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationOpen(false); // Close notification dropdown
              }}
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                {profileName[0]}
              </div>
              <span className="text-sm">{profileName}</span>
              <FiChevronDown className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Profile Dropdown Menu */}
            <div
              className={`absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border ${
                profileOpen ? "block" : "hidden"
              }`}
              style={{ zIndex: 100 }}
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/dashboard/user/profile");
                }}
              >
                <FiSearch className="text-gray-500" />
                Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/dashboard/user/profile");
                }}
              >
                <FiBell className="text-gray-500" />
                Settings
              </button>
              <hr className="my-1" />
              <button
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserTopbar;
UserTopbar.propTypes = {
  onToggleSidebar: PropTypes.func,
  onLogout: PropTypes.func,
};
