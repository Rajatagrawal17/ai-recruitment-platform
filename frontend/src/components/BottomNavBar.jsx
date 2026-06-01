import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Bookmark, Sparkles, ClipboardList, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import socketService from "../services/socketService";

const BottomNavBar = () => {
  const { isAuthenticated, role, user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [tappedIndex, setTappedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!isAuthenticated || !userId || role !== "candidate") return;

    // Connect to socket.io query
    const socket = socketService.connect(userId);

    const handleNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socketService.on("applicationStatusUpdate", handleNotification);
    socketService.on("applicationShortlist", handleNotification);
    socketService.on("newMessage", handleNotification);
    socketService.on("interviewScheduled", handleNotification);
    socketService.on("applicationUpdate", handleNotification);
    socketService.on("message", handleNotification);

    return () => {
      socketService.off("applicationStatusUpdate", handleNotification);
      socketService.off("applicationShortlist", handleNotification);
      socketService.off("newMessage", handleNotification);
      socketService.off("interviewScheduled", handleNotification);
      socketService.off("applicationUpdate", handleNotification);
      socketService.off("message", handleNotification);
    };
  }, [user, isAuthenticated, role]);

  const hiddenPaths = ["/login", "/register", "/onboarding"];
  const isHidden = hiddenPaths.includes(location.pathname);

  // Hidden on desktop (query window width < 768px)
  // Hidden if candidate is not authenticated (use useAuth() to check isAuthenticated)
  // Hidden on routes: /login, /register, /onboarding
  if (!isMobile || !isAuthenticated || isHidden || role !== "candidate") {
    return null;
  }

  const navItems = [
    { label: "Explore", path: "/apply", icon: Compass },
    { label: "Jobs", path: "/saved-jobs", icon: Bookmark },
    { label: "Interview Prep", path: "/interview-prep", icon: Sparkles },
    { label: "Applied", path: "/applications", icon: ClipboardList },
    { label: "Profile", path: "/profile", icon: User },
  ];

  const getIsActive = (path) => {
    if (path === "/apply") {
      return location.pathname === "/apply" || location.pathname.startsWith("/jobs");
    }
    if (path === "/applications") {
      return location.pathname === "/applications" || location.pathname === "/candidate/dashboard";
    }
    if (path === "/profile") {
      return location.pathname === "/profile" || location.pathname === "/complete-profile";
    }
    return location.pathname === path;
  };

  const handleTap = (index, item) => {
    // Haptic vibration
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }

    setTappedIndex(index);
    setTimeout(() => setTappedIndex(null), 300);

    // Clear badge count if Profile or Interview Prep is clicked
    if (item.label === "Profile" || item.label === "Interview Prep") {
      setUnreadCount(0);
    }
  };

  const bottomNavBarStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "64px",
    background: "rgba(15, 15, 26, 0.9)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    zIndex: 1000,
    paddingBottom: "env(safe-area-inset-bottom)",
  };

  return (
    <nav
      style={bottomNavBarStyle}
      className="md:hidden flex items-center justify-around px-2 shadow-lg"
    >
      {navItems.map((item, index) => {
        const isActive = getIsActive(item.path);
        const Icon = item.icon;
        const showBadge = (item.label === "Profile" || item.label === "Interview Prep") && unreadCount > 0;

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => handleTap(index, item)}
            className="flex-1 flex flex-col items-center justify-center h-full relative no-underline select-none"
          >
            {/* Subtle indicator dot above active icon */}
            {isActive && (
              <motion.span
                layoutId="activeDot"
                className="absolute top-1.5 w-1 h-1 rounded-full bg-purple-500"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            {/* Icon Container with Tap scale animation */}
            <motion.div
              animate={tappedIndex === index ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative flex items-center justify-center p-1"
            >
              <Icon
                size={22}
                style={{
                  color: isActive ? "#A855F7" : "rgba(255, 255, 255, 0.6)",
                  transition: "color 0.3s ease, transform 0.3s ease",
                }}
              />

              {/* Red notification badge with count */}
              {showBadge && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-[#0f0f1a] shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </motion.div>

            {/* Label appears below active icon (inactive labels are hidden) */}
            <div className="h-4 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="text-[9px] font-semibold text-purple-500 mt-0.5"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
