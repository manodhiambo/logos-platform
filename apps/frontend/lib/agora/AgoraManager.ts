import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

export interface AgoraConfig {
  appId: string;
  channel: string;
  token: string;
  uid: string | number;
}

export class AgoraManager {
  private client: IAgoraRTCClient;
  private localAudioTrack?: IMicrophoneAudioTrack;
  private localVideoTrack?: ICameraVideoTrack;
  private remoteUsers: Map<string | number, IAgoraRTCRemoteUser> = new Map();

  constructor(private config: AgoraConfig) {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      console.log('Subscribed to user:', user.uid, mediaType);

      this.remoteUsers.set(user.uid, user);

      if (mediaType === 'video') {
        this.onUserJoined?.(user);
      }

      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });

    this.client.on('user-unpublished', (user, mediaType) => {
      console.log('User unpublished:', user.uid, mediaType);
      if (mediaType === 'video') {
        this.onUserLeft?.(user);
      }
    });

    this.client.on('user-left', (user) => {
      console.log('User left:', user.uid);
      this.remoteUsers.delete(user.uid);
      this.onUserLeft?.(user);
    });

    this.client.on('connection-state-change', (curState, prevState) => {
      console.log('Connection state changed:', prevState, '->', curState);
    });
  }

  async join() {
    try {
      await this.client.join(
        this.config.appId,
        this.config.channel,
        this.config.token,
        this.config.uid
      );

      // Create local tracks with correct config
      [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        { encoderConfig: '720p_2' }
      );

      // Publish local tracks
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

      console.log('Successfully joined channel:', this.config.channel);
      return { audio: this.localAudioTrack, video: this.localVideoTrack };
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }

  async leave() {
    try {
      // Stop and close local tracks
      this.localAudioTrack?.close();
      this.localVideoTrack?.close();

      // Leave the channel
      await this.client.leave();
      
      console.log('Left channel successfully');
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }

  async toggleAudio(muted: boolean) {
    if (!this.localAudioTrack) return;

    await this.localAudioTrack.setEnabled(!muted);
    return !muted;
  }

  async toggleVideo(enabled: boolean) {
    if (!this.localVideoTrack) return;

    await this.localVideoTrack.setEnabled(enabled);
    return enabled;
  }

  playLocalVideo(elementId: string) {
    if (!this.localVideoTrack) return;
    this.localVideoTrack.play(elementId);
  }

  playRemoteVideo(user: IAgoraRTCRemoteUser, elementId: string) {
    user.videoTrack?.play(elementId);
  }

  getRemoteUsers() {
    return Array.from(this.remoteUsers.values());
  }

  // Callbacks
  onUserJoined?: (user: IAgoraRTCRemoteUser) => void;
  onUserLeft?: (user: IAgoraRTCRemoteUser) => void;
}
