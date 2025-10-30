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
  prayer_count: number;
  user: {
    full_name: string;
  };
  created_at: string;
}

export default function PrayersPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      const response = await apiClient.get('/prayers/requests');
      setPrayers(response.data.data.prayerRequests || []);
    } catch (error) {
      console.error('Failed to fetch prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const prayForRequest = async (prayerId: string) => {
    try {
      await apiClient.post(`/prayers/requests/${prayerId}/pray`);
      fetchPrayers();
    } catch (error) {
      console.error('Failed to pray:', error);
    }
  };

  if (loading) {
    return <div>Loading prayers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🙏 Prayer Wall</h1>
          <p className="text-gray-600 mt-1">Lift each other up in prayer</p>
        </div>
        <Link href="/dashboard/prayers/new">
          <Button>+ New Request</Button>
        </Link>
      </div>

      {prayers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No prayer requests yet</p>
          <Link href="/dashboard/prayers/new">
            <Button>Submit First Request</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {prayers.map((prayer) => (
            <Card key={prayer.id} className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold">{prayer.title}</h3>
                  <p className="text-sm text-gray-500">
                    by {prayer.user.full_name} • {new Date(prayer.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {prayer.category}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{prayer.description}</p>

              <div className="flex items-center gap-4">
                <Button onClick={() => prayForRequest(prayer.id)} size="sm">
                  🙏 Pray ({prayer.prayer_count})
                </Button>
                <span className="text-sm text-gray-500">
                  Status: {prayer.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
