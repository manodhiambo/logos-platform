import apiClient from './api';

export interface VideoCall {
  id: string;
  channelName: string;
  title: string;
  description?: string;
  type: string;
  purpose: string;
  status: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  maxParticipants: number;
  createdBy: string;
  host?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

class VideoCallService {
  async getActiveCalls() {
    const response = await apiClient.get('/video-calls/active/all');
    return response.data.data || response.data;
  }

  async getScheduledCalls() {
    const response = await apiClient.get('/video-calls/scheduled/all');
    return response.data.data || response.data;
  }

  async getCallHistory() {
    const response = await apiClient.get('/video-calls/history/me', {
      params: { page: 1, limit: 20 }
    });
    return response.data.data || response.data;
  }

  async getCall(id: string) {
    const response = await apiClient.get(`/video-calls/${id}`);
    return response.data.data || response.data;
  }

  async createCall(data: {
    title: string;
    description?: string;
    type: string;
    purpose: string;
    scheduledAt?: string;
  }) {
    const response = await apiClient.post('/video-calls', data);
    return response.data.data || response.data;
  }

  async joinCall(id: string) {
    const response = await apiClient.post(`/video-calls/${id}/join`);
    return response.data.data || response.data;
  }

  async leaveCall(id: string) {
    const response = await apiClient.post(`/video-calls/${id}/leave`);
    return response.data;
  }

  async startCall(id: string) {
    const response = await apiClient.post(`/video-calls/${id}/start`);
    return response.data.data || response.data;
  }

  async endCall(id: string) {
    const response = await apiClient.post(`/video-calls/${id}/end`);
    return response.data.data || response.data;
  }
}

export default new VideoCallService();
