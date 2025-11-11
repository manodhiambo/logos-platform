import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface UseWebRTCProps {
  userId: string;
  onCallEnded?: () => void;
}

export const useWebRTC = ({ userId, onCallEnded }: UseWebRTCProps) => {
  const { socket } = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callerId, setCallerId] = useState<string | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('call:ice-candidate', {
          userId: callerId || userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [socket, userId, callerId]);

  // Start call
  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socket) {
        socket.emit('call:initiate', {
          receiverId: userId,
          offer,
        });
      }

      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Failed to access camera/microphone');
    }
  }, [userId, socket, createPeerConnection]);

  // Answer call
  const answerCall = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socket && callerId) {
        socket.emit('call:answer', {
          callerId,
          answer,
        });
      }

      setIsCallActive(true);
      setIsIncomingCall(false);
    } catch (error) {
      console.error('Error answering call:', error);
      alert('Failed to answer call');
    }
  }, [socket, callerId, createPeerConnection]);

  // End call
  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    if (socket) {
      socket.emit('call:end', {
        userId: callerId || userId,
      });
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setIsIncomingCall(false);
    setCallerId(null);

    if (onCallEnded) {
      onCallEnded();
    }
  }, [localStream, socket, userId, callerId, onCallEnded]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('call:incoming', (data: { callerId: string; offer: RTCSessionDescriptionInit }) => {
      setCallerId(data.callerId);
      setIsIncomingCall(true);
      // Auto-answer or show incoming call UI
    });

    socket.on('call:answered', async (data: { answer: RTCSessionDescriptionInit }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      }
    });

    socket.on('call:ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      }
    });

    socket.on('call:ended', () => {
      endCall();
    });

    return () => {
      socket.off('call:incoming');
      socket.off('call:answered');
      socket.off('call:ice-candidate');
      socket.off('call:ended');
    };
  }, [socket, endCall]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);

  return {
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
    isCallActive,
    isIncomingCall,
    startCall,
    answerCall,
    endCall,
    toggleVideo,
    toggleAudio,
  };
};
