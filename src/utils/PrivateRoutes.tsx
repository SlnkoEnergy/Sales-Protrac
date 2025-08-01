import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem("authToken");

  console.log("PrivateRoute token:", token);

  // Treat null, undefined, empty string, or invalid tokens as unauthenticated
  if (!token || token === "null" || token === "undefined" || token.trim() === "") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
