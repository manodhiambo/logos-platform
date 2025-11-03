'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  prayerCount: number;
  author: {
    id: string;
    fullName: string;
    username: string;
  };
  createdAt: string;
  hasPrayed: boolean;
}

export default function PrayersPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      const response = await apiClient.get('/prayers/requests?page=1&limit=20');
      setPrayers(response.data.data?.prayerRequests || []);
    } catch (error) {
      console.error('Failed to fetch prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const prayForRequest = async (prayerId: string) => {
    try {
      await apiClient.post(`/prayers/requests/${prayerId}/pray`, {
        message: 'Praying for you in Jesus name'
      });
      alert('Prayer recorded! 🙏');
      fetchPrayers();
    } catch (error: any) {
      console.error('Failed to pray:', error);
      alert(error.response?.data?.error?.message || 'Failed to record prayer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prayers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">🙏 Prayer Wall</h1>
          <p className="text-gray-600 mt-1">Lift each other up in prayer</p>
        </div>
        <Link href="/dashboard/prayers/new">
          <Button className="w-full sm:w-auto">+ New Request</Button>
        </Link>
      </div>

      {prayers.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🙏</div>
          <p className="text-gray-500 mb-4">No prayer requests yet</p>
          <p className="text-sm text-gray-400 mb-6">
            Be the first to share your prayer needs with the community
          </p>
          <Link href="/dashboard/prayers/new">
            <Button>Submit First Request</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {prayers.map((prayer) => (
            <Card key={prayer.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{prayer.title}</h3>
                  <p className="text-sm text-gray-500">
                    by {prayer.author?.fullName || prayer.author?.username || 'Anonymous'} • {new Date(prayer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {prayer.category}
                </span>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{prayer.description}</p>

              <div className="flex flex-wrap items-center gap-3 pt-3 border-t">
                <Button 
                  onClick={() => prayForRequest(prayer.id)} 
                  size="sm"
                  variant={prayer.hasPrayed ? "outline" : "default"}
                  disabled={prayer.hasPrayed}
                >
                  {prayer.hasPrayed ? '✓ Prayed' : '🙏 Pray'} ({prayer.prayerCount})
                </Button>
                <span className="text-sm text-gray-500">
                  Status: <span className="font-medium text-gray-700">{prayer.status}</span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
