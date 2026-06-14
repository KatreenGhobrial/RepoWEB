"use strict";
import { jsx, jsxs } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Loading..." })
    ] }) });
  }
  return user ? /* @__PURE__ */ jsx(Outlet, {}) : /* @__PURE__ */ jsx(Navigate, { to: "/login", replace: true });
}
