import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Menu, Moon, Sun, X, BriefcaseBusiness, LayoutDashboard, UserCircle2, Heart, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = useMemo(() => {
    if (!token) {
      return [
        { path: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
        { path: "/login", label: "Login" },
        { path: "/register", label: "Register" },
      ];
    }

    if (role === "candidate") {
      return [
        { path: "/apply", label: "Apply Jobs", icon: BriefcaseBusiness },
        { path: "/personalized/jobs", label: "AI Recommendations", icon: LayoutDashboard },
        { path: "/saved-jobs", label: "Saved Jobs", icon: Heart },
        { path: "/search-history", label: "Search History", icon: Clock },
        { path: "/candidate/dashboard", label: "Applications & Feedback", icon: LayoutDashboard },
      ];
    }

    return [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
      { path: "/candidates", label: "Candidates", icon: UserCircle2 },
    ];
  }, [token, role]);

  const closeAll = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAll();
    navigate("/");
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
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-1.5"
              >
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                  {roleLabel}
                </span>
                <span className="text-sm font-medium text-text">{user?.name || "User"}</span>
                <UserCircle2 size={18} className="text-text-muted" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.97 }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
                    className="glass-card absolute right-0 mt-2 w-52 p-2"
                  >
                    <button
                      onClick={() => {
                        navigate(role === "candidate" ? "/candidate/dashboard" : "/dashboard");
                        setProfileOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-muted hover:bg-surface-soft hover:text-text"
                    >
                      Open Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10"
                    >
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
                Register
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
                <button onClick={handleLogout} className="w-full rounded-lg bg-red-500/10 px-3 py-2 text-left text-sm font-medium text-red-500">
                  Logout
                </button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
