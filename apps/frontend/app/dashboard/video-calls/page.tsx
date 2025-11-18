'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VideoCall {
  id: string;
  channelName: string;
  title: string;
  description: string;
  type: string;
  purpose: string;
  status: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  maxParticipants: number;
  host: {
    id: string;
    fullName: string;
  };
  participants?: any[];
}

export default function VideoCallsPage() {
  const { user } = useAuth();
  const [activeCalls, setActiveCalls] = useState<VideoCall[]>([]);
  const [scheduledCalls, setScheduledCalls] = useState<VideoCall[]>([]);
  const [myCallHistory, setMyCallHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const [activeRes, scheduledRes, historyRes] = await Promise.all([
        apiClient.get('/video-calls/active/all'),
        apiClient.get('/video-calls/scheduled/all'),
        apiClient.get('/video-calls/history/me?page=1&limit=5'),
      ]);

      setActiveCalls(activeRes.data.data?.calls || []);
      setScheduledCalls(scheduledRes.data.data?.calls || []);
      setMyCallHistory(historyRes.data.data?.history || []);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinCall = async (callId: string) => {
    try {
      // Just join - backend handles starting if needed
      const response = await apiClient.post(`/video-calls/${callId}/join`);
      
      // Redirect to call room
      window.location.href = `/dashboard/video-calls/${callId}`;
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to join call');
      console.error('Join call error:', error);
    }
  };

  const canJoinCall = (call: VideoCall) => {
    // Can join ongoing calls
    if (call.status === 'ongoing') return true;
    
    // Can join scheduled calls 15 minutes before time
    if (call.status === 'scheduled' && call.scheduledAt) {
      const scheduledTime = new Date(call.scheduledAt).getTime();
      const now = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;
      
      return now >= (scheduledTime - fifteenMinutes);
    }
    
    return false;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading video calls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">🎥 Video Calls</h1>
        <Button onClick={() => setShowCreateModal(true)} size="sm" className="w-full sm:w-auto">
          + Schedule Call
        </Button>
      </div>

      {showCreateModal && (
        <CreateCallModal onClose={() => setShowCreateModal(false)} onSuccess={fetchCalls} />
      )}

      {/* Active Calls */}
      <div>
        <h2 className="text-xl font-semibold mb-3">🔴 Live Now</h2>
        {activeCalls.length === 0 ? (
          <Card className="p-6 text-center text-slate-500">
            <p className="text-4xl mb-3">📹</p>
            <p>No active calls right now</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCalls.map((call) => (
              <Card key={call.id} className="p-4 md:p-6 border-2 border-red-500 relative">
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2 pr-16">{call.title}</h3>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{call.description || 'No description'}</p>

                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {call.purpose.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded">
                    👥 {call.participants?.length || 0}/{call.maxParticipants}
                  </span>
                </div>

                <Button onClick={() => joinCall(call.id)} className="w-full">
                  Join Call
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Calls */}
      <div>
        <h2 className="text-xl font-semibold mb-3">📅 Upcoming</h2>
        {scheduledCalls.length === 0 ? (
          <Card className="p-6 text-center text-slate-500">
            <p className="text-4xl mb-3">📆</p>
            <p>No scheduled calls</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {scheduledCalls.map((call) => {
              const isHost = call.host.id === user?.id;
              const canJoin = canJoinCall(call);
              
              return (
                <Card key={call.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{call.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{call.description || 'No description'}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          🗓️ {formatDateTime(call.scheduledAt)}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {call.purpose.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded">
                          Host: {call.host.fullName}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-stretch sm:items-end">
                      {canJoin ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => joinCall(call.id)}
                            className="w-full sm:w-auto"
                          >
                            {isHost ? 'Start Call' : 'Join Call'}
                          </Button>
                          <p className="text-xs text-green-600 text-center sm:text-right font-medium">
                            ✓ Available now
                          </p>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full sm:w-auto"
                            disabled
                          >
                            Not yet available
                          </Button>
                          <p className="text-xs text-slate-500 text-center sm:text-right">
                            Opens 15 min before
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* My Call History */}
      <div>
        <h2 className="text-xl font-semibold mb-3">📜 Recent History</h2>
        {myCallHistory.length === 0 ? (
          <Card className="p-6 text-center text-slate-500">
            <p className="text-4xl mb-3">📝</p>
            <p>No call history yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {myCallHistory.map((item: any) => (
              <Card key={item.id} className="p-4 hover:bg-slate-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm md:text-base">
                      {item.call?.title || 'Untitled Call'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(item.joinedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded block mb-1">
                      {item.call?.status || 'ended'}
                    </span>
                    {item.duration && (
                      <span className="text-xs text-slate-500">
                        {Math.floor(item.duration / 60)}m {item.duration % 60}s
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateCallModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'group',
    purpose: 'general',
    scheduledAt: '',
    maxParticipants: 50,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        purpose: formData.purpose,
        maxParticipants: formData.maxParticipants,
      };

      // Only add scheduledAt if provided
      if (formData.scheduledAt) {
        payload.scheduledAt = new Date(formData.scheduledAt).toISOString();
      }

      await apiClient.post('/video-calls', payload);
      alert('Call scheduled successfully! ✅');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to schedule call');
      console.error('Create call error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Schedule Video Call</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Sunday Bible Study"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What will you discuss?"
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Purpose *</label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            >
              <option value="general">General Meeting</option>
              <option value="prayer">Prayer Meeting</option>
              <option value="bible_study">Bible Study</option>
              <option value="counseling">Counseling Session</option>
              <option value="community">Community Gathering</option>
              <option value="mentorship">Mentorship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Schedule For (Optional)</label>
            <Input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave empty to start immediately
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Participants</label>
            <Input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
              min="2"
              max="100"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Scheduling...' : 'Schedule'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
