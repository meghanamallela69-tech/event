import { useState } from "react";
import { SITE_NAME } from "../../config/site";
import { BsCalendarEvent } from "react-icons/bs";
import { FiBell, FiSearch, FiChevronDown } from "react-icons/fi";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const AdminTopbar = ({ onToggleSidebar, profileName = "Admin", onLogout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
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
          <button className="p-2 rounded hover:bg-gray-100">
            <FiBell />
          </button>
          <div className="relative">
            <button
              className="flex items-center gap-2 p-1 rounded hover:bg-gray-100"
              onClick={() => setOpen(!open)}
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">{profileName[0]}</div>
              <span className="text-sm">{profileName}</span>
              <FiChevronDown />
            </button>
            <div
              className={`absolute right-0 mt-2 w-44 bg-white rounded-md shadow border ${
                open ? "block" : "hidden"
              }`}
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setOpen(false);
                  navigate("/dashboard/admin/settings");
                }}
              >
                Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setOpen(false);
                  navigate("/dashboard/admin/settings");
                }}
              >
                Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
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
