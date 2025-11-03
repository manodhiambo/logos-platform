'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewPrayerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'spiritual',
    privacyLevel: 'public',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.title.length < 5) {
      alert('Title must be at least 5 characters');
      return;
    }
    
    if (formData.description.length < 10) {
      alert('Description must be at least 10 characters');
      return;
    }
    
    setLoading(true);

    try {
      await apiClient.post('/prayers/requests', formData);
      alert('Prayer request submitted successfully!');
      router.push('/dashboard/prayers');
    } catch (error: any) {
      console.error('Submit error:', error);
      alert(error.response?.data?.error?.message || 'Failed to submit prayer request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🙏 New Prayer Request</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What do you need prayer for?"
              required
              minLength={5}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 5 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Share more details about your prayer request..."
              className="w-full border rounded px-3 py-2"
              rows={6}
              required
              minLength={10}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="spiritual">Spiritual Growth</option>
              <option value="health">Health & Healing</option>
              <option value="family">Family</option>
              <option value="work">Work & Career</option>
              <option value="financial">Financial</option>
              <option value="relationships">Relationships</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Privacy *</label>
            <select
              value={formData.privacyLevel}
              onChange={(e) => setFormData({ ...formData, privacyLevel: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="public">Public (Anyone can see)</option>
              <option value="private">Private (Only me)</option>
              <option value="friends_only">Friends Only</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Prayer Request'}
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
