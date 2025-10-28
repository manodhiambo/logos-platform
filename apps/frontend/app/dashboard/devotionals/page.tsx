'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { devotionalService, Devotional, DevotionalStats } from '@/lib/services/devotional.service';

export default function DevotionalsPage() {
  const [todaysDevotional, setTodaysDevotional] = useState<Devotional | null>(null);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [stats, setStats] = useState<DevotionalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [todayData, allData, statsData] = await Promise.all([
        devotionalService.getTodaysDevotional(),
        devotionalService.getDevotionals(),
        devotionalService.getUserStats().catch(() => null),
      ]);

      setTodaysDevotional(todayData.devotional);
      setDevotionals(allData.devotionals || []);
      setStats(statsData?.stats || null);
    } catch (error) {
      console.error('Failed to load devotionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (devotionalId: string) => {
    try {
      await devotionalService.markAsComplete(devotionalId);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark as complete');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Daily Devotionals</h1>
          <p className="text-slate-600 mt-2">Grow deeper in your faith with daily readings</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon="✅"
              title="Completed"
              value={stats.totalCompleted.toString()}
              description="devotionals"
            />
            <StatCard
              icon="🔥"
              title="Current Streak"
              value={`${stats.currentStreak} days`}
              description="Keep it going!"
            />
            <StatCard
              icon="🏆"
              title="Longest Streak"
              value={`${stats.longestStreak} days`}
              description="Personal best"
            />
            <StatCard
              icon="📊"
              title="Completion Rate"
              value={`${Math.round(stats.completionRate)}%`}
              description="This month"
            />
          </div>
        )}

        {/* Today's Devotional */}
        {todaysDevotional && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📖</span>
                    Today's Devotional
                  </CardTitle>
                  <CardDescription>
                    {new Date(todaysDevotional.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardDescription>
                </div>
                {todaysDevotional.isCompleted && (
                  <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    ✅ Completed
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{todaysDevotional.title}</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-primary">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {todaysDevotional.verseReference}
                    </p>
                    <p className="italic text-slate-700">"{todaysDevotional.bibleVerse}"</p>
                  </div>
                </div>

                <p className="text-slate-700 whitespace-pre-wrap line-clamp-3">
                  {todaysDevotional.content}
                </p>

                <div className="flex gap-3">
                  <Link href={`/dashboard/devotionals/${todaysDevotional.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Read Full Devotional
                    </Button>
                  </Link>
                  {!todaysDevotional.isCompleted && (
                    <Button
                      onClick={() => handleMarkComplete(todaysDevotional.id)}
                      className="flex-1"
                    >
                      ✅ Mark as Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Devotionals */}
        <Card>
          <CardHeader>
            <CardTitle>Past Devotionals</CardTitle>
            <CardDescription>Browse previous daily devotionals</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading devotionals...</p>
              </div>
            ) : devotionals.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-6xl mb-4">📖</p>
                <p>No devotionals available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devotionals.map((devotional) => (
                  <DevotionalCard
                    key={devotional.id}
                    devotional={devotional}
                    onMarkComplete={handleMarkComplete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  description: string;
}

function StatCard({ icon, title, value, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="text-4xl mb-2">{icon}</div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface DevotionalCardProps {
  devotional: Devotional;
  onMarkComplete: (id: string) => void;
}

function DevotionalCard({ devotional, onMarkComplete }: DevotionalCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-2xl">📖</span>
            {devotional.isCompleted && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                ✅ Done
              </span>
            )}
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1">
              {new Date(devotional.date).toLocaleDateString()}
            </p>
            <h3 className="font-semibold line-clamp-2 mb-2">{devotional.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-2">{devotional.verseReference}</p>
          </div>

          <Link href={`/dashboard/devotionals/${devotional.id}`}>
            <Button variant="outline" className="w-full" size="sm">
              Read More
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
