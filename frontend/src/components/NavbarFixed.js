import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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

  const [totalDocHeight, setTotalDocHeight] = useState(1000);
  const [windowHeight, setWindowHeight] = useState(800);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateHeights = () => {
      setTotalDocHeight(document.documentElement.scrollHeight || document.body.scrollHeight || 1000);
      setWindowHeight(window.innerHeight || 800);
    };
    updateHeights();
    window.addEventListener("resize", updateHeights);
    const interval = setInterval(updateHeights, 1000);
    return () => {
      window.removeEventListener("resize", updateHeights);
      clearInterval(interval);
    };
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

  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(10, 15, 30, 0)', 'rgba(10, 15, 30, 0.85)']);
  const navBlur = useTransform(scrollY, [0, 80], ['blur(0px)', 'blur(24px)']);
  const navBorderOpacity = useTransform(scrollY, [0, 80], [0, 0.08]);
  const navHeight = useTransform(scrollY, [0, 80], [72, 56]);
  const navShadow = useTransform(scrollY, [0, 80], ['0 0 0 0 transparent', '0 4px 30px rgba(0, 0, 0, 0.3)']);
  const logoScale = useTransform(scrollY, [0, 80], [1, 0.9]);
  
  const progress = useTransform(
    scrollY,
    [0, Math.max(1, totalDocHeight - windowHeight)],
    ['0%', '100%']
  );
  
  if (location.pathname.startsWith("/recruiter")) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        backgroundColor: navBg,
        backdropFilter: navBlur,
        WebkitBackdropFilter: navBlur,
        borderBottom: `1px solid rgba(255, 255, 255, ${navBorderOpacity})`,
        height: navHeight,
        boxShadow: navShadow,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        transition: 'height 0.3s ease'
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <motion.div style={{ scale: logoScale }}>
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
        </motion.div>

        <nav className="nav-desktop-links hidden items-center gap-1 rounded-full border border-border bg-surface-elevated px-1.5 py-1 shadow-sm backdrop-blur-xl md:flex">
          {!isLoggedIn && (
            <Link
              to="/jobs"
              onMouseEnter={() => import("../pages/EnhancedJobsPage").catch(() => {})}
              className="rounded-full px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-soft hover:text-text"
            >
              Jobs
            </Link>
          )}

          {isLoggedIn && role === "candidate" && (
            <>
              <Link
                to="/apply"
                onMouseEnter={() => import("../pages/JobsPage").catch(() => {})}
                className="rounded-full px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-soft hover:text-text"
              >
                Apply Jobs
              </Link>
              <Link
                to="/resume-score"
                onMouseEnter={() => import("../pages/ResumeScorePage").catch(() => {})}
                className="rounded-full px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-soft hover:text-text"
              >
                AI Scorer
              </Link>
            </>
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

          {/* User profile dropdown - visible on desktop and mobile if logged in */}
          {isLoggedIn && (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="avatar-circle flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                  color: "#a5b4fc",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
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
                      <>
                        <button
                          onClick={() => {
                            navigate("/resume-score");
                            setDropdownOpen(false);
                          }}
                          className="dropdown-menu-item"
                        >
                          <Sparkles size={16} />
                          AI Scorer
                        </button>
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
                      </>
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
          )}

          {/* Desktop Only Login/Register Buttons (hidden on mobile) */}
          {!isLoggedIn && (
            <div className="hidden items-center gap-2 md:flex">
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
            </div>
          )}

          {/* Hamburger Menu Button (shown only on mobile) */}
          <button
            onClick={() => setMobileOpen(true)}
            className="nav-hamburger"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <i className="ti ti-menu-2" style={{ fontSize: 20, color: "white" }}>
              <Menu size={20} />
            </i>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                zIndex: 9998,
              }}
            />

            {/* Left Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{
                width: "280px",
                height: "100dvh",
                position: "fixed",
                top: 0,
                left: 0,
                background: "rgba(10,10,20,0.98)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                zIndex: 9999,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "10px 0 30px rgba(0,0,0,0.5)",
              }}
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <div className="rounded-xl bg-gradient-to-tr from-primary to-accent px-2 py-1 text-sm font-extrabold text-white">
                    C
                  </div>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-extrabold text-transparent">
                    CogniFit
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation links inside drawer */}
              <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                {isLoggedIn ? (
                  <>
                    {/* Common / Candidate links */}
                    {role === "candidate" ? (
                      <>
                        {[
                          { to: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
                          { to: "/apply", label: "Apply Jobs", icon: Zap },
                          { to: "/resume-score", label: "AI Scorer", icon: Sparkles },
                          { to: "/cover-letter", label: "AI Cover Letter", icon: Sparkles },
                          { to: "/interview-prep", label: "AI Interview", icon: Sparkles },
                          { to: "/ai-tools", label: "AI Tools", icon: Zap },
                          { to: "/complete-profile", label: "Profile", icon: Sparkles },
                        ].map((link) => {
                          const isActive = location.pathname === link.to;
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                                isActive
                                  ? "bg-[#6366f1]/10 text-[#a5b4fc] border-l-4 border-[#6366f1]"
                                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                              }`}
                              style={{ minHeight: "52px" }}
                            >
                              <Icon size={18} />
                              {link.label}
                            </Link>
                          );
                        })}
                      </>
                    ) : (
                      /* Recruiter links */
                      <>
                        {[
                          { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                        ].map((link) => {
                          const isActive = location.pathname === link.to;
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                                isActive
                                  ? "bg-[#6366f1]/10 text-[#a5b4fc] border-l-4 border-[#6366f1]"
                                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                              }`}
                              style={{ minHeight: "52px" }}
                            >
                              <Icon size={18} />
                              {link.label}
                            </Link>
                          );
                        })}
                      </>
                    )}
                  </>
                ) : (
                  /* Public / Guest links */
                  <>
                    {[
                      { to: "/jobs", label: "Browse Jobs", icon: Zap },
                      { to: "/login", label: "Login", icon: LogOut },
                      { to: "/register", label: "Get Started", icon: Sparkles },
                    ].map((link) => {
                      const isActive = location.pathname === link.to;
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                            isActive
                              ? "bg-[#6366f1]/10 text-[#a5b4fc] border-l-4 border-[#6366f1]"
                              : "text-slate-400 hover:bg-white/5 hover:text-white"
                          }`}
                          style={{ minHeight: "52px" }}
                        >
                          <Icon size={18} />
                          {link.label}
                        </Link>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Logout button at bottom of drawer */}
              {isLoggedIn && (
                <div className="mt-auto pt-4 border-t border-white/5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                    style={{ minHeight: "52px" }}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '1.5px',
          background: 'gradient-linear',
          backgroundImage: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
          width: progress
        }}
      />
    </motion.nav>
  );
};

export default NavbarFixed;
