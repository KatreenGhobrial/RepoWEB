import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Header from "../UIComponents/Header";
import LabeledInput from '../UIComponents/LabeledInput';
import * as communityService from "./communityService";

const TAG_COLORS = {
  mqtt: "bg-cyan-100 text-cyan-700",
  hardware: "bg-purple-100 text-purple-700",
  security: "bg-red-100 text-red-700",
  power: "bg-amber-100 text-amber-700",
  cloud: "bg-blue-100 text-blue-700",
  protocol: "bg-emerald-100 text-emerald-700",
  sensor: "bg-pink-100 text-pink-700",
  integration: "bg-orange-100 text-orange-700"
};

export default function CommunityBoard() {
  const userStr = localStorage.getItem('currentUser');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser ? currentUser._id : "anonymous";

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

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      withCredentials: true,
    });

    socket.on('new_post', (post) => {
      setPosts((prev) => [post, ...prev]);
    });

    socket.on('post_updated', (updatedPost) => {
      setPosts((prev) => prev.map((p) => p._id === updatedPost._id ? updatedPost : p));
      setSelectedPost((prevSelected) => prevSelected?._id === updatedPost._id ? updatedPost : prevSelected);
    });

    socket.on('upvote_update', ({ postId, upvotes }) => {
      setPosts((prev) => prev.map((p) => {
        if (p._id === postId) {
          // Handled elsewhere if full object is sent, or just updating visually
        }
        return p;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [tagFilter, searchQuery]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await communityService.list(tagFilter || undefined, searchQuery || undefined);
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
      await communityService.create({
        title,
        content,
        tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      });
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
      await communityService.reply(selectedPost._id, replyContent);
      setReplyContent("");
    } catch (err) {
      setError(err.message || "Failed to post reply");
    } finally {
      setReplying(false);
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const res = await communityService.upvote(postId);
      setPosts(
        (prev) => prev.map(
          (p) => p._id === postId ? { ...p, upvotes: res.upvoted ? [...p.upvotes, currentUserId] : p.upvotes.filter((id) => id !== currentUserId) } : p
        )
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => ({
          ...prev,
          upvotes: res.upvoted ? [...prev.upvotes, currentUserId] : prev.upvotes.filter((id) => id !== currentUserId)
        }));
      }
    } catch {
    }
  };

  const getTagColor = (tag) => TAG_COLORS[tag] || "bg-slate-100 text-slate-500";

  return (
    <>
      <Header
        title="💬 Community Board"
        subtitle="Share solutions, ask questions, and collaborate with the IoT community"
      />
      
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) setSelectedPost(null);
          }}
          className="bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-700 transition-all shadow-sm"
        >
          {showForm ? "✕ Cancel" : "+ New Post"}
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search posts..."
          className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-48 shadow-sm"
        />
        <select 
          value={tagFilter} 
          onChange={(e) => setTagFilter(e.target.value)} 
          className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 shadow-sm"
        >
          <option value="">All Tags</option>
          {Object.keys(TAG_COLORS).map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <span className="text-sm font-medium text-slate-500 ml-auto">
          {posts.length} posts
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm mb-4 font-medium">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${(selectedPost || showForm) ? "lg:col-span-1" : "lg:col-span-3"} space-y-4`}>
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto"></div>
            </div>
          )}
          {!loading && posts.length === 0 && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-12 text-center">
              <span className="text-5xl">📫</span>
              <h3 className="text-xl font-bold text-slate-800 mt-4">No Posts Yet</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">Be the first to share knowledge!</p>
            </div>
          )}
          {posts.map((post) => (
            <button
              key={post._id}
              onClick={() => {
                setSelectedPost(post);
                setShowForm(false);
              }}
              className={`w-full text-left bg-white border shadow-sm rounded-2xl p-5 transition-all hover:border-sky-300 hover:shadow-md ${selectedPost?._id === post._id ? "border-sky-500 ring-2 ring-sky-100" : "border-slate-200"}`}
            >
              <h4 className="text-base font-bold text-slate-900 mb-2 line-clamp-1">{post.title}</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getTagColor(tag)}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1">▲ {post.upvotes.length}</span>
                  <span className="flex items-center gap-1">💬 {post.replies.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-400">
                <span>by {post.author?.username || "Unknown"}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>

        {(selectedPost || showForm) && (
          <div className="lg:col-span-2">
            {showForm ? (
              <form onSubmit={handleCreate} className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 space-y-6 sticky top-6">
                <h3 className="text-2xl font-bold text-slate-900">Create New Post</h3>
                <LabeledInput label="Title *" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How to reduce latency in MQTT?" className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                <LabeledInput label="Content *">
                  <textarea 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    rows={6} 
                    placeholder="Describe your question, solution, or insight..." 
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" 
                    required 
                  />
                </LabeledInput>
                <LabeledInput label="Tags (comma-separated)" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="mqtt, hardware, security" className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <button type="submit" disabled={saving || !title.trim() || !content.trim()} className="bg-slate-950 text-white px-8 py-3 rounded-2xl font-bold text-sm disabled:opacity-50 hover:bg-slate-800 transition-colors">
                  {saving ? "⏳ Posting..." : "📢 Publish Post"}
                </button>
              </form>
            ) : (
              <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden sticky top-6">
                <div className="px-8 py-6 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedPost.title}</h2>
                    <button onClick={() => setSelectedPost(null)} className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-full transition-colors">✕</button>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-sm text-slate-500 font-medium">by <strong className="text-sky-600">{selectedPost.author?.username || "Unknown"}</strong></span>
                    <span className="text-sm text-slate-400">{new Date(selectedPost.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {selectedPost.tags.map((tag) => (
                      <span key={tag} className={`text-xs font-bold px-3 py-1.5 rounded-full ${getTagColor(tag)}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
                  <div className="flex items-center gap-4 mt-6">
                    <button onClick={() => handleUpvote(selectedPost._id)} className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm ${selectedPost.upvotes.includes(currentUserId) ? "bg-sky-100 text-sky-700 border border-sky-200" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      ▲ {selectedPost.upvotes.length}
                    </button>
                    <span className="text-sm font-medium text-slate-500">{selectedPost.replies.length} replies</span>
                  </div>
                </div>
                <div className="px-8 py-6 space-y-6 max-h-[400px] overflow-y-auto">
                  {selectedPost.replies.map((reply) => (
                    <div key={reply._id} className="flex gap-4">
                      <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                        {reply.author?.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-slate-900">{reply.author?.username || "Unknown"}</span>
                          <span className="text-xs font-medium text-slate-400">{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                  {selectedPost.replies.length === 0 && (
                    <p className="text-sm font-medium text-slate-400 text-center py-6">No replies yet. Be the first to help out!</p>
                  )}
                </div>
                <form onSubmit={handleReply} className="px-8 py-5 border-t border-slate-100 bg-white flex gap-4 items-center">
                  <input type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write a helpful reply..." className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all" />
                  <button type="submit" disabled={replying || !replyContent.trim()} className="bg-sky-600 text-white px-6 py-3 rounded-2xl font-bold text-sm disabled:opacity-50 hover:bg-sky-700 shadow-sm transition-all">
                    {replying ? "..." : "Reply"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
