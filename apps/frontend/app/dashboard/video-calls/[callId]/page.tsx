'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AgoraManager } from '@/lib/agora/AgoraManager';
import type { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

export default function CallRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const callId = params.callId as string;
  const agoraToken = searchParams.get('token');
  
  const [call, setCall] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agoraReady, setAgoraReady] = useState(false);
  
  const agoraManagerRef = useRef<AgoraManager | null>(null);

  useEffect(() => {
    if (!agoraToken) {
      alert('Invalid call link');
      router.push('/dashboard/video-calls');
      return;
    }
    
    initializeCall();
    
    return () => {
      cleanup();
    };
  }, [callId, agoraToken]);

  const initializeCall = async () => {
    try {
      // Fetch call details
      const response = await apiClient.get(`/video-calls/${callId}`);
      const callData = response.data.data.call;
      setCall(callData);
      setParticipants(response.data.data.participants || []);

      // Initialize Agora
      const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
      if (!appId) {
        console.warn('Agora App ID not configured');
        setLoading(false);
        return;
      }

      const agoraManager = new AgoraManager({
        appId: appId,
        channel: callData.channel_name,
        token: agoraToken || '',
        uid: user?.id || Math.floor(Math.random() * 100000),
      });

      // Setup callbacks
      agoraManager.onUserJoined = (remoteUser) => {
        console.log('Remote user joined:', remoteUser.uid);
        setRemoteUsers(prev => [...prev, remoteUser]);
        
        // Play remote video after a short delay
        setTimeout(() => {
          agoraManager.playRemoteVideo(remoteUser, `remote-${remoteUser.uid}`);
        }, 100);
      };

      agoraManager.onUserLeft = (remoteUser) => {
        console.log('Remote user left:', remoteUser.uid);
        setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
      };

      // Join the call
      const tracks = await agoraManager.join();
      
      // Play local video
      setTimeout(() => {
        agoraManager.playLocalVideo('local-video');
      }, 100);

      agoraManagerRef.current = agoraManager;
      setAgoraReady(true);
    } catch (error) {
      console.error('Failed to initialize call:', error);
      alert('Failed to join call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cleanup = async () => {
    if (agoraManagerRef.current) {
      await agoraManagerRef.current.leave();
    }
  };

  const toggleMute = async () => {
    if (!agoraManagerRef.current) return;
    
    const newMutedState = !isMuted;
    await agoraManagerRef.current.toggleAudio(newMutedState);
    setIsMuted(newMutedState);
    
    // Update backend
    try {
      await apiClient.patch(`/video-calls/${callId}/status`, { is_muted: newMutedState });
    } catch (error) {
      console.error('Failed to update mute status:', error);
    }
  };

  const toggleVideo = async () => {
    if (!agoraManagerRef.current) return;
    
    const newVideoState = !isVideoOff;
    await agoraManagerRef.current.toggleVideo(!newVideoState);
    setIsVideoOff(newVideoState);
    
    // Update backend
    try {
      await apiClient.patch(`/video-calls/${callId}/status`, { is_video_off: newVideoState });
    } catch (error) {
      console.error('Failed to update video status:', error);
    }
  };

  const leaveCall = async () => {
    await cleanup();
    
    try {
      await apiClient.post(`/video-calls/${callId}/leave`);
    } catch (error) {
      console.error('Failed to notify server:', error);
    }
    
    router.push('/dashboard/video-calls');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">🎥</div>
          <div className="text-xl">Joining call...</div>
          <div className="text-sm text-gray-400 mt-2">Please allow camera and microphone access</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-lg md:text-xl font-bold">{call?.title}</h1>
          <p className="text-sm text-gray-400">
            {remoteUsers.length + 1} participant{remoteUsers.length !== 0 ? 's' : ''}
          </p>
        </div>
        <Button variant="destructive" onClick={leaveCall} size="sm">
          Leave Call
        </Button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Local Video */}
          <Card className="relative aspect-video bg-gray-800 overflow-hidden">
            <div 
              id="local-video" 
              className="w-full h-full bg-gray-700 flex items-center justify-center"
            >
              {!agoraReady && (
                <div className="text-center text-gray-400">
                  <p className="text-sm">Connecting...</p>
                </div>
              )}
            </div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded-full text-sm">
              You {isMuted && '🔇'}
            </div>
          </Card>

          {/* Remote Videos */}
          {remoteUsers.map((remoteUser) => (
            <Card key={remoteUser.uid} className="relative aspect-video bg-gray-800 overflow-hidden">
              <div 
                id={`remote-${remoteUser.uid}`}
                className="w-full h-full bg-gray-700"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded-full text-sm">
                Participant {remoteUser.uid}
              </div>
            </Card>
          ))}
        </div>

        {/* Info Banner */}
        {!agoraReady && (
          <Card className="mt-4 p-4 bg-yellow-900 border-yellow-700">
            <p className="text-sm text-center">
              ⚠️ <strong>Agora App ID not configured.</strong> Add NEXT_PUBLIC_AGORA_APP_ID to your environment variables to enable video calling.
            </p>
          </Card>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex-shrink-0">
        <div className="flex justify-center items-center gap-3 md:gap-4">
          <Button
            onClick={toggleMute}
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-12 h-12 md:w-14 md:h-14"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? '🔇' : '🎤'}
          </Button>
          
          <Button
            onClick={toggleVideo}
            variant={isVideoOff ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-12 h-12 md:w-14 md:h-14"
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? '📹' : '📷'}
          </Button>
          
          <Button
            onClick={leaveCall}
            variant="destructive"
            size="lg"
            className="px-6 md:px-8 h-12 md:h-14"
          >
            End Call
          </Button>
        </div>
      </div>
    </div>
  );
}
