import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null));
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const login = async (credentials) => {
    const res = await api.post("/login", credentials);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      if (token) await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(() => ({ token, user, setUser, login, logout, isAuthenticated: Boolean(token) }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
