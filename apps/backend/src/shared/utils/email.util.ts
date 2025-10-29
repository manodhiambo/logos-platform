// SendGrid email disabled for now
// import sgMail from '@sendgrid/mail';

class EmailService {
  async sendEmail(to: string, subject: string, html: string) {
    console.log('Email service disabled - would send:', { to, subject });
    // TODO: Implement email sending when SendGrid is configured
    return { success: true, message: 'Email disabled in production' };
  }

  async sendVerificationEmail(email: string, token: string) {
    console.log('Verification email would be sent to:', email);
    return { success: true };
  }

  async sendPasswordResetEmail(email: string, token: string) {
    console.log('Password reset email would be sent to:', email);
    return { success: true };
  }
}

export const emailService = new EmailService();
