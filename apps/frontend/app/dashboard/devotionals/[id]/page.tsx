'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { devotionalService, Devotional } from '@/lib/services/devotional.service';

export default function DevotionalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const devotionalId = params.id as string;

  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDevotional();
  }, [devotionalId]);

  const loadDevotional = async () => {
    try {
      setLoading(true);
      const data = await devotionalService.getDevotional(devotionalId);
      setDevotional(data.devotional);
      setNotes(data.devotional.userNotes || '');
    } catch (error) {
      console.error('Failed to load devotional:', error);
      alert('Failed to load devotional');
      router.push('/dashboard/devotionals');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await devotionalService.markAsComplete(devotionalId);
      await loadDevotional();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark as complete');
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSaving(true);
      await devotionalService.addNotes(devotionalId, notes);
      await loadDevotional();
      alert('Notes saved successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading devotional...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!devotional) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Devotional not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          {devotional.isCompleted ? (
            <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
              ✅ Completed
            </span>
          ) : (
            <Button onClick={handleMarkComplete}>✅ Mark as Complete</Button>
          )}
        </div>

        {/* Devotional Content */}
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">
                {new Date(devotional.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <CardTitle className="text-3xl">{devotional.title}</CardTitle>
              <p className="text-sm text-slate-600">By {devotional.author}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bible Verse */}
            <div className="bg-primary/5 p-6 rounded-lg border-l-4 border-primary">
              <p className="text-sm font-semibold text-primary mb-2">
                {devotional.verseReference}
              </p>
              <p className="text-lg italic text-slate-800">"{devotional.bibleVerse}"</p>
            </div>

            {/* Content */}
            <div className="prose prose-slate max-w-none">
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {devotional.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Notes */}
        <Card>
          <CardHeader>
            <CardTitle>My Reflections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your personal reflections, prayers, or insights from today's devotional..."
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <Button onClick={handleSaveNotes} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Notes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
