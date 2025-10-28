'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import {
  notificationService,
  Notification,
  NotificationPreferences,
} from '@/lib/services/notification.service';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifData, countData, prefData] = await Promise.all([
        notificationService.getNotifications({ unread: filter === 'unread' }),
        notificationService.getUnreadCount(),
        notificationService.getPreferences(),
      ]);

      setNotifications(notifData.notifications || []);
      setUnreadCount(countData.count || 0);
      setPreferences(prefData.preferences);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete notification');
    }
  };

  const handleUpdatePreferences = async () => {
    if (!preferences) return;

    try {
      setSavingPreferences(true);
      await notificationService.updatePreferences(preferences);
      alert('Preferences saved successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-2">Stay updated with your activity</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              Mark All as Read ({unreadCount})
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">🔔 Notifications</TabsTrigger>
            <TabsTrigger value="preferences">⚙️ Preferences</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Notifications</CardTitle>
                    <CardDescription>Stay updated with your activity</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === 'unread' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('unread')}
                    >
                      Unread ({unreadCount})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-6xl mb-4">🔔</p>
                    <p>
                      {filter === 'unread'
                        ? 'No unread notifications'
                        : 'No notifications yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                {preferences ? (
                  <div className="space-y-4">
                    <PreferenceToggle
                      label="Email Notifications"
                      description="Receive notifications via email"
                      icon="📧"
                      checked={preferences.emailNotifications}
                      onChange={(checked) =>
                        setPreferences({ ...preferences, emailNotifications: checked })
                      }
                    />
                    <PreferenceToggle
                      label="Push Notifications"
                      description="Receive push notifications in browser"
                      icon="🔔"
                      checked={preferences.pushNotifications}
                      onChange={(checked) =>
                        setPreferences({ ...preferences, pushNotifications: checked })
                      }
                    />
                    <PreferenceToggle
                      label="Prayer Updates"
                      description="Get notified about prayer requests and answers"
                      icon="🙏"
                      checked={preferences.prayerUpdates}
                      onChange={(checked) =>
                        setPreferences({ ...preferences, prayerUpdates: checked })
                      }
                    />
                    <PreferenceToggle
                      label="Devotional Reminders"
                      description="Daily reminders for devotional reading"
                      icon="📖"
                      checked={preferences.devotionalReminders}
                      onChange={(checked) =>
                        setPreferences({ ...preferences, devotionalReminders: checked })
                      }
                    />
                    <PreferenceToggle
                      label="Community Activity"
                      description="Updates from your communities"
                      icon="👥"
                      checked={preferences.communityActivity}
                      onChange={(checked) =>
                        setPreferences({ ...preferences, communityActivity: checked })
                      }
                    />
                    <PreferenceToggle
                      label="Post Interactions"
                      description="Likes and comments on your posts"
                      icon="💬"
                      checked={preferences.postInteractions}
                      onChange={(checked) =>
                        setPreferences({ ...preferences, postInteractions: checked })
                      }
                    />
                    <PreferenceToggle
                      label="Announcements"
                      description="Important updates and announcements"
                      icon="📢"
                      checked={preferences.announcements}
                      onChange={(checked) =>
                        setPreferences({ ...preferences, announcements: checked })
                      }
                    />

                    <Button
                      onClick={handleUpdatePreferences}
                      disabled={savingPreferences}
                      className="w-full"
                    >
                      {savingPreferences ? 'Saving...' : '💾 Save Preferences'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading preferences...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationCardProps) {
  const typeIcons: Record<string, string> = {
    prayer: '🙏',
    post: '📝',
    comment: '💬',
    like: '❤️',
    community: '👥',
    devotional: '📖',
    announcement: '📢',
    system: '⚙️',
  };

  const content = (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        notification.isRead
          ? 'bg-white border-slate-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{typeIcons[notification.type] || '🔔'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{notification.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
              <p className="text-xs text-slate-500 mt-2">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-1">
              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onMarkAsRead(notification.id);
                  }}
                  className="text-primary hover:text-primary/80 text-sm"
                  title="Mark as read"
                >
                  ✓
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(notification.id);
                }}
                className="text-red-500 hover:text-red-600 text-sm"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>;
  }

  return content;
}

interface PreferenceToggleProps {
  label: string;
  description: string;
  icon: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function PreferenceToggle({ label, description, icon, checked, onChange }: PreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium text-slate-900">{label}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}
