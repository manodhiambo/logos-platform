import sgMail from '@sendgrid/mail';
import { config } from '../../config/env.config';
import { logger } from './logger.util';

// Initialize SendGrid
if (config.email.sendgridApiKey) {
  sgMail.setApiKey(config.email.sendgridApiKey);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  // Send generic email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: {
          email: config.email.fromEmail,
          name: config.email.fromName,
        },
        subject: options.subject,
        text: options.text || '',
        html: options.html || options.text || '',
      };

      await sgMail.send(msg);
      logger.info(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to LOGOS Christian Community! 🙏',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1>✝️ Welcome to LOGOS</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${username}! 🙏</h2>
            <p>We're thrilled to have you join the LOGOS Christian Community Platform.</p>
            <p style="font-style: italic; padding: 15px; background: white; border-left: 4px solid #667eea;">
              "For where two or three gather in my name, there am I with them." - Matthew 18:20
            </p>
            <p><strong>Get started:</strong></p>
            <ul>
              <li>💬 Chat with LOGOS AI for biblical guidance</li>
              <li>🤝 Join communities and small groups</li>
              <li>🙏 Share prayer requests</li>
              <li>📖 Read daily devotionals</li>
            </ul>
            <p>God bless you!</p>
          </div>
        </div>
      `,
    });
  }

  // Send email verification
  async sendVerificationEmail(email: string, username: string, token: string): Promise<boolean> {
    const verificationUrl = `${config.appUrl}/verify-email?token=${token}`;
    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - LOGOS Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #667eea; color: white; padding: 30px; text-align: center;">
            <h1>✉️ Verify Your Email</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${username}!</h2>
            <p>Please verify your email address to activate your account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>Or copy this link: <span style="color: #667eea;">${verificationUrl}</span></p>
            <p style="background: #fff3cd; padding: 15px; border-radius: 5px;">
              ⚠️ This link expires in 24 hours.
            </p>
          </div>
        </div>
      `,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, username: string, token: string): Promise<boolean> {
    const resetUrl = `${config.appUrl}/reset-password?token=${token}`;
    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - LOGOS Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #667eea; color: white; padding: 30px; text-align: center;">
            <h1>🔐 Reset Your Password</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${username},</h2>
            <p>We received a request to reset your password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy this link: <span style="color: #667eea;">${resetUrl}</span></p>
            <p style="background: #f8d7da; padding: 15px; border-radius: 5px;">
              ⚠️ This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
          </div>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
