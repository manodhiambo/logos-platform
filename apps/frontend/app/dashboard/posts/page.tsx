'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

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

function MediaGallery({ urls }: { urls: string[] }) {
  const safeUrls = Array.isArray(urls) ? urls.filter(u => typeof u === 'string' && u.length > 0) : [];
  if (safeUrls.length === 0) return null;

  const isVideo = (url: string) =>
    url.match(/\.(mp4|mov|webm|avi)(\?|$)/i) || url.includes('/video/');

  if (safeUrls.length === 1) {
    const url = safeUrls[0];
    return (
      <div className="mt-3 rounded-xl overflow-hidden bg-black">
        {isVideo(url) ? (
          <video
            src={url}
            controls
            className="w-full max-h-96 object-contain"
            preload="metadata"
          />
        ) : (
          <img
            src={url}
            alt="Post media"
            className="w-full max-h-96 object-cover cursor-pointer"
            onClick={() => window.open(url, '_blank')}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`mt-3 grid gap-1 rounded-xl overflow-hidden ${safeUrls.length === 2 ? 'grid-cols-2' : safeUrls.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {safeUrls.slice(0, 4).map((url, i) => (
        <div key={i} className="relative aspect-square bg-black">
          {isVideo(url) ? (
            <video src={url} className="w-full h-full object-cover" preload="metadata" />
          ) : (
            <img
              src={url}
              alt={`Media ${i + 1}`}
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(url, '_blank')}
            />
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

function PostCard({
  post,
  currentUser,
  onLike,
  onDelete,
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
      const response = await apiClient.get(`/posts/${post.id}/comments`);
      setComments(response.data.data?.comments || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      await fetchComments();
    }
    setShowComments(v => !v);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await apiClient.post(`/posts/${post.id}/comments`, { content: newComment.trim() });
      setNewComment('');
      setCommentCount(c => c + 1);
      await fetchComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const canDelete = currentUser && (post.author.id === currentUser.id || currentUser.role === 'admin' || currentUser.role === 'super_admin');
  const avatarInitial = (post.author?.fullName?.[0] || post.author?.username?.[0] || 'U').toUpperCase();

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <Card className="p-4 md:p-5 hover:shadow-md transition-shadow">
      {/* Author row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
            {post.author?.avatarUrl ? (
              <img src={post.author.avatarUrl} alt={post.author.fullName} className="w-full h-full object-cover" />
            ) : (
              avatarInitial
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">
                {post.author?.fullName || post.author?.username || 'Anonymous'}
              </span>
              {post.community && (
                <span className="text-xs text-gray-500">
                  in <span className="font-medium text-blue-600">{post.community.name}</span>
                </span>
              )}
              {post.postType && post.postType !== 'regular' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                  {post.postType}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{formatTime(post.createdAt)}</p>
          </div>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 -mr-1"
          >
            🗑️
          </Button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed mb-2">{post.content}</p>
      )}

      {/* Media */}
      <MediaGallery urls={post.mediaUrls || []} />

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 mt-1 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 ${post.isLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}
        >
          <span>{post.isLiked ? '❤️' : '🤍'}</span>
          <span>{post.likeCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600"
        >
          <span>💬</span>
          <span>{commentCount}</span>
        </Button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 min-h-[60px] text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addComment();
                }
              }}
            />
            <Button size="sm" onClick={addComment} disabled={!newComment.trim()} className="self-end">
              Post
            </Button>
          </div>
          {loadingComments ? (
            <div className="text-center py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              {comments.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be the first!</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2 bg-gray-50 rounded-lg p-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(c.author?.fullName?.[0] || c.author?.username?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-xs text-gray-800">
                      {c.author?.fullName || c.author?.username}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function StatusStrip() {
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/status/grouped').then(r => {
      setGroups(r.data.data?.groups || []);
    }).catch(() => {});
  }, []);

  // Always show the strip — at minimum the "Add Status" button is visible
  return (
    <Card className="p-3">
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {/* Add status button — always visible */}
        <Link href="/dashboard/status/new" className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center bg-blue-50 text-blue-500 text-2xl">
            +
          </div>
          <span className="text-xs text-gray-500">Add</span>
        </Link>

        {groups.map(group => {
          if (!group?.user?.id) return null;
          return (
            <Link key={group.user.id} href="/dashboard/status" className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full border-2 border-blue-500 p-0.5">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                  {group.user?.avatarUrl ? (
                    <img src={group.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (group.user?.fullName?.[0] || 'U').toUpperCase()
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-600 truncate w-14 text-center">
                {group.user?.fullName?.split(' ')[0] || group.user?.username}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setCurrentUser(JSON.parse(user));
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await apiClient.get('/posts?page=1&limit=30');
      setPosts(response.data.data?.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
    try {
      await apiClient.post(`/posts/${postId}/like`);
    } catch (err) {
      // Revert on error
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        )
      );
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await apiClient.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Feed</h1>
          <p className="text-sm text-gray-500 mt-0.5">Connect and share with the community</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button>+ New Post</Button>
        </Link>
      </div>

      {/* Status ring strip */}
      <StatusStrip />

      {posts.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-600 font-medium mb-1">No posts yet</p>
          <p className="text-sm text-gray-400 mb-5">Be the first to share with the community</p>
          <Link href="/dashboard/posts/new">
            <Button>Create First Post</Button>
          </Link>
        </Card>
      ) : (
        posts.map((post) => (
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
  );
}
