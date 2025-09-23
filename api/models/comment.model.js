import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ['post', 'project'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    // For nested replies (YouTube-style threads). Null means top-level comment
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    text: { type: String, required: true, trim: true },
    ip: { type: String },

    // Likes with basic abuse prevention (by user or IP)
    likes: { type: Number, default: 0 },
    likedByUserIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    likedByIps: { type: [String], default: [] },

    // Count of direct replies to this comment
    repliesCount: { type: Number, default: 0 },

  // Content edit flags (separate from updatedAt which may change on likes)
  edited: { type: Boolean, default: false },
  editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
