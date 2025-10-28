'use client';

import { useParams, useRouter } from 'next/navigation';
import VideoCallRoom from '@/components/video-calls/VideoCallRoom';

export default function VideoCallPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.callId as string;

  const handleLeave = () => {
    router.push('/dashboard/video-calls');
  };

  return <VideoCallRoom callId={callId} onLeave={handleLeave} />;
}
