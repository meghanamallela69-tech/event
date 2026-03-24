import { NavLink, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { BsCalendarEvent, BsBookmarkHeart, BsSearch } from "react-icons/bs";
import { FaUser, FaTicketAlt, FaHome } from "react-icons/fa";
import { FiBell, FiLogOut } from "react-icons/fi";
import PropTypes from "prop-types";
import useAuth from "../../context/useAuth";

const Item = ({ icon: Icon, label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-md transition ${
        isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
      }`
    }
  >
    <Icon className="text-lg" />
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);

Item.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

const UserSidebar = ({ onLogout }) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white text-gray-800 flex flex-col shadow-xl z-40 border-r border-gray-200">
      <div className="px-4 py-4 text-lg font-semibold border-b border-gray-200 text-blue-600">
        User Dashboard
      </div>
      <div role="navigation" className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        <Item icon={RxDashboard} label="Dashboard" to="/dashboard/user" />
        <Item icon={BsSearch} label="Browse Events" to="/dashboard/user/browse" />
        <Item icon={FaTicketAlt} label="My Bookings" to="/dashboard/user/bookings" />
        <Item icon={BsBookmarkHeart} label="Saved Events" to="/dashboard/user/saved" />
        <Item icon={FiBell} label="Notifications" to="/dashboard/user/notifications" />
        <Item icon={FaUser} label="My Profile" to="/dashboard/user/profile" />
        <Item icon={FaHome} label="Back to Home" to="/home" />
      </div>
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 justify-center px-4 py-2 rounded-md bg-red-500 text-white transition hover:bg-red-600 shadow-sm"
        >
          <FiLogOut className="text-lg" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

UserSidebar.propTypes = {
  onLogout: PropTypes.func,
};

export default UserSidebar;
