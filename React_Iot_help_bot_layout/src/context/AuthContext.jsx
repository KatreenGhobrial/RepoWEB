"use strict";
import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../UserManagement/authService";
const AuthContext = createContext(void 0);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);
  const login = async (usernameOrEmail, password) => {
    const res = await authService.login(usernameOrEmail, password);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
  };
  const register = async (data) => {
    const res = await authService.register(data);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
  };
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };
  const updateUser = async (data) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, token, loading, login, register, logout, updateUser }, children });
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
