import { useState, useEffect, FormEvent } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { forumAPI } from '../services/api';
import type { ForumPost } from '../types';

const TAG_COLORS: Record<string, string> = {
  mqtt: 'bg-cyan-500/10 text-cyan-400',
  hardware: 'bg-purple-500/10 text-purple-400',
  security: 'bg-red-500/10 text-red-400',
  power: 'bg-amber-500/10 text-amber-400',
  cloud: 'bg-blue-500/10 text-blue-400',
  protocol: 'bg-emerald-500/10 text-emerald-400',
  sensor: 'bg-pink-500/10 text-pink-400',
  integration: 'bg-orange-500/10 text-orange-400',
};

export default function KnowledgeSharing() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Create form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  // Reply form
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [tagFilter, searchQuery]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await forumAPI.list(tagFilter || undefined, searchQuery || undefined);
      setPosts(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const post = await forumAPI.create({
        title,
        content,
        tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      });
      setPosts((prev) => [post, ...prev]);
      setShowForm(false);
      setTitle('');
      setContent('');
      setTags('');
    } catch (err) {
      setError((err as Error).message || 'Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !replyContent.trim()) return;
    setReplying(true);
    try {
      const updated = await forumAPI.reply(selectedPost._id, replyContent);
      setSelectedPost(updated);
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setReplyContent('');
    } catch (err) {
      setError((err as Error).message || 'Failed to post reply');
    } finally {
      setReplying(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      const res = await forumAPI.upvote(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, upvotes: res.upvoted ? [...p.upvotes, user?.id || ''] : p.upvotes.filter((id) => id !== user?.id) }
            : p
        )
      );
    } catch {
      // ignore
    }
  };

  const getTagColor = (tag: string) => TAG_COLORS[tag] || 'bg-slate-700/50 text-slate-400';

  return (
    <>
      <Header
        title="💬 Knowledge Forum"
        subtitle="Share solutions, ask questions, and collaborate with the IoT community"
      />

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => { setShowForm(!showForm); setSelectedPost(null); }}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20"
        >
          {showForm ? '✕ Cancel' : '+ New Post'}
        </button>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search posts..."
          className="bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 w-48"
        />

        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
          <option value="">All Tags</option>
          {Object.keys(TAG_COLORS).map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        <span className="text-xs text-slate-500 ml-auto">{posts.length} posts</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-4">⚠️ {error}</div>
      )}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Create New Post</h3>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How to reduce latency in MQTT?" className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50" required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Content *</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Describe your question, solution, or insight..." className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none" required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Tags (comma-separated)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="mqtt, hardware, security" className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <button type="submit" disabled={saving || !title.trim() || !content.trim()} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
            {saving ? 'Posting...' : '📢 Publish Post'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className={`${selectedPost ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-3`}>
          {loading && (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
              <span className="text-4xl">📭</span>
              <h3 className="text-lg font-semibold text-slate-300 mt-4">No Posts Yet</h3>
              <p className="text-sm text-slate-500 mt-2">Be the first to share knowledge!</p>
            </div>
          )}

          {posts.map((post) => (
            <button
              key={post._id}
              onClick={() => { setSelectedPost(post); setShowForm(false); }}
              className={`w-full text-left bg-slate-800/30 border rounded-xl p-4 transition-all hover:bg-slate-800/60 ${
                selectedPost?._id === post._id ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : 'border-white/5'
              }`}
            >
              <h4 className="text-sm font-medium text-white mb-2 line-clamp-1">{post.title}</h4>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{post.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${getTagColor(tag)}`}>{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>▲ {post.upvotes.length}</span>
                  <span>💬 {post.replies.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <span>by {typeof post.author === 'object' ? post.author.username : 'Unknown'}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Post Detail */}
        {selectedPost && (
          <div className="lg:col-span-2">
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl overflow-hidden">
              {/* Post Header */}
              <div className="px-6 py-5 border-b border-white/5">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-bold text-white">{selectedPost.title}</h2>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-slate-500 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-400">
                    by <strong className="text-cyan-400">{typeof selectedPost.author === 'object' ? selectedPost.author.username : 'Unknown'}</strong>
                  </span>
                  <span className="text-xs text-slate-500">{new Date(selectedPost.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedPost.tags.map((tag) => (
                    <span key={tag} className={`text-xs px-2.5 py-1 rounded-full ${getTagColor(tag)}`}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Post Content */}
              <div className="px-6 py-5 border-b border-white/5">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => handleUpvote(selectedPost._id)}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${
                      selectedPost.upvotes.includes(user?.id || '')
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    ▲ {selectedPost.upvotes.length}
                  </button>
                  <span className="text-xs text-slate-500">{selectedPost.replies.length} replies</span>
                </div>
              </div>

              {/* Replies */}
              <div className="px-6 py-5 space-y-4 max-h-60 overflow-y-auto">
                {selectedPost.replies.map((reply) => (
                  <div key={reply._id} className="flex gap-3">
                    <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                      {typeof reply.author === 'object' ? reply.author.username?.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-white">
                          {typeof reply.author === 'object' ? reply.author.username : 'Unknown'}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-300">{reply.content}</p>
                    </div>
                  </div>
                ))}
                {selectedPost.replies.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No replies yet. Be the first!</p>
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReply} className="px-6 py-4 border-t border-white/5 flex gap-3">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                />
                <button
                  type="submit"
                  disabled={replying || !replyContent.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
                >
                  {replying ? '...' : 'Reply'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
