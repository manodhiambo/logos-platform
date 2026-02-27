'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface StatusUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

interface StatusItem {
  id: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  backgroundColor?: string;
  textColor?: string;
  viewsCount: number;
  expiresAt: string;
  createdAt: string;
  user: StatusUser;
}

interface UserStatusGroup {
  user: StatusUser;
  statuses: StatusItem[];
}

function TimeRemaining({ expiresAt }: { expiresAt: string }) {
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffMs <= 0) return <span className="text-red-500 text-xs">Expired</span>;
  if (diffHours === 0) return <span className="text-orange-500 text-xs">{diffMins}m left</span>;
  return <span className="text-gray-400 text-xs">{diffHours}h {diffMins}m left</span>;
}

function StatusViewer({ group, onClose, currentUserId, onDelete }: {
  group: UserStatusGroup;
  onClose: () => void;
  currentUserId: string;
  onDelete: (statusId: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const status = group.statuses[currentIndex];

  const goNext = () => {
    if (currentIndex < group.statuses.length - 1) setCurrentIndex(i => i + 1);
    else onClose();
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  useEffect(() => {
    // Record view
    apiClient.post(`/status/${status.id}/view`).catch(() => {});
  }, [status.id]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        {/* Progress bars */}
        <div className="flex gap-1 mb-3">
          {group.statuses.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
              <div className={`h-full bg-white transition-all duration-300 ${i < currentIndex ? 'w-full' : i === currentIndex ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
            {status.user?.avatarUrl ? (
              <img src={status.user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (status.user?.fullName?.[0] || 'U').toUpperCase()
            )}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{status.user?.fullName || status.user?.username}</p>
            <TimeRemaining expiresAt={status.expiresAt} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {status.user?.id === currentUserId && (
              <button
                onClick={() => { onDelete(status.id); onClose(); }}
                className="text-white/70 hover:text-red-400 text-sm"
              >
                🗑️
              </button>
            )}
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl">✕</button>
          </div>
        </div>

        {/* Status Content */}
        <div
          className="rounded-2xl overflow-hidden aspect-[9/16] max-h-[70vh] flex items-center justify-center relative"
          style={{ backgroundColor: status.backgroundColor || '#667eea' }}
        >
          {status.mediaUrl && status.mediaType === 'image' && (
            <img src={status.mediaUrl} alt="Status" className="w-full h-full object-cover absolute inset-0" />
          )}
          {status.mediaUrl && status.mediaType === 'video' && (
            <video src={status.mediaUrl} autoPlay loop muted className="w-full h-full object-cover absolute inset-0" />
          )}
          {status.content && (
            <div className={`relative z-10 p-6 text-center ${status.mediaUrl ? 'bg-black/40 w-full' : ''}`}>
              <p
                className="text-2xl font-semibold leading-snug"
                style={{ color: status.textColor || '#ffffff' }}
              >
                {status.content}
              </p>
            </div>
          )}

          {/* Nav areas */}
          <button
            className="absolute left-0 top-0 w-1/3 h-full"
            onClick={goPrev}
            aria-label="Previous"
          />
          <button
            className="absolute right-0 top-0 w-1/3 h-full"
            onClick={goNext}
            aria-label="Next"
          />
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-white/60 text-xs px-1">
          <span>👁️ {status.viewsCount} views</span>
          <span>{currentIndex + 1} / {group.statuses.length}</span>
        </div>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [groups, setGroups] = useState<UserStatusGroup[]>([]);
  const [myStatuses, setMyStatuses] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingGroup, setViewingGroup] = useState<UserStatusGroup | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setCurrentUser(JSON.parse(user));
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const [groupsRes, myRes] = await Promise.all([
        apiClient.get('/status/grouped'),
        apiClient.get('/status/my'),
      ]);
      setGroups(groupsRes.data.data?.groups || []);
      setMyStatuses(myRes.data.data?.statuses || []);
    } catch (err) {
      console.error('Failed to fetch statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteStatus = async (statusId: string) => {
    if (!confirm('Delete this status?')) return;
    try {
      await apiClient.delete(`/status/${statusId}`);
      fetchStatuses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete status');
    }
  };

  const otherGroups = groups.filter(g => g.user?.id !== currentUser?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Status</h1>
          <p className="text-sm text-gray-500 mt-0.5">Stories disappear after 24 hours</p>
        </div>
        <Link href="/dashboard/status/new">
          <Button>+ Add Status</Button>
        </Link>
      </div>

      {/* My Status */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">My Status</h3>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/status/new">
            <div className="relative cursor-pointer">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 ${myStatuses.length > 0 ? 'border-blue-500' : 'border-dashed border-gray-300'}`}
                style={{ background: myStatuses.length > 0 ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f3f4f6' }}>
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className={myStatuses.length > 0 ? 'text-white' : 'text-gray-400 text-2xl'}>
                    {myStatuses.length > 0 ? (currentUser?.fullName?.[0] || 'U').toUpperCase() : '+'}
                  </span>
                )}
              </div>
            </div>
          </Link>
          <div>
            <p className="font-medium text-gray-800">
              {myStatuses.length > 0 ? `${myStatuses.length} active status${myStatuses.length > 1 ? 'es' : ''}` : 'Add your status'}
            </p>
            <p className="text-xs text-gray-400">
              {myStatuses.length > 0 ? 'Visible for 24 hours' : 'Share a photo, video, or text'}
            </p>
          </div>
          {myStatuses.length > 0 && (
            <button
              onClick={() => setViewingGroup({ user: currentUser, statuses: myStatuses })}
              className="ml-auto text-sm text-blue-600 font-medium"
            >
              View
            </button>
          )}
        </div>

        {/* My status thumbnails */}
        {myStatuses.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {myStatuses.map(s => (
              <div key={s.id} className="flex-shrink-0 relative">
                <div
                  className="w-16 h-24 rounded-lg overflow-hidden cursor-pointer border border-gray-200"
                  style={{ backgroundColor: s.backgroundColor || '#667eea' }}
                  onClick={() => setViewingGroup({ user: currentUser, statuses: myStatuses })}
                >
                  {s.mediaUrl && s.mediaType === 'image' && (
                    <img src={s.mediaUrl} alt="" className="w-full h-full object-cover" />
                  )}
                  {s.mediaUrl && s.mediaType === 'video' && (
                    <video src={s.mediaUrl} className="w-full h-full object-cover" preload="metadata" />
                  )}
                  {s.content && !s.mediaUrl && (
                    <div className="w-full h-full flex items-center justify-center p-1">
                      <p className="text-white text-xs text-center line-clamp-3">{s.content}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteStatus(s.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Others' Statuses */}
      {otherGroups.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-gray-500 font-medium">No statuses from others yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to add a status!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600">Recent Updates</h3>
          {otherGroups.map((group) => (
            <Card
              key={group.user.id}
              className="p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setViewingGroup(group)}
            >
              <div className="w-14 h-14 rounded-full border-2 border-blue-500 p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                  {group.user?.avatarUrl ? (
                    <img src={group.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (group.user?.fullName?.[0] || 'U').toUpperCase()
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {group.user?.fullName || group.user?.username}
                </p>
                <p className="text-xs text-gray-400">
                  {group.statuses.length} status{group.statuses.length > 1 ? 'es' : ''} • <TimeRemaining expiresAt={group.statuses[0].expiresAt} />
                </p>
              </div>
              {/* Preview thumbnails */}
              <div className="flex gap-1 flex-shrink-0">
                {group.statuses.slice(0, 3).map(s => (
                  <div
                    key={s.id}
                    className="w-10 h-14 rounded-lg overflow-hidden"
                    style={{ backgroundColor: s.backgroundColor || '#667eea' }}
                  >
                    {s.mediaUrl && s.mediaType === 'image' && (
                      <img src={s.mediaUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    {s.content && !s.mediaUrl && (
                      <div className="w-full h-full flex items-center justify-center p-0.5">
                        <p className="text-white text-xs text-center line-clamp-2 text-[9px]">{s.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Status Viewer Modal */}
      {viewingGroup && (
        <StatusViewer
          group={viewingGroup}
          onClose={() => { setViewingGroup(null); fetchStatuses(); }}
          currentUserId={currentUser?.id}
          onDelete={deleteStatus}
        />
      )}
    </div>
  );
}
