import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ['post', 'project'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    text: { type: String, required: true, trim: true },
    ip: { type: String },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
