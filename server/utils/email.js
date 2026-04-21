const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const urlPrefix = process.env.URL_PREFIX || 'http://localhost:8000';

function sendPasswordResetEmail(email, token) {
  const resetLink = `${urlPrefix}/reset-password?token=${token}`;
  return resend.emails.send({
    from: 'Get Hooked! <help@0sake.net>',
    to: [email],
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `
  });
}

function sendEmailVerificationEmail(email, token) {
  const verificationLink = `${urlPrefix}/verify-email?token=${token}`;
  return resend.emails.send({
    from: 'Get Hooked! <help@0sake.net>',
    to: [email],
    subject: 'Email Verification',
    html: `
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `
  });
}

module.exports = { sendPasswordResetEmail, sendEmailVerificationEmail };