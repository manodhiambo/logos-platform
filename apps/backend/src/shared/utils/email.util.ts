import nodemailer, { Transporter } from 'nodemailer';
import { logger } from './logger.util';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor() {
    this.transporter = this.createTransporter();
  }

  private createTransporter() {
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    
    if (emailService === 'sendgrid') {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else {
      return nodemailer.createTransport({
        service: emailService,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'LOGOS Platform <noreply@logosplatform.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      logger.error('Email sending failed:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, verificationCode: string, username: string): Promise<boolean> {
    const subject = 'Verify Your Email - LOGOS Platform';
    const html = this.getVerificationEmailTemplate(verificationCode, username);
    const text = `Welcome to LOGOS Platform! Your verification code is: ${verificationCode}. This code will expire in 15 minutes.`;

    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, username: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Password - LOGOS Platform';
    const html = this.getPasswordResetEmailTemplate(resetUrl, username);
    const text = `You requested a password reset. Click this link to reset your password: ${resetUrl}. This link will expire in 1 hour.`;

    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    const subject = 'Welcome to LOGOS Platform! 🙏';
    const html = this.getWelcomeEmailTemplate(username);
    const text = `Welcome to LOGOS Platform, ${username}! We're excited to have you join our faith community.`;

    return this.sendEmail({ to: email, subject, html, text });
  }

  private getVerificationEmailTemplate(code: string, username: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f7;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">LOGOS Platform</h1>
                  <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 14px;">Faith • Community • Growth</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Verify Your Email Address</h2>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Hello <strong>${username}</strong>,
                  </p>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Thank you for joining LOGOS Platform! To complete your registration, please use the verification code below:
                  </p>
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                    <tr>
                      <td align="center" style="padding: 30px; background-color: #f8f9fa; border-radius: 8px; border: 2px dashed #667eea;">
                        <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                          ${code}
                        </div>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    This code will expire in <strong>15 minutes</strong>.
                  </p>
                  <p style="margin: 0 0 20px; color: #999999; font-size: 14px; line-height: 1.6;">
                    If you didn't create an account with LOGOS Platform, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:support@logosplatform.com" style="color: #667eea; text-decoration: none;">support@logosplatform.com</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} LOGOS Platform. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  private getPasswordResetEmailTemplate(resetUrl: string, username: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f7;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">LOGOS Platform</h1>
                  <p style="margin: 10px 0 0; color: #f0f0f0; font-size: 14px;">Faith • Community • Growth</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Reset Your Password</h2>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    Hello <strong>${username}</strong>,
                  </p>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password. Click the button below to create a new password:
                  </p>
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0 0 20px; padding: 15px; background-color: #f8f9fa; border-radius: 6px; color: #667eea; font-size: 14px; word-break: break-all;">
                    ${resetUrl}
                  </p>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    This link will expire in <strong>1 hour</strong>.
                  </p>
                  <p style="margin: 0 0 20px; color: #999999; font-size: 14px; line-height: 1.6;">
                    If you didn't request a password reset, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:support@logosplatform.com" style="color: #667eea; text-decoration: none;">support@logosplatform.com</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} LOGOS Platform. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  private getWelcomeEmailTemplate(username: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to LOGOS Platform</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f7;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🙏 Welcome to LOGOS!</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hello ${username}!</h2>
                  <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                    We're thrilled to have you join our faith community! LOGOS Platform is here to support you on your spiritual journey.
                  </p>
                  <h3 style="margin: 30px 0 15px; color: #333333; font-size: 20px;">What's Next?</h3>
                  <ul style="margin: 0 0 20px; padding-left: 20px; color: #666666; font-size: 16px; line-height: 1.8;">
                    <li>💬 <strong>Chat with LOGOS AI</strong> - Get biblical guidance and answers</li>
                    <li>🙏 <strong>Join Prayer Groups</strong> - Connect with believers</li>
                    <li>📖 <strong>Daily Devotionals</strong> - Grow in your faith</li>
                    <li>👥 <strong>Join Communities</strong> - Find your tribe</li>
                    <li>📚 <strong>Bible Study Plans</strong> - Follow structured readings</li>
                  </ul>
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                          Go to Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 20px 0 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    May the Lord bless you and keep you! 🙏
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:support@logosplatform.com" style="color: #667eea; text-decoration: none;">support@logosplatform.com</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} LOGOS Platform. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }
}

export const emailService = new EmailService();
