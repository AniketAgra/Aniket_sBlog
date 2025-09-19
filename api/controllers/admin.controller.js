import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import { createPostSchema, updatePostSchema } from '../utils/validation.js';
import { errorHandler } from '../utils/error.js';

export const createPost = async (req, res, next) => {
  try {
    const { value, error } = createPostSchema.validate(req.body);
    if (error) return next(errorHandler(400, error.details[0].message));

    const post = await Post.create({ ...value, author: req.user.id });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { value, error } = updatePostSchema.validate(req.body);
    if (error) return next(errorHandler(400, error.details[0].message));

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    );
    if (!updated) return next(errorHandler(404, 'Post not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return next(errorHandler(404, 'Post not found'));
    // Optional: cascade delete comments
    await Comment.deleteMany({ post: req.params.id });
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

export const analytics = async (req, res, next) => {
  try {
    const agg = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          totalComments: { $sum: '$commentsCount' },
          posts: { $sum: 1 },
        },
      },
      { $project: { _id: 0 } },
    ]);
    res.status(200).json(agg[0] || { totalViews: 0, totalLikes: 0, totalComments: 0, posts: 0 });
  } catch (err) {
    next(err);
  }
};
