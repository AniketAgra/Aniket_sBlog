import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) {
    // Dev fallback: log to console
    console.log('\n[Email simulated]\nTo:', to, '\nSubject:', subject, '\nBody:\n', html, '\n');
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to,
    subject,
    html,
  });

  return { simulated: false };
}
