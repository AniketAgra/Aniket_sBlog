import mongoose from 'mongoose';

const ResumeDownloadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    username: { type: String },
    name: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    device: { type: String }, // e.g., mobile | tablet | desktop-windows | desktop-mac | desktop-linux | bot
    notes: { type: String },
  },
  { timestamps: true }
);

ResumeDownloadSchema.index({ createdAt: -1 });
ResumeDownloadSchema.index({ userId: 1, createdAt: -1 });
ResumeDownloadSchema.index({ ip: 1, createdAt: -1 });
ResumeDownloadSchema.index({ username: 1, createdAt: -1 });
ResumeDownloadSchema.index({ email: 1, createdAt: -1 });

const ResumeDownload = mongoose.model('ResumeDownload', ResumeDownloadSchema);
export default ResumeDownload;
