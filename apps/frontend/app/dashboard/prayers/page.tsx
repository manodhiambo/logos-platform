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
  created_at: string;
  author: {
    full_name: string;
  };
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

  const prayForRequest = async (id: string) => {
    try {
      await apiClient.post(`/prayers/requests/${id}/pray`, {
        message: 'Praying for you 🙏'
      });
      alert('Your prayer has been recorded!');
      fetchPrayers();
    } catch (error) {
      console.error('Failed to pray:', error);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-6">Loading prayer requests...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">🙏 Prayer Wall</h1>
        <Link href="/dashboard/prayers/new">
          <Button size="sm" className="w-full sm:w-auto">+ New Prayer Request</Button>
        </Link>
      </div>

      {prayers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No prayer requests yet</p>
          <Link href="/dashboard/prayers/new">
            <Button>Submit First Prayer Request</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {prayers.map((prayer) => (
            <Card key={prayer.id} className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-1">{prayer.title}</h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    by {prayer.author?.full_name || 'Anonymous'} • {new Date(prayer.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {prayer.status}
                </span>
              </div>
              
              <p className="text-sm md:text-base text-gray-700 mb-4 line-clamp-3">{prayer.description}</p>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <span className="text-sm text-gray-600">
                  🙏 {prayer.prayer_count} {prayer.prayer_count === 1 ? 'person' : 'people'} prayed
                </span>
                <Button 
                  onClick={() => prayForRequest(prayer.id)}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Pray for This
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
