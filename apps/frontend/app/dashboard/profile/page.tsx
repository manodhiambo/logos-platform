'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { friendshipService, messageService } from '@/lib/services';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    denomination: user?.denomination || '',
    spiritualJourneyStage: user?.spiritualJourneyStage || '',
    country: user?.country || '',
    timezone: user?.timezone || '',
    preferredBibleTranslation: user?.preferredBibleTranslation || 'NKJV',
  });

  // Friends, Followers, Following state
  const [friends, setFriends] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  
  // User search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      fullName: user?.fullName || '',
      bio: user?.bio || '',
      denomination: user?.denomination || '',
      spiritualJourneyStage: user?.spiritualJourneyStage || '',
      country: user?.country || '',
      timezone: user?.timezone || '',
      preferredBibleTranslation: user?.preferredBibleTranslation || 'NKJV',
    });
  }, [user]);

  useEffect(() => {
    if (activeTab === 'friends') {
      loadFriendsData();
    } else if (activeTab === 'followers') {
      loadFollowersData();
    } else if (activeTab === 'following') {
      loadFollowingData();
    }
  }, [activeTab]);

  const loadFriendsData = async () => {
    setLoading(true);
    try {
      const [friendsData, pendingData, sentData] = await Promise.all([
        friendshipService.getFriends(),
        friendshipService.getPendingRequests(),
        friendshipService.getSentRequests(),
      ]);
      setFriends(friendsData.data || []);
      setPendingRequests(pendingData.data || []);
      setSentRequests(sentData.data || []);
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowersData = async () => {
    setLoading(true);
    try {
      const data = await friendshipService.getFollowers(user?.id || '');
      setFollowers(data.data || []);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowingData = async () => {
    setLoading(true);
    try {
      const data = await friendshipService.getFollowing(user?.id || '');
      setFollowing(data.data || []);
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const data = await friendshipService.searchUsers(searchQuery);
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await friendshipService.sendFriendRequest(userId);
      alert('Friend request sent! 🎉');
      handleSearch(); // Refresh search results
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await friendshipService.acceptFriendRequest(friendshipId);
      alert('Friend request accepted! 🎉');
      loadFriendsData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      await friendshipService.rejectFriendRequest(friendshipId);
      alert('Friend request rejected');
      loadFriendsData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      await friendshipService.removeFriend(friendshipId);
      alert('Friend removed');
      loadFriendsData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove friend');
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      await friendshipService.followUser(userId);
      alert('User followed! 🎉');
      handleSearch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to follow user');
    }
  };

  const handleUnfollowUser = async (userId: string) => {
    try {
      await friendshipService.unfollowUser(userId);
      alert('User unfollowed');
      loadFollowingData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to unfollow user');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG, GIF, and WebP images are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      await apiClient.post('/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Avatar updated successfully! 📸 Refreshing...');
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      alert(error.response?.data?.error?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/auth/me', formData);
      alert('Profile updated successfully! ✅ Refreshing...');
      setEditing(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold">👤 My Profile</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="friends">
            Friends
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-red-500">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="search">Find Friends</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-6">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl md:text-4xl font-bold overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName?.[0].toUpperCase()
                  )}
                </div>
                <label className={`absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition ${uploading ? 'opacity-50' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <span className="text-lg">{uploading ? '⏳' : '📷'}</span>
                </label>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl md:text-2xl font-bold">{user?.fullName}</h2>
                <p className="text-sm md:text-base text-gray-600">@{user?.username}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  disabled={!editing}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  disabled={!editing}
                  placeholder="Tell us about your faith journey..."
                  className="w-full border rounded px-3 py-2 text-sm md:text-base disabled:bg-gray-100"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Denomination</label>
                  <Input
                    value={formData.denomination || ''}
                    onChange={(e) => setFormData({...formData, denomination: e.target.value})}
                    disabled={!editing}
                    placeholder="e.g., Baptist, Methodist"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <Input
                    value={formData.country || ''}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    disabled={!editing}
                    placeholder="e.g., USA, Kenya"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Spiritual Journey Stage</label>
                <select
                  value={formData.spiritualJourneyStage || ''}
                  onChange={(e) => setFormData({...formData, spiritualJourneyStage: e.target.value})}
                  disabled={!editing}
                  className="w-full border rounded px-3 py-2 text-sm md:text-base disabled:bg-gray-100"
                >
                  <option value="">Select stage...</option>
                  <option value="seeker">🔍 Seeker - Exploring Christianity</option>
                  <option value="new_believer">🌱 New Believer - Just started my journey</option>
                  <option value="growing">📈 Growing - Deepening my faith</option>
                  <option value="mature">🌳 Mature - Established in faith</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preferred Bible Translation</label>
                <select
                  value={formData.preferredBibleTranslation}
                  onChange={(e) => setFormData({...formData, preferredBibleTranslation: e.target.value})}
                  disabled={!editing}
                  className="w-full border rounded px-3 py-2 text-sm md:text-base disabled:bg-gray-100"
                >
                  <option value="NKJV">NKJV - New King James Version</option>
                  <option value="NIV">NIV - New International Version</option>
                  <option value="KJV">KJV - King James Version</option>
                  <option value="ESV">ESV - English Standard Version</option>
                  <option value="NLT">NLT - New Living Translation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  value={formData.timezone || ''}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  disabled={!editing}
                  className="w-full border rounded px-3 py-2 text-sm md:text-base disabled:bg-gray-100"
                >
                  <option value="">Select timezone...</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                  <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {editing ? (
                <>
                  <Button onClick={handleSave} className="flex-1" disabled={saving}>
                    {saving ? '💾 Saving...' : '💾 Save Changes'}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        fullName: user?.fullName || '',
                        bio: user?.bio || '',
                        denomination: user?.denomination || '',
                        spiritualJourneyStage: user?.spiritualJourneyStage || '',
                        country: user?.country || '',
                        timezone: user?.timezone || '',
                        preferredBibleTranslation: user?.preferredBibleTranslation || 'NKJV',
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={saving}
                  >
                    ❌ Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)} className="w-full">
                  ✏️ Edit Profile
                </Button>
              )}
            </div>
          </Card>

          {/* Settings Card */}
          <Card className="p-4 md:p-6 mt-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">⚙️ Settings</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Email Notifications</span>
                <input type="checkbox" className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">Prayer Reminders</span>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Devotional Reminders</span>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends">
          <div className="space-y-6">
            {/* Pending Friend Requests */}
            {pendingRequests.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  📬 Pending Friend Requests
                  <Badge className="bg-red-500">{pendingRequests.length}</Badge>
                </h2>
                <div className="space-y-3">
                  {pendingRequests.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <div className="w-full h-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                            {request.requester?.fullName?.charAt(0) || '?'}
                          </div>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{request.requester?.fullName}</h3>
                          <p className="text-sm text-slate-600">@{request.requester?.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                          ✅ Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                          ❌ Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">📤 Sent Friend Requests</h2>
                <div className="space-y-3">
                  {sentRequests.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <div className="w-full h-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                            {request.addressee?.fullName?.charAt(0) || '?'}
                          </div>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{request.addressee?.fullName}</h3>
                          <p className="text-sm text-slate-600">@{request.addressee?.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Friends List */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">👥 My Friends ({friends.length})</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.map((friendship: any) => (
                    <div key={friendship.friendshipId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <div className="w-full h-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                            {friendship.friend?.fullName?.charAt(0) || '?'}
                          </div>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{friendship.friend?.fullName}</h3>
                          <p className="text-sm text-slate-600">{friendship.friend?.email}</p>
                          {friendship.friend?.bio && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{friendship.friend.bio}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/messages/${friendship.friend?.id}`}>
                          <Button size="sm" variant="outline">
                            💬 Message
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRemoveFriend(friendship.friendshipId)}
                        >
                          ❌ Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No friends yet. Start connecting!</p>
                  <Button className="mt-4" onClick={() => setActiveTab('search')}>
                    Find Friends
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">👤 My Followers ({followers.length})</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : followers.length > 0 ? (
              <div className="space-y-3">
                {followers.map((follower: any) => (
                  <div key={follower.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <div className="w-full h-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                          {follower.follower?.fullName?.charAt(0) || '?'}
                        </div>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{follower.follower?.fullName}</h3>
                        <p className="text-sm text-slate-600">{follower.follower?.email}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleFollowUser(follower.follower?.id)}>
                      ➕ Follow Back
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No followers yet</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Following Tab */}
        <TabsContent value="following">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">➕ Following ({following.length})</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : following.length > 0 ? (
              <div className="space-y-3">
                {following.map((follow: any) => (
                  <div key={follow.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <div className="w-full h-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                          {follow.following?.fullName?.charAt(0) || '?'}
                        </div>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{follow.following?.fullName}</h3>
                        <p className="text-sm text-slate-600">{follow.following?.email}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUnfollowUser(follow.following?.id)}
                    >
                      ❌ Unfollow
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>You're not following anyone yet</p>
                <Button className="mt-4" onClick={() => setActiveTab('search')}>
                  Find People to Follow
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Find Friends</h2>
            
            {/* Search Bar */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? '🔍 Searching...' : '🔍 Search'}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <div className="w-full h-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                          {user.fullName?.charAt(0) || '?'}
                        </div>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.fullName}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        {user.bio && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{user.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSendFriendRequest(user.id)}>
                        👥 Add Friend
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleFollowUser(user.id)}>
                        ➕ Follow
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery && !searching ? (
              <div className="text-center py-8 text-slate-500">
                <p>No users found. Try a different search term.</p>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Search for users by name or email to connect with them!</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
