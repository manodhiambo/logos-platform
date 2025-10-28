import apiClient from '@/lib/api-client';

export enum CallType {
  ONE_ON_ONE = 'one_on_one',
  GROUP = 'group',
}

export enum CallStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum CallPurpose {
  PRAYER = 'prayer',
  BIBLE_STUDY = 'bible_study',
  COUNSELING = 'counseling',
  COMMUNITY = 'community',
  MENTORSHIP = 'mentorship',
  GENERAL = 'general',
}

export interface VideoCall {
  id: string;
  channelName: string;
  hostId: string;
  type: CallType;
  purpose: CallPurpose;
  status: CallStatus;
  title: string;
  description?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  maxParticipants: number;
  isRecording: boolean;
  recordingUrl?: string;
  relatedTo?: string;
  relatedType?: string;
  createdAt: string;
  updatedAt: string;
  host?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface CallParticipant {
  id: string;
  callId: string;
  userId: string;
  role: 'host' | 'co_host' | 'participant';
  joinedAt?: string;
  leftAt?: string;
  duration?: number;
  isMuted: boolean;
  isVideoOff: boolean;
  user?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface JoinCallResponse {
  call: VideoCall;
  participant: CallParticipant;
  token: string;
  appId: string;
  channelName: string;
  uid: number;
}

class VideoCallService {
  async createCall(data: {
    title: string;
    description?: string;
    type: CallType;
    purpose: CallPurpose;
    scheduledAt?: string;
    maxParticipants?: number;
    relatedTo?: string;
    relatedType?: string;
  }) {
    const response = await apiClient.post('/video-calls', data);
    return response.data.data;
  }

  async joinCall(callId: string): Promise<JoinCallResponse> {
    const response = await apiClient.post(`/video-calls/${callId}/join`);
    return response.data.data;
  }

  async leaveCall(callId: string) {
    const response = await apiClient.post(`/video-calls/${callId}/leave`);
    return response.data.data;
  }

  async endCall(callId: string) {
    const response = await apiClient.post(`/video-calls/${callId}/end`);
    return response.data.data;
  }

  async getCallById(callId: string) {
    const response = await apiClient.get(`/video-calls/${callId}`);
    return response.data.data;
  }

  async getActiveCalls(filters?: {
    purpose?: CallPurpose;
    relatedTo?: string;
    relatedType?: string;
  }) {
    const response = await apiClient.get('/video-calls/active/all', { params: filters });
    return response.data.data;
  }

  async getScheduledCalls() {
    const response = await apiClient.get('/video-calls/scheduled/all');
    return response.data.data;
  }

  async getCallHistory(page = 1, limit = 20) {
    const response = await apiClient.get('/video-calls/history/me', {
      params: { page, limit },
    });
    return response.data.data;
  }

  async updateParticipantStatus(callId: string, data: { isMuted?: boolean; isVideoOff?: boolean }) {
    const response = await apiClient.put(`/video-calls/${callId}/participant`, data);
    return response.data.data;
  }
}

export const videoCallService = new VideoCallService();
