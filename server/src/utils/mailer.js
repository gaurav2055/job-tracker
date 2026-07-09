const nodemailer = require('nodemailer');

const { EMAIL_USER, EMAIL_APP_PASSWORD } = process.env;

const transporter = (EMAIL_USER && EMAIL_APP_PASSWORD)
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD },
    })
  : null;

// Sends the password reset email, or logs the link to the console if
// EMAIL_USER/EMAIL_APP_PASSWORD aren't configured (local dev fallback).
async function sendPasswordResetEmail(to, resetUrl) {
  if (!transporter) {
    console.log(`[mailer] EMAIL_USER/EMAIL_APP_PASSWORD not set — password reset link for ${to}:\n${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: `Job Tracker <${EMAIL_USER}>`,
    to,
    subject: 'Reset your Job Tracker password',
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 15 minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <p>Someone requested a password reset for your Job Tracker account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
