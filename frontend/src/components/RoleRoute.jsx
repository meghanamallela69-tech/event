import useAuth from "../context/useAuth";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const RoleRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user || user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

export default RoleRoute;
RoleRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string.isRequired,
};
