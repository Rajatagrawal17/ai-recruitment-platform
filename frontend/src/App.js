import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";

import Navbar from "./components/Navbar";
import NavbarFixed from "./components/NavbarFixed";
import BottomNavBar from "./components/BottomNavBar";
import ScrollProgress from "./components/ScrollProgress";
import ThemeToggle from "./components/ThemeToggle";
import AIHelpWidget from "./components/AIHelpWidget";
import ProtectedRoute from "./components/ProtectedRoute";
import { getBackendUrl, getApiEndpoint } from "./utils/apiConfig";
import API from "./services/api"; // ✅ Import API for health check
import SkeletonLoading from "./components/SkeletonLoading";
import { PageTransition } from "./components/PageTransition";
import SpotlightCursor from "./components/SpotlightCursor";
import { ToastProvider } from "./contexts/ToastContext";
import ToastSystem from "./components/ToastSystem";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ModernLandingPage = lazy(() => import("./pages/ModernLandingPage"));
const ExperienceHubPage = lazy(() => import("./pages/ExperienceHubPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const EnhancedJobsPage = lazy(() => import("./pages/EnhancedJobsPage"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));
const ApplicationForm = lazy(() => import("./pages/ApplicationForm"));
const SimpleRecruiterDashboard = lazy(() => import("./pages/SimpleRecruiterDashboard"));
const CandidateDashboard = lazy(() => import("./pages/CandidateDashboard"));
const PersonalizedDashboard = lazy(() => import("./pages/PersonalizedDashboard"));
const SavedJobs = lazy(() => import("./pages/SavedJobs"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const FilteredJobs = lazy(() => import("./pages/FilteredJobs"));
const SearchHistoryManager = lazy(() => import("./pages/SearchHistoryManager"));
const AIToolsPage = lazy(() => import("./pages/AIToolsPage"));
const ProfileCompletion = lazy(() => import("./pages/ProfileCompletion"));
const OrbitalNetworkPage = lazy(() => import("./pages/OrbitalNetworkPage"));
const ResumeScorePage = lazy(() => import("./pages/ResumeScorePage"));
const CoverLetterPage = lazy(() => import("./pages/CoverLetterPage"));
const InterviewSimPage = lazy(() => import("./pages/InterviewSimPage"));
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

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }},
  exit: { opacity: 0, y: -8, scale: 0.99,
    transition: { duration: 0.15 }}
};

const AnimatedPage = ({ children }) => {
  return children;
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
    <PageTransition>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><ModernLandingPage /></AnimatedPage>} />
        <Route path="/experience" element={<AnimatedPage><ExperienceHubPage /></AnimatedPage>} />
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
          path="/resume-score"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><ResumeScorePage /></AnimatedPage>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/cover-letter"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><CoverLetterPage /></AnimatedPage>
            </ProtectedRoute>
          )}
        />

        <Route
          path="/interview-prep"
          element={(
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AnimatedPage><InterviewSimPage /></AnimatedPage>
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
          path="/orbital-network"
          element={<AnimatedPage><OrbitalNetworkPage /></AnimatedPage>}
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
        <Route path="/applications" element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="/profile" element={<Navigate to="/complete-profile" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  );
};

// ✅ Cold start handler - ping backend health check on app load
const ColdStartHandler = ({ children }) => {
  useEffect(() => {
    const wakeupServer = async () => {
      try {
        console.log("🔄 [Cold Start] Pinging backend health check...");
        const startTime = Date.now();
        
        await API.get("/health", { timeout: 10000 });
        
        const duration = Date.now() - startTime;
        console.log(`✅ [Cold Start] Server responded in ${duration}ms`);
      } catch (error) {
        console.warn("⚠️ [Cold Start] Server not responding yet, will retry on first request");
      }
    };

    // Ping on load
    wakeupServer();
  }, []);

  return <>{children}</>;
};

function App() {
  const hasPointer = typeof window !== "undefined" && window.matchMedia('(pointer: fine)').matches;

  return (
    <ColdStartHandler>
      <ToastProvider>
        <MotionConfig reducedMotion="user">
          <Router>
            <ScrollProgress />
            <NavbarFixed />
            <Suspense fallback={<SkeletonLoading />}>
              <AppRoutes />
            </Suspense>
            <ThemeToggle />
            <AIHelpWidget />
            <BottomNavBar />
            {hasPointer && <SpotlightCursor />}
            <ToastSystem />
          </Router>
        </MotionConfig>
      </ToastProvider>
    </ColdStartHandler>
  );
}

export default App;
