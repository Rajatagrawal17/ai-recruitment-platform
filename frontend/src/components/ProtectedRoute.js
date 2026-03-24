import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const defaultRoleHome = (role) => {
  if (role === "candidate") {
    return "/apply";
  }
  if (role === "recruiter" || role === "admin") {
    return "/dashboard";
  }
  return "/";
};

const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = "/login" }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={defaultRoleHome(role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
