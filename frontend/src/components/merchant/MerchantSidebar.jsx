import { NavLink } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { BsCalendar2Event, BsBell, BsGraphUp, BsTicket, BsMegaphone } from "react-icons/bs";
import { FaListAlt, FaCreditCard, FaUser, FaSignOutAlt, FaPlusCircle, FaRegCalendarCheck, FaCog, FaDollarSign, FaTags } from "react-icons/fa";
import PropTypes from "prop-types";
import useNotificationBadges from "../../context/useNotificationBadges";

const Item = ({ icon: Icon, label, to, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-md transition ${
        isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
      }`
    }
  >
    <Icon className="text-lg" />
    <span className="text-sm font-medium flex-1">{label}</span>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
        {badge > 99 ? "99+" : badge}
      </span>
    )}
  </NavLink>
);

const MerchantSidebar = ({ onLogout }) => {
  const { badgeCounts } = useNotificationBadges();
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white text-gray-800 flex flex-col shadow-xl z-50 border-r border-gray-200">
      <div className="px-4 py-4 text-lg font-semibold border-b border-gray-200 text-blue-600">
        Merchant Panel
      </div>
      <div role="navigation" className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        <Item icon={RxDashboard} label="Dashboard" to="/dashboard/merchant" />
        <Item icon={BsCalendar2Event} label="My Events" to="/dashboard/merchant/events" />
        <Item icon={FaTags} label="Categories" to="/dashboard/merchant/categories" />
        <Item icon={FaPlusCircle} label="Create Event" to="/dashboard/merchant/create" />
        <Item 
          icon={FaRegCalendarCheck} 
          label="Bookings / Registrations" 
          to="/dashboard/merchant/bookings" 
          badge={badgeCounts.bookings}
        />
        <Item icon={FaDollarSign} label="Earnings" to="/dashboard/merchant/earnings" />
        <Item icon={FaCreditCard} label="Payments" to="/dashboard/merchant/payments" badge={badgeCounts.payments} />
        <Item icon={BsGraphUp} label="Event Analytics" to="/dashboard/merchant/analytics" />
        <Item icon={BsTicket} label="Ticket Validation" to="/dashboard/merchant/ticket-validation" />
        <Item icon={BsMegaphone} label="Marketing Tools" to="/dashboard/merchant/marketing" />
        <Item 
          icon={BsBell} 
          label="Notifications" 
          to="/dashboard/merchant/notifications" 
          badge={badgeCounts.total}
        />
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
