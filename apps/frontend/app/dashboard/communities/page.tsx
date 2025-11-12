'use client';

import { useEffect, useState } from 'react';
import { communityService } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  postCount: number;
  category: string;
  avatarUrl?: string;
  privacyLevel?: string;
  createdBy?: string;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const data = await communityService.getCommunities();
      console.log('Communities data:', data);
      // The service returns the data directly (array of communities)
      setCommunities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await communityService.joinCommunity(communityId);
      alert('Successfully joined community! 🎉');
      fetchCommunities(); // Refresh
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to join community');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">🏘️ Communities</h1>
          <p className="text-slate-600 mt-1">Join communities and connect with others</p>
        </div>
        <Link href="/dashboard/communities/new">
          <Button className="w-full sm:w-auto">
            ➕ Create Community
          </Button>
        </Link>
      </div>

      {communities.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🏘️</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No communities yet</h3>
          <p className="text-slate-600 mb-6">Be the first to create a community!</p>
          <Link href="/dashboard/communities/new">
            <Button size="lg">Create the First Community</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Card key={community.id} className="overflow-hidden hover:shadow-lg transition-all">
              {community.avatarUrl ? (
                <img
                  src={community.avatarUrl}
                  alt={community.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-6xl">🏘️</span>
                </div>
              )}
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-1">
                    {community.name}
                  </h3>
                  {community.category && (
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {community.category}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
                  {community.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{community.memberCount || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📝</span>
                    <span>{community.postCount || 0} posts</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/dashboard/communities/${community.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      View
                    </Button>
                  </Link>
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleJoinCommunity(community.id)}
                  >
                    Join
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
