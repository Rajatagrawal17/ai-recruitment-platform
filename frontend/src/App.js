import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HelpChatbot from "./components/HelpChatbot";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import ApplicationForm from "./pages/ApplicationForm";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route
          path="/jobs/:id/apply"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <ApplicationForm />
            </ProtectedRoute>
          )}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/apply"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <JobsPage />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/candidate/dashboard"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/recruiter/dashboard"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route path="/candidate" element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="/recruiter" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <HelpChatbot />
    </Router>
  );
}

export default App;