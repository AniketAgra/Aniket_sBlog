import Post from '../models/post.model.js';
import { Types } from 'mongoose';
import Project from '../models/project.model.js';
import Comment from '../models/comment.model.js';
import { errorHandler } from '../utils/error.js';
import {
  postCreateSchema,
  postUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  commentCreateSchema,
} from '../utils/validation.js';

// Admin: Create Post
export const createPost = async (req, res, next) => {
  try {
    const { value, error } = postCreateSchema.validate(req.body, { abortEarly: false });
    if (error) return next(errorHandler(400, error.details.map(d => d.message).join(', ')));
    const post = await Post.create({ ...value, author: req.user.id });
    res.status(201).json(post);
  } catch (e) { next(e); }
};

// Admin: Update Post
export const updatePost = async (req, res, next) => {
  try {
    const { value, error } = postUpdateSchema.validate(req.body, { abortEarly: false });
    if (error) return next(errorHandler(400, error.details.map(d => d.message).join(', ')));
    const post = await Post.findByIdAndUpdate(req.params.id, { $set: value }, { new: true });
    if (!post) return next(errorHandler(404, 'Post not found'));
    res.json(post);
  } catch (e) { next(e); }
};

// Admin: Delete Post
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return next(errorHandler(404, 'Post not found'));
    await Comment.deleteMany({ targetType: 'post', targetId: post._id });
    res.json({ message: 'Post deleted' });
  } catch (e) { next(e); }
};

// Admin: Create Project
export const createProject = async (req, res, next) => {
  try {
    const { value, error } = projectCreateSchema.validate(req.body, { abortEarly: false });
    if (error) return next(errorHandler(400, error.details.map(d => d.message).join(', ')));
    const project = await Project.create({ ...value, author: req.user.id });
    res.status(201).json(project);
  } catch (e) { next(e); }
};

// Admin: Update Project
export const updateProject = async (req, res, next) => {
  try {
    const { value, error } = projectUpdateSchema.validate(req.body, { abortEarly: false });
    if (error) return next(errorHandler(400, error.details.map(d => d.message).join(', ')));
    const project = await Project.findByIdAndUpdate(req.params.id, { $set: value }, { new: true });
    if (!project) return next(errorHandler(404, 'Project not found'));
    res.json(project);
  } catch (e) { next(e); }
};

// Admin: Delete Project
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return next(errorHandler(404, 'Project not found'));
    await Comment.deleteMany({ targetType: 'project', targetId: project._id });
    res.json({ message: 'Project deleted' });
  } catch (e) { next(e); }
};

// Admin: Analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const [postAgg] = await Post.aggregate([
      { $group: { _id: null, views: { $sum: '$views' }, likes: { $sum: '$likes' }, comments: { $sum: '$commentsCount' } } },
    ]);
    const [projectAgg] = await Project.aggregate([
      { $group: { _id: null, views: { $sum: '$views' }, likes: { $sum: '$likes' }, comments: { $sum: '$commentsCount' } } },
    ]);
    res.json({
      totalViews: (postAgg?.views || 0) + (projectAgg?.views || 0),
      totalLikes: (postAgg?.likes || 0) + (projectAgg?.likes || 0),
      totalComments: (postAgg?.comments || 0) + (projectAgg?.comments || 0),
    });
  } catch (e) { next(e); }
};

// Public: List Posts
export const listPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, language, tag } = req.query;
    const filter = {};
    if (language) filter.languages = language;
    if (tag) filter.tags = tag;
    const docs = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    const count = await Post.countDocuments(filter);
    res.json({ items: docs, page: +page, total: count });
  } catch (e) { next(e); }
};

export const listProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, language, tag } = req.query;
    const filter = {};
    if (language) filter.languages = language;
    if (tag) filter.tags = tag;
    const docs = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    const count = await Project.countDocuments(filter);
    res.json({ items: docs, page: +page, total: count });
  } catch (e) { next(e); }
};

// Public: Get Post by id or slug
export const getPost = async (req, res, next) => {
  try {
  const { id } = req.params;
  const isObjectId = !!(id && Types.ObjectId.isValid(id));
    const query = isObjectId ? { _id: id } : { slug: id };
    // Ensure we don't try to $inc on null by using findOneAndUpdate; if not found as slug, also try by _id as fallback
  let post = await Post.findOneAndUpdate(query, { $inc: { views: 1 } }, { new: true });
  console.log(post);
    if (!post && !isObjectId) {
      // Fallback: if slug lookup failed, attempt ObjectId lookup in case slug resembles an id
      post = await Post.findOneAndUpdate({ _id: id }, { $inc: { views: 1 } }, { new: true }).catch(() => null);
    }
    if (!post) return next(errorHandler(404, 'Post not found'));
    const comments = await Comment.find({ targetType: 'post', targetId: post._id }).sort({ createdAt: -1 });
    res.json({ ...post.toObject(), comments });
  } catch (e) { next(e); }
};

