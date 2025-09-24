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

// Admin: List Posts (optionally only mine)
export const listAdminPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;
    const mine = ['1', 'true', 'yes'].includes(String(req.query.mine || '').toLowerCase());
  const status = req.query.status;
  const filter = mine ? { author: req.user.id } : {};
  if (status === 'draft' || status === 'published') filter.status = status;
    const [items, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);
    res.json({ items, page, total });
  } catch (e) { next(e); }
};

// Admin: List Projects (optionally only mine)
export const listAdminProjects = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;
    const mine = ['1', 'true', 'yes'].includes(String(req.query.mine || '').toLowerCase());
    const status = req.query.status;
    const filter = mine ? { author: req.user.id } : {};
    if (status === 'draft' || status === 'published') filter.status = status;
    const [items, total] = await Promise.all([
      Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Project.countDocuments(filter),
    ]);
    res.json({ items, page, total });
  } catch (e) { next(e); }
};

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
  // Hide drafts for public lists, but include legacy docs without status
  filter.$or = [{ status: 'published' }, { status: { $exists: false } }];
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
    const { page = 1, limit = 10 } = req.query;
    // Backward-compatible single filters
    const singleLanguage = req.query.language;
    const singleTag = req.query.tag;
    // Optional multi-value filters (comma separated)
    const languagesParam = req.query.languages;
    const tagsParam = req.query.tags;
    const q = (req.query.q || '').toString().trim();
    const includeFacets = ['1', 'true', 'yes'].includes(String(req.query.includeFacets || '').toLowerCase());

    const filter = {};
    // Hide drafts for public lists, but include legacy docs without status
    filter.$or = [{ status: 'published' }, { status: { $exists: false } }];

    const languages = Array.isArray(languagesParam)
      ? languagesParam
      : typeof languagesParam === 'string' && languagesParam
      ? languagesParam.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const tags = Array.isArray(tagsParam)
      ? tagsParam
      : typeof tagsParam === 'string' && tagsParam
      ? tagsParam.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (singleLanguage) languages.push(singleLanguage);
    if (singleTag) tags.push(singleTag);

    if (languages.length) filter.languages = { $in: languages };
    if (tags.length) filter.tags = { $in: tags };

    if (q) {
      // Multi-token AND search across title, tagline, tags, languages, and keywords
      const tokens = Array.from(new Set(q.split(/\s+/).filter(Boolean)));
      if (tokens.length) {
        filter.$and = tokens.map((t) => {
          const rx = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          return { $or: [
            { title: rx },
            { tagline: rx },
            { tags: rx },
            { languages: rx },
            { keywords: rx },
          ] };
        });
      }
    }

    // Sorting support
    const sortParam = (req.query.sort || '').toString();
    const orderParam = (req.query.order || '').toString().toLowerCase();
    /** @type {Record<string, 1|-1>} */
    let sort = { createdAt: -1 };
    const dir = orderParam === 'asc' ? 1 : -1;
    switch (sortParam) {
      case 'likes':
        sort = { likes: dir, createdAt: -1 };
        break;
      case 'views':
        sort = { views: dir, createdAt: -1 };
        break;
      case 'title':
        sort = { title: dir };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [docs, count, facets] = await Promise.all([
      Project.find(filter).sort(sort).skip(skip).limit(limitNum),
      Project.countDocuments(filter),
      includeFacets
        ? Project.aggregate([
            { $match: filter },
            { $project: { tags: 1, languages: 1 } },
            { $facet: {
              tags: [ { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } }, { $group: { _id: { $toLower: '$tags' }, label: { $first: '$tags' }, count: { $sum: 1 } } }, { $sort: { count: -1 } } ],
              languages: [ { $unwind: { path: '$languages', preserveNullAndEmptyArrays: false } }, { $group: { _id: { $toLower: '$languages' }, label: { $first: '$languages' }, count: { $sum: 1 } } }, { $sort: { count: -1 } } ],
            } },
          ])
        : Promise.resolve([]),
    ]);

    const result = { items: docs, page: pageNum, total: count, pageSize: limitNum, hasMore: skip + docs.length < count };
    if (includeFacets && Array.isArray(facets) && facets[0]) {
      result.facets = {
        tags: facets[0].tags?.map((t) => ({ value: t.label, count: t.count })) || [],
        languages: facets[0].languages?.map((t) => ({ value: t.label, count: t.count })) || [],
      };
    }
    res.json(result);
  } catch (e) { next(e); }
};

