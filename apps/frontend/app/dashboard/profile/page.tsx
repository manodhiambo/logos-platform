'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user } = useAuth();
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
      const response = await apiClient.post('/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUser = response.data.data.user;
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));

      alert('Avatar updated successfully! 📸');
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
      alert('Profile updated successfully! ✅');
      setEditing(false);
      
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">👤 My Profile</h1>
      </div>

      {/* Profile Picture Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <Avatar className="w-32 h-32">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-4xl font-bold">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                user?.fullName?.charAt(0).toUpperCase()
              )}
            </div>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg mb-2">{user?.fullName}</h3>
            <p className="text-gray-600 text-sm mb-3">@{user?.username}</p>
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <label 
              htmlFor="avatar-upload" 
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {uploading ? 'Uploading...' : '📸 Change Photo'}
            </label>
          </div>
        </div>
      </Card>

      {/* Profile Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          {!editing && (
            <Button onClick={() => setEditing(true)} variant="outline">
              ✏️ Edit Profile
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={!editing}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!editing}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Denomination</label>
              <Input
                value={formData.denomination}
                onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                disabled={!editing}
                placeholder="e.g., Baptist, Catholic, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Spiritual Journey Stage</label>
              <select
                value={formData.spiritualJourneyStage}
                onChange={(e) => setFormData({ ...formData, spiritualJourneyStage: e.target.value })}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              >
                <option value="">Select stage</option>
                <option value="new_believer">New Believer</option>
                <option value="growing">Growing</option>
                <option value="mature">Mature</option>
                <option value="leader">Leader</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                disabled={!editing}
                placeholder="Your country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <Input
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                disabled={!editing}
                placeholder="e.g., UTC+3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Preferred Bible Translation</label>
              <select
                value={formData.preferredBibleTranslation}
                onChange={(e) => setFormData({ ...formData, preferredBibleTranslation: e.target.value })}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              >
                <option value="NKJV">NKJV</option>
                <option value="NIV">NIV</option>
                <option value="KJV">KJV</option>
                <option value="ESV">ESV</option>
                <option value="NLT">NLT</option>
              </select>
            </div>
          </div>

          {editing && (
            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : '💾 Save Changes'}
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
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Username</p>
              <p className="text-sm text-gray-600">@{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Role</p>
              <p className="text-sm text-gray-600">{user?.role || 'user'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
