import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Moon, Sun, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { logoutUser } from "../services/api";
import "./Navbar.css";

const NavbarFixed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const dropdownRef = useRef(null);

  // Check auth on component mount
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("token");
      console.log("✅ AUTH CHECK: token=", !!storedToken, "isAuthenticated=", isAuthenticated);
      setAuthReady(true);
    };

    checkAuth();
  }, [isAuthenticated]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const closeAll = () => {
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || "U").toUpperCase();
  };

  const handleLogout = async () => {
    closeAll();
    try {
      await logoutUser();
    } catch (error) {
      console.warn("Backend logout failed:", error.message);
    }
    logout();
    navigate("/", { replace: true });
  };

  // Determine if user is logged in
  const isLoggedIn = isAuthenticated && token;

  return (
    <motion.header 
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isScrolled 
          ? 'border-border/50 bg-surface/80 backdrop-blur-xl shadow-sm' 
          : 'border-transparent bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div 
        className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 py-4"
        animate={{ height: isScrolled ? "3.5rem" : "4rem" }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <motion.div 
            className="rounded-xl bg-gradient-to-tr from-primary to-accent px-2 py-1 text-sm font-extrabold text-white shadow-card"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            C
          </motion.div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-extrabold text-transparent whitespace-nowrap">
            CogniFit
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {!isLoggedIn && (
            <Link
              to="/jobs"
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-soft hover:text-text transition-colors"
            >
              Jobs
            </Link>
          )}
          
          {isLoggedIn && role === "candidate" && (
            <Link
              to="/apply"
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-soft hover:text-text transition-colors"
            >
              Apply Jobs
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Theme Toggle */}
          <motion.button
            whileHover={reduceMotion ? undefined : { rotate: isDark ? -12 : 12 }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            onClick={toggleTheme}
            className="rounded-lg border border-border bg-surface-elevated p-2 text-text-muted hover:text-text transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar Circle */}
                <motion.button
                  whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="avatar-circle"
                  title={user?.name}
                >
                  {getUserInitials()}
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.95 }}
                      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.95 }}
                      className="avatar-dropdown"
                    >
                      {/* User Info */}
                      <div className="dropdown-user-info">
                        <div className="name">{user?.name}</div>
                        <div className="email">{user?.email}</div>
                      </div>

                      <div className="dropdown-divider" />

                      {/* Dashboard Link */}
                      <button
                        onClick={() => {
                          navigate(role === "candidate" ? "/candidate/dashboard" : "/dashboard");
                          setDropdownOpen(false);
                        }}
                        className="dropdown-menu-item"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </button>

                      <div className="dropdown-divider" />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="dropdown-logout"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg border border-border bg-surface-elevated p-2 text-text-muted md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            className="border-t border-border bg-surface-elevated/95 md:hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {!isLoggedIn && (
                <Link
                  to="/jobs"
                  onClick={closeAll}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-soft"
                >
                  Jobs
                </Link>
              )}

              {isLoggedIn && (
                <>
                  {role === "candidate" && (
                    <Link
                      to="/apply"
                      onClick={closeAll}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-soft"
                    >
                      Apply Jobs
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      navigate(role === "candidate" ? "/candidate/dashboard" : "/dashboard");
                      closeAll();
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-soft"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              )}

              {!isLoggedIn && (
                <>
                  <Link
                    to="/login"
                    onClick={closeAll}
                    className="block text-center rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-soft"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeAll}
                    className="block text-center rounded-lg bg-primary text-white px-3 py-2 text-sm font-medium hover:bg-primary-dark"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default NavbarFixed;
