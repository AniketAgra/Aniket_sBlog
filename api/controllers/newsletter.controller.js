import Subscriber from '../models/subscriber.model.js';
import Joi from 'joi';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

const subscribeSchema = Joi.object({
  email: Joi.string().email().required(),
  source: Joi.string().max(50).optional(),
});

export async function subscribe(req, res, next) {
  try {
    const { value, error } = subscribeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { email, source = 'home' } = value;

    // If already subscribed and verified, return friendly message
    let sub = await Subscriber.findOne({ email });
    if (sub && sub.verified) {
      return res.status(200).json({ success: true, message: 'You are already subscribed.' });
    }

    // Create or update with new verification token
    const verifyToken = crypto.randomBytes(24).toString('hex');
    const verifyTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    if (!sub) {
      sub = await Subscriber.create({ email, source, verifyToken, verifyTokenExpires, verified: false });
    } else {
      sub.verifyToken = verifyToken;
      sub.verifyTokenExpires = verifyTokenExpires;
      sub.source = source;
      sub.verified = false;
      await sub.save();
    }

    // Build verify URL
    const origin = req.headers.origin || process.env.FRONTEND_URL || '';
    const baseUrl = origin || `${req.protocol}://${req.get('host')}`;
    const verifyUrl = `${baseUrl}/api/subscribe/verify?token=${sub.verifyToken}`;

    // Send email (simulated in dev if SMTP not configured)
    await sendEmail({
      to: email,
      subject: 'Confirm your subscription',
      html: `<p>Thanks for subscribing!</p>
             <p>Please confirm your email by clicking the link below:</p>
             <p><a href="${verifyUrl}">Confirm subscription</a></p>
             <p>This link expires in 24 hours.</p>`
    });

    return res.status(201).json({ success: true, message: 'Check your email to confirm your subscription.' });
  } catch (err) {
    // Handle duplicate key race conditions gracefully
    if (err?.code === 11000) {
      return res.status(200).json({ success: true, message: 'You are already subscribed.' });
    }
    next(err);
  }
}

export async function verifySubscription(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Missing token' });
    const sub = await Subscriber.findOne({ verifyToken: token, verifyTokenExpires: { $gt: new Date() } });
    if (!sub) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    sub.verified = true;
    sub.verifyToken = undefined;
    sub.verifyTokenExpires = undefined;
    await sub.save();
    return res.status(200).json({ success: true, message: 'Subscription confirmed. Thank you!' });
  } catch (err) {
    next(err);
  }
}
