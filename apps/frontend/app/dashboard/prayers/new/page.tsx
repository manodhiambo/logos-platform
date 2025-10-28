'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { prayerService } from '@/lib/services/prayer.service';

export default function NewPrayerRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'spiritual',
    isPrivate: false,
    isAnonymous: false,
  });

  const categories = [
    { value: 'health', label: '🏥 Health' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
    { value: 'work', label: '💼 Work' },
    { value: 'spiritual', label: '✝️ Spiritual Growth' },
    { value: 'financial', label: '💰 Financial' },
    { value: 'relationship', label: '💑 Relationships' },
    { value: 'guidance', label: '🧭 Guidance' },
    { value: 'other', label: '🙏 Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await prayerService.createPrayerRequest(formData);
      router.push('/dashboard/prayers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create prayer request');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Prayer Request</h1>
          <p className="text-slate-600 mt-2">Share your prayer need with the community</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
            ❌ {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Prayer Request Details</CardTitle>
            <CardDescription>
              Share what you need prayer for - our community is here to support you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title *
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief title for your prayer request"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={loading}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Share more details about your prayer need..."
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    className="w-4 h-4 text-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <div>
                    <label htmlFor="isPrivate" className="font-medium cursor-pointer">
                      🔒 Private Request
                    </label>
                    <p className="text-sm text-slate-500">
                      Only you and those you share with can see this
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="w-4 h-4 text-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <div>
                    <label htmlFor="isAnonymous" className="font-medium cursor-pointer">
                      👤 Submit Anonymously
                    </label>
                    <p className="text-sm text-slate-500">
                      Your name won't be shown with this request
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Submitting...' : '🙏 Submit Prayer Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
