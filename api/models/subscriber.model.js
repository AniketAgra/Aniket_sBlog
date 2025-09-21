import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  source: { type: String, default: 'home' },
  verified: { type: Boolean, default: false },
  verifyToken: { type: String },
  verifyTokenExpires: { type: Date },
}, { timestamps: true });

subscriberSchema.index({ email: 1 }, { unique: true });

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
