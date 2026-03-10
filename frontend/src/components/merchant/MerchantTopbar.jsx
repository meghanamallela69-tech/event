import { useState } from "react";
import { SITE_NAME } from "../../config/site";
import { BsCalendarEvent } from "react-icons/bs";
import { FiBell, FiSearch, FiChevronDown } from "react-icons/fi";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const MerchantTopbar = ({ onToggleSidebar }) => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.name || "Merchant";
  const handleLogout = () => {
    logout();
    navigate("/login");
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
            <input className="bg-transparent outline-none text-sm" placeholder="Search events" />
          </div>
          <button className="p-2 rounded hover:bg-gray-100">
            <FiBell />
          </button>
          <div className="relative">
            <button
              className="flex items-center gap-2 p-1 rounded hover:bg-gray-100"
              onClick={() => setOpen(!open)}
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                {name[0]}
              </div>
              <span className="text-sm">{name}</span>
              <FiChevronDown />
            </button>
            <div
              className={`absolute right-0 mt-2 w-44 bg-white rounded-md shadow border ${
                open ? "block" : "hidden"
              }`}
            >
              <button onClick={() => navigate("/dashboard/merchant/profile")} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                Profile
              </button>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MerchantTopbar;
MerchantTopbar.propTypes = {
  onToggleSidebar: PropTypes.func,
};
