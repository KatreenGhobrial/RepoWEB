"use strict";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Header from "../UIComponents/Header";
import * as libraryService from "./iotService";
const TABS = [
  { key: "protocols", label: "Protocols", icon: "\u{1F4E1}" },
  { key: "hardware", label: "Hardware", icon: "\u{1F527}" },
  { key: "cloudPlatforms", label: "Cloud", icon: "\u2601\uFE0F" },
  { key: "sensors", label: "Sensors", icon: "\u{1F4CF}" }
];
export default function IoTSolutionLibrary() {
  const [activeTab, setActiveTab] = useState("protocols");
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    loadLibrary();
  }, []);
  const loadLibrary = async () => {
    setLoading(true);
    try {
      const lib = await libraryService.getAll();
      setData(lib);
    } catch (err) {
      setError(err.message || "Failed to load library");
    } finally {
      setLoading(false);
    }
  };
  const filterBySearch = (items) => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) => Object.values(item).some(
        (val) => typeof val === "string" && val.toLowerCase().includes(q)
      )
    );
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Header,
      {
        title: "\u{1F4DA} IoT Solution Library",
        subtitle: "Browse and compare protocols, hardware, sensors, and cloud platforms"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value: search,
        onChange: (e) => setSearch(e.target.value),
        placeholder: "\u{1F50D} Search across all categories...",
        className: "w-full max-w-md bg-slate-700/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-6 overflow-x-auto", children: TABS.map((tab) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setActiveTab(tab.key),
        className: `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-slate-800/30 text-slate-400 border border-white/5 hover:bg-slate-800/60"}`,
        children: [
          /* @__PURE__ */ jsx("span", { children: tab.icon }),
          " ",
          tab.label
        ]
      },
      tab.key
    )) }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6", children: [
      "\u26A0\uFE0F ",
      error
    ] }),
    loading && /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-3", children: "Loading library..." })
    ] }),
    data && !loading && /* @__PURE__ */ jsxs(Fragment, { children: [
      activeTab === "protocols" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        filterBySearch(data.protocols).map((proto) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white", children: proto.name }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-cyan-400", children: proto.category })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400", children: proto.type })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mb-3", children: proto.description }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs mb-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Best For" }),
              /* @__PURE__ */ jsx("p", { className: "text-slate-300", children: proto.bestFor })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: "Power Usage" }),
              /* @__PURE__ */ jsx("p", { className: "text-slate-300", children: proto.powerUsage })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-emerald-400 mb-1", children: "\u2705 Pros" }),
              proto.pros.map((p, i) => /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-400", children: [
                "\u2022 ",
                p
              ] }, i))
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 mb-1", children: "\u274C Cons" }),
              proto.cons.map((c, i) => /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-400", children: [
                "\u2022 ",
                c
              ] }, i))
            ] })
          ] })
        ] }, proto.name)),
        filterBySearch(data.protocols).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 col-span-2 text-center py-8", children: "No protocols match your search." })
      ] }),
      activeTab === "hardware" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        filterBySearch(data.hardware).map((hw) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white", children: hw.name }),
            /* @__PURE__ */ jsx("span", { className: "text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400", children: hw.type })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mb-3", children: hw.description }),
          /* @__PURE__ */ jsxs("div", { className: "bg-slate-700/30 rounded-lg p-3 mb-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Specs" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1", children: Object.entries(hw.specs).map(([key, val]) => /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-slate-500", children: [
                key,
                ": "
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: String(val) })
            ] }, key)) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
            "Best for: ",
            /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: hw.bestFor })
          ] })
        ] }, hw.name)),
        filterBySearch(data.hardware).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 col-span-2 text-center py-8", children: "No hardware matches your search." })
      ] }),
      activeTab === "cloudPlatforms" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        filterBySearch(data.cloudPlatforms).map((cp) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white", children: cp.name }),
            /* @__PURE__ */ jsx("span", { className: "text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400", children: cp.type })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mb-3", children: cp.description }),
          /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-1", children: "Features" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: cp.features.map((f, i) => /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400", children: f }, i)) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
            "Pricing: ",
            /* @__PURE__ */ jsx("span", { className: "text-emerald-400", children: cp.pricing })
          ] })
        ] }, cp.name)),
        filterBySearch(data.cloudPlatforms).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 col-span-2 text-center py-8", children: "No cloud platforms match your search." })
      ] }),
      activeTab === "sensors" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        filterBySearch(data.sensors).map((sensor) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-white mb-2", children: sensor.name }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Type" }),
              /* @__PURE__ */ jsx("span", { className: "text-cyan-400", children: sensor.type })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Range" }),
              /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: sensor.range })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Accuracy" }),
              /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: sensor.accuracy })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Interface" }),
              /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: sensor.interface })
            ] })
          ] })
        ] }, sensor.name)),
        filterBySearch(data.sensors).length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 col-span-3 text-center py-8", children: "No sensors match your search." })
      ] })
    ] })
  ] });
}

