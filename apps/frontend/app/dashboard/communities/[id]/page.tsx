'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { communityService, postService } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  avatarUrl?: string;
  isMember?: boolean;
}

interface Post {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    loadCurrentUser();
    loadCommunity();
    loadPosts();
  }, [communityId]);

  const loadCurrentUser = () => {
    // Get from localStorage or context
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUserId(userData.id);
    }
  };

  const loadCommunity = async () => {
    try {
      const data = await communityService.getCommunity(communityId);
      setCommunity(data);
    } catch (error) {
      console.error('Failed to load community:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await postService.getCommunityPosts(communityId);
      console.log('Posts data:', data);
      const postsArray = Array.isArray(data) ? data : (data?.posts || []);
      setPosts(postsArray);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setPosts([]);
    }
  };

  const handleJoin = async () => {
    try {
      await communityService.joinCommunity(communityId);
      alert('Successfully joined! 🎉');
      loadCommunity();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to join';
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this community?')) return;
    
    try {
      await communityService.leaveCommunity(communityId);
      alert('Left community');
      router.push('/dashboard/communities');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to leave');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    setPosting(true);
    try {
      await postService.createPost({
        content: newPostContent,
        communityId: communityId,
      });
      setNewPostContent('');
      loadPosts();
      alert('Post created! 🎉');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleEditPost = async (postId: string) => {
    if (!editContent.trim()) return;
    
    try {
      await postService.updatePost(postId, { content: editContent });
      setEditingPost(null);
      setEditContent('');
      loadPosts();
      alert('Post updated! ✅');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await postService.deletePost(postId);
      loadPosts();
      alert('Post deleted! 🗑️');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const startEdit = (post: Post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Community not found</h3>
        <Link href="/dashboard/communities">
          <Button>Back to Communities</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Community Header */}
      <Card className="overflow-hidden">
        {community.avatarUrl ? (
          <img
            src={community.avatarUrl}
            alt={community.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
            <span className="text-8xl">🏘️</span>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {community.name}
              </h1>
              <p className="text-slate-600">{community.description}</p>
            </div>
            <Badge variant="secondary" className="ml-4">
              {community.category}
            </Badge>
          </div>

          <div className="flex items-center gap-6 text-slate-600 mb-4">
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>{community.memberCount || 0} members</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📝</span>
              <span>{community.postCount || 0} posts</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/communities" className="flex-1">
              <Button variant="outline" className="w-full">
                ← Back
              </Button>
            </Link>
            {community.isMember ? (
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleLeave}
              >
                Leave Community
              </Button>
            ) : (
              <Button 
                className="flex-1"
                onClick={handleJoin}
              >
                Join Community
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Create Post Section */}
      {community.isMember && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            Share with the community
          </h3>
          <Textarea
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={4}
            className="mb-3"
          />
          <Button 
            onClick={handleCreatePost}
            disabled={posting || !newPostContent.trim()}
            className="w-full"
          >
            {posting ? 'Posting...' : 'Post'}
          </Button>
        </Card>
      )}

      {/* Posts Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Posts</h2>
        
        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No posts yet
            </h3>
            <p className="text-slate-600">
              {community.isMember 
                ? 'Be the first to post!' 
                : 'Join to see posts and participate'}
            </p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0">
                  {post.author?.fullName?.charAt(0) || '?'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-800">
                        {post.author?.fullName || 'Unknown'}
                      </h4>
                      <span className="text-sm text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Edit/Delete buttons for post author */}
                    {post.authorId === currentUserId && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(post)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {editingPost === post.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleEditPost(post.id)}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-700 mb-3 break-words">{post.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <button className="flex items-center gap-1 hover:text-primary">
                          <span>👍</span>
                          <span>{post.likeCount || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary">
                          <span>💬</span>
                          <span>{post.commentCount || 0}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
