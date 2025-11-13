'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'maintenance' | 'feature' | 'event' | 'urgent';
  priority: number;
  status: string;
  isGlobal: boolean;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
    loadDismissedIds();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements/active`);
      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.data?.announcements || []);
      }
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDismissedIds = () => {
    try {
      const stored = localStorage.getItem('dismissedAnnouncements');
      if (stored) {
        setDismissedIds(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load dismissed announcements:', error);
    }
  };

  const handleDismiss = async (announcementId: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(announcementId);
    setDismissedIds(newDismissed);
    
    try {
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(Array.from(newDismissed)));
    } catch (error) {
      console.error('Failed to save dismissed state:', error);
    }

    // Optionally mark as read on backend
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements/${announcementId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Failed to mark announcement as read:', error);
    }
  };

  const visibleAnnouncements = announcements.filter(
    (announcement) => !dismissedIds.has(announcement.id)
  );

  if (loading || visibleAnnouncements.length === 0) {
    return null;
  }

  const typeStyles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    general: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', icon: '📢' },
    maintenance: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', icon: '🔧' },
    feature: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900', icon: '✨' },
    event: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', icon: '🎉' },
    urgent: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900', icon: '🚨' },
  };

  return (
    <div className="space-y-3 mb-6">
      {visibleAnnouncements.map((announcement) => {
        const style = typeStyles[announcement.type] || typeStyles.general;
        
        return (
          <div
            key={announcement.id}
            className={`${style.bg} ${style.border} ${style.text} border-2 rounded-lg p-4 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{style.icon}</span>
                  <h3 className="font-bold text-lg">{announcement.title}</h3>
                  {announcement.priority >= 4 && (
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-semibold">
                      High Priority
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
                <div className="mt-2 text-xs opacity-75">
                  Posted: {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()}
                  {announcement.expiresAt && (
                    <> • Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDismiss(announcement.id)}
                className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
                aria-label="Dismiss announcement"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
