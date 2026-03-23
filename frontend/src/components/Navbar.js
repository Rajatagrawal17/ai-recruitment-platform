import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CognifitLogo from "./CognifitLogo";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("candidate");
  const token = localStorage.getItem("token");
  const userDropdownRef = useRef(null);

  // Fetch user name from localStorage or API
  useEffect(() => {
    const storedUser = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole");
    if (storedUser) {
      setUserName(storedUser);
    }
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/jobs", label: "Jobs" },
    ...(token
      ? [
          {
            path: userRole === "recruiter" || userRole === "admin" ? "/recruiter" : "/candidate",
            label: "Dashboard",
          },
        ]
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <CognifitLogo size={35} />
            <span>Cognifit</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="navbar-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${isActive(link.path) ? "active" : ""}`}
              >
                {link.label}
                <span className="navbar-underline"></span>
              </Link>
            ))}
          </div>

          {/* Right Section - Desktop */}
          <div className="navbar-right">
            {token && (
              <div className="user-avatar-container" ref={userDropdownRef}>
                <button
                  className="user-avatar"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </button>
                {userDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      Welcome, {userName || "User"}
                    </div>
                    <Link
                      to={userRole === "recruiter" || userRole === "admin" ? "/recruiter" : "/candidate"}
                      className="user-dropdown-item"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="user-dropdown-item logout"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            {!token && (
              <div className="navbar-auth">
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            className={`hamburger ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
                Cognifit
              </Link>
              <button
                className={`hamburger ${mobileMenuOpen ? "open" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>

            <div className="mobile-menu-links">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-menu-link ${isActive(link.path) ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mobile-menu-footer">
              {token ? (
                <>
                  <Link
                    to={userRole === "recruiter" || userRole === "admin" ? "/recruiter" : "/candidate"}
                    className="btn btn-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;