import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true }, // Markdown
    coverImageUrl: { type: String },
  // Publication status: 'draft' or 'published'
  status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
  languages: { type: [String], default: [] },
  tagline: { type: String, default: '' },
  tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  likedByUserIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  likedByIps: { type: [String], default: [] },
    commentsCount: { type: Number, default: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

postSchema.pre('validate', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let base = slugify(this.title || 'post');
    let slug = base;
    let counter = 1;
    // Ensure uniqueness by checking existing docs
    while (await mongoose.models.Post.findOne({ slug })) {
      slug = `${base}-${counter++}`;
    }
    this.slug = slug;
  }
  next();
});

const Post = mongoose.model('Post', postSchema);
export default Post;
