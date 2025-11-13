'use client';

import { useState, useEffect } from 'react';
import { friendshipService } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await friendshipService.getFriends();
      setFriends(response.data || []);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendshipId: string, friendName: string) => {
    if (!confirm(`Are you sure you want to remove ${friendName} as a friend?`)) return;

    try {
      await friendshipService.removeFriend(friendshipId);
      alert('Friend removed successfully');
      loadFriends();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove friend');
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">👥 My Friends</h1>
        <Link href="/dashboard/friends/find">
          <Button>🔍 Find Friends</Button>
        </Link>
      </div>

      {friends.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-semibold mb-2">No friends yet</h2>
          <p className="text-gray-600 mb-6">Start connecting with other believers!</p>
          <Link href="/dashboard/friends/find">
            <Button>Find Friends</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friendship: any) => {
            const friend = friendship.friend || friendship;
            return (
              <Card key={friendship.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-4">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                      {friend.avatarUrl ? (
                        <img src={friend.avatarUrl} alt={friend.fullName} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        friend.fullName?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-1">{friend.fullName}</h3>
                  <p className="text-sm text-gray-600 mb-4">@{friend.username}</p>
                  {friend.bio && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{friend.bio}</p>
                  )}
                  <div className="flex gap-2 w-full">
                    <Link href={`/dashboard/messages/${friend.id}`} className="flex-1">
                      <Button size="sm" className="w-full">💬 Message</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFriend(friendship.id, friend.fullName)}
                      className="text-red-600 hover:text-red-700"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
