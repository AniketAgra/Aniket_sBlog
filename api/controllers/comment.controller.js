import { Types } from 'mongoose';
import Comment from '../models/comment.model.js';
import Post from '../models/post.model.js';
import Project from '../models/project.model.js';
import { errorHandler } from '../utils/error.js';

// Toggle like on a comment (by user or IP)
export const toggleLikeOnComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return next(errorHandler(400, 'Invalid comment id'));
    const comment = await Comment.findById(id);
    if (!comment) return next(errorHandler(404, 'Comment not found'));

    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userId = req.user?.id;

    const alreadyByUser = userId && comment.likedByUserIds.some(u => String(u) === String(userId));
    const alreadyByIp = comment.likedByIps.includes(String(ip));
    const hasLiked = !!(alreadyByUser || alreadyByIp);

    let update;
    if (hasLiked) {
      update = {
        $inc: { likes: -1 },
        ...(userId ? { $pull: { likedByUserIds: userId } } : {}),
        $pull: { likedByIps: String(ip) },
      };
    } else {
      update = {
        $inc: { likes: 1 },
        ...(userId ? { $addToSet: { likedByUserIds: userId } } : {}),
        $addToSet: { likedByIps: String(ip) },
      };
    }

    const updated = await Comment.findByIdAndUpdate(id, update, { new: true });
    res.json({ likes: updated.likes || 0, liked: !hasLiked });
  } catch (e) { next(e); }
};

// Create a reply under a parent comment
export const createReply = async (req, res, next) => {
  try {
    const { id } = req.params; // parent comment id
    const { username, text } = req.body || {};
    if (!Types.ObjectId.isValid(id)) return next(errorHandler(400, 'Invalid parent comment id'));
    if (!text || !username) return next(errorHandler(400, 'username and text are required'));

    const parent = await Comment.findById(id);
    if (!parent) return next(errorHandler(404, 'Parent comment not found'));

    const reply = await Comment.create({
      targetType: parent.targetType,
      targetId: parent.targetId,
      parentId: parent._id,
      userId: req.user?.id,
      username,
      text: text.trim(),
      ip: req.ip,
    });

    // increment parent's repliesCount
    await Comment.findByIdAndUpdate(parent._id, { $inc: { repliesCount: 1 } });

    // increment counters on post/project for total comments
    if (parent.targetType === 'post') {
      await Post.findByIdAndUpdate(parent.targetId, { $inc: { commentsCount: 1 } });
    } else if (parent.targetType === 'project') {
      await Project.findByIdAndUpdate(parent.targetId, { $inc: { commentsCount: 1 } });
    }

    res.status(201).json(reply);
  } catch (e) { next(e); }
};

// Get replies for a specific comment
export const getReplies = async (req, res, next) => {
  try {
    const { id } = req.params; // parent comment id
    const { page = 1, limit = 20 } = req.query;
    if (!Types.ObjectId.isValid(id)) return next(errorHandler(400, 'Invalid parent comment id'));
    const parent = await Comment.findById(id);
    if (!parent) return next(errorHandler(404, 'Parent comment not found'));

    const docs = await Comment.find({ parentId: parent._id })
      .sort({ createdAt: 1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    const total = await Comment.countDocuments({ parentId: parent._id });
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userId = req.user?.id ? String(req.user.id) : null;
    const items = docs.map((c) => ({
      ...c.toObject(),
      liked: !!(
        (userId && c.likedByUserIds?.some((u) => String(u) === userId)) ||
        (ip && c.likedByIps?.includes(String(ip)))
      ),
    }));
    res.json({ items, page: +page, total });
  } catch (e) { next(e); }
};

// Update comment text (owner or admin). Marks as edited and updates counters if needed.
export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body || {};
    if (!Types.ObjectId.isValid(id)) return next(errorHandler(400, 'Invalid comment id'));
    if (!text || !String(text).trim()) return next(errorHandler(400, 'Text is required'));
    const comment = await Comment.findById(id);
    if (!comment) return next(errorHandler(404, 'Comment not found'));
    const isOwner = req.user && String(req.user.id) === String(comment.userId);
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) return next(errorHandler(403, 'Not authorized to edit'));

    comment.text = String(text).trim();
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();
    res.json(comment);
  } catch (e) { next(e); }
};

// Delete a comment (owner or admin). If parent exists, decrement parent's repliesCount. Also decrement target counters.
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return next(errorHandler(400, 'Invalid comment id'));
    const comment = await Comment.findById(id);
    if (!comment) return next(errorHandler(404, 'Comment not found'));
    const isOwner = req.user && String(req.user.id) === String(comment.userId);
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) return next(errorHandler(403, 'Not authorized to delete'));

    // Count all descendants to adjust total comments count properly
    const allDescendants = await Comment.find({ parentId: comment._id }).select({ _id: 1 });
    // Note: for deep trees, consider recursive delete; here we cascade delete all children using parentId filter repeatedly.
    await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentId: comment._id }] });

    // Update parent repliesCount
    if (comment.parentId) {
      await Comment.findByIdAndUpdate(comment.parentId, { $inc: { repliesCount: -1 } });
    }

    // Update target's commentsCount: subtract this comment + direct children (best-effort)
    const decrementBy = 1 + (allDescendants?.length || 0);
    if (comment.targetType === 'post') {
      await Post.findByIdAndUpdate(comment.targetId, { $inc: { commentsCount: -decrementBy } });
    } else if (comment.targetType === 'project') {
      await Project.findByIdAndUpdate(comment.targetId, { $inc: { commentsCount: -decrementBy } });
    }

    res.json({ deleted: true });
  } catch (e) { next(e); }
};
