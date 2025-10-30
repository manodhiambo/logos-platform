'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture_reference: string;
  scheduled_date: string;
  reading_time_minutes: number;
}

export default function DevotionalsPage() {
  const [todayDevotional, setTodayDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayDevotional();
  }, []);

  const fetchTodayDevotional = async () => {
    try {
      const response = await apiClient.get('/devotionals/today');
      setTodayDevotional(response.data.data.devotional);
    } catch (error) {
      console.error('Failed to fetch devotional:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-6">Loading today's devotional...</div>;
  }

  if (!todayDevotional) {
    return (
      <div className="p-4 md:p-6">
        <Card className="p-8 text-center">
          <p className="text-gray-500">No devotional available for today</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">📖 Today's Devotional</h1>
        <p className="text-sm md:text-base text-gray-600">
          {new Date(todayDevotional.scheduled_date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <Card className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{todayDevotional.title}</h2>
        
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
          <p className="text-sm font-semibold text-blue-900 mb-1">Scripture Reference</p>
          <p className="text-base md:text-lg text-blue-800">{todayDevotional.scripture_reference}</p>
        </div>

        <div className="prose prose-sm md:prose-base max-w-none">
          <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
            {todayDevotional.content}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-xs md:text-sm text-gray-500">
              ⏱️ {todayDevotional.reading_time_minutes} min read
            </span>
            <Button size="sm" className="w-full sm:w-auto">Mark as Complete</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
