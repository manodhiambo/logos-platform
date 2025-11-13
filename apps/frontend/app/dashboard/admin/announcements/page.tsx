'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminService, Announcement } from '@/lib/services/admin.service';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'maintenance' | 'feature' | 'event' | 'urgent',
    priority: 3,
    status: 'published' as 'draft' | 'published' | 'archived',
    isGlobal: true,
    expiresAt: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAnnouncements();
      setAnnouncements(data.announcements || []);
    } catch (error: any) {
      console.error('Failed to load announcements:', error);
      if (error.response?.status === 403) {
        alert('You do not have permission to access announcements management');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Prepare data for backend
      const announcementData: any = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        isGlobal: formData.isGlobal,
      };
      
      // Only add expiresAt if provided
      if (formData.expiresAt) {
        announcementData.expiresAt = new Date(formData.expiresAt).toISOString();
      }
      
      await adminService.createAnnouncement(announcementData);
      setShowCreateForm(false);
      setFormData({
        title: '',
        content: '',
        type: 'general',
        priority: 3,
        status: 'published',
        isGlobal: true,
        expiresAt: '',
      });
      await loadAnnouncements();
      alert('Announcement created successfully! 🎉');
    } catch (error: any) {
      console.error('Create announcement error:', error);
      alert(error.response?.data?.message || 'Failed to create announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (announcementId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'archived' : 'published';
      await adminService.updateAnnouncement(announcementId, { status: newStatus });
      await loadAnnouncements();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update announcement');
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await adminService.deleteAnnouncement(announcementId);
      await loadAnnouncements();
      alert('Announcement deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete announcement');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => router.back()}>
              ← Back to Admin
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 mt-4">📢 Announcements</h1>
            <p className="text-slate-600 mt-2">Manage platform-wide announcements</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <span className="text-lg mr-2">➕</span>
            New Announcement
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Create New Announcement</CardTitle>
              <CardDescription>
                Post important updates or information to all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Announcement title"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    Content *
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Announcement content..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">
                      Type *
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="general">📢 General</option>
                      <option value="maintenance">🔧 Maintenance</option>
                      <option value="feature">✨ Feature</option>
                      <option value="event">🎉 Event</option>
                      <option value="urgent">🚨 Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">
                      Priority *
                    </label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="1">1 - Lowest</option>
                      <option value="2">2 - Low</option>
                      <option value="3">3 - Medium</option>
                      <option value="4">4 - High</option>
                      <option value="5">5 - Highest</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="expiresAt" className="text-sm font-medium">
                      Expires At (Optional)
                    </label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="isGlobal"
                      checked={formData.isGlobal}
                      onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                      className="w-4 h-4 text-primary focus:ring-primary"
                      disabled={saving}
                    />
                    <div>
                      <label htmlFor="isGlobal" className="font-medium cursor-pointer">
                        Global Announcement
                      </label>
                      <p className="text-sm text-slate-500">
                        Show this announcement to all users across all communities
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Status *
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="draft">📝 Draft (not visible)</option>
                      <option value="published">✅ Published (visible to users)</option>
                      <option value="archived">📦 Archived (hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? 'Creating...' : 'Create Announcement'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Announcements List */}
        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
            <CardDescription>Manage existing announcements</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading announcements...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-6xl mb-4">📢</p>
                <p>No announcements yet. Create your first announcement!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
}

function AnnouncementCard({ announcement, onToggleStatus, onDelete }: AnnouncementCardProps) {
  const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
    general: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '📢' },
    maintenance: { bg: 'bg-orange-50', border: 'border-orange-200', icon: '🔧' },
    feature: { bg: 'bg-green-50', border: 'border-green-200', icon: '✨' },
    event: { bg: 'bg-purple-50', border: 'border-purple-200', icon: '🎉' },
    urgent: { bg: 'bg-red-50', border: 'border-red-200', icon: '🚨' },
  };

  const style = typeStyles[announcement.type] || typeStyles.general;
  const isPublished = announcement.status === 'published';

  return (
    <div
      className={`p-4 rounded-lg border-2 ${style.bg} ${style.border} ${
        !isPublished ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{style.icon}</span>
            <h3 className="font-semibold text-lg">{announcement.title}</h3>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
              Priority: {announcement.priority || 3}
            </span>
            {!isPublished && (
              <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded">
                {announcement.status}
              </span>
            )}
          </div>
          <p className="text-slate-700 mb-3">{announcement.content}</p>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Created: {new Date(announcement.createdAt).toLocaleString()}</span>
            {announcement.expiresAt && (
              <span>Expires: {new Date(announcement.expiresAt).toLocaleString()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(announcement.id, announcement.status)}
          >
            {isPublished ? '📦 Archive' : '✅ Publish'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(announcement.id)}
            className="text-red-600 hover:text-red-700"
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>
  );
}
