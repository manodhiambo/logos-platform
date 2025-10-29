'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { videoCallService } from '@/lib/services/video-call.service';

interface VideoCallRoomProps {
  callId: string;
  onLeave: () => void;
}

export default function VideoCallRoom({ callId, onLeave }: VideoCallRoomProps) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<{ [uid: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    joinCall();

    return () => {
      leaveCall();
    };
  }, [callId]);

  const joinCall = async () => {
    try {
      // Get call credentials from backend
      const joinData = await videoCallService.joinCall(callId);
      const { appId, channelName, token, uid } = joinData;

      // Create Agora client
      const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setClient(agoraClient);

      // Set up event listeners
      agoraClient.on('user-published', handleUserPublished);
      agoraClient.on('user-unpublished', handleUserUnpublished);
      agoraClient.on('user-left', handleUserLeft);

      // Join the channel
      await agoraClient.join(appId, channelName, token, uid);

      // Create and publish local tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      // Play local video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      // Publish local tracks
      await agoraClient.publish([audioTrack, videoTrack]);

      setIsJoined(true);
    } catch (err: any) {
      console.error('Failed to join call:', err);
      setError(err.message || 'Failed to join call');
    }
  };

  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    if (!client) return;

    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
      setRemoteUsers((prev) => {
        const exists = prev.find((u) => u.uid === user.uid);
        if (exists) return prev;
        return [...prev, user];
      });

      // Play remote video
      setTimeout(() => {
        const videoElement = remoteVideoRefs.current[user.uid.toString()];
        if (videoElement && user.videoTrack) {
          user.videoTrack.play(videoElement);
        }
      }, 100);
    }

    if (mediaType === 'audio' && user.audioTrack) {
      user.audioTrack.play();
    }
  };

  const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    if (mediaType === 'video') {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    }
  };

  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
      await videoCallService.updateParticipantStatus(callId, { isMuted: !isAudioMuted });
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoOff);
      setIsVideoOff(!isVideoOff);
      await videoCallService.updateParticipantStatus(callId, { isVideoOff: !isVideoOff });
    }
  };

  const toggleScreenShare = async () => {
    if (!client) return;

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({});

        if (localVideoTrack) {
          await client.unpublish([localVideoTrack]);
          localVideoTrack.close();
        }

        if (Array.isArray(screenTrack)) {
          await client.publish(screenTrack);
          if (localVideoRef.current) {
            screenTrack[0].play(localVideoRef.current);
          }
        } else {
          await client.publish([screenTrack]);
          if (localVideoRef.current) {
            screenTrack.play(localVideoRef.current);
          }
        }

        setIsScreenSharing(true);
      } else {
        // Stop screen sharing
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        await client.unpublish();
        await client.publish([videoTrack]);

        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        setLocalVideoTrack(videoTrack);
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Screen share error:', err);
    }
  };

  const leaveCall = async () => {
    if (localAudioTrack) {
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.close();
    }
    if (client) {
      await client.leave();
    }

    await videoCallService.leaveCall(callId);
    onLeave();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">❌ {error}</p>
          <Button onClick={onLeave}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Local Video */}
        <div className="relative bg-slate-800 rounded-lg overflow-hidden">
          <div ref={localVideoRef} className="w-full h-full"></div>
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
            You {isVideoOff && '(Video Off)'}
          </div>
        </div>

        {/* Remote Videos */}
        {remoteUsers.map((user) => (
          <div key={user.uid} className="relative bg-slate-800 rounded-lg overflow-hidden">
            <div
              ref={(el) => { remoteVideoRefs.current[user.uid.toString()] = el; }}
              className="w-full h-full"
            ></div>
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
              Participant {user.uid}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-slate-800 p-6 flex items-center justify-center gap-4">
        <Button
          onClick={toggleAudio}
          variant={isAudioMuted ? 'destructive' : 'default'}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          {isAudioMuted ? '🔇' : '🎤'}
        </Button>

        <Button
          onClick={toggleVideo}
          variant={isVideoOff ? 'destructive' : 'default'}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          {isVideoOff ? '📹' : '📷'}
        </Button>

        <Button
          onClick={toggleScreenShare}
          variant={isScreenSharing ? 'secondary' : 'default'}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          🖥️
        </Button>

        <Button
          onClick={leaveCall}
          variant="destructive"
          size="lg"
          className="rounded-full px-8"
        >
          End Call
        </Button>
      </div>
    </div>
  );
}
