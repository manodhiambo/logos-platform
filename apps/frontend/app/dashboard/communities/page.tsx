'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { communityService, Community } from '@/lib/services/community.service';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Communities' },
    { value: 'prayer', label: 'Prayer Groups' },
    { value: 'bible_study', label: 'Bible Study' },
    { value: 'youth', label: 'Youth' },
    { value: 'worship', label: 'Worship' },
    { value: 'missions', label: 'Missions' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'discipleship', label: 'Discipleship' },
  ];

  useEffect(() => {
    loadCommunities();
    loadMyCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const data = await communityService.getCommunities();
      setCommunities(data.communities || []);
    } catch (error) {
      console.error('Failed to load communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyCommunities = async () => {
    try {
      const data = await communityService.getMyCommunities();
      setMyCommunities(data.communities || []);
    } catch (error) {
      console.error('Failed to load my communities:', error);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await communityService.joinCommunity(communityId);
      await loadCommunities();
      await loadMyCommunities();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to join community');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!confirm('Are you sure you want to leave this community?')) return;

    try {
      await communityService.leaveCommunity(communityId);
      await loadCommunities();
      await loadMyCommunities();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to leave community');
    }
  };

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Communities</h1>
            <p className="text-slate-600 mt-2">Connect with believers who share your interests</p>
          </div>
          <Link href="/dashboard/communities/new">
            <Button>
              <span className="text-lg mr-2">➕</span>
              Create Community
            </Button>
          </Link>
        </div>

        {/* My Communities Section */}
        {myCommunities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Communities</CardTitle>
              <CardDescription>Communities you're a member of</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    onLeave={handleLeaveCommunity}
                    isMember={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* All Communities */}
        <Card>
          <CardHeader>
            <CardTitle>Discover Communities</CardTitle>
            <CardDescription>Find and join communities that interest you</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading communities...</p>
              </div>
            ) : filteredCommunities.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                {searchQuery || selectedCategory !== 'all'
                  ? 'No communities found matching your search'
                  : 'No communities available yet'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    onJoin={handleJoinCommunity}
                    onLeave={handleLeaveCommunity}
                    isMember={community.isMember}
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

interface CommunityCardProps {
  community: Community;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
  isMember?: boolean;
}

function CommunityCard({ community, onJoin, onLeave, isMember }: CommunityCardProps) {
  const categoryEmojis: Record<string, string> = {
    prayer: '🙏',
    bible_study: '📖',
    youth: '🌟',
    worship: '🎵',
    missions: '🌍',
    fellowship: '🤝',
    discipleship: '✝️',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <Link href={`/dashboard/communities/${community.id}`}>
          <div className="cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">{categoryEmojis[community.category] || '👥'}</div>
              {community.isPrivate && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  🔒 Private
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-2">{community.name}</h3>
            <p className="text-sm text-slate-600 line-clamp-2 mb-3">{community.description}</p>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>👥 {community.memberCount || 0} members</span>
              <span className="capitalize">{community.category.replace('_', ' ')}</span>
            </div>
          </div>
        </Link>
        <div className="mt-4">
          {isMember ? (
            <div className="flex gap-2">
              <Link href={`/dashboard/communities/${community.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => onLeave?.(community.id)}
                className="text-red-600 hover:text-red-700"
              >
                Leave
              </Button>
            </div>
          ) : (
            <Button onClick={() => onJoin?.(community.id)} className="w-full">
              Join Community
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
