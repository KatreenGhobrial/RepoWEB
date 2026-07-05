import { useState, useEffect } from "react";

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
/**
 * CommunityBoard Component.
 * Serves as the main forum interface for users to post questions, share solutions,
 * and interact with other community members. Supports tag filtering, search, nested replies,
 * upvotes, and marking posts as similar.
 */
export default function CommunityBoard() {
  const userStr = localStorage.getItem('currentUser');
  let currentUser = null;
  try {
    currentUser = userStr ? JSON.parse(userStr) : null;
  } catch(e) {}
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

  // States for duplicate question check and threaded replies
  const [similarPosts, setSimilarPosts] = useState([]);
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [nestedReplyContent, setNestedReplyContent] = useState("");
  const [submittingNestedReply, setSubmittingNestedReply] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadPosts();
  }, [tagFilter, searchQuery]);

  // Debounced check for similar posts
  useEffect(() => {
    if (!title.trim() || title.trim().length < 4) {
      setSimilarPosts([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await communityService.checkSimilar(title);
        setSimilarPosts(data || []);
      } catch (err) {
        console.error("Failed to check similar posts", err);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [title]);

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

  const handleSelectPost = async (post) => {
    setLoading(true);
    try {
      const fullPost = await communityService.get(post._id);
      setSelectedPost(fullPost);
      setShowForm(false);
    } catch (err) {
      setError("Failed to load post details");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let tagsArray = tags.split(",");
      
      await communityService.create({
        title: title,
        content: content,
        tags: tagsArray
      });
      
      const allPosts = await communityService.list();
      setPosts(allPosts);
      
      setShowForm(false);
      setTitle("");
      setContent("");
      setTags("");
      setSimilarPosts([]);
      
    } catch (err) {
      setError("שגיאה ביצירת הפוסט");
    }
    
    setSaving(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (replyContent === "") {
      return;
    }
    
    setReplying(true);
    
    try {
      await communityService.reply(selectedPost._id, replyContent);
      setReplyContent("");
      
      const allPosts = await communityService.list();
      setPosts(allPosts);
      
      const updatedPost = allPosts.find(p => p._id === selectedPost._id);
      setSelectedPost(updatedPost);
      
    } catch (err) {
      setError("error");
    }
    
    setReplying(false);
  };

  const handleRateComment = async (commentId) => {
    try {
      const updatedPost = await communityService.rateComment(selectedPost._id, commentId);
      
      setPosts((prev) => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
      setSelectedPost(updatedPost);
    } catch (err) {
      setError(err.message || "Failed to rate comment");
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      const updatedPost = await communityService.editComment(selectedPost._id, commentId, newContent);
      
      setPosts((prev) => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
      setSelectedPost(updatedPost);
      setEditingCommentId(null);
      setEditContent("");
    } catch (err) {
      setError(err.message || "Failed to edit comment");
    }
  };


  const handleNestedReply = async (e, commentId) => {
    e.preventDefault();
    if (!nestedReplyContent.trim()) return;

    setSubmittingNestedReply(true);
    try {
      const updatedPost = await communityService.replyToComment(selectedPost._id, commentId, nestedReplyContent);
      
      setPosts((prev) => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
      setSelectedPost(updatedPost);
      setNestedReplyContent("");
      setActiveReplyCommentId(null);
    } catch (err) {
      setError(err.message || "Failed to add reply");
    } finally {
      setSubmittingNestedReply(false);
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const res = await communityService.upvote(postId);
      setPosts(
        (prev) => prev.map(
          (p) => p._id === postId ? { ...p, upvotes: res.upvoted ? [...p.upvotes, currentUserId] : p.upvotes.filter((id) => id !== currentUserId), score: res.score } : p
        )
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => ({
          ...prev,
          upvotes: res.upvoted ? [...prev.upvotes, currentUserId] : prev.upvotes.filter((id) => id !== currentUserId),
          score: res.score
        }));
      }
    } catch {
    }
  };

  const getTagColor = (tag) => TAG_COLORS[tag] || "bg-slate-100 text-slate-500 dark:text-slate-400";

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
            if (!showForm) {
              setSelectedPost(null);
              setSimilarPosts([]);
            }
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
          className="bg-white dark:bg-zinc-900 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-48 shadow-sm"
        />
        <select 
          value={tagFilter} 
          onChange={(e) => setTagFilter(e.target.value)} 
          className="bg-white dark:bg-zinc-900 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white shadow-sm"
        >
          <option value="">All Tags</option>
          {Object.keys(TAG_COLORS).map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-auto">
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
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-3xl p-12 text-center">
              <span className="text-5xl">📫</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-4">No Posts Yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Be the first to share knowledge!</p>
            </div>
          )}
          {posts.map((post) => (
            <button
              key={post._id}
              onClick={() => handleSelectPost(post)}
              className={`w-full text-left bg-white dark:bg-zinc-900 border shadow-sm rounded-2xl p-5 transition-all hover:border-sky-300 hover:shadow-md ${selectedPost?._id === post._id ? "border-sky-500 ring-2 ring-sky-100" : "border-slate-200 dark:border-zinc-800"}`}
            >
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{post.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{post.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getTagColor(tag)}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1">👍 {post.score || 0}</span>
                  <span className="flex items-center gap-1">💬 {post.replies.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-400">
                <span>by {post.author?.role === 'mentor' ? post.author.username : "Unknown"}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>

        {(selectedPost || showForm) && (
          <div className="lg:col-span-2">
            {showForm ? (
              <form onSubmit={handleCreate} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-3xl p-8 space-y-6 sticky top-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Post</h3>
                <div>
                  <LabeledInput label="Title *" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How to reduce latency in MQTT?" className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                  
                  {similarPosts.length > 0 && (
                    <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-2xl p-4 mt-3 space-y-2 animate-fadeIn transition-all shadow-inner">
                      <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-bold text-xs">
                        <span>💡 Similar posts already exist:</span>
                      </div>
                      <ul className="space-y-1.5 max-h-36 overflow-y-auto">
                        {similarPosts.map(p => (
                          <li key={p._id}>
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectPost(p);
                                setSimilarPosts([]);
                              }}
                              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200 hover:underline text-left block w-full truncate"
                            >
                              • {p.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <LabeledInput label="Content *">
                  <textarea 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    rows={6} 
                    placeholder="Describe your question, solution, or insight..." 
                    className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" 
                    required 
                  />
                </LabeledInput>
                <LabeledInput label="Tags (comma-separated)" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="mqtt, hardware, security" className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <button type="submit" disabled={saving || !title.trim() || !content.trim()} className="bg-slate-950 text-white dark:bg-cyan-600 dark:text-white px-8 py-3 rounded-2xl font-bold text-sm disabled:opacity-50 hover:bg-slate-800 transition-colors">
                  {saving ? "⏳ Posting..." : "📢 Publish Post"}
                </button>
              </form>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-3xl overflow-hidden sticky top-6">
                <div className="px-8 py-6 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedPost.title}</h2>
                    <button onClick={() => setSelectedPost(null)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-full transition-colors">✕</button>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                      by <strong className="text-sky-600">{selectedPost.author?.role === 'mentor' ? selectedPost.author.username : "Unknown"}</strong>
                      {selectedPost.author?.role === 'mentor' && (
                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
                          Mentor 🎓
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-slate-400">{new Date(selectedPost.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {selectedPost.tags.map((tag) => (
                      <span key={tag} className={`text-xs font-bold px-3 py-1.5 rounded-full ${getTagColor(tag)}`}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 dark:bg-zinc-800/50/50">
                  <p className="text-base text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
                  <div className="flex items-center gap-4 mt-6">
                    <button onClick={() => handleUpvote(selectedPost._id)} className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm ${selectedPost.upvotes.includes(currentUserId) ? "bg-sky-100 text-sky-700 border border-sky-200" : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-zinc-800/50"}`}>
                      👍 {selectedPost.score || 0}
                    </button>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{selectedPost.replies.length} replies</span>
                  </div>
                </div>
                <div className="px-8 py-6 space-y-4 max-h-[400px] overflow-y-auto">
                  {selectedPost.replies.map((reply) => (
                    <CommentNode
                      key={reply._id}
                      reply={reply}
                      currentUserId={currentUserId}
                      activeReplyCommentId={activeReplyCommentId}
                      setActiveReplyCommentId={setActiveReplyCommentId}
                      nestedReplyContent={nestedReplyContent}
                      setNestedReplyContent={setNestedReplyContent}
                      submittingNestedReply={submittingNestedReply}
                      handleNestedReply={handleNestedReply}
                      handleRateComment={handleRateComment}
                      editingCommentId={editingCommentId}
                      setEditingCommentId={setEditingCommentId}
                      editContent={editContent}
                      setEditContent={setEditContent}
                      handleEditComment={handleEditComment}
                    />
                  ))}
                  {selectedPost.replies.length === 0 && (
                    <p className="text-sm font-medium text-slate-400 text-center py-6">No replies yet. Be the first to help out!</p>
                  )}
                </div>
                <form onSubmit={handleReply} className="px-8 py-5 border-t border-slate-100 bg-white dark:bg-zinc-900 flex gap-4 items-center">
                  <input type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write a helpful reply..." className="flex-1 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl px-5 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all" />
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

const CommentNode = ({
  reply,
  currentUserId,
  activeReplyCommentId,
  setActiveReplyCommentId,
  nestedReplyContent,
  setNestedReplyContent,
  submittingNestedReply,
  handleNestedReply,
  handleRateComment,
  editingCommentId,
  setEditingCommentId,
  editContent,
  setEditContent,
  handleEditComment
}) => {
  const hasRated = !!reply.ratings?.find(r => (r.user?._id || r.user)?.toString() === currentUserId);
  const replyCount = reply.replies?.length || 0;
  const isCapped = replyCount >= 10;
  const displayName = reply.author?.role === 'mentor' ? reply.author.username : "Unknown";
  const isAuthor = (reply.author?._id || reply.author)?.toString() === currentUserId;

  return (
    <div className="relative flex gap-4 mt-4 animate-fadeIn">
      {/* Vertical visual hierarchy line connecting replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="absolute left-[19px] top-[40px] bottom-0 w-0.5 bg-slate-200 dark:bg-zinc-800"></div>
      )}

      {/* Avatar */}
      <div className="w-10 h-10 bg-slate-200 text-slate-600 dark:text-slate-400 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm z-10">
        {reply.author?.role === 'mentor' ? (reply.author?.username?.charAt(0).toUpperCase() || "?") : "?"}
      </div>

      {/* Reply Body */}
      <div className="flex-1 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800/60 shadow-sm">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            {displayName}
          </span>
          {reply.author?.role === 'mentor' && (
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
              Mentor 🎓
            </span>
          )}
          <span className="text-xs font-medium text-slate-400 ml-auto">{new Date(reply.createdAt).toLocaleString()}</span>
        </div>

        {/* Text content or edit input */}
        {editingCommentId === reply._id ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditComment(reply._id, editContent);
            }}
            className="mt-2 flex gap-3 items-center"
          >
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              autoFocus
            />
            <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-sky-700 shadow-sm transition-all whitespace-nowrap">
              Save
            </button>
            <button type="button" onClick={() => { setEditingCommentId(null); setEditContent(""); }} className="text-slate-400 hover:text-slate-600 text-xs font-medium px-2 py-1">
              Cancel
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
        )}

        {/* Action Row */}
        <div className="flex items-center gap-4 mt-3">
          <button
            type="button"
            onClick={() => handleRateComment(reply._id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all text-xs font-bold border ${hasRated ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400" : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-zinc-800/40 dark:border-zinc-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800/80"}`}
            title={hasRated ? "Delete rating" : "Add rating"}
          >
            <span>👍</span>
            <span>{reply.score || 0}</span>
          </button>

          <button
            type="button"
            disabled={isCapped}
            onClick={() => {
              setActiveReplyCommentId(reply._id === activeReplyCommentId ? null : reply._id);
              setNestedReplyContent(reply.author?.role === 'mentor' ? `@${reply.author.username} ` : "");
            }}
            className={`text-xs font-bold flex items-center gap-1 transition-all ${isCapped ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" : "text-sky-600 hover:text-sky-800"}`}
          >
            💬 Reply ({replyCount}/10)
          </button>

          {isAuthor && (
            <button
              type="button"
              onClick={() => {
                setEditingCommentId(reply._id);
                setEditContent(reply.content);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 transition-all"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {/* Inline reply editor */}
        {activeReplyCommentId === reply._id && (
          <form onSubmit={(e) => handleNestedReply(e, reply._id)} className="mt-3 flex gap-3 items-center ml-2 lg:ml-6">
            <input
              type="text"
              value={nestedReplyContent}
              onChange={(e) => setNestedReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
            <button type="submit" disabled={submittingNestedReply || !nestedReplyContent.trim()} className="bg-sky-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-sky-700 shadow-sm transition-all whitespace-nowrap">
              {submittingNestedReply ? "..." : "Send"}
            </button>
            <button type="button" onClick={() => { setActiveReplyCommentId(null); setNestedReplyContent(""); }} className="text-slate-400 hover:text-slate-600 text-xs font-medium px-2 py-1">
              Cancel
            </button>
          </form>
        )}

        {/* Recursive Child Comments rendering */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-2 pl-4 border-l border-slate-200 dark:border-zinc-800 space-y-2">
            {reply.replies.map((child) => (
              <CommentNode
                key={child._id}
                reply={child}
                currentUserId={currentUserId}
                activeReplyCommentId={activeReplyCommentId}
                setActiveReplyCommentId={setActiveReplyCommentId}
                nestedReplyContent={nestedReplyContent}
                setNestedReplyContent={setNestedReplyContent}
                submittingNestedReply={submittingNestedReply}
                handleNestedReply={handleNestedReply}
                handleRateComment={handleRateComment}
                editingCommentId={editingCommentId}
                setEditingCommentId={setEditingCommentId}
                editContent={editContent}
                setEditContent={setEditContent}
                handleEditComment={handleEditComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

