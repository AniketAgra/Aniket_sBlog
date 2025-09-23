import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    coverImageUrl: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
    languages: { type: [String], default: [] },
    tagline: { type: String, default: '' },
    tags: { type: [String], default: [] },
    demoUrl: { type: String },
    repoUrl: { type: String },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedByUserIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    likedByIps: { type: [String], default: [] },
    commentsCount: { type: Number, default: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

projectSchema.pre('validate', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let base = slugify(this.title || 'project');
    let slug = base;
    let counter = 1;
    while (await mongoose.models.Project.findOne({ slug })) {
      slug = `${base}-${counter++}`;
    }
    this.slug = slug;
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
