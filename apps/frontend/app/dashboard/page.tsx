'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';
import {
  messageService,
  friendshipService,
  prayerService,
  communityService,
  devotionalService,
  adminService,
} from '@/lib/services';

interface DashboardStats {
  totalFriends: number;
  totalFollowers: number;
  totalFollowing: number;
  unreadMessages: number;
  pendingFriendRequests: number;
  activePrayers: number;
  communitiesJoined: number;
  prayersAnswered: number;
  devotionalStreak: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  totalCommunities: number;
  totalPrayers: number;
  pendingModeration: number;
}

interface QuickAction {
  icon: string;
  title: string;
  description: string;
  href: string;
  badge?: number;
  color: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalFriends: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    unreadMessages: 0,
    pendingFriendRequests: 0,
    activePrayers: 0,
    communitiesJoined: 0,
    prayersAnswered: 0,
    devotionalStreak: 0,
  });
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [todaysDevotion, setTodaysDevotion] = useState<any>(null);
  const [recentPrayers, setRecentPrayers] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  const isAdmin = user && ['admin', 'super_admin'].includes(user.role || '');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        communitiesData,
        myPrayersData,
        devotionData,
        devotionalStats,
      ] = await Promise.all([
        communityService.getMyCommunities().catch(() => []),
        prayerService.getMyPrayerRequests().catch(() => []),
        devotionalService.getTodaysDevotional().catch(() => null),
        devotionalService.getUserStats().catch(() => ({ currentStreak: 0 })),
      ]);

      let friendsCount = 0;
      let followersCount = 0;
      let followingCount = 0;
      let pendingCount = 0;
      let unreadMsgCount = 0;
      let conversations: any[] = [];

      try {
        const friendsData = await friendshipService.getFriends();
        friendsCount = friendsData.data?.length || 0;
      } catch (error) {
        console.log('Could not load friends:', error);
      }

      try {
        const followersData = await friendshipService.getFollowers(user?.id || '');
        followersCount = followersData.data?.length || 0;
      } catch (error) {
        console.log('Could not load followers:', error);
      }

      try {
        const followingData = await friendshipService.getFollowing(user?.id || '');
        followingCount = followingData.data?.length || 0;
      } catch (error) {
        console.log('Could not load following:', error);
      }

      try {
        const pendingRequests = await friendshipService.getPendingRequests();
        pendingCount = pendingRequests.data?.length || 0;
      } catch (error) {
        console.log('Could not load pending requests:', error);
      }

      try {
        const unreadCount = await messageService.getUnreadCount();
        unreadMsgCount = typeof unreadCount === 'number' ? unreadCount : (unreadCount.data?.count || 0);
      } catch (error) {
        console.log('Could not load unread count:', error);
      }

      try {
        const conversationsData = await messageService.getConversations();
        conversations = conversationsData.data?.slice(0, 5) || [];
      } catch (error) {
        console.log('Could not load conversations:', error);
      }

      setStats({
        totalFriends: friendsCount,
        totalFollowers: followersCount,
        totalFollowing: followingCount,
        unreadMessages: unreadMsgCount,
        pendingFriendRequests: pendingCount,
        activePrayers: Array.isArray(myPrayersData) 
          ? myPrayersData.filter((p: any) => p.status === 'open' || p.status === 'in_progress').length 
          : 0,
        communitiesJoined: Array.isArray(communitiesData) ? communitiesData.length : 0,
        prayersAnswered: Array.isArray(myPrayersData) 
          ? myPrayersData.filter((p: any) => p.status === 'answered').length 
          : 0,
        devotionalStreak: devotionalStats?.currentStreak || 0,
      });

      setTodaysDevotion(devotionData);
      setRecentPrayers(Array.isArray(myPrayersData) ? myPrayersData.slice(0, 5) : []);
      setRecentMessages(conversations);

      if (isAdmin) {
        try {
          const systemStats = await adminService.getSystemStats();
          setAdminStats(systemStats);
        } catch (error) {
          console.error('Error loading admin stats:', error);
        }
      }

      try {
        const usersData = await friendshipService.searchUsers('a');
        const randomUsers = (usersData.data || [])
          .filter((u: any) => u.id !== user?.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);
        setSuggestedUsers(randomUsers);
      } catch (error) {
        console.log('Could not load suggested users:', error);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      console.log('Sending friend request to user ID:', userId);
      console.log('Current user ID:', user?.id);
      
      const response = await friendshipService.sendFriendRequest(userId);
      console.log('Friend request response:', response);
      
      alert('Friend request sent! 🎉');
      loadDashboardData();
    } catch (error: any) {
      console.error('=== FRIEND REQUEST ERROR ===');
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.response?.data?.message);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send friend request';
      alert(`Error: ${errorMsg}`);
    }
  };

  const quickActions: QuickAction[] = [
    {
      icon: '💬',
      title: 'Messages',
      description: 'Chat with friends',
      href: '/dashboard/messages',
      badge: stats.unreadMessages,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    },
    {
      icon: '👥',
      title: 'Friend Requests',
      description: 'Pending requests',
      href: '/dashboard/friends/requests',
      badge: stats.pendingFriendRequests,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    },
    {
      icon: '🙏',
      title: 'Pray',
      description: 'Submit a prayer',
      href: '/dashboard/prayers',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
    },
    {
      icon: '📖',
      title: 'Daily Devotion',
      description: "Today's reading",
      href: '/dashboard/devotionals',
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
    },
    {
      icon: '🤖',
      title: 'AI Assistant',
      description: 'Get spiritual guidance',
      href: '/dashboard/ai-assistant',
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
    },
    {
      icon: '🎥',
      title: 'Video Call',
      description: 'Join or start a call',
      href: '/dashboard/video-calls',
      color: 'bg-red-50 hover:bg-red-100 border-red-200',
    },
    {
      icon: '👤',
      title: 'My Profile',
      description: 'View and edit profile',
      href: '/dashboard/profile',
      color: 'bg-slate-50 hover:bg-slate-100 border-slate-200',
    },

    {
      icon: '👤',
      title: 'Find Friends',
      description: 'Connect with users',
      href: '/dashboard/friends/find',
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
    },
    {
      icon: '📝',
      title: 'Create Post',
      description: 'Share your thoughts',
      href: '/dashboard/posts',
      color: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 space-y-4">
      {/* ── Greeting Hero ── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-white font-black text-2xl shrink-0">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt={user?.fullName} className="w-full h-full object-cover" />
              : (user?.fullName?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user?.fullName?.split(' ')[0]}! ✝️
            </h1>
            <p className="text-blue-100 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { value: stats.totalFriends, label: 'Friends' },
            { value: stats.communitiesJoined, label: 'Communities' },
            { value: stats.prayersAnswered, label: 'Answered' },
            { value: stats.devotionalStreak, label: 'Day Streak 🔥' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs text-blue-100">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && adminStats && (
        <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              🛡️ Admin Overview
            </h2>
            <Link href="/dashboard/admin">
              <Button variant="outline" size="sm">View Full Admin</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary">{adminStats.totalUsers}</div>
              <div className="text-sm text-slate-600 mt-1">Total Users</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{adminStats.activeUsersToday}</div>
              <div className="text-sm text-slate-600 mt-1">Active Today</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{adminStats.totalCommunities}</div>
              <div className="text-sm text-slate-600 mt-1">Communities</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{adminStats.totalPrayers}</div>
              <div className="text-sm text-slate-600 mt-1">Total Prayers</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">{adminStats.pendingModeration}</div>
              <div className="text-sm text-slate-600 mt-1">Pending Review</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href="/dashboard/admin/users">
              <Button size="sm">👥 Manage Users</Button>
            </Link>
            <Link href="/dashboard/admin/announcements">
              <Button size="sm" variant="outline">📢 Announcements</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-base font-semibold text-gray-500 mb-2 px-1">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all text-center relative group">
                {action.badge !== undefined && action.badge > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5">
                    {action.badge}
                  </span>
                )}
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                <p className="text-xs font-semibold text-gray-700 leading-tight">{action.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {suggestedUsers.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              🌟 Discover Users
            </h2>
            <Link href="/dashboard/friends">
              <Button variant="outline" size="sm">See All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedUsers.map((suggestedUser: any) => (
              <Card key={suggestedUser.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <div className="w-full h-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                      {suggestedUser.fullName?.charAt(0) || '?'}
                    </div>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {suggestedUser.fullName}
                    </h3>
                    <p className="text-sm text-slate-600 truncate">{suggestedUser.email}</p>
                    {suggestedUser.bio && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{suggestedUser.bio}</p>
                    )}
                    <Button 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSendFriendRequest(suggestedUser.id);
                      }}
                    >
                      👥 Add Friend
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              📖 Today's Devotion
            </h2>
            <Link href="/dashboard/devotionals">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          {todaysDevotion ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-700">
                {todaysDevotion.title}
              </h3>
              <p className="text-sm text-slate-600 italic">
                "{todaysDevotion.bibleVerse}" - {todaysDevotion.verseReference}
              </p>
              <p className="text-slate-700 leading-relaxed line-clamp-4">
                {todaysDevotion.content}
              </p>
              <Link href="/dashboard/devotionals">
                <Button className="mt-2">Read More →</Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No devotion available for today</p>
              <Link href="/dashboard/devotionals">
                <Button variant="outline" className="mt-3">Browse Devotions</Button>
              </Link>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Network</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                  👥
                </div>
                <div>
                  <div className="font-semibold text-slate-700">Friends</div>
                  <div className="text-sm text-slate-500">{stats.totalFriends} connected</div>
                </div>
              </div>
              <Link href="/dashboard/friends">
                <Button variant="ghost" size="sm">View</Button>
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">
                  👤
                </div>
                <div>
                  <div className="font-semibold text-slate-700">Followers</div>
                  <div className="text-sm text-slate-500">{stats.totalFollowers} followers</div>
                </div>
              </div>
              <Link href="/dashboard/followers">
                <Button variant="ghost" size="sm">View</Button>
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                  ➕
                </div>
                <div>
                  <div className="font-semibold text-slate-700">Following</div>
                  <div className="text-sm text-slate-500">{stats.totalFollowing} following</div>
                </div>
              </div>
              <Link href="/dashboard/following">
                <Button variant="ghost" size="sm">View</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              🙏 Your Prayer Requests
            </h2>
            <Link href="/dashboard/prayers">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          {recentPrayers.length > 0 ? (
            <div className="space-y-3">
              {recentPrayers.map((prayer: any) => (
                <div key={prayer.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-700 line-clamp-1">
                      {prayer.title}
                    </h3>
                    <Badge variant={prayer.status === 'answered' ? 'default' : 'secondary'}>
                      {prayer.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {prayer.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{new Date(prayer.createdAt).toLocaleDateString()}</span>
                    <span>{prayer.prayerCount} prayers</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="mb-3">No prayer requests yet</p>
              <Link href="/dashboard/prayers">
                <Button>Submit a Prayer Request</Button>
              </Link>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              💬 Recent Messages
              {stats.unreadMessages > 0 && (
                <Badge className="bg-red-500 text-white">{stats.unreadMessages}</Badge>
              )}
            </h2>
            <Link href="/dashboard/messages">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          {recentMessages.length > 0 ? (
            <div className="space-y-3">
              {recentMessages.map((conversation: any) => (
                <Link 
                  key={conversation.conversationId} 
                  href={`/dashboard/messages/${conversation.otherUser?.id}`}
                >
                  <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <div className="w-full h-full bg-primary text-white flex items-center justify-center font-semibold">
                          {conversation.otherUser?.fullName?.charAt(0) || '?'}
                        </div>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-slate-700 truncate">
                            {conversation.otherUser?.fullName || 'Unknown User'}
                          </h3>
                          <span className="text-xs text-slate-500">
                            {conversation.lastMessageAt && new Date(conversation.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {conversation.lastMessagePreview || 'No messages yet'}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white shrink-0">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="mb-3">No messages yet</p>
              <Link href="/dashboard/friends">
                <Button>Find Friends to Chat</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            👥 Your Communities ({stats.communitiesJoined})
          </h2>
          <Link href="/dashboard/communities">
            <Button variant="outline" size="sm">Explore More</Button>
          </Link>
        </div>
        {stats.communitiesJoined > 0 ? (
          <div className="text-center py-4">
            <p className="text-slate-600 mb-3">
              You're part of {stats.communitiesJoined} {stats.communitiesJoined === 1 ? 'community' : 'communities'}
            </p>
            <Link href="/dashboard/communities">
              <Button>View Your Communities</Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p className="mb-3">You haven't joined any communities yet</p>
            <Link href="/dashboard/communities">
              <Button>Discover Communities</Button>
            </Link>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-5xl">📕</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Continue Your Bible Study
            </h3>
            <p className="text-slate-600">
              Explore scripture, use AI assistance for deeper understanding
            </p>
          </div>
          <Link href="/dashboard/bible">
            <Button>Open Bible</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
