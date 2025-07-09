import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
const RequireAuth = ({ roles, children }) => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.value);

  if (!user?.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!roles?.includes(user?.role)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
