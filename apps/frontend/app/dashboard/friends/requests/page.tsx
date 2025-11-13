'use client';

import { useState, useEffect } from 'react';
import { friendshipService } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FriendRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [pending, sent] = await Promise.all([
        friendshipService.getPendingRequests(),
        friendshipService.getSentRequests(),
      ]);
      setPendingRequests(pending.data || []);
      setSentRequests(sent.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await friendshipService.acceptFriendRequest(requestId);
      alert('Friend request accepted! 🎉');
      loadRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await friendshipService.rejectFriendRequest(requestId);
      alert('Friend request rejected');
      loadRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this friend request?')) return;
    
    try {
      // Use rejectFriendRequest to cancel sent requests
      await friendshipService.rejectFriendRequest(requestId);
      alert('Friend request cancelled');
      loadRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel request');
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
      <h1 className="text-3xl font-bold">📨 Friend Requests</h1>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="received">
            Received ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          {pendingRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600">No pending friend requests</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((request: any) => {
                const requester = request.requester || request.user1;
                return (
                  <Card key={request.id} className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-20 h-20 mb-4">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                          {requester?.avatarUrl ? (
                            <img src={requester.avatarUrl} alt={requester.fullName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            requester?.fullName?.charAt(0).toUpperCase()
                          )}
                        </div>
                      </Avatar>
                      <h3 className="font-semibold text-lg mb-1">{requester?.fullName}</h3>
                      <p className="text-sm text-gray-600 mb-4">@{requester?.username}</p>
                      <div className="flex gap-2 w-full">
                        <Button size="sm" onClick={() => handleAccept(request.id)} className="flex-1">
                          ✅ Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(request.id)} className="flex-1">
                          ❌ Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {sentRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📤</div>
              <p className="text-gray-600">No sent friend requests</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentRequests.map((request: any) => {
                const addressee = request.addressee || request.user2;
                return (
                  <Card key={request.id} className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-20 h-20 mb-4">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                          {addressee?.avatarUrl ? (
                            <img src={addressee.avatarUrl} alt={addressee.fullName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            addressee?.fullName?.charAt(0).toUpperCase()
                          )}
                        </div>
                      </Avatar>
                      <h3 className="font-semibold text-lg mb-1">{addressee?.fullName}</h3>
                      <p className="text-sm text-gray-600 mb-4">@{addressee?.username}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(request.id)}
                        className="w-full"
                      >
                        🚫 Cancel Request
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
