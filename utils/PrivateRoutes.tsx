// src/routes/PrivateRoute.tsx
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
