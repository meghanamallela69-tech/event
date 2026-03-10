import PropTypes from "prop-types";
import UserSidebar from "./UserSidebar";
import UserTopbar from "./UserTopbar";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

const UserLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <UserSidebar onLogout={handleLogout} />
      <div className="flex-1 ml-64 flex flex-col">
        <UserTopbar onLogout={handleLogout} />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
};

UserLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserLayout;
