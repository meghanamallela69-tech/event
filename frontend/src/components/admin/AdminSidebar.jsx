import { NavLink } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { BsCalendar2Event, BsBell, BsGraphUp } from "react-icons/bs";
import { FaUsers, FaListAlt, FaStore, FaCreditCard, FaUser } from "react-icons/fa";
import { FiSettings, FiLogOut } from "react-icons/fi";
import PropTypes from "prop-types";

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

const AdminSidebar = ({ onLogout }) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white text-gray-800 flex flex-col shadow-xl z-50 border-r border-gray-200">
      <div className="px-4 py-4 text-lg font-semibold border-b border-gray-200 text-blue-600">
        Event Admin Panel
      </div>
      <div role="navigation" className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        <Item icon={RxDashboard} label="Dashboard" to="/dashboard/admin" />
        <Item icon={FaUsers} label="Users" to="/dashboard/admin/users" />
        <Item icon={FaStore} label="Merchants" to="/dashboard/admin/merchants" />
        <Item icon={BsCalendar2Event} label="Events" to="/dashboard/admin/events" />
        <Item icon={FaListAlt} label="Bookings" to="/dashboard/admin/registrations" />
        <Item icon={FaCreditCard} label="Payments" to="/dashboard/admin/payments" />
        <Item icon={BsGraphUp} label="Analytics" to="/dashboard/admin/analytics" />
        <Item icon={FaUser} label="Profile" to="/dashboard/admin/profile" />
        <Item icon={BsBell} label="Notifications" to="/dashboard/admin/notifications" />
        <Item icon={FiSettings} label="Settings" to="/dashboard/admin/settings" />
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

export default AdminSidebar;
Item.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};
AdminSidebar.propTypes = {
  onLogout: PropTypes.func,
};