// Public: Get Post by id or slug
export const getPost = async (req, res, next) => {
  try {
  const { id } = req.params;
  const isObjectId = !!(id && Types.ObjectId.isValid(id));
    const canSeeDrafts = req.user?.role === 'admin';
    const statusClause = canSeeDrafts ? {} : { $or: [{ status: 'published' }, { status: { $exists: false } }] };
    const query = isObjectId ? { _id: id, ...statusClause } : { slug: id, ...statusClause };
    // Ensure we don't try to $inc on null by using findOneAndUpdate; if not found as slug, also try by _id as fallback
    let post = await Post.findOneAndUpdate(query, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'username name profilePicture');
    console.log(post);
    if (!post && !isObjectId) {
      // Fallback: if slug lookup failed, attempt ObjectId lookup in case slug resembles an id
      post = await Post.findOneAndUpdate({ _id: id, ...statusClause }, { $inc: { views: 1 } }, { new: true })
        .populate('author', 'username name profilePicture')
        .catch(() => null);
    }
    if (!post) return next(errorHandler(404, 'Post not found'));
    const commentsDocs = await Comment.find({ targetType: 'post', targetId: post._id, parentId: null }).sort({ createdAt: -1 });
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userId = req.user?.id ? String(req.user.id) : null;
    const comments = commentsDocs.map((c) => ({
      ...c.toObject(),
      liked: !!(
        (userId && c.likedByUserIds?.some((u) => String(u) === userId)) ||
        (ip && c.likedByIps?.includes(String(ip)))
      ),
    }));
    const obj = post.toObject({ virtuals: true });
    const author = post.author && typeof post.author === 'object' ? {
      id: post.author._id,
      name: post.author.name || post.author.username,
      username: post.author.username,
      profilePicture: post.author.profilePicture,
    } : undefined;
    const liked = !!(
      (userId && post.likedByUserIds?.some((u) => String(u) === userId)) ||
      (ip && post.likedByIps?.includes(String(ip)))
    );
    res.json({ ...obj, author, authorName: author?.name, comments, liked });
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
    if (alreadyByUser || alreadyByIp) {
      // Toggle off (unlike)
      const update = {
        $inc: { likes: -1 },
        $pull: {
          ...(userId ? { likedByUserIds: userId } : {}),
          likedByIps: String(ip),
        },
      };
      const updated = await Post.findByIdAndUpdate(id, update, { new: true });
      const likes = Math.max(0, updated.likes || 0);
      if (updated.likes !== likes) {
        await Post.findByIdAndUpdate(id, { $set: { likes } });
      }
      return res.json({ likes, liked: false });
    }

    // Like
    const update = { $inc: { likes: 1 }, $addToSet: { likedByIps: String(ip) } };
    if (userId) update.$addToSet.likedByUserIds = userId;
    const updated = await Post.findByIdAndUpdate(id, update, { new: true });
    res.json({ likes: updated.likes, liked: true });
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
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userId = req.user?.id ? String(req.user.id) : null;
    const docs = await Comment.find({ targetType: 'post', targetId: post._id, parentId: null })
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    const total = await Comment.countDocuments({ targetType: 'post', targetId: post._id, parentId: null });
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

// Public: Get Project by id (include demoUrl)
export const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = !!(id && Types.ObjectId.isValid(id));
    const canSeeDrafts = req.user?.role === 'admin';
    const statusClause = canSeeDrafts ? {} : { $or: [{ status: 'published' }, { status: { $exists: false } }] };
    const query = isObjectId ? { _id: id, ...statusClause } : { slug: id, ...statusClause };

    let project = await Project.findOneAndUpdate(query, { $inc: { views: 1 } }, { new: true });
    if (!project && !isObjectId) {
      // Fallback to ObjectId lookup if slug-like id was provided
      project = await Project.findOneAndUpdate({ _id: id, ...statusClause }, { $inc: { views: 1 } }, { new: true }).catch(() => null);
    }
    if (!project) return next(errorHandler(404, 'Project not found'));

    const commentsDocs = await Comment.find({ targetType: 'project', targetId: project._id, parentId: null }).sort({ createdAt: -1 });
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userId = req.user?.id ? String(req.user.id) : null;
    const comments = commentsDocs.map((c) => ({
      ...c.toObject(),
      liked: !!(
        (userId && c.likedByUserIds?.some((u) => String(u) === userId)) ||
        (ip && c.likedByIps?.includes(String(ip)))
      ),
    }));
    const liked = !!(
      (userId && project.likedByUserIds?.some((u) => String(u) === userId)) ||
      (ip && project.likedByIps?.includes(String(ip)))
    );
    res.json({ ...project.toObject(), comments, liked });
  } catch (e) { next(e); }
};

