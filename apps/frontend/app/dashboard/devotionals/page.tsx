'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture_reference: string;
  theme: string;
  date: string;
}

export default function DevotionalsPage() {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [todayDevotional, setTodayDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevotionals();
    fetchToday();
  }, []);

  const fetchDevotionals = async () => {
    try {
      const response = await apiClient.get('/devotionals?page=1&limit=10');
      setDevotionals(response.data.data.devotionals || []);
    } catch (error) {
      console.error('Failed to fetch devotionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchToday = async () => {
    try {
      const response = await apiClient.get('/devotionals/today');
      setTodayDevotional(response.data.data.devotional);
    } catch (error) {
      console.error('Failed to fetch today\'s devotional:', error);
    }
  };

  if (loading) {
    return <div>Loading devotionals...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">✝️ Daily Devotionals</h1>

      {todayDevotional && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-2xl font-bold mb-2">Today's Devotional</h2>
          <h3 className="text-xl font-semibold mb-3">{todayDevotional.title}</h3>
          <p className="text-sm text-blue-600 mb-4">{todayDevotional.scripture_reference}</p>
          <p className="text-gray-700 whitespace-pre-wrap">{todayDevotional.content}</p>
          <div className="mt-4 pt-4 border-t">
            <Link href={`/dashboard/devotionals/${todayDevotional.id}`}>
              <Button>Read Full Devotional</Button>
            </Link>
          </div>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Devotionals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devotionals.map((devotional) => (
            <Card key={devotional.id} className="p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-2">{devotional.title}</h3>
              <p className="text-sm text-blue-600 mb-3">{devotional.scripture_reference}</p>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {devotional.content}
              </p>
              <Link href={`/dashboard/devotionals/${devotional.id}`}>
                <Button size="sm" variant="outline">Read More</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
