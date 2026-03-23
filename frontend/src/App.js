import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import JobListingsPage from "./pages/JobListingsPage";
import ApplyJob from "./pages/ApplyJob";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";

const RequireAuth = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const fallback = role === "recruiter" || role === "admin" ? "/recruiter" : "/candidate";
    return <Navigate to={fallback} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobListingsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/apply/:jobId" element={<ApplyJob />} />

        <Route
          path="/candidate"
          element={(
            <RequireAuth allowedRoles={["candidate", "admin"]}>
              <CandidateDashboard />
            </RequireAuth>
          )}
        />

        <Route
          path="/recruiter"
          element={(
            <RequireAuth allowedRoles={["recruiter", "admin"]}>
              <RecruiterDashboard />
            </RequireAuth>
          )}
        />

        <Route path="/dashboard" element={<Navigate to="/candidate" replace />} />
        <Route path="/admin" element={<Navigate to="/recruiter" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;