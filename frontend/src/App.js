import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";

import Navbar from "./components/Navbar";
import NavbarFixed from "./components/NavbarFixed";
import ScrollProgress from "./components/ScrollProgress";
import ThemeToggle from "./components/ThemeToggle";
import HelpChatbot from "./components/HelpChatbot";
import ConnectionStatus from "./components/ConnectionStatus";
import ProtectedRoute from "./components/ProtectedRoute";
import { getBackendUrl, getApiEndpoint } from "./utils/apiConfig";
import API from "./services/api"; // ✅ Import API for health check

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
import SavedJobs from "./pages/SavedJobs";
import NotificationSettings from "./pages/NotificationSettings";
import FilteredJobs from "./pages/FilteredJobs";
import SearchHistoryManager from "./pages/SearchHistoryManager";
import AIToolsPage from "./pages/AIToolsPage";
import ProfileCompletion from "./pages/ProfileCompletion";
import DebugPage from "./pages/DebugPage";
import { useAuth } from "./context/AuthContext";

// Log API configuration on app start
if (typeof window !== "undefined") {
  console.log("");
  console.log("╔═════════════════════════════════════════════════════════════╗");
  console.log("║          🚀 COGNIFIT AI RECRUITMENT PLATFORM 🚀            ║");
  console.log("╚═════════════════════════════════════════════════════════════╝");
  console.log("📌 Backend Base URL:", getBackendUrl());
  console.log("📍 Example API Endpoint:", getApiEndpoint("/auth/login"));
  console.log("🌍 Environment:", process.env.NODE_ENV);
  console.log("💻 Frontend URL:", window.location.origin);
  console.log("════════════════════════════════════════════════════════════\n");
}

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
          path="/saved-jobs"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><SavedJobs /></AnimatedPage>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/settings/notifications"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><NotificationSettings /></AnimatedPage>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/jobs/advanced-search"
          element={<AnimatedPage><FilteredJobs /></AnimatedPage>}
        />

        <Route
          path="/search-history"
          element={<AnimatedPage><SearchHistoryManager /></AnimatedPage>}
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
          path="/ai-tools"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><AIToolsPage /></AnimatedPage>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/complete-profile"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><ProfileCompletion /></AnimatedPage>
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
        
        {/* Debug page for troubleshooting */}
        <Route path="/debug" element={<DebugPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// ✅ Cold start handler - ping backend health check on app load
const ColdStartHandler = ({ children }) => {
  const [serverReady, setServerReady] = useState(true); // Assume ready by default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wakeupServer = async () => {
      try {
        console.log("🔄 [Cold Start] Pinging backend health check...");
        const startTime = Date.now();
        
        await API.get("/health", { timeout: 10000 });
        
        const duration = Date.now() - startTime;
        console.log(`✅ [Cold Start] Server responded in ${duration}ms`);
        setServerReady(true);
      } catch (error) {
        console.warn("⚠️ [Cold Start] Server not responding yet, will retry on first request");
        // Don't block the app - API interceptor will handle retries
        setServerReady(true);
      } finally {
        setLoading(false);
      }
    };

    // Ping on load
    wakeupServer();
  }, []);

  // If cold start is taking too long, show a message but don't block
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary, #fff)',
        color: 'var(--text-primary, #000)',
        fontSize: '14px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '10px' }}>⏳ Loading...</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>Waking up server on free tier</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <ColdStartHandler>
      <MotionConfig reducedMotion="user">
        <Router>
          <ConnectionStatus />
          <ScrollProgress />
          <NavbarFixed />
          <AppRoutes />
          <ThemeToggle />
          <HelpChatbot />
        </Router>
      </MotionConfig>
    </ColdStartHandler>
  );
}

export default App;