'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
  post_count: number;
  category: string;
  avatar_url?: string;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await apiClient.get('/communities');
      setCommunities(response.data.data.communities || []);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-6">Loading communities...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">🏘️ Communities</h1>
        <Link href="/dashboard/communities/new">
          <Button size="sm" className="w-full sm:w-auto">+ Create Community</Button>
        </Link>
      </div>

      {communities.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No communities yet</p>
          <Link href="/dashboard/communities/new">
            <Button>Create the First Community</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {communities.map((community) => (
            <Card key={community.id} className="p-4 md:p-6 hover:shadow-lg transition">
              {community.avatar_url && (
                <img 
                  src={community.avatar_url} 
                  alt={community.name} 
                  className="w-full h-32 object-cover rounded mb-4" 
                />
              )}
              <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-1">{community.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{community.description}</p>
              <div className="flex justify-between text-xs md:text-sm text-gray-500 mb-3">
                <span>👥 {community.member_count}</span>
                <span>📝 {community.post_count}</span>
              </div>
              <Button className="w-full text-sm" size="sm">View Community</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
