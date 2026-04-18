import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading stored user:", error);
    localStorage.removeItem("user");
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => readStoredUser());
  const [role, setRole] = useState(() => localStorage.getItem("role") || readStoredUser()?.role || "");
  const [isReady, setIsReady] = useState(false);
  
  const isAuthenticated = Boolean(token);

  // Check for stored credentials on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = readStoredUser();
    const storedRole = localStorage.getItem("role");

    if (storedToken) {
      setToken(storedToken);
      setUser(storedUser);
      setRole(storedRole || storedUser?.role || "");
    }
    setIsReady(true);
  }, []);

  const login = ({ token: nextToken, user: nextUser }) => {
    if (nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
    }

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);

      const nextRole = nextUser.role || "candidate";
      localStorage.setItem("role", nextRole);
      setRole(nextRole);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setToken("");
    setUser(null);
    setRole("");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated,
      isReady,
      login,
      logout,
    }),
    [user, token, role, isAuthenticated, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
