import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Verification Code - Property Management',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3366cc;">Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f0f7ff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #3366cc; margin: 0; font-size: 32px; letter-spacing: 5px;">${code}</h1>
        </div>
        <p>This code will expire in 2 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset - Property Management',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3366cc;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #3366cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetLink}</p>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};
