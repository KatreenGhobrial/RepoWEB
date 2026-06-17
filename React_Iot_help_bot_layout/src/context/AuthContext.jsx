"use strict";
import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import * as usersService from "../UserManagement/usersService";
const AuthContext = createContext(void 0);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await usersService.getMe();
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
    const res = await usersService.login(usernameOrEmail, password);
    localStorage.setItem("token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };
  const register = async (data) => {
    const res = await usersService.register(data);
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
    const updated = await usersService.updateProfile(data);
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
