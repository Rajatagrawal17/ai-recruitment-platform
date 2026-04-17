import React, { useMemo, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Menu, Moon, Sun, X, BriefcaseBusiness, LayoutDashboard, UserCircle2, Heart, Clock, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { logoutUser } from "../services/api";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  React.useEffect(() => {
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

  const links = useMemo(() => {
    if (!token) {
      return [
        { path: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
      ];
    }

    if (role === "candidate") {
      return [
        { path: "/apply", label: "Apply Jobs", icon: BriefcaseBusiness },
      ];
    }

    return [
      { path: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
    ];
  }, [token, role]);

  const closeAll = () => {
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  // Generate initials from user name (e.g. "RA" for "Rajat Agrawal")
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
    
    // Call backend logout endpoint for audit trail
    try {
      await logoutUser();
    } catch (error) {
      console.warn("Backend logout failed, proceeding with client-side logout:", error.message);
    }
    
    // Clear client-side auth state
    logout();
    navigate("/", { replace: true });
  };

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Guest";

  return (
    <motion.header 
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${isScrolled ? 'border-border/50 bg-surface/80 backdrop-blur-xl shadow-sm' : 'border-transparent bg-transparent'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div 
        className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6"
        animate={{ height: isScrolled ? "4rem" : "5rem" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div 
            className="rounded-xl bg-gradient-to-tr from-primary to-accent px-2 py-1 text-sm font-extrabold text-white shadow-card"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            H
          </motion.div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-extrabold text-transparent">
            HireAI
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const active = location.pathname === link.path || (link.path === "/candidates" && location.pathname === "/dashboard");
            return (
              <motion.div
                key={link.path}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                <Link
                  to={link.path}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-text-muted hover:bg-surface-soft hover:text-text"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={reduceMotion ? undefined : { rotate: isDark ? -12 : 12 }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            onClick={toggleTheme}
            className="rounded-lg border border-border bg-surface-elevated p-2 text-text-muted hover:text-text"
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {token ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              {/* Avatar Circle */}
              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="avatar-circle"
                title={`${user?.name || "User"}`}
              >
                {getUserInitials()}
              </motion.button>

              {/* Avatar Dropdown */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.95 }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.95 }}
                    className="avatar-dropdown"
                  >
                    {/* User Info Header */}
                    <div className="dropdown-user-info">
                      <div className="name">{user?.name || "User"}</div>
                      <div className="email">{user?.email || "email@example.com"}</div>
                    </div>

                    {/* Divider */}
                    <div className="dropdown-divider" />

                    {/* Logout Button */}
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
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn-secondary text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-lg border border-border bg-surface-elevated p-2 text-text-muted md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            animate={reduceMotion ? { opacity: 1, height: "auto" } : { opacity: 1, height: "auto" }}
            exit={reduceMotion ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
            className="border-t border-border bg-surface-elevated/95 px-4 py-3 md:hidden"
          >
            <div className="space-y-2">
              {links.map((link) => {
                const active = location.pathname === link.path;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeAll}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-text-muted hover:bg-surface-soft"
                    }`}
                  >
                    {Icon ? <Icon size={16} /> : null}
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {token ? (
                <div className="space-y-2 border-t border-border pt-2 mt-2">
                  <button
                    onClick={() => {
                      navigate(role === "candidate" ? "/candidate/dashboard" : "/dashboard");
                      closeAll();
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-text-muted hover:bg-surface-soft hover:text-text"
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
                </div>
              ) : (
                <div className="space-y-2 border-t border-border pt-2 mt-2">
                  <Link 
                    to="/login" 
                    onClick={closeAll}
                    className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-text-muted hover:bg-surface-soft"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={closeAll}
                    className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
