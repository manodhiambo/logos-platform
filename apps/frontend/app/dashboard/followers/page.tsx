'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendshipService } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';

export default function FollowersPage() {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowers();
  }, []);

  const loadFollowers = async () => {
    try {
      setLoading(true);
      const response = await friendshipService.getFollowers(user?.id || '');
      setFollowers(response.data || []);
    } catch (error) {
      console.error('Failed to load followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowBack = async (userId: string) => {
    try {
      await friendshipService.followUser(userId);
      alert('Now following! 🎉');
      loadFollowers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to follow user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">👁️ Followers</h1>

      {followers.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">👁️</div>
          <h2 className="text-2xl font-semibold mb-2">No followers yet</h2>
          <p className="text-gray-600 mb-6">Keep engaging with the community!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followers.map((follower: any) => (
            <Card key={follower.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                    {follower.avatarUrl ? (
                      <img src={follower.avatarUrl} alt={follower.fullName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      follower.fullName?.charAt(0).toUpperCase()
                    )}
                  </div>
                </Avatar>
                <h3 className="font-semibold text-lg mb-1">{follower.fullName}</h3>
                <p className="text-sm text-gray-600 mb-4">@{follower.username}</p>
                {follower.bio && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{follower.bio}</p>
                )}
                <Button
                  size="sm"
                  onClick={() => handleFollowBack(follower.id)}
                  className="w-full"
                >
                  👁️ Follow Back
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
