import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    localStorage.removeItem("user");
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => readStoredUser());

  const role = user?.role || "";

  const login = ({ token: nextToken, user: nextUser }) => {
    if (nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
    }

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      login,
      logout,
    }),
    [user, token, role]
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
