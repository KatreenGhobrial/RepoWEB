"use strict";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Header from "../UIComponents/Header";
import { useAuth } from "../context/AuthContext";
import * as forumService from "./forumService";
const TAG_COLORS = {
  mqtt: "bg-cyan-500/10 text-cyan-400",
  hardware: "bg-purple-500/10 text-purple-400",
  security: "bg-red-500/10 text-red-400",
  power: "bg-amber-500/10 text-amber-400",
  cloud: "bg-blue-500/10 text-blue-400",
  protocol: "bg-emerald-500/10 text-emerald-400",
  sensor: "bg-pink-500/10 text-pink-400",
  integration: "bg-orange-500/10 text-orange-400"
};
export default function KnowledgeSharing() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  useEffect(() => {
    loadPosts();
  }, [tagFilter, searchQuery]);
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await forumService.list(tagFilter || void 0, searchQuery || void 0);
      setPosts(data);
    } catch (err) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const post = await forumService.create({
        title,
        content,
        tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      });
      setPosts((prev) => [post, ...prev]);
      setShowForm(false);
      setTitle("");
      setContent("");
      setTags("");
    } catch (err) {
      setError(err.message || "Failed to create post");
    } finally {
      setSaving(false);
    }
  };
  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedPost || !replyContent.trim()) return;
    setReplying(true);
    try {
      const updated = await forumService.reply(selectedPost._id, replyContent);
      setSelectedPost(updated);
      setPosts((prev) => prev.map((p) => p._id === updated._id ? updated : p));
      setReplyContent("");
    } catch (err) {
      setError(err.message || "Failed to post reply");
    } finally {
      setReplying(false);
    }
  };
  const handleUpvote = async (postId) => {
    try {
      const res = await forumService.upvote(postId);
      setPosts(
        (prev) => prev.map(
          (p) => p._id === postId ? { ...p, upvotes: res.upvoted ? [...p.upvotes, user?.id || ""] : p.upvotes.filter((id) => id !== user?.id) } : p
        )
      );
    } catch {
    }
  };
  const getTagColor = (tag) => TAG_COLORS[tag] || "bg-slate-700/50 text-slate-400";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Header,
      {
        title: "\u{1F4AC} Knowledge Forum",
        subtitle: "Share solutions, ask questions, and collaborate with the IoT community"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setShowForm(!showForm);
            setSelectedPost(null);
          },
          className: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20",
          children: showForm ? "\u2715 Cancel" : "+ New Post"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          placeholder: "\u{1F50D} Search posts...",
          className: "bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 w-48"
        }
      ),
      /* @__PURE__ */ jsxs("select", { value: tagFilter, onChange: (e) => setTagFilter(e.target.value), className: "bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white", children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "All Tags" }),
        Object.keys(TAG_COLORS).map((tag) => /* @__PURE__ */ jsx("option", { value: tag, children: tag }, tag))
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500 ml-auto", children: [
        posts.length,
        " posts"
      ] })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-4", children: [
      "\u26A0\uFE0F ",
      error
    ] }),
    showForm && /* @__PURE__ */ jsxs("form", { onSubmit: handleCreate, className: "bg-slate-800/30 border border-white/5 rounded-2xl p-6 mb-6 space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white", children: "Create New Post" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1.5", children: "Title *" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g. How to reduce latency in MQTT?", className: "w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50", required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1.5", children: "Content *" }),
        /* @__PURE__ */ jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value), rows: 4, placeholder: "Describe your question, solution, or insight...", className: "w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none", required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1.5", children: "Tags (comma-separated)" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: tags, onChange: (e) => setTags(e.target.value), placeholder: "mqtt, hardware, security", className: "w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50" })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: saving || !title.trim() || !content.trim(), className: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50", children: saving ? "Posting..." : "\u{1F4E2} Publish Post" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: `${selectedPost ? "lg:col-span-1" : "lg:col-span-3"} space-y-3`, children: [
        loading && /* @__PURE__ */ jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsx("div", { className: "w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" }) }),
        !loading && posts.length === 0 && /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-4xl", children: "\u{1F4ED}" }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-slate-300 mt-4", children: "No Posts Yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-2", children: "Be the first to share knowledge!" })
        ] }),
        posts.map((post) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setSelectedPost(post);
              setShowForm(false);
            },
            className: `w-full text-left bg-slate-800/30 border rounded-xl p-4 transition-all hover:bg-slate-800/60 ${selectedPost?._id === post._id ? "border-cyan-500/50 ring-1 ring-cyan-500/20" : "border-white/5"}`,
            children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-white mb-2 line-clamp-1", children: post.title }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mb-3 line-clamp-2", children: post.content }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: post.tags.slice(0, 3).map((tag) => /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${getTagColor(tag)}`, children: tag }, tag)) }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-slate-500", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "\u25B2 ",
                    post.upvotes.length
                  ] }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "\u{1F4AC} ",
                    post.replies.length
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2 text-xs text-slate-500", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  "by ",
                  typeof post.author === "object" ? post.author.username : "Unknown"
                ] }),
                /* @__PURE__ */ jsx("span", { children: "\u2022" }),
                /* @__PURE__ */ jsx("span", { children: new Date(post.createdAt).toLocaleDateString() })
              ] })
            ]
          },
          post._id
        ))
      ] }),
      selectedPost && /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/30 border border-white/5 rounded-2xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 border-b border-white/5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white", children: selectedPost.title }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSelectedPost(null),
                className: "text-slate-500 hover:text-white text-sm",
                children: "\u2715"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-2", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-400", children: [
              "by ",
              /* @__PURE__ */ jsx("strong", { className: "text-cyan-400", children: typeof selectedPost.author === "object" ? selectedPost.author.username : "Unknown" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: new Date(selectedPost.createdAt).toLocaleString() })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 mt-3", children: selectedPost.tags.map((tag) => /* @__PURE__ */ jsx("span", { className: `text-xs px-2.5 py-1 rounded-full ${getTagColor(tag)}`, children: tag }, tag)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 border-b border-white/5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 whitespace-pre-wrap leading-relaxed", children: selectedPost.content }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-4", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleUpvote(selectedPost._id),
                className: `flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${selectedPost.upvotes.includes(user?.id || "") ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-slate-400 hover:bg-white/10"}`,
                children: [
                  "\u25B2 ",
                  selectedPost.upvotes.length
                ]
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500", children: [
              selectedPost.replies.length,
              " replies"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 space-y-4 max-h-60 overflow-y-auto", children: [
          selectedPost.replies.map((reply) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-xs flex-shrink-0", children: typeof reply.author === "object" ? reply.author.username?.charAt(0).toUpperCase() : "?" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-white", children: typeof reply.author === "object" ? reply.author.username : "Unknown" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: new Date(reply.createdAt).toLocaleString() })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300", children: reply.content })
            ] })
          ] }, reply._id)),
          selectedPost.replies.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 text-center py-4", children: "No replies yet. Be the first!" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleReply, className: "px-6 py-4 border-t border-white/5 flex gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: replyContent,
              onChange: (e) => setReplyContent(e.target.value),
              placeholder: "Write a reply...",
              className: "flex-1 bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: replying || !replyContent.trim(),
              className: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50",
              children: replying ? "..." : "Reply"
            }
          )
        ] })
      ] }) })
    ] })
  ] });
}

