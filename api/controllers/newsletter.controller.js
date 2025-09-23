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

    // Send email (simulated in dev if SMTP not configured or on SMTP auth errors)
    const emailResult = await sendEmail({
      to: email,
      subject: 'Confirm your subscription',
      html: `<p>Thanks for subscribing!</p>
             <p>Please confirm your email by clicking the link below:</p>
             <p><a href="${verifyUrl}">Confirm subscription</a></p>
             <p>This link expires in 24 hours.</p>`
    });

    const msg = emailResult?.simulated
      ? 'Subscription created. Email sending is not configured in this environment. Check server logs for the verification link.'
      : 'Check your email to confirm your subscription.';
    return res.status(201).json({ success: true, message: msg });
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

// Admin: List subscribers with pagination and optional search by email
export async function listSubscribers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').toString().trim();
    const rx = search ? new RegExp(search.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i') : null;
    const filter = rx ? { email: rx } : {};

    const [items, total] = await Promise.all([
      Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Subscriber.countDocuments(filter),
    ]);

    res.json({ items, page, total });
  } catch (err) {
    next(err);
  }
}
