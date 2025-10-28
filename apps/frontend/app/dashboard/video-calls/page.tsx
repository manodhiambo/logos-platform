'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import {
  videoCallService,
  VideoCall,
  CallType,
  CallPurpose,
  CallStatus,
} from '@/lib/services/video-call.service';

export default function VideoCallsPage() {
  const [activeCalls, setActiveCalls] = useState<VideoCall[]>([]);
  const [scheduledCalls, setScheduledCalls] = useState<VideoCall[]>([]);
  const [callHistory, setCallHistory] = useState<VideoCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [active, scheduled, history] = await Promise.all([
        videoCallService.getActiveCalls(),
        videoCallService.getScheduledCalls(),
        videoCallService.getCallHistory(),
      ]);

      setActiveCalls(active.calls || []);
      setScheduledCalls(scheduled.calls || []);
      setCallHistory(history.calls || []);
    } catch (error) {
      console.error('Failed to load video calls:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Video Calls</h1>
            <p className="text-slate-600 mt-2">Connect with your community in real-time</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <span className="text-lg mr-2">➕</span>
            Start New Call
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickActionCard
            icon="🙏"
            title="Prayer Meeting"
            description="Start a prayer call"
            purpose={CallPurpose.PRAYER}
            onClick={() => setShowCreateForm(true)}
          />
          <QuickActionCard
            icon="📖"
            title="Bible Study"
            description="Host a study session"
            purpose={CallPurpose.BIBLE_STUDY}
            onClick={() => setShowCreateForm(true)}
          />
          <QuickActionCard
            icon="👥"
            title="Community Call"
            description="Connect with community"
            purpose={CallPurpose.COMMUNITY}
            onClick={() => setShowCreateForm(true)}
          />
          <QuickActionCard
            icon="🤝"
            title="Mentorship"
            description="One-on-one guidance"
            purpose={CallPurpose.MENTORSHIP}
            onClick={() => setShowCreateForm(true)}
          />
        </div>

        {/* Create Call Form */}
        {showCreateForm && (
          <CreateCallForm onClose={() => setShowCreateForm(false)} onSuccess={loadData} />
        )}

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              🔴 Active ({activeCalls.length})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              📅 Scheduled ({scheduledCalls.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              📜 History
            </TabsTrigger>
          </TabsList>

          {/* Active Calls */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Calls</CardTitle>
                <CardDescription>Join ongoing calls in your community</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingState />
                ) : activeCalls.length === 0 ? (
                  <EmptyState message="No active calls right now" icon="📵" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCalls.map((call) => (
                      <CallCard key={call.id} call={call} onJoin={loadData} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Calls */}
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Calls</CardTitle>
                <CardDescription>Upcoming video calls</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingState />
                ) : scheduledCalls.length === 0 ? (
                  <EmptyState message="No scheduled calls" icon="📅" />
                ) : (
                  <div className="space-y-4">
                    {scheduledCalls.map((call) => (
                      <ScheduledCallCard key={call.id} call={call} onUpdate={loadData} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Call History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Call History</CardTitle>
                <CardDescription>Your past video calls</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingState />
                ) : callHistory.length === 0 ? (
                  <EmptyState message="No call history yet" icon="📜" />
                ) : (
                  <div className="space-y-3">
                    {callHistory.map((call) => (
                      <HistoryCallCard key={call.id} call={call} />
                    ))}
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

interface QuickActionCardProps {
  icon: string;
  title: string;
  description: string;
  purpose: CallPurpose;
  onClick: () => void;
}

function QuickActionCard({ icon, title, description, onClick }: QuickActionCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="pt-6 text-center">
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

interface CallCardProps {
  call: VideoCall;
  onJoin: () => void;
}

function CallCard({ call, onJoin }: CallCardProps) {
  const purposeIcons: Record<CallPurpose, string> = {
    [CallPurpose.PRAYER]: '🙏',
    [CallPurpose.BIBLE_STUDY]: '📖',
    [CallPurpose.COUNSELING]: '💬',
    [CallPurpose.COMMUNITY]: '👥',
    [CallPurpose.MENTORSHIP]: '🤝',
    [CallPurpose.GENERAL]: '🎥',
  };

  const handleJoin = async () => {
    try {
      window.location.href = `/dashboard/video-calls/${call.id}`;
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to join call');
    }
  };

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{purposeIcons[call.purpose]}</span>
            <div>
              <h3 className="font-semibold text-lg">{call.title}</h3>
              <p className="text-sm text-slate-600">
                Host: {call.host?.fullName || 'Unknown'}
              </p>
            </div>
          </div>
          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full animate-pulse">
            LIVE
          </span>
        </div>
        {call.description && (
          <p className="text-sm text-slate-600 mb-3">{call.description}</p>
        )}
        <Button onClick={handleJoin} className="w-full">
          🎥 Join Call
        </Button>
      </CardContent>
    </Card>
  );
}

interface ScheduledCallCardProps {
  call: VideoCall;
  onUpdate: () => void;
}

function ScheduledCallCard({ call, onUpdate }: ScheduledCallCardProps) {
  const purposeIcons: Record<CallPurpose, string> = {
    [CallPurpose.PRAYER]: '🙏',
    [CallPurpose.BIBLE_STUDY]: '📖',
    [CallPurpose.COUNSELING]: '💬',
    [CallPurpose.COMMUNITY]: '👥',
    [CallPurpose.MENTORSHIP]: '🤝',
    [CallPurpose.GENERAL]: '🎥',
  };

  const scheduledDate = call.scheduledAt ? new Date(call.scheduledAt) : null;
  const canJoin = scheduledDate && new Date() >= new Date(scheduledDate.getTime() - 10 * 60000); // 10 min before

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{purposeIcons[call.purpose]}</span>
        <div>
          <h3 className="font-semibold">{call.title}</h3>
          <p className="text-sm text-slate-600">
            {scheduledDate?.toLocaleString()} • Host: {call.host?.fullName}
          </p>
        </div>
      </div>
      {canJoin ? (
        <Link href={`/dashboard/video-calls/${call.id}`}>
          <Button>Join Now</Button>
        </Link>
      ) : (
        <Button variant="outline" disabled>
          Scheduled
        </Button>
      )}
    </div>
  );
}

interface HistoryCallCardProps {
  call: VideoCall;
}

function HistoryCallCard({ call }: HistoryCallCardProps) {
  const purposeIcons: Record<CallPurpose, string> = {
    [CallPurpose.PRAYER]: '🙏',
    [CallPurpose.BIBLE_STUDY]: '📖',
    [CallPurpose.COUNSELING]: '💬',
    [CallPurpose.COMMUNITY]: '👥',
    [CallPurpose.MENTORSHIP]: '🤝',
    [CallPurpose.GENERAL]: '🎥',
  };

  return (
    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{purposeIcons[call.purpose]}</span>
        <div>
          <h4 className="font-medium">{call.title}</h4>
          <p className="text-sm text-slate-500">
            {new Date(call.createdAt).toLocaleDateString()} • {call.host?.fullName}
          </p>
        </div>
      </div>
      <span className="text-xs text-slate-500">{call.status}</span>
    </div>
  );
}

interface CreateCallFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateCallForm({ onClose, onSuccess }: CreateCallFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: CallType.GROUP,
    purpose: CallPurpose.GENERAL,
    scheduledAt: '',
    maxParticipants: 50,
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const call = await videoCallService.createCall(formData);
      onSuccess();
      onClose();
      // Redirect to call room
      window.location.href = `/dashboard/video-calls/${call.call.id}`;
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create call');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle>Create New Video Call</CardTitle>
        <CardDescription>Start or schedule a video call</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Sunday Prayer Meeting"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder="What is this call about?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CallType })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={CallType.ONE_ON_ONE}>One-on-One</option>
                <option value={CallType.GROUP}>Group Call</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Purpose *</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value as CallPurpose })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={CallPurpose.PRAYER}>🙏 Prayer</option>
                <option value={CallPurpose.BIBLE_STUDY}>📖 Bible Study</option>
                <option value={CallPurpose.COUNSELING}>💬 Counseling</option>
                <option value={CallPurpose.COMMUNITY}>👥 Community</option>
                <option value={CallPurpose.MENTORSHIP}>🤝 Mentorship</option>
                <option value={CallPurpose.GENERAL}>🎥 General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Participants</label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                min="2"
                max="100"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="flex-1">
              {creating ? 'Creating...' : formData.scheduledAt ? 'Schedule Call' : 'Start Call'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-slate-600">Loading...</p>
    </div>
  );
}

function EmptyState({ message, icon }: { message: string; icon: string }) {
  return (
    <div className="text-center py-12 text-slate-500">
      <p className="text-6xl mb-4">{icon}</p>
      <p>{message}</p>
    </div>
  );
}
