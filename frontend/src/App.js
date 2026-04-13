import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";

import Navbar from "./components/Navbar";
import ModernNavbar from "./components/ModernNavbar";
import ScrollProgress from "./components/ScrollProgress";
import HelpChatbot from "./components/HelpChatbot";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import ModernLandingPage from "./pages/ModernLandingPage";
import JobsPage from "./pages/JobsPage";
import EnhancedJobsPage from "./pages/EnhancedJobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import ApplicationForm from "./pages/ApplicationForm";
import SimpleRecruiterDashboard from "./pages/SimpleRecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";
import { useAuth } from "./context/AuthContext";

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const AnimatedPage = ({ children }) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const roleHome = (role) => {
  if (role === "candidate") return "/candidate/dashboard";
  if (role === "recruiter" || role === "admin") return "/dashboard";
  return "/";
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={roleHome(role)} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><ModernLandingPage /></AnimatedPage>} />
        <Route
          path="/jobs"
          element={
            isAuthenticated && role === "candidate"
              ? <Navigate to="/apply" replace />
              : <AnimatedPage><EnhancedJobsPage /></AnimatedPage>
          }
        />
        <Route path="/jobs/:id" element={<AnimatedPage><JobDetailPage /></AnimatedPage>} />
        <Route
          path="/jobs/:id/apply"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><ApplicationForm /></AnimatedPage>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/login"
          element={(
            <PublicOnlyRoute>
              <AnimatedPage><LoginPage /></AnimatedPage>
            </PublicOnlyRoute>
          )}
        />
        <Route
          path="/register"
          element={(
            <PublicOnlyRoute>
              <AnimatedPage><RegisterPage /></AnimatedPage>
            </PublicOnlyRoute>
          )}
        />

        <Route
          path="/forgot-password"
          element={(
            <PublicOnlyRoute>
              <AnimatedPage><ForgotPassword /></AnimatedPage>
            </PublicOnlyRoute>
          )}
        />

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
              <AnimatedPage><SimpleRecruiterDashboard /></AnimatedPage>
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
          path="/personalized/jobs"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><PersonalizedDashboard /></AnimatedPage>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/recruiter/dashboard"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/candidates"
          element={(
            <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
              <Navigate to="/dashboard#candidates" replace />
            </ProtectedRoute>
          )}
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
    <MotionConfig reducedMotion="user">
      <Router>
        <ScrollProgress />
        <ModernNavbar />
        <AppRoutes />
        <HelpChatbot />
      </Router>
    </MotionConfig>
  );
}

export default App;