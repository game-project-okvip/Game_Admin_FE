import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "admin" | "user";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/login" />; 
  }

  return <>{children}</>;
};

export default ProtectedRoute;
