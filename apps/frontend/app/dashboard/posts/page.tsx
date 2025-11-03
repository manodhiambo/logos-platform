'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  community?: {
    id: string;
    name: string;
  } | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await apiClient.get('/posts?page=1&limit=20');
      setPosts(response.data.data?.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      await apiClient.post(`/posts/${postId}/like`);
      fetchPosts();
    } catch (error: any) {
      console.error('Failed to like post:', error);
      alert(error.response?.data?.error?.message || 'Failed to like post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">📝 Community Feed</h1>
          <p className="text-gray-600 mt-1">Share and connect with others</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="w-full sm:w-auto">+ New Post</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 mb-4">No posts yet</p>
          <p className="text-sm text-gray-400 mb-6">
            Be the first to share something with the community
          </p>
          <Link href="/dashboard/posts/new">
            <Button>Create First Post</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {post.author?.fullName?.[0] || post.author?.username?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      {post.author?.fullName || post.author?.username || 'Anonymous'}
                    </h3>
                    {post.community && (
                      <span className="text-sm text-gray-500">
                        in <span className="font-medium text-blue-600">{post.community.name}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center gap-4 pt-3 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => likePost(post.id)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <span className="mr-1">👍</span>
                  {post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <span className="mr-1">💬</span>
                  {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
