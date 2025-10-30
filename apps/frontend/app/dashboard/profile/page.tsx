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
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    denomination: user?.denomination || '',
    spiritualJourneyStage: user?.spiritualJourneyStage || '',
  });

  const handleSave = async () => {
    try {
      await apiClient.put('/users/me', formData);
      alert('Profile updated successfully!');
      setEditing(false);
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
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl md:text-4xl font-bold flex-shrink-0">
            {user?.fullName?.[0].toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl md:text-2xl font-bold">{user?.fullName}</h2>
            <p className="text-sm md:text-base text-gray-600">@{user?.username}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              disabled={!editing}
              className="text-sm md:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              disabled={!editing}
              className="w-full border rounded px-3 py-2 text-sm md:text-base"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Denomination</label>
            <Input
              value={formData.denomination}
              onChange={(e) => setFormData({...formData, denomination: e.target.value})}
              disabled={!editing}
              className="text-sm md:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Spiritual Journey Stage</label>
            <select
              value={formData.spiritualJourneyStage}
              onChange={(e) => setFormData({...formData, spiritualJourneyStage: e.target.value})}
              disabled={!editing}
              className="w-full border rounded px-3 py-2 text-sm md:text-base"
            >
              <option value="">Select stage...</option>
              <option value="seeker">Seeker</option>
              <option value="new_believer">New Believer</option>
              <option value="growing">Growing</option>
              <option value="mature">Mature</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {editing ? (
            <>
              <Button onClick={handleSave} className="flex-1">Save Changes</Button>
              <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)} className="w-full">
              Edit Profile
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
