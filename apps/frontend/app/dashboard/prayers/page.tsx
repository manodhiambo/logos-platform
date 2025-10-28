'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { prayerService, PrayerRequest } from '@/lib/services/prayer.service';

export default function PrayersPage() {
  const { user } = useAuth();
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'health', label: '🏥 Health' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
    { value: 'work', label: '💼 Work' },
    { value: 'spiritual', label: '✝️ Spiritual Growth' },
    { value: 'financial', label: '💰 Financial' },
    { value: 'relationship', label: '💑 Relationships' },
    { value: 'guidance', label: '🧭 Guidance' },
    { value: 'other', label: '🙏 Other' },
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: '🔓 Open' },
    { value: 'in_progress', label: '⏳ In Progress' },
    { value: 'answered', label: '✅ Answered' },
    { value: 'closed', label: '🔒 Closed' },
  ];

  useEffect(() => {
    loadPrayerRequests();
    loadMyRequests();
  }, [selectedCategory, selectedStatus]);

  const loadPrayerRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      
      const data = await prayerService.getPrayerRequests(params);
      setPrayerRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to load prayer requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      const data = await prayerService.getMyPrayerRequests();
      setMyRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to load my requests:', error);
    }
  };

  const handlePray = async (requestId: string) => {
    try {
      await prayerService.prayForRequest(requestId);
      await loadPrayerRequests();
      await loadMyRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to pray for request');
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this prayer request?')) return;

    try {
      await prayerService.deletePrayerRequest(requestId);
      await loadPrayerRequests();
      await loadMyRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete prayer request');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Prayer Requests</h1>
            <p className="text-slate-600 mt-2">Join others in prayer and support</p>
          </div>
          <Link href="/dashboard/prayers/new">
            <Button>
              <span className="text-lg mr-2">🙏</span>
              New Prayer Request
            </Button>
          </Link>
        </div>

        {/* My Prayer Requests */}
        {myRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Prayer Requests</CardTitle>
              <CardDescription>Prayer requests you've submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <PrayerRequestCard
                    key={request.id}
                    request={request}
                    isOwner={true}
                    onPray={handlePray}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Wall */}
        <Card>
          <CardHeader>
            <CardTitle>Prayer Wall</CardTitle>
            <CardDescription>Pray for others and share in community support</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading prayer requests...</p>
              </div>
            ) : prayerRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-6xl mb-4">🙏</p>
                <p>No prayer requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prayerRequests.map((request) => (
                  <PrayerRequestCard
                    key={request.id}
                    request={request}
                    isOwner={request.userId === user?.id}
                    onPray={handlePray}
                    onDelete={handleDelete}
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

interface PrayerRequestCardProps {
  request: PrayerRequest;
  isOwner: boolean;
  onPray: (requestId: string) => void;
  onDelete: (requestId: string) => void;
}

function PrayerRequestCard({ request, isOwner, onPray, onDelete }: PrayerRequestCardProps) {
  const categoryEmojis: Record<string, string> = {
    health: '🏥',
    family: '👨‍👩‍👧‍👦',
    work: '💼',
    spiritual: '✝️',
    financial: '💰',
    relationship: '💑',
    guidance: '🧭',
    other: '🙏',
  };

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    answered: 'bg-green-100 text-green-800',
    closed: 'bg-slate-100 text-slate-800',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-3xl">{categoryEmojis[request.category] || '🙏'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/dashboard/prayers/${request.id}`}>
                  <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                    {request.title}
                  </h3>
                </Link>
                <span className={`text-xs px-2 py-1 rounded ${statusColors[request.status]}`}>
                  {request.status.replace('_', ' ')}
                </span>
                {request.isPrivate && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    🔒 Private
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-sm mb-3 line-clamp-2">{request.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>
                  {request.isAnonymous
                    ? 'Anonymous'
                    : `By ${request.user?.fullName || 'Unknown'}`}
                </span>
                <span>•</span>
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>🙏 {request.prayerCount || 0} prayers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-200">
          {!isOwner && (
            <Button onClick={() => onPray(request.id)} className="flex-1">
              🙏 Pray for this
            </Button>
          )}
          {isOwner && (
            <>
              <Link href={`/dashboard/prayers/${request.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => onDelete(request.id)}
                className="text-red-600 hover:text-red-700"
              >
                🗑️
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
