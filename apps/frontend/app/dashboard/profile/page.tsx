'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    denomination: user?.denomination || '',
    spiritualJourneyStage: user?.spiritualJourneyStage || '',
    country: user?.country || '',
    timezone: user?.timezone || '',
    preferredBibleTranslation: user?.preferredBibleTranslation || 'NKJV',
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      await apiClient.put('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Avatar updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Avatar upload coming soon!');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.put('/users/me', formData);
      alert('Profile updated successfully!');
      setEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold">👤 My Profile</h1>

      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl md:text-4xl font-bold">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.fullName?.[0].toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer hover:bg-gray-100">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
              <span className="text-xl">📷</span>
            </label>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl md:text-2xl font-bold">{user?.fullName}</h2>
            <p className="text-sm md:text-base text-gray-600">@{user?.username}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
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
              value={formData.bio}
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
                value={formData.denomination}
                onChange={(e) => setFormData({...formData, denomination: e.target.value})}
                disabled={!editing}
                placeholder="e.g., Baptist, Methodist"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                disabled={!editing}
                placeholder="e.g., USA, Kenya"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Spiritual Journey Stage</label>
            <select
              value={formData.spiritualJourneyStage}
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
              value={formData.timezone}
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
              <Button onClick={handleSave} className="flex-1">💾 Save Changes</Button>
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
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">⚙️ Settings</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Email Notifications</span>
            <input type="checkbox" className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Prayer Reminders</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Devotional Reminders</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
        </div>
      </Card>
    </div>
  );
}
