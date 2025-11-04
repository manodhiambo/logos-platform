require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function testEmail() {
  try {
    console.log('🔍 Testing email configuration...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('⚙️  Email Service:', process.env.EMAIL_SERVICE);
    console.log('');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'LOGOS Platform <noreply@logosplatform.com>',
      to: process.env.EMAIL_USER,
      subject: 'LOGOS Platform - Email Configuration Test ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">Success! 🎉</h1>
          <p>Your LOGOS Platform email configuration is working correctly.</p>
          <p>You can now:</p>
          <ul>
            <li>✅ Send verification codes</li>
            <li>✅ Send password reset emails</li>
            <li>✅ Send welcome emails</li>
          </ul>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is a test email from your LOGOS Platform development server.
          </p>
        </div>
      `,
      text: 'Success! Your email configuration is working correctly.',
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('');
    console.log('🎉 Check your inbox at:', process.env.EMAIL_USER);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure 2-Step Verification is enabled on your Google account');
    console.error('2. Verify the App Password is correct (no spaces)');
    console.error('3. Check your internet connection');
  }
}

testEmail();
