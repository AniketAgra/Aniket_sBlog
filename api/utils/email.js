import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) {
    // Dev fallback: log to console
    console.log('\n[Email simulated]\nTo:', to, '\nSubject:', subject, '\nBody:\n', html, '\n');
    return { simulated: true, reason: 'no-smtp-config' };
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

  try {
    const fromEmail = process.env.SMTP_FROM || 'no-reply@example.com';
    const fromName = process.env.SMTP_FROM_NAME?.trim();
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    return { simulated: false };
  } catch (err) {
    const isAuthErr = err && (err.code === 'EAUTH' || /Invalid\s+login|535\s+5\.7\.8/i.test(err.message || ''));
    const allowSim = process.env.NODE_ENV !== 'production' || process.env.EMAIL_SIMULATE_ON_ERROR === 'true';
    if (isAuthErr && allowSim) {
      console.warn('[Email] SMTP auth failed, simulating send in dev. Error:', err.message);
      console.log('\n[Email simulated on error]\nTo:', to, '\nSubject:', subject, '\nBody:\n', html, '\n');
      return { simulated: true, reason: 'smtp-auth-failed', error: err?.message };
    }
    throw err;
  }
}
