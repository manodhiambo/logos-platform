import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { config } from '../../../config/env.config';
import { logger } from '../../../shared/utils/logger.util';

class AgoraTokenService {
  private appId: string;
  private appCertificate: string;

  constructor() {
    this.appId = config.agora.appId;
    this.appCertificate = config.agora.appCertificate;
  }

  /**
   * Generate RTC token for video call
   */
  generateRtcToken(
    channelName: string,
    uid: number,
    role: 'publisher' | 'subscriber' = 'publisher',
    expirationTimeInSeconds: number = 3600
  ): string {
    try {
      if (!this.appId || !this.appCertificate) {
        throw new Error('Agora App ID or Certificate not configured');
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

      const token = RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        uid,
        agoraRole,
        privilegeExpiredTs
      );

      logger.info(`Generated Agora token for channel: ${channelName}, uid: ${uid}`);

      return token;
    } catch (error: any) {
      logger.error('Failed to generate Agora token:', error.message);
      throw new Error('Failed to generate video call token');
    }
  }

  /**
   * Generate token with string UID (for user accounts)
   */
  generateRtcTokenWithAccount(
    channelName: string,
    account: string,
    role: 'publisher' | 'subscriber' = 'publisher',
    expirationTimeInSeconds: number = 3600
  ): string {
    try {
      if (!this.appId || !this.appCertificate) {
        throw new Error('Agora App ID or Certificate not configured');
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

      const token = RtcTokenBuilder.buildTokenWithAccount(
        this.appId,
        this.appCertificate,
        channelName,
        account,
        agoraRole,
        privilegeExpiredTs
      );

      logger.info(`Generated Agora token for channel: ${channelName}, account: ${account}`);

      return token;
    } catch (error: any) {
      logger.error('Failed to generate Agora token:', error.message);
      throw new Error('Failed to generate video call token');
    }
  }

  /**
   * Get App ID (for client-side initialization)
   */
  getAppId(): string {
    return this.appId;
  }
}

export default new AgoraTokenService();
