// SendGrid email disabled for now
// import sgMail from '@sendgrid/mail';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  async sendEmail(params: SendEmailParams) {
    console.log('Email service disabled - would send:', params);
    // TODO: Implement email sending when SendGrid is configured
    return { success: true, message: 'Email disabled in production' };
  }

  async sendVerificationEmail(email: string, token?: string) {
    console.log('Verification email would be sent to:', email);
    return { success: true };
  }

  async sendPasswordResetEmail(email: string, token?: string) {
    console.log('Password reset email would be sent to:', email);
    return { success: true };
  }

  async sendWelcomeEmail(email: string) {
    console.log('Welcome email would be sent to:', email);
    return { success: true };
  }

  async sendNotificationEmail(email: string) {
    console.log('Notification email would be sent to:', email);
    return { success: true };
  }
}

export const emailService = new EmailService();
