'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendshipService } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

export default function FollowingPage() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowing();
  }, []);

  const loadFollowing = async () => {
    try {
      setLoading(true);
      const response = await friendshipService.getFollowing(user?.id || '');
      setFollowing(response.data || []);
    } catch (error) {
      console.error('Failed to load following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!confirm('Are you sure you want to unfollow this user?')) return;

    try {
      await friendshipService.unfollowUser(userId);
      alert('Unfollowed successfully');
      loadFollowing();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to unfollow');
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
      <h1 className="text-3xl font-bold">➕ Following</h1>

      {following.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">➕</div>
          <h2 className="text-2xl font-semibold mb-2">Not following anyone yet</h2>
          <p className="text-gray-600 mb-6">Discover users to follow!</p>
          <Link href="/dashboard/friends/find">
            <Button>Find Users</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {following.map((followedUser: any) => (
            <Card key={followedUser.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-2xl font-bold">
                    {followedUser.avatarUrl ? (
                      <img src={followedUser.avatarUrl} alt={followedUser.fullName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      followedUser.fullName?.charAt(0).toUpperCase()
                    )}
                  </div>
                </Avatar>
                <h3 className="font-semibold text-lg mb-1">{followedUser.fullName}</h3>
                <p className="text-sm text-gray-600 mb-4">@{followedUser.username}</p>
                {followedUser.bio && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{followedUser.bio}</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUnfollow(followedUser.id)}
                  className="w-full"
                >
                  ❌ Unfollow
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
