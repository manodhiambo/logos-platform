'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { postService } from '@/lib/services/post.service';

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    setLoading(true);

    try {
      await postService.createPost({ content: content.trim() });
      router.push('/dashboard/posts');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create Post</h1>
          <p className="text-slate-600 mt-2">Share your thoughts with the community</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
            ❌ {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>What's on your mind?</CardTitle>
            <CardDescription>Share encouragement, insights, or questions</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  disabled={loading}
                  required
                />
                <p className="text-xs text-slate-500">
                  {content.length} characters
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !content.trim()} className="flex-1">
                  {loading ? 'Posting...' : 'Publish Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
