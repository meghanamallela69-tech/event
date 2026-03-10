import PropTypes from "prop-types";
import MerchantSidebar from "./MerchantSidebar";
import MerchantTopbar from "./MerchantTopbar";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

const MerchantLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <MerchantSidebar onLogout={handleLogout} />
      <div className="flex-1 ml-64 flex flex-col">
        <MerchantTopbar onToggleSidebar={() => {}} />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default MerchantLayout;
MerchantLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
