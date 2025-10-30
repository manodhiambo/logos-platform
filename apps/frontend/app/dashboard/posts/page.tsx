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
    full_name: string;
    username: string;
  };
  community?: {
    id: string;
    name: string;
  };
  like_count: number;
  comment_count: number;
  created_at: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await apiClient.get('/posts');
      setPosts(response.data.data.posts || []);
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
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📝 Community Feed</h1>
          <p className="text-gray-600 mt-1">Share and connect with others</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button>+ New Post</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No posts yet</p>
          <Link href="/dashboard/posts/new">
            <Button>Create First Post</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                  {post.author.full_name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{post.author.full_name}</h3>
                  <p className="text-sm text-gray-500">
                    {post.community && <span>in {post.community.name} • </span>}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

              <div className="flex items-center gap-4 pt-3 border-t">
                <Button variant="ghost" size="sm" onClick={() => likePost(post.id)}>
                  👍 {post.like_count} {post.like_count === 1 ? 'Like' : 'Likes'}
                </Button>
                <Button variant="ghost" size="sm">
                  💬 {post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
