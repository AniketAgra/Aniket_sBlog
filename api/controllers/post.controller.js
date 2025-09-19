import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import mongoose from 'mongoose';
import { errorHandler } from '../utils/error.js';

export const listPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, language } = req.query;
    const query = {};
    if (language) query.languages = language;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-content'),
      Post.countDocuments(query),
    ]);
    res.status(200).json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

export const getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username name role');
    if (!post) return next(errorHandler(404, 'Post not found'));
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return next(errorHandler(400, 'Invalid post id'));
    const updated = await Post.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    if (!updated) return next(errorHandler(404, 'Post not found'));
    res.status(200).json({ likes: updated.likes });
  } catch (err) {
    next(err);
  }
};

export const commentOnPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!mongoose.isValidObjectId(id)) return next(errorHandler(400, 'Invalid post id'));
    if (!text || !text.trim()) return next(errorHandler(400, 'Comment text required'));

    const post = await Post.findById(id);
    if (!post) return next(errorHandler(404, 'Post not found'));

    const comment = await Comment.create({ post: id, author: req.user.id, text: text.trim() });
    await Post.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};
