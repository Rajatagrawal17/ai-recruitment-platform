import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, Moon, Sparkles, Sun, X, Zap } from "lucide-react";
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const isLoggedIn = isAuthenticated && token;

  return (
    <motion.header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isScrolled
          ? "border-border/50 bg-surface/80 backdrop-blur-xl shadow-sm"
          : "border-transparent bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6"
        animate={{ height: isScrolled ? "3.5rem" : "4.25rem" }}
      >
        <Link to="/" className="group flex flex-shrink-0 items-center gap-2">
          <motion.div
            className="rounded-xl bg-gradient-to-tr from-primary to-accent px-2 py-1 text-sm font-extrabold text-white shadow-card"
            whileHover={reduceMotion ? undefined : { rotate: 10, scale: 1.1 }}
          >
            C
          </motion.div>
          <div className="leading-tight">
            <span className="block whitespace-nowrap bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-extrabold text-transparent">
              CogniFit
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted md:block">
              Intelligent hiring workspace
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface-elevated px-1.5 py-1 shadow-sm backdrop-blur-xl md:flex">
          {!isLoggedIn && (
            <Link
              to="/jobs"
              className="rounded-full px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-soft hover:text-text"
            >
              Jobs
            </Link>
          )}

          {isLoggedIn && role === "candidate" && (
            <Link
              to="/apply"
              className="rounded-full px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-soft hover:text-text"
            >
              Apply Jobs
            </Link>
          )}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-3">
          {isLoggedIn && role && (
            <span className="hidden items-center gap-1 rounded-full border border-border bg-surface-elevated px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted md:inline-flex">
              <Sparkles size={12} className="text-accent" />
              {role}
            </span>
          )}

          <motion.button
            whileHover={reduceMotion ? undefined : { rotate: isDark ? -12 : 12 }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            onClick={toggleTheme}
            className="rounded-full border border-border bg-surface-elevated p-2.5 text-text-muted shadow-sm transition-all hover:text-text"
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          <div className="hidden items-center gap-2 md:flex">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="avatar-circle"
                  title={user?.name}
                >
                  {getUserInitials()}
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.95 }}
                      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.95 }}
                      className="avatar-dropdown"
                    >
                      <div className="dropdown-user-info">
                        <div className="name">{user?.name}</div>
                        <div className="email">{user?.email}</div>
                      </div>

                      <div className="dropdown-divider" />

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

                      {role === "candidate" && (
                        <button
                          onClick={() => {
                            navigate("/ai-tools");
                            setDropdownOpen(false);
                          }}
                          className="dropdown-menu-item"
                        >
                          <Zap size={16} />
                          AI Tools
                        </button>
                      )}

                      <div className="dropdown-divider" />

                      <button onClick={handleLogout} className="dropdown-logout">
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
                  className="rounded-full px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card transition-all hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

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
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            className="border-t border-border bg-surface-elevated/95 md:hidden"
          >
            <div className="space-y-2 px-4 py-3">
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
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-text-muted hover:bg-surface-soft"
                  >
                    Dashboard
                  </button>

                  {role === "candidate" && (
                    <button
                      onClick={() => {
                        navigate("/ai-tools");
                        closeAll();
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-text-muted hover:bg-surface-soft"
                    >
                      AI Tools
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20"
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
                    className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-text-muted hover:bg-surface-soft"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeAll}
                    className="block rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark"
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
