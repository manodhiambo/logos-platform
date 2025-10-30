'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CallRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const callId = params.callId as string;
  const token = searchParams.get('token');
  
  const [call, setCall] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      alert('Invalid call link');
      router.push('/dashboard/video-calls');
      return;
    }
    
    fetchCallDetails();
    // Initialize Agora here when you add the SDK
    
    return () => {
      // Cleanup: leave call when component unmounts
      leaveCall();
    };
  }, [callId, token]);

  const fetchCallDetails = async () => {
    try {
      const response = await apiClient.get(`/video-calls/${callId}`);
      setCall(response.data.data.call);
      setParticipants(response.data.data.participants || []);
    } catch (error) {
      console.error('Failed to fetch call details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Toggle audio in Agora
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // Toggle video in Agora
  };

  const leaveCall = async () => {
    try {
      await apiClient.post(`/video-calls/${callId}/leave`);
      router.push('/dashboard/video-calls');
    } catch (error) {
      console.error('Failed to leave call:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Joining call...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg md:text-xl font-bold">{call?.title}</h1>
          <p className="text-sm text-gray-400">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="destructive" onClick={leaveCall} size="sm">
          Leave Call
        </Button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Local Video */}
          <Card className="relative aspect-video bg-gray-800 overflow-hidden">
            <div ref={localVideoRef} className="w-full h-full bg-gray-700 flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">{user?.fullName?.[0]}</span>
                  </div>
                  <p className="text-sm">You (Video Off)</p>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <p className="text-sm">📹 Your Video</p>
                  <p className="text-xs mt-2">(Camera feed will appear here)</p>
                </div>
              )}
            </div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
              You {isMuted && '🔇'}
            </div>
          </Card>

          {/* Remote Videos */}
          {participants.filter(p => p.user_id !== user?.id).map((participant) => (
            <Card key={participant.id} className="relative aspect-video bg-gray-800 overflow-hidden">
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">{participant.user?.full_name?.[0]}</span>
                  </div>
                  <p className="text-sm">{participant.user?.full_name}</p>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
                {participant.user?.full_name} {participant.is_muted && '🔇'}
              </div>
            </Card>
          ))}
        </div>

        {/* Info Banner */}
        <Card className="p-4 bg-blue-900 border-blue-700">
          <p className="text-sm text-center">
            📹 <strong>Video calling is powered by Agora.</strong> Full video/audio functionality will be enabled when you add the Agora SDK.
            For now, you can schedule calls and see participants.
          </p>
        </Card>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4">
        <div className="flex justify-center gap-4">
          <Button
            onClick={toggleMute}
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isMuted ? '🔇' : '🎤'}
          </Button>
          
          <Button
            onClick={toggleVideo}
            variant={isVideoOff ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isVideoOff ? '📹' : '📷'}
          </Button>
          
          <Button
            onClick={leaveCall}
            variant="destructive"
            size="lg"
            className="px-8"
          >
            End Call
          </Button>
        </div>
      </div>
    </div>
  );
}
