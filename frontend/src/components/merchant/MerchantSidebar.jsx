import { NavLink } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { BsCalendar2Event, BsBell, BsGraphUp, BsTicket, BsMegaphone } from "react-icons/bs";
import { FaListAlt, FaCreditCard, FaUser, FaSignOutAlt, FaPlusCircle, FaRegCalendarCheck, FaCog } from "react-icons/fa";
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

const MerchantSidebar = ({ onLogout }) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white text-gray-800 flex flex-col shadow-xl z-50 border-r border-gray-200">
      <div className="px-4 py-4 text-lg font-semibold border-b border-gray-200 text-blue-600">
        Merchant Panel
      </div>
      <div role="navigation" className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        <Item icon={RxDashboard} label="Dashboard" to="/dashboard/merchant" />
        <Item icon={BsCalendar2Event} label="My Events" to="/dashboard/merchant/events" />
        <Item icon={FaPlusCircle} label="Create Event" to="/dashboard/merchant/create" />
        <Item icon={FaRegCalendarCheck} label="Bookings / Registrations" to="/dashboard/merchant/bookings" />
        <Item icon={FaCreditCard} label="Payments" to="/dashboard/merchant/payments" />
        <Item icon={BsGraphUp} label="Event Analytics" to="/dashboard/merchant/analytics" />
        <Item icon={BsTicket} label="Ticket Validation" to="/dashboard/merchant/ticket-validation" />
        <Item icon={BsMegaphone} label="Marketing Tools" to="/dashboard/merchant/marketing" />
        <Item icon={BsBell} label="Notifications" to="/dashboard/merchant/notifications" />
        <Item icon={FaUser} label="Profile" to="/dashboard/merchant/profile" />
        <Item icon={FaCog} label="Settings" to="/dashboard/merchant/settings" />
      </div>
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 justify-center px-4 py-2 rounded-md bg-red-500 text-white transition hover:bg-red-600 shadow-sm"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default MerchantSidebar;
Item.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string,
  to: PropTypes.string,
};
MerchantSidebar.propTypes = {
  onLogout: PropTypes.func,
};