// Public: Lightweight counters for Post (no view increment)
export const getPostCounters = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = !!(id && Types.ObjectId.isValid(id));
    const query = isObjectId ? { _id: id } : { slug: id };
    const post = await Post.findOne(query).select({ likes: 1, commentsCount: 1, updatedAt: 1, likedByUserIds: 1, likedByIps: 1 });
    if (!post) return next(errorHandler(404, 'Post not found'));
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userId = req.user?.id ? String(req.user.id) : null;
    const liked = !!(
      (userId && post.likedByUserIds?.some((u) => String(u) === userId)) ||
      (ip && post.likedByIps?.includes(String(ip)))
    );
    res.json({ likes: post.likes || 0, commentsCount: post.commentsCount || 0, updatedAt: post.updatedAt, liked });
  } catch (e) { next(e); }
};

// Public: Lightweight counters for Project (no view increment)
export const getProjectCounters = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = !!(id && Types.ObjectId.isValid(id));
    const query = isObjectId ? { _id: id } : { slug: id };
    const project = await Project.findOne(query).select({ likes: 1, commentsCount: 1, updatedAt: 1, likedByUserIds: 1, likedByIps: 1 });
    if (!project) return next(errorHandler(404, 'Project not found'));
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userId = req.user?.id ? String(req.user.id) : null;
    const liked = !!(
      (userId && project.likedByUserIds?.some((u) => String(u) === userId)) ||
      (ip && project.likedByIps?.includes(String(ip)))
    );
    res.json({ likes: project.likes || 0, commentsCount: project.commentsCount || 0, updatedAt: project.updatedAt, liked });
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
    if (alreadyByUser || alreadyByIp) {
      // Unlike
      const update = {
        $inc: { likes: -1 },
        $pull: {
          ...(userId ? { likedByUserIds: userId } : {}),
          likedByIps: String(ip),
        },
      };
      const updated = await Project.findByIdAndUpdate(id, update, { new: true });
      const likes = Math.max(0, updated.likes || 0);
      if (updated.likes !== likes) {
        await Project.findByIdAndUpdate(id, { $set: { likes } });
      }
      return res.json({ likes, liked: false });
    }

    const update = { $inc: { likes: 1 }, $addToSet: { likedByIps: String(ip) } };
    if (userId) update.$addToSet.likedByUserIds = userId;
    const updated = await Project.findByIdAndUpdate(id, update, { new: true });
    res.json({ likes: updated.likes, liked: true });
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

// Public: Get project comments with pagination
export const getProjectComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const project = await Project.findById(id);
    if (!project) return next(errorHandler(404, 'Project not found'));
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userId = req.user?.id ? String(req.user.id) : null;
    const docs = await Comment.find({ targetType: 'project', targetId: project._id, parentId: null })
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    const total = await Comment.countDocuments({ targetType: 'project', targetId: project._id, parentId: null });
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

// Public: Search across posts and projects
export const searchAll = async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString();
    if (!q) return res.json({ posts: [], projects: [] });
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const publishedOrLegacy = { $or: [{ status: 'published' }, { status: { $exists: false } }] };
  const postFilter = { $and: [publishedOrLegacy, { $or: [{ title: rx }, { tagline: rx }, { tags: rx }] }] };
  const projectFilter = { $and: [publishedOrLegacy, { $or: [{ title: rx }, { tagline: rx }, { tags: rx }] }] };
    const [posts, projects] = await Promise.all([
      Post.find(postFilter).sort({ createdAt: -1 }).limit(50),
      Project.find(projectFilter).sort({ createdAt: -1 }).limit(50),
    ]);
    res.json({ posts, projects });
  } catch (e) { next(e); }
};

// Public: Related posts by overlapping tags/languages
export const getRelatedPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = !!(id && Types.ObjectId.isValid(id));
    const query = isObjectId ? { _id: id } : { slug: id };
    const post = await Post.findOne(query).select({ tags: 1, languages: 1 });
    if (!post) return next(errorHandler(404, 'Post not found'));
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const languages = Array.isArray(post.languages) ? post.languages : [];
    const related = await Post.find({
      _id: { $ne: post._id },
      $or: [
        ...(tags.length ? [{ tags: { $in: tags } }] : []),
        ...(languages.length ? [{ languages: { $in: languages } }] : []),
      ],
      // Only surface published posts (or legacy without status) in related list
      $and: [ { $or: [ { status: 'published' }, { status: { $exists: false } } ] } ],
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select({ title: 1, slug: 1, coverImageUrl: 1, createdAt: 1, tags: 1, tagline: 1 });
    res.json({ items: related });
  } catch (e) { next(e); }
};
