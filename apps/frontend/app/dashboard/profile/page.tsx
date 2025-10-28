'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userService } from '@/lib/services/user.service';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    bio: '',
    denomination: '',
    country: '',
    timezone: '',
    spiritualJourneyStage: 'new_believer',
    preferredBibleTranslation: 'NKJV',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    prayer: true,
    devotional: true,
    announcements: true,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await userService.updateProfile(profileData);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await userService.updateNotificationSettings({ notificationSettings });
      setSuccess('Notification settings updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile & Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-200">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
            ❌ {error}
          </div>
        )}

        {/* Profile Card with Avatar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">{user?.fullName}</h2>
                <p className="text-slate-600">@{user?.username}</p>
                <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
              </div>
              <Button variant="outline">Upload Photo</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different settings */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, fullName: e.target.value })
                        }
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="denomination" className="text-sm font-medium">
                        Denomination
                      </label>
                      <Input
                        id="denomination"
                        placeholder="e.g., Baptist, Catholic, etc."
                        value={profileData.denomination}
                        onChange={(e) =>
                          setProfileData({ ...profileData, denomination: e.target.value })
                        }
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="country" className="text-sm font-medium">
                        Country
                      </label>
                      <Input
                        id="country"
                        placeholder="Your country"
                        value={profileData.country}
                        onChange={(e) =>
                          setProfileData({ ...profileData, country: e.target.value })
                        }
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="timezone" className="text-sm font-medium">
                        Timezone
                      </label>
                      <Input
                        id="timezone"
                        placeholder="e.g., America/New_York"
                        value={profileData.timezone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, timezone: e.target.value })
                        }
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="spiritualJourneyStage" className="text-sm font-medium">
                        Spiritual Journey Stage
                      </label>
                      <select
                        id="spiritualJourneyStage"
                        value={profileData.spiritualJourneyStage}
                        onChange={(e) =>
                          setProfileData({ ...profileData, spiritualJourneyStage: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={loading}
                      >
                        <option value="seeker">Exploring Christianity</option>
                        <option value="new_believer">New Believer</option>
                        <option value="growing">Growing in Faith</option>
                        <option value="mature">Mature Believer</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="preferredBibleTranslation" className="text-sm font-medium">
                        Preferred Bible Translation
                      </label>
                      <select
                        id="preferredBibleTranslation"
                        value={profileData.preferredBibleTranslation}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            preferredBibleTranslation: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={loading}
                      >
                        <option value="NKJV">NKJV</option>
                        <option value="NIV">NIV</option>
                        <option value="KJV">KJV</option>
                        <option value="ESV">ESV</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      placeholder="Tell us about your faith journey..."
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-sm font-medium">
                      Current Password
                    </label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Must be at least 8 characters with uppercase, lowercase, number, and special
                      character
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <NotificationToggle
                    label="Email Notifications"
                    description="Receive notifications via email"
                    checked={notificationSettings.email}
                    onChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, email: checked })
                    }
                  />
                  <NotificationToggle
                    label="Push Notifications"
                    description="Receive push notifications in your browser"
                    checked={notificationSettings.push}
                    onChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, push: checked })
                    }
                  />
                  <NotificationToggle
                    label="Prayer Notifications"
                    description="Get notified about prayer requests and updates"
                    checked={notificationSettings.prayer}
                    onChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, prayer: checked })
                    }
                  />
                  <NotificationToggle
                    label="Devotional Reminders"
                    description="Daily reminders for devotional reading"
                    checked={notificationSettings.devotional}
                    onChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, devotional: checked })
                    }
                  />
                  <NotificationToggle
                    label="Announcements"
                    description="Receive important announcements and updates"
                    checked={notificationSettings.announcements}
                    onChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, announcements: checked })
                    }
                  />
                </div>

                <Button onClick={handleNotificationUpdate} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function NotificationToggle({ label, description, checked, onChange }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
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
