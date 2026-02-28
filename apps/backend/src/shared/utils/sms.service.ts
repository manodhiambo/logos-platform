import { logger } from './logger.util';

class SmsService {
  private client: any;
  private fromNumber: string;
  private isConfigured: boolean;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.isConfigured = !!(accountSid && authToken && this.fromNumber);

    if (this.isConfigured) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const twilio = require('twilio');
        this.client = twilio(accountSid, authToken);
        logger.info('SMS service (Twilio) configured');
      } catch {
        this.isConfigured = false;
        logger.warn('Twilio package not available');
      }
    } else {
      logger.warn('SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER env vars.');
    }
  }

  async sendVerificationSms(phoneNumber: string, code: string): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      logger.warn(`SMS not configured — cannot send code to ${phoneNumber}`);
      return false;
    }

    try {
      await this.client.messages.create({
        body: `Your LOGOS Platform verification code is: ${code}\n\nThis code expires in 15 minutes. Do not share it with anyone.`,
        from: this.fromNumber,
        to: phoneNumber,
      });
      logger.info(`SMS verification code sent to ${phoneNumber}`);
      return true;
    } catch (error: any) {
      logger.error(`SMS send failed to ${phoneNumber}:`, error.message);
      return false;
    }
  }
}

export const smsService = new SmsService();
