import PropTypes from "prop-types";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar onLogout={handleLogout} />
      <div className="flex-1 ml-64 flex flex-col">
        <AdminTopbar onToggleSidebar={() => {}} onLogout={handleLogout} />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
