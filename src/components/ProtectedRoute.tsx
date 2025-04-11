
import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type AllowedRole = "admin" | "staff" | "airline" | "passenger";

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles: AllowedRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role as AllowedRole)) {
    // Navigate to the appropriate dashboard based on their role
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "staff") {
      return <Navigate to="/staff/dashboard" replace />;
    } else if (user?.role === "airline") {
      return <Navigate to="/airline/dashboard" replace />;
    } else if (user?.role === "passenger") {
      return <Navigate to="/passenger/dashboard" replace />;
    } else {
      // Fallback to home if role is unknown
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
