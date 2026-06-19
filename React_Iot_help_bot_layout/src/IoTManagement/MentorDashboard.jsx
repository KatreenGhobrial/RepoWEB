"use strict";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Header from "../UIComponents/Header";
import * as mentorService from "./iotService";
export default function MentorDashboard() {
  const [dashData, setDashData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fbContent, setFbContent] = useState("");
  const [fbCategory, setFbCategory] = useState("general");
  const [fbRating, setFbRating] = useState(5);
  const [fbSaving, setFbSaving] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastResult, setBroadcastResult] = useState("");
  useEffect(() => {
    loadDashboard();
  }, []);
  useEffect(() => {
    if (selectedProject) loadFeedback(selectedProject);
  }, [selectedProject]);
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dash, projs] = await Promise.all([
        mentorService.getDashboard(),
        mentorService.getProjects()
      ]);
      setDashData(dash);
      setProjects(projs);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };
  const loadFeedback = async (projectId) => {
    try {
      const fb = await mentorService.getFeedback(projectId);
      setFeedback(fb);
    } catch {
    }
  };
  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setFbSaving(true);
    try {
      await mentorAPI.giveFeedback({
        projectId: selectedProject,
        content: fbContent,
        category: fbCategory,
        rating: fbRating
      });
      setFbContent("");
      await loadFeedback(selectedProject);
    } catch (err) {
      setError(err.message || "Failed to send feedback");
    } finally {
      setFbSaving(false);
    }
  };
  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    try {
      const res = await mentorAPI.broadcast(broadcastMsg);
      setBroadcastResult(`Sent to ${res.sentTo.length} projects`);
      setBroadcastMsg("");
    } catch (err) {
      setError(err.message || "Broadcast failed");
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Header, { title: "\u{1F393} Mentor Dashboard", subtitle: "Oversee student projects and provide guidance" }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6", children: [
      "\u26A0\uFE0F ",
      error
    ] }),
    dashData && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [
      { label: "Active Projects", value: dashData.activeProjects, icon: "\u{1F4C2}", color: "cyan" },
      { label: "Total Students", value: dashData.totalStudents, icon: "\u{1F465}", color: "blue" },
      { label: "Tasks Completed", value: dashData.completedTasks, icon: "\u2705", color: "emerald" },
      { label: "Avg Reflection", value: dashData.avgReflection.toFixed(1), icon: "\u{1F9E0}", color: "purple" }
    ].map((stat) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/30 border border-white/5 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx("span", { children: stat.icon }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: stat.label })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-white", children: stat.value })
    ] }, stat.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1 space-y-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-slate-300 mb-2", children: "\u{1F4C2} Student Projects" }),
        projects.map((proj) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSelectedProject(proj._id),
            className: `w-full text-left bg-slate-800/30 border rounded-xl p-4 transition-all hover:bg-slate-800/60 ${selectedProject === proj._id ? "border-cyan-500/50 ring-1 ring-cyan-500/20" : "border-white/5"}`,
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-white", children: proj.name }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400", children: proj.phase }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: proj.device })
              ] })
            ]
          },
          proj._id
        )),
        projects.length === 0 && !loading && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 text-center py-8", children: "No projects found" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        selectedProject && /* @__PURE__ */ jsxs("form", { onSubmit: handleFeedback, className: "bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white", children: "\u{1F4AC} Give Feedback" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: fbContent,
              onChange: (e) => setFbContent(e.target.value),
              rows: 3,
              placeholder: "Write your feedback for this team...",
              className: "w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none",
              required: true
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1.5", children: "Category" }),
              /* @__PURE__ */ jsxs("select", { value: fbCategory, onChange: (e) => setFbCategory(e.target.value), className: "w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white", children: [
                /* @__PURE__ */ jsx("option", { value: "general", children: "General" }),
                /* @__PURE__ */ jsx("option", { value: "architecture", children: "Architecture" }),
                /* @__PURE__ */ jsx("option", { value: "collaboration", children: "Collaboration" }),
                /* @__PURE__ */ jsx("option", { value: "technical", children: "Technical" }),
                /* @__PURE__ */ jsx("option", { value: "milestone", children: "Milestone" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1.5", children: "Rating" }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setFbRating(n),
                  className: `text-lg ${n <= fbRating ? "text-amber-400" : "text-slate-600"}`,
                  children: "\u2605"
                },
                n
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: fbSaving, className: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 shadow-lg shadow-cyan-500/20", children: fbSaving ? "Sending..." : "\u{1F4E8} Send Feedback" })
        ] }),
        selectedProject && feedback.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/30 border border-white/5 rounded-2xl p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-slate-300 mb-3", children: "\u{1F4CB} Feedback History" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-60 overflow-y-auto", children: feedback.map((fb) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-cyan-400 capitalize", children: fb.category }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: new Date(fb.createdAt).toLocaleDateString() })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300", children: fb.content }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-0.5 mt-1", children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsx("span", { className: `text-xs ${n <= fb.rating ? "text-amber-400" : "text-slate-700"}`, children: "\u2605" }, n)) })
          ] }, fb._id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-2xl p-6", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-base font-semibold text-white mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { children: "\u{1F4E2}" }),
            " Broadcast to All Teams"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: broadcastMsg,
                onChange: (e) => setBroadcastMsg(e.target.value),
                placeholder: "Type a message to send to all project teams...",
                className: "flex-1 bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              }
            ),
            /* @__PURE__ */ jsx("button", { onClick: handleBroadcast, className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm", children: "Send" })
          ] }),
          broadcastResult && /* @__PURE__ */ jsxs("p", { className: "text-xs text-emerald-400 mt-2", children: [
            "\u2705 ",
            broadcastResult
          ] })
        ] }),
        !selectedProject && /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-4xl", children: "\u{1F448}" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-300 mt-4", children: "Select a Project" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-2", children: "Choose a student project from the list to view details and provide feedback." })
        ] })
      ] })
    ] })
  ] });
}

