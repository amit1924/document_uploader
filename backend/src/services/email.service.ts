import nodemailer from 'nodemailer';
import config from '../config';

let transporter: nodemailer.Transporter;

const initTransporter = async (): Promise<nodemailer.Transporter> => {
  if (config.smtp.host && config.smtp.user) {
    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  console.log('[EMAIL] Using Ethereal test email service');
  console.log('[EMAIL] Preview URL: https://ethereal.email/login');
  console.log('[EMAIL] Username:', testAccount.user);

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (!transporter) transporter = await initTransporter();
  return transporter;
};

export const sendPasswordResetEmail = async (to: string, resetToken: string): Promise<void> => {
  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
  const t = await getTransporter();

  const info = await t.sendMail({
    from: config.smtp.from || '"Document Vault" <noreply@documentvault.app>',
    to,
    subject: 'Password Reset - Document Vault',
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">Password Reset</h1>
        </div>
        <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; margin: 0 0 16px;">You requested a password reset. Click the button below to set a new password.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">Reset Password</a>
          <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0;">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  });

  if (config.smtp.host && config.smtp.user) {
    console.log('[EMAIL] Sent password reset email to', to);
  } else {
    console.log('[EMAIL] Preview URL:', nodemailer.getTestMessageUrl(info));
  }
};
