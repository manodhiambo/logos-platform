'use client';

import { useWebRTC } from '@/hooks/useWebRTC';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';

interface VideoCallProps {
  userId: string;
  onCallEnded?: () => void;
}

export default function VideoCall({ userId, onCallEnded }: VideoCallProps) {
  const {
    localVideoRef,
    remoteVideoRef,
    isCallActive,
    isIncomingCall,
    startCall,
    answerCall,
    endCall,
    toggleVideo,
    toggleAudio,
  } = useWebRTC({ userId, onCallEnded });

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote Video (Main) */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local Video (Picture-in-Picture) */}
        <Card className="absolute top-4 right-4 w-48 h-36 overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </Card>
      </div>

      {/* Controls */}
      <div className="p-6 bg-gradient-to-t from-black to-transparent">
        <div className="flex justify-center space-x-4">
          {!isCallActive && !isIncomingCall && (
            <Button onClick={startCall} size="lg" className="rounded-full">
              <Video className="w-5 h-5 mr-2" />
              Start Call
            </Button>
          )}

          {isIncomingCall && (
            <>
              <Button onClick={() => answerCall({} as any)} size="lg" className="rounded-full bg-green-600">
                <Video className="w-5 h-5 mr-2" />
                Answer
              </Button>
              <Button onClick={endCall} size="lg" variant="destructive" className="rounded-full">
                <PhoneOff className="w-5 h-5 mr-2" />
                Decline
              </Button>
            </>
          )}

          {isCallActive && (
            <>
              <Button onClick={toggleVideo} size="lg" variant="secondary" className="rounded-full">
                <Video className="w-5 h-5" />
              </Button>
              <Button onClick={toggleAudio} size="lg" variant="secondary" className="rounded-full">
                <Mic className="w-5 h-5" />
              </Button>
              <Button onClick={endCall} size="lg" variant="destructive" className="rounded-full">
                <PhoneOff className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
