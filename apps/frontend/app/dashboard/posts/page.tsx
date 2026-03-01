'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { ThumbsUp, MessageCircle as CommentIcon, Share2, MoreHorizontal, Image as ImageIcon, Smile, X } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  mediaUrls?: string[];
  postType?: string;
  author: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  community?: { id: string; name: string } | null;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: { id: string; fullName: string; username: string; avatarUrl?: string };
  createdAt: string;
}

// ─── Avatar helper ────────────────────────────────────────────────────────────
function Avatar({
  url, name, size = 10,
}: { url?: string; name?: string; size?: number }) {
  const initial = (name?.[0] || 'U').toUpperCase();
  return (
    <div
      className={`w-${size} h-${size} rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm`}
    >
      {url ? <img src={url} alt={name} className="w-full h-full object-cover" /> : initial}
    </div>
  );
}

// ─── Media Gallery ────────────────────────────────────────────────────────────
function MediaGallery({ urls }: { urls: string[] }) {
  const safeUrls = Array.isArray(urls) ? urls.filter(u => typeof u === 'string' && u.length > 0) : [];
  if (safeUrls.length === 0) return null;

  const isVideo = (url: string) =>
    /\.(mp4|mov|webm|avi)(\?|$)/i.test(url) || url.includes('/video/');

  if (safeUrls.length === 1) {
    const url = safeUrls[0];
    return (
      <div className="mt-3 bg-black overflow-hidden max-h-[500px]">
        {isVideo(url) ? (
          <video src={url} controls className="w-full max-h-[500px] object-contain" preload="metadata" />
        ) : (
          <img src={url} alt="Post media" className="w-full max-h-[500px] object-cover cursor-pointer" onClick={() => window.open(url, '_blank')} />
        )}
      </div>
    );
  }

  return (
    <div className={`mt-3 grid gap-0.5 ${safeUrls.length === 2 ? 'grid-cols-2' : safeUrls.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {safeUrls.slice(0, 4).map((url, i) => (
        <div key={i} className="relative aspect-square bg-black">
          {isVideo(url) ? (
            <video src={url} className="w-full h-full object-cover" preload="metadata" />
          ) : (
            <img src={url} alt={`Media ${i + 1}`} className="w-full h-full object-cover cursor-pointer hover:opacity-95" onClick={() => window.open(url, '_blank')} />
          )}
          {i === 3 && safeUrls.length > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold">
              +{safeUrls.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Status / Story Strip ─────────────────────────────────────────────────────
function StatusStrip() {
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/status/grouped').then(r => {
      setGroups(r.data?.data?.groups || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 mb-3">
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <Link href="/dashboard/status/new" className="flex-shrink-0 flex flex-col items-center gap-1.5">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center bg-blue-50 text-blue-500 text-2xl font-bold">
            +
          </div>
          <span className="text-xs text-gray-500 font-medium">Add Story</span>
        </Link>
        {groups.map(group => {
          if (!group?.user?.id) return null;
          return (
            <Link key={group.user.id} href="/dashboard/status" className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {group.user?.avatarUrl
                      ? <img src={group.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : (group.user?.fullName?.[0] || 'U').toUpperCase()
                    }
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 truncate w-16 text-center font-medium">
                {group.user?.fullName?.split(' ')[0] || group.user?.username}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Post Composer ─────────────────────────────────────────────────────────────
function PostComposer({ currentUser }: { currentUser: any }) {
  const avatarInitial = (currentUser?.fullName?.[0] || currentUser?.username?.[0] || 'U').toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {currentUser?.avatarUrl
            ? <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
            : avatarInitial}
        </div>
        <Link href="/dashboard/posts/new" className="flex-1">
          <div className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2.5 text-gray-500 text-sm cursor-pointer transition">
            What's on your mind, {currentUser?.fullName?.split(' ')[0] || 'friend'}?
          </div>
        </Link>
      </div>
      <div className="border-t border-gray-100 pt-3 flex justify-around">
        <Link href="/dashboard/status/new" className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-sm font-semibold transition">
          <span className="text-lg">📸</span> Photo/Story
        </Link>
        <Link href="/dashboard/posts/new" className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-sm font-semibold transition">
          <span className="text-lg">✝️</span> Faith Moment
        </Link>
        <Link href="/dashboard/prayers/new" className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-sm font-semibold transition">
          <span className="text-lg">🙏</span> Prayer
        </Link>
      </div>
    </div>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({
  post, currentUser, onLike, onDelete,
}: {
  post: Post;
  currentUser: any;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  const fetchComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const r = await apiClient.get(`/posts/${post.id}/comments`);
      setComments(r.data?.data?.comments || []);
    } catch { /* silent */ }
    finally { setLoadingComments(false); }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) await fetchComments();
    setShowComments(v => !v);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await apiClient.post(`/posts/${post.id}/comments`, { content: newComment.trim() });
      setNewComment('');
      setCommentCount(c => c + 1);
      await fetchComments();
    } catch { /* silent */ }
  };

  const canDelete = currentUser && (post.author.id === currentUser.id || currentUser.role === 'admin' || currentUser.role === 'super_admin');
  const avatarInitial = (post.author?.fullName?.[0] || post.author?.username?.[0] || 'U').toUpperCase();

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return d.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5">
          <Link href={`/dashboard/profile`}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {post.author?.avatarUrl
                ? <img src={post.author.avatarUrl} alt={post.author.fullName} className="w-full h-full object-cover" />
                : avatarInitial}
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-gray-900 text-[15px] hover:underline cursor-pointer">
                {post.author?.fullName || post.author?.username}
              </span>
              {post.community && (
                <span className="text-gray-500 text-sm">
                  › <span className="text-blue-600 font-medium hover:underline cursor-pointer">{post.community.name}</span>
                </span>
              )}
              {post.postType && post.postType !== 'regular' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize font-medium">
                  {post.postType}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{formatTime(post.createdAt)} · 🌐</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {canDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-red-400 hover:text-red-500 transition text-lg"
              title="Delete post"
            >
              ×
            </button>
          )}
          <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {post.content && (
        <p className="px-4 pb-2 text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* ── Media ── */}
      <MediaGallery urls={post.mediaUrls || []} />

      {/* ── Stats (likes + comments count) ── */}
      {(post.likeCount > 0 || commentCount > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500">
          {post.likeCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <div className="w-[18px] h-[18px] rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]">👍</div>
              </div>
              <span className="hover:underline cursor-pointer">{post.likeCount}</span>
            </div>
          )}
          {commentCount > 0 && (
            <button onClick={toggleComments} className="hover:underline ml-auto">
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="border-t border-gray-100 mx-4" />
      <div className="flex items-center px-2 py-1">
        <button
          onClick={() => onLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-semibold transition ${
            post.isLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ThumbsUp className={`w-5 h-5 ${post.isLiked ? 'fill-blue-600' : ''}`} />
          Like
        </button>
        <button
          onClick={toggleComments}
          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
        >
          <CommentIcon className="w-5 h-5" />
          Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition">
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* ── Comments Section ── */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          {/* Add comment input */}
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {(currentUser?.fullName?.[0] || 'U').toUpperCase()}
            </div>
            <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2 flex items-center gap-2">
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
                placeholder="Write a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(); } }}
              />
              {newComment.trim() && (
                <button
                  onClick={addComment}
                  className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                >
                  Post
                </button>
              )}
            </div>
          </div>

          {/* Comments list */}
          {loadingComments ? (
            <div className="flex justify-center py-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {comments.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-1">No comments yet. Be the first!</p>
              )}
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(c.author?.fullName?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                      <span className="font-semibold text-xs text-gray-800 block">
                        {c.author?.fullName || c.author?.username}
                      </span>
                      <p className="text-sm text-gray-700">{c.content}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 pl-1">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Feed Page ───────────────────────────────────────────────────────────
export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setCurrentUser(JSON.parse(u));
    fetchPosts();
    fetchSuggested();
  }, []);

  const fetchPosts = async () => {
    try {
      const r = await apiClient.get('/posts?page=1&limit=30');
      setPosts(r.data?.data?.posts || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const fetchSuggested = async () => {
    try {
      const r = await apiClient.get('/friendship/users/search?query=a&limit=6');
      setSuggestedUsers((r.data?.data || []).slice(0, 5));
    } catch { /* silent */ }
  };

  const likePost = async (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
        : p
    ));
    try {
      await apiClient.post(`/posts/${postId}/like`);
    } catch {
      // revert
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      ));
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await apiClient.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (e: any) {
      alert(e.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 max-w-5xl mx-auto px-2 py-3">

      {/* ── CENTER FEED ── */}
      <div className="flex-1 min-w-0 max-w-[600px] mx-auto">
        {/* Stories */}
        <StatusStrip />

        {/* Composer */}
        <PostComposer currentUser={currentUser} />

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-700 font-semibold mb-1">No posts yet</p>
            <p className="text-sm text-gray-500 mb-5">Be the first to share something with the community</p>
            <Link href="/dashboard/posts/new">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full transition">
                Create Post
              </button>
            </Link>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={likePost}
              onDelete={deletePost}
            />
          ))
        )}
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="hidden xl:block w-[300px] shrink-0 space-y-3">
        {/* Contacts / Suggested */}
        {suggestedUsers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-gray-500 font-semibold text-[15px]">People You May Know</h3>
              <Link href="/dashboard/friends/find" className="text-blue-600 text-sm font-semibold hover:underline">
                See all
              </Link>
            </div>
            <div className="space-y-1">
              {suggestedUsers.map((u: any) => (
                <div key={u.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {u.avatarUrl
                      ? <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover rounded-full" />
                      : (u.fullName?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{u.fullName}</p>
                    {u.mutualFriends > 0 && (
                      <p className="text-xs text-gray-500">{u.mutualFriends} mutual friends</p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await apiClient.post('/friendships/request', { receiverId: u.id });
                        setSuggestedUsers(prev => prev.filter(s => s.id !== u.id));
                      } catch { /* silent */ }
                    }}
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full transition"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-gray-500 font-semibold text-[15px] mb-3">Quick Links</h3>
          <div className="space-y-2">
            {[
              { href: '/dashboard/devotionals', label: "📖 Today's Devotional" },
              { href: '/dashboard/bible', label: '📕 Open Bible' },
              { href: '/dashboard/ai-assistant', label: '🤖 Ask LOGOS AI' },
              { href: '/dashboard/communities', label: '🏘️ Communities' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition font-medium">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 px-2">
          Privacy · Terms · Cookies · LOGOS Platform © 2025
        </p>
      </div>
    </div>
  );
}
