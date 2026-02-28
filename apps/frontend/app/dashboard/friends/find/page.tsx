'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendshipService } from '@/lib/services';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';

export default function FindFriendsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setSearched(true);
      const response = await friendshipService.searchUsers(searchQuery);
      const results = (response.data || []).filter((u: any) => u.id !== user?.id);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendshipService.sendFriendRequest(userId);
      alert('Friend request sent! 🎉');
      handleSearch(new Event('submit') as any);
    } catch (error: any) {
      alert(error.message || 'Failed to send request');
    }
  };

  const handleVideoCall = async (targetUser: any) => {
    try {
      const response = await apiClient.post('/video-calls', {
        title: `Call with ${targetUser.fullName}`,
        type: 'one_on_one',
        purpose: 'general',
        maxParticipants: 2,
        // No scheduledAt → starts immediately
      });
      const callId = response.data.data?.call?.id;
      if (callId) {
        window.location.href = `/dashboard/video-calls/${callId}`;
      }
    } catch (error: any) {
      alert(error.message || 'Failed to start video call');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🔍 Find Friends</h1>

      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or username..."
            className="flex-1"
          />
          <Button type="submit" disabled={searching}>
            {searching ? 'Searching...' : '🔍 Search'}
          </Button>
        </form>
      </Card>

      {searched && searchResults.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600">No users found. Try a different search.</p>
        </Card>
      )}

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((foundUser: any) => (
            <Card key={foundUser.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                    {foundUser.avatarUrl ? (
                      <img src={foundUser.avatarUrl} alt={foundUser.fullName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      foundUser.fullName?.charAt(0).toUpperCase()
                    )}
                  </div>
                </Avatar>
                <h3 className="font-semibold text-lg mb-1">{foundUser.fullName}</h3>
                <p className="text-sm text-gray-600 mb-2">@{foundUser.username}</p>
                {foundUser.bio && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{foundUser.bio}</p>
                )}
                <div className="flex gap-2 w-full">
                  <Button
                    size="sm"
                    onClick={() => handleSendRequest(foundUser.id)}
                    className="flex-1"
                  >
                    👥 Add Friend
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVideoCall(foundUser)}
                    title="Start video call"
                    className="px-3"
                  >
                    📹
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
