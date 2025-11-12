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
  isLiked?: boolean;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      const response = await apiClient.get('/posts?page=1&limit=20');
      console.log('Posts response:', response);
      setPosts(response.data.data?.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      console.log('Liking post:', postId);
      const response = await apiClient.post(`/posts/${postId}/like`);
      console.log('Like response:', response);
      
      // Update the post in the list immediately
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const isLiked = !post.isLiked;
            return {
              ...post,
              isLiked,
              likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1
            };
          }
          return post;
        })
      );
    } catch (error: any) {
      console.error('Failed to like post:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to like post');
    }
  };

  const toggleComments = async (postId: string) => {
    const isShowing = showComments[postId];
    
    if (!isShowing && !comments[postId]) {
      // Load comments if not already loaded
      await fetchComments(postId);
    }
    
    setShowComments(prev => ({
      ...prev,
      [postId]: !isShowing
    }));
  };

  const fetchComments = async (postId: string) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      console.log('Fetching comments for post:', postId);
      const response = await apiClient.get(`/posts/${postId}/comments`);
      console.log('Comments response:', response);
      setComments(prev => ({
        ...prev,
        [postId]: response.data.data?.comments || []
      }));
    } catch (error: any) {
      console.error('Failed to fetch comments:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to load comments');
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const addComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      console.log('Adding comment to post:', postId);
      const response = await apiClient.post(`/posts/${postId}/comments`, { content });
      console.log('Add comment response:', response);
      
      // Refresh comments
      await fetchComments(postId);
      
      // Clear input
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      
      // Update comment count
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        )
      );
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to add comment');
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
                  className={`${
                    post.isLiked ? 'text-blue-600' : 'text-gray-600'
                  } hover:text-blue-600`}
                >
                  <span className="mr-1">{post.isLiked ? '👍' : '👍'}</span>
                  {post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(post.id)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <span className="mr-1">💬</span>
                  {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
                </Button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="flex-1 min-h-[80px]"
                    />
                    <Button
                      onClick={() => addComment(post.id)}
                      disabled={!newComment[post.id]?.trim()}
                      className="self-end"
                    >
                      Post
                    </Button>
                  </div>

                  {/* Comments List */}
                  {loadingComments[post.id] ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                            {comment.author?.fullName?.[0] || comment.author?.username?.[0] || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {comment.author?.fullName || comment.author?.username || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      {comments[post.id]?.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
