'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VideoCall {
  id: string;
  title: string;
  description: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  host: {
    full_name: string;
  };
  participant_count: number;
}

export default function VideoCallsPage() {
  const [upcomingCalls, setUpcomingCalls] = useState<VideoCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await apiClient.get('/video-calls/scheduled/all');
      setUpcomingCalls(response.data.data.calls || []);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-6">Loading video calls...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">🎥 Video Calls</h1>
        <Button size="sm" className="w-full sm:w-auto">+ Schedule Call</Button>
      </div>

      {/* Feature Coming Soon Banner */}
      <Card className="p-6 md:p-8 bg-gradient-to-r from-purple-50 to-pink-50 text-center">
        <div className="text-5xl md:text-6xl mb-4">🚧</div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Video Calls Coming Soon!</h2>
        <p className="text-sm md:text-base text-gray-600 mb-4">
          We're building an amazing video calling feature for Bible studies, prayer meetings, and fellowship.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm text-gray-500">
          <span>✅ HD Video & Audio</span>
          <span>✅ Screen Sharing</span>
          <span>✅ Group Prayer Rooms</span>
          <span>✅ Bible Study Sessions</span>
        </div>
      </Card>

      {/* Placeholder for upcoming features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 md:p-6">
          <h3 className="font-semibold mb-2 text-sm md:text-base">📅 Scheduled Calls</h3>
          <p className="text-xs md:text-sm text-gray-600 mb-3">
            Schedule video calls for Bible studies, prayer meetings, and more
          </p>
          <Button variant="outline" size="sm" disabled className="w-full">
            Coming Soon
          </Button>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="font-semibold mb-2 text-sm md:text-base">🔴 Live Sessions</h3>
          <p className="text-xs md:text-sm text-gray-600 mb-3">
            Join live prayer meetings and worship sessions with your community
          </p>
          <Button variant="outline" size="sm" disabled className="w-full">
            Coming Soon
          </Button>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="font-semibold mb-2 text-sm md:text-base">📺 Recordings</h3>
          <p className="text-xs md:text-sm text-gray-600 mb-3">
            Access recorded sessions and teachings you might have missed
          </p>
          <Button variant="outline" size="sm" disabled className="w-full">
            Coming Soon
          </Button>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="font-semibold mb-2 text-sm md:text-base">👥 Prayer Rooms</h3>
          <p className="text-xs md:text-sm text-gray-600 mb-3">
            Create private prayer rooms for your small groups
          </p>
          <Button variant="outline" size="sm" disabled className="w-full">
            Coming Soon
          </Button>
        </Card>
      </div>
    </div>
  );
}
