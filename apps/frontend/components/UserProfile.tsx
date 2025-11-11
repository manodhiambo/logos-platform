'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import friendshipService from '@/lib/services/friendship.service';
import messageService from '@/lib/services/message.service';
import { useRouter } from 'next/navigation';

interface UserProfileProps {
  userId: string;
  currentUserId: string;
}

export default function UserProfile({ userId, currentUserId }: UserProfileProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Load friendship status
      const status = await friendshipService.checkFriendshipStatus(userId);
      setFriendshipStatus(status);

      // Check if following
      const following = await friendshipService.isFollowing(userId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await friendshipService.sendFriendRequest(userId);
      await loadUserProfile();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async () => {
    try {
      if (friendshipStatus?.friendshipId) {
        await friendshipService.acceptFriendRequest(friendshipStatus.friendshipId);
        await loadUserProfile();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRemoveFriend = async () => {
    try {
      if (friendshipStatus?.friendshipId) {
        await friendshipService.removeFriend(friendshipStatus.friendshipId);
        await loadUserProfile();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove friend');
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await friendshipService.unfollowUser(userId);
      } else {
        await friendshipService.followUser(userId);
      }
      setIsFollowing(!isFollowing);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update follow status');
    }
  };

  const handleSendMessage = () => {
    router.push(`/dashboard/messages/${userId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const renderFriendshipButton = () => {
    if (!friendshipStatus) return null;

    switch (friendshipStatus.status) {
      case 'none':
        return (
          <Button onClick={handleSendFriendRequest}>
            Add Friend
          </Button>
        );
      case 'pending':
        if (friendshipStatus.isRequester) {
          return (
            <Badge variant="secondary">Friend Request Sent</Badge>
          );
        } else {
          return (
            <Button onClick={handleAcceptRequest}>
              Accept Friend Request
            </Button>
          );
        }
      case 'accepted':
        return (
          <>
            <Badge variant="default">Friends</Badge>
            <Button variant="outline" onClick={handleRemoveFriend} size="sm">
              Unfriend
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {renderFriendshipButton()}
          
          <Button 
            variant={isFollowing ? "outline" : "default"}
            onClick={handleFollow}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>

          <Button variant="secondary" onClick={handleSendMessage}>
            Send Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
