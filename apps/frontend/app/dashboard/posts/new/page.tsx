'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NewPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    content: '',
    postType: 'regular',
    visibility: 'public',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.content.length < 10) {
      alert('Post content must be at least 10 characters');
      return;
    }
    
    setLoading(true);

    try {
      await apiClient.post('/posts', formData);
      alert('Post created successfully!');
      router.push('/dashboard/posts');
    } catch (error: any) {
      console.error('Post error:', error);
      alert(error.response?.data?.error?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📝 Create New Post</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">What's on your mind?</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your thoughts, prayer, testimony, or encouragement..."
              className="w-full border rounded px-3 py-2"
              rows={8}
              required
              minLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Post Type</label>
            <select
              value={formData.postType}
              onChange={(e) => setFormData({ ...formData, postType: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="regular">Regular Post</option>
              <option value="announcement">Announcement</option>
              <option value="poll">Poll</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="public">Public</option>
              <option value="followers">Followers Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Posting...' : 'Create Post'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
