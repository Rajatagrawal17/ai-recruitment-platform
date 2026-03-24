import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageTransition}
    transition={{ duration: 0.28, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
        <Route path="/jobs" element={<AnimatedPage><JobsPage /></AnimatedPage>} />
        <Route path="/jobs/:id" element={<AnimatedPage><JobDetailPage /></AnimatedPage>} />
        <Route
          path="/jobs/:id/apply"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><ApplicationForm /></AnimatedPage>
            </ProtectedRoute>
          )}
        />
        <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
        <Route path="/register" element={<AnimatedPage><RegisterPage /></AnimatedPage>} />

        <Route
          path="/apply"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><JobsPage /></AnimatedPage>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
              <AnimatedPage><RecruiterDashboard /></AnimatedPage>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/candidate/dashboard"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><CandidateDashboard /></AnimatedPage>
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
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <Navbar />
      <AppRoutes />
      <HelpChatbot />
    </Router>
  );
}

export default App;