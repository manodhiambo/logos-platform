'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { postService, Post } from '@/lib/services/post.service';

export default function PostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getPosts();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      await postService.toggleLike(postId);
      await loadPosts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to like post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postService.deletePost(postId);
      await loadPosts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete post');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Posts Feed</h1>
            <p className="text-slate-600 mt-2">Share your thoughts and engage with the community</p>
          </div>
          <Link href="/dashboard/posts/new">
            <Button>
              <span className="text-lg mr-2">✍️</span>
              Create Post
            </Button>
          </Link>
        </div>

        {/* Create Post Card */}
        <Card>
          <CardContent className="pt-6">
            <Link href="/dashboard/posts/new">
              <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-primary cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <p className="text-slate-500 flex-1">What's on your mind?</p>
                <span className="text-2xl">✍️</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <p className="text-6xl mb-4">📝</p>
              <p>No posts yet. Be the first to share something!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLike={handleToggleLike}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
}

function PostCard({ post, currentUserId, onLike, onDelete }: PostCardProps) {
  const isAuthor = currentUserId === post.authorId;

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {post.author?.fullName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="font-semibold">{post.author?.fullName || 'Unknown User'}</h3>
              <p className="text-sm text-slate-500">
                @{post.author?.username} • {new Date(post.createdAt).toLocaleDateString()}
              </p>
              {post.community && (
                <p className="text-xs text-primary">in {post.community.name}</p>
              )}
            </div>
          </div>
          {isAuthor && (
            <div className="flex gap-2">
              <Link href={`/dashboard/posts/${post.id}/edit`}>
                <Button variant="outline" size="sm">
                  ✏️ Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(post.id)}
                className="text-red-600 hover:text-red-700"
              >
                🗑️
              </Button>
            </div>
          )}
        </div>

        {/* Post Content */}
        <Link href={`/dashboard/posts/${post.id}`}>
          <div className="cursor-pointer">
            <p className="text-slate-900 whitespace-pre-wrap mb-4">{post.content}</p>
          </div>
        </Link>

        {/* Post Actions */}
        <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 transition-colors ${
              post.isLiked ? 'text-red-500' : 'text-slate-600 hover:text-red-500'
            }`}
          >
            <span className="text-xl">{post.isLiked ? '❤️' : '🤍'}</span>
            <span className="text-sm font-medium">{post.likeCount || 0}</span>
          </button>
          <Link
            href={`/dashboard/posts/${post.id}`}
            className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium">{post.commentCount || 0} Comments</span>
          </Link>
          {post.isPinned && (
            <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              📌 Pinned
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
