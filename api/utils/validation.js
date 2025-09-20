import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().min(1).max(50).trim().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(1).required(),
  coverImageUrl: Joi.string().uri().optional(),
  languages: Joi.array().items(Joi.string().min(1)).default([]),
  tagline: Joi.string().max(300).allow('').optional(),
  tags: Joi.array().items(Joi.string().min(1)).default([]),
});

export const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  content: Joi.string().min(1).optional(),
  coverImageUrl: Joi.string().uri().optional(),
  languages: Joi.array().items(Joi.string().min(1)).optional(),
  tagline: Joi.string().max(300).allow('').optional(),
  tags: Joi.array().items(Joi.string().min(1)).optional(),
});

export const likeSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const commentSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  text: Joi.string().min(1).max(1000).required(),
});

// Aliases for other controllers
export const postCreateSchema = createPostSchema;
export const postUpdateSchema = updatePostSchema;

// Project schemas
export const projectCreateSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(1).required(),
  coverImageUrl: Joi.string().uri().optional(),
  languages: Joi.array().items(Joi.string().min(1)).default([]),
  tagline: Joi.string().max(300).allow('').optional(),
  tags: Joi.array().items(Joi.string().min(1)).default([]),
  demoUrl: Joi.string().uri().optional(),
  repoUrl: Joi.string().uri().optional(),
});

export const projectUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  content: Joi.string().min(1).optional(),
  coverImageUrl: Joi.string().uri().optional(),
  languages: Joi.array().items(Joi.string().min(1)).optional(),
  tagline: Joi.string().max(300).allow('').optional(),
  tags: Joi.array().items(Joi.string().min(1)).optional(),
  demoUrl: Joi.string().uri().optional(),
  repoUrl: Joi.string().uri().optional(),
});

export const commentCreateSchema = Joi.object({
  username: Joi.string().min(1).max(50).required(),
  text: Joi.string().min(1).max(1000).required(),
});