// Public: Like Post (one per user or IP)
export const likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userId = req.user?.id;

    const post = await Post.findById(id);
    if (!post) return next(errorHandler(404, 'Post not found'));

    const alreadyByUser = userId && post.likedByUserIds.some(u => u.toString() === userId);
    const alreadyByIp = post.likedByIps.includes(String(ip));
    if (alreadyByUser || alreadyByIp) return res.json({ likes: post.likes });

    const update = {
      $inc: { likes: 1 },
      ...(userId ? { $addToSet: { likedByUserIds: userId } } : {}),
      $addToSet: { likedByIps: String(ip) },
    };
    const updated = await Post.findByIdAndUpdate(id, update, { new: true });
    res.json({ likes: updated.likes });
  } catch (e) { next(e); }
};

// Public: Comment on Post
export const commentOnPost = async (req, res, next) => {
  try {
    const { error, value } = commentCreateSchema.validate(req.body);
    if (error) return next(errorHandler(400, error.details.map(d => d.message).join(', ')));
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return next(errorHandler(404, 'Post not found'));
    const comment = await Comment.create({
      targetType: 'post',
      targetId: post._id,
      userId: req.user?.id,
      username: value.username,
      text: value.text,
      ip: req.ip,
    });
    await Post.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });
    res.status(201).json(comment);
  } catch (e) { next(e); }
};

// Public: Get comments with pagination
export const getPostComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const post = await Post.findById(id);
    if (!post) return next(errorHandler(404, 'Post not found'));
    const comments = await Comment.find({ targetType: 'post', targetId: post._id })
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    const total = await Comment.countDocuments({ targetType: 'post', targetId: post._id });
    res.json({ items: comments, page: +page, total });
  } catch (e) { next(e); }
};

// Public: Get Project by id (include demoUrl)
export const getProject = async (req, res, next) => {
  try {
  const { id } = req.params;
  const isObjectId = !!(id && Types.ObjectId.isValid(id));
    const query = isObjectId ? { _id: id } : { slug: id };
    let project = await Project.findOneAndUpdate(query, { $inc: { views: 1 } }, { new: true });
    console.log(project);
    if (!project && !isObjectId) {
      project = await Project.findOneAndUpdate({ _id: id }, { $inc: { views: 1 } }, { new: true }).catch(() => null);
    }
    if (!project) return next(errorHandler(404, 'Project not found'));
    const comments = await Comment.find({ targetType: 'project', targetId: project._id }).sort({ createdAt: -1 });
    res.json({ ...project.toObject(), comments });
  } catch (e) { next(e); }
};

export const likeProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userId = req.user?.id;
    const project = await Project.findById(id);
    if (!project) return next(errorHandler(404, 'Project not found'));
    const alreadyByUser = userId && project.likedByUserIds.some(u => u.toString() === userId);
    const alreadyByIp = project.likedByIps.includes(String(ip));
    if (alreadyByUser || alreadyByIp) return res.json({ likes: project.likes });
    const update = {
      $inc: { likes: 1 },
      ...(userId ? { $addToSet: { likedByUserIds: userId } } : {}),
      $addToSet: { likedByIps: String(ip) },
    };
    const updated = await Project.findByIdAndUpdate(id, update, { new: true });
    res.json({ likes: updated.likes });
  } catch (e) { next(e); }
};

export const commentOnProject = async (req, res, next) => {
  try {
    const { error, value } = commentCreateSchema.validate(req.body);
    if (error) return next(errorHandler(400, error.details.map(d => d.message).join(', ')));
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return next(errorHandler(404, 'Project not found'));
    const comment = await Comment.create({
      targetType: 'project',
      targetId: project._id,
      userId: req.user?.id,
      username: value.username,
      text: value.text,
      ip: req.ip,
    });
    await Project.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });
    res.status(201).json(comment);
  } catch (e) { next(e); }
};

// Public: Search across posts and projects
export const searchAll = async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString();
    if (!q) return res.json({ posts: [], projects: [] });
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const postFilter = { $or: [{ title: rx }, { tagline: rx }, { tags: rx }] };
    const projectFilter = { $or: [{ title: rx }, { tagline: rx }, { tags: rx }] };
    const [posts, projects] = await Promise.all([
      Post.find(postFilter).sort({ createdAt: -1 }).limit(50),
      Project.find(projectFilter).sort({ createdAt: -1 }).limit(50),
    ]);
    res.json({ posts, projects });
  } catch (e) { next(e); }
};
