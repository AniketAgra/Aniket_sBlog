## MyBlog (MERN) – Overview

Full‑stack blog and portfolio application built with the MERN stack. It includes public posts and projects, comments and likes, newsletter subscriptions with email verification, authenticated resume downloads with logging, and an admin API for content management. The React SPA is served by the Node/Express API in production.

## Tech stack

- Backend: Node.js, Express, MongoDB (Mongoose)
- Auth: JWT (http-only cookie or Authorization: Bearer), bcryptjs; Google OAuth via Firebase on the frontend
- Email: Nodemailer with Brevo SMTP (Sendinblue)
- Security: helmet, express-rate-limit, xss-clean, express-mongo-sanitize, CORS
- File uploads: multer (served from `/uploads`)
- Frontend: React 18, Vite, React Router, Redux Toolkit + redux-persist, Tailwind CSS, Flowbite/Flowbite-React, React Markdown + highlight.js
- Tooling: ESLint, PostCSS, scripts to sync client build into API `public/`

## Project structure (top-level)

```
api/                 # Express API (mounted under /api)
	controllers/       # Route handlers (auth, posts/projects, comments, newsletter, resume, admin)
	middleware/        # authenticate, authOptional, rateLimiter, requireAdmin
	models/            # Mongoose models (user, post, project, comment, subscriber, resumeDownload)
	routes/            # Route modules (auth, user, posts, projects, comments, newsletter, resume, admin, upload)
	public/            # Production client build served by the API
	uploads/           # Uploaded assets (served at /uploads)
client/              # React app (Vite + Tailwind)
scripts/             # syncClientBuild.js (moves client build into api/public)
```

## Environment variables

Create a `.env` file in `api/` (preferred) or project root with:

- Core: `MONGO_URL`, `JWT_SECRET`, `PORT` (default 7000)
- CORS: `FRONTEND_URL` or `FRONTEND_URLS` (comma‑separated), optionally `RENDER_EXTERNAL_URL`
- Email (Brevo SMTP): `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_FROM_NAME`, optional `EMAIL_SIMULATE_ON_ERROR`
- Frontend link for password reset emails: `CLIENT_URL` (fallback is request Origin)
- CSP allow‑lists (optional): `ALLOWED_IMG_DOMAINS`, `ALLOWED_CONNECT_DOMAINS`, `ALLOWED_FRAME_DOMAINS` (comma‑separated)

## Run locally

1) Install dependencies

- At project root: `npm install`
- Frontend: `npm --prefix client install`

2) Start development servers

- API: `npm run dev` (nodemon on port 7000 by default)
- Client: `npm --prefix client run dev` (Vite on 5173)

3) Production build and serve

- Build SPA and sync to API: `npm run build`
- Start API (serves SPA from `api/public`): `npm start`

Utility scripts:
- Promote a user to admin by email/ID (see script prompts): `npm run promote`

## API overview (base: `/api`)

Public/content routes
- GET `/posts` – List posts (filters/pagination handled in controller)
- GET `/posts/:id` – Get a post by id or slug (auth optional)
- GET `/posts/:id/counters` – Get post counters (views/likes/comments)
- GET `/posts/:id/related` – Related posts
- GET `/posts/:id/comments` – List comments (auth optional)
- POST `/posts/:id/like` – Like/unlike a post (auth)
- POST `/posts/:id/comments` – Add a comment (auth)

- GET `/projects` – List projects
- GET `/projects/:id` – Get a project (auth optional)
- GET `/projects/:id/counters` – Project counters
- GET `/projects/:id/comments` – List project comments (auth optional)
- POST `/projects/:id/like` – Like/unlike a project (auth)
- POST `/projects/:id/comments` – Add a project comment (auth)

Comments
- POST `/comments/:id/like` – Toggle like on a comment (auth)
- POST `/comments/:id/replies` – Create reply (auth)
- GET `/comments/:id/replies` – List replies
- PUT `/comments/:id` – Update comment (owner/admin)
- DELETE `/comments/:id` – Delete comment (owner/admin)
- Fallback aliases (POST): `/comments/:id/update`, `/comments/:id/delete`

Auth
- POST `/auth/signup` | `/auth/register` – Create account
- POST `/auth/signin` | `/auth/login` – Email/password login
- POST `/auth/google` – Google login (frontend uses Firebase)
- POST `/auth/signout` – Sign out
- POST `/auth/forgot-password` – Request reset link (email)
- POST `/auth/reset-password` – Reset with token

Users
- GET `/user/test` – Simple health/test endpoint
- PATCH `/user/update/:userId` – Update profile (auth)
- DELETE `/user/delete/:userId` – Delete account (auth)

Newsletter
- POST `/subscribe` – Subscribe (rate‑limited)
- GET `/subscribe/verify` – Verify subscription link

Resume
- POST `/resume/download` – Download resume (auth; logs download)
- GET `/resume/download` – Backward‑compatible alias (auth)

Uploads
- POST `/upload` – Upload single image field `image` (auth); returns `{ url }`
- Static: GET `/uploads/<filename>` – Served files

Admin (all require auth + admin role; prefix `/admin`)
- Posts: `POST /admin/posts`, `PATCH /admin/posts/:id`, `DELETE /admin/posts/:id`, `GET /admin/posts`
- Projects: `POST /admin/projects`, `PATCH /admin/projects/:id`, `DELETE /admin/projects/:id`, `GET /admin/projects`
- Analytics: `GET /admin/analytics`
- Newsletter subscribers: `GET /admin/subscribers`
- Resume logs: `GET /admin/resume-downloads`, `GET /admin/resume-downloads/stats`

Auth mechanics
- Provide JWT via `Authorization: Bearer <token>` or cookie `access_token`
- Admin guard checks `req.user.role === 'admin'`

Static assets and SPA
- In production the API serves the built SPA from `api/public/` and assets from `/assets`
- Uploaded files are served at `/uploads`

## Architecture & workflow

High level flow
- Client (React SPA) calls API under `/api` with credentials (JWT via cookie or Authorization header).
- API validates JWT (middleware `authenticate` or `authOptional`) and authorizes admin routes (`requireAdmin`).
- Controllers interact with MongoDB via Mongoose models and return JSON. Some actions trigger emails (Nodemailer).
- For uploads, images are saved with Multer in `api/uploads/` and served at `/uploads`.
- In production, the built SPA is served by Express from `api/public` with an SPA fallback for non-API routes.

Request lifecycle
1) Request hits Express → security middlewares (helmet, CORS, rate limit, sanitizers).
2) Route middleware (auth/authOptional/admin) attaches `req.user` if token valid.
3) Controller executes business logic with models and utilities (validation, slugify, etc.).
4) Response JSON returned (and side effects like email/logging performed).
5) Global error handler serializes errors consistently.  

## How the tech stack is used

- Express: Core HTTP server, routers in `api/routes/*`, JSON body parsing, static serving for `/assets` and SPA.
- Mongoose: Schemas and models in `api/models/*` for users, posts, projects, comments, subscribers, and resume downloads; handles querying, relations, counters.
- JWT: Issued on login; verified in `authenticate.js` and parsed into `req.user`. Supports cookie `access_token` and `Authorization: Bearer`.
- bcryptjs: Secure password hashing for user credentials.
- Helmet: Sets security headers incl. CSP tuned for OAuth popups and external images/APIs; optional domain allow-lists via env vars.
- express-rate-limit: Protects sensitive/public endpoints (e.g., newsletter subscribe) from abuse.
- xss-clean & express-mongo-sanitize: Input sanitization against XSS and query selector injection.
- CORS: Strict allowlist for local dev and configured frontends via `FRONTEND_URL(S)`; only applied on `/api` routes.
- Multer: Disk storage for image uploads; sanitized filenames and served via `/uploads`.
- Nodemailer + Brevo SMTP: Transactional emails for newsletter verification and password resets, with dev‑friendly simulation.
- React + Vite: SPA with fast dev server; routes for blog, projects, auth, dashboard, etc.
- Redux Toolkit + redux-persist: App state and session persistence.
- Tailwind + Flowbite: UI styling and components.
- React Markdown + highlight.js: Renders post content with code highlighting.
- Firebase (client): Handles Google OAuth sign‑in; tokens exchanged with backend via `/auth/google`.

## Security hardening

- Helmet: Enabled with custom CSP (scripts, frames, images, connect), crossOriginOpenerPolicy and crossOriginResourcePolicy configured.
- CORS: Origin callback allowlist; credentials enabled; limited to `/api`.
- Rate limiting: Default limiter for subscribe; extend as needed for auth endpoints.
- Sanitization: `xss-clean` and `express-mongo-sanitize` applied to requests.
- AuthZ: `requireAdmin` ensures admin‑only access for management routes.

## Email setup (Brevo SMTP)

This project uses SMTP for transactional emails. It's pre‑configured to work with Brevo (formerly Sendinblue).

1) Create a Brevo account and get SMTP credentials
- In Brevo, go to SMTP & API → SMTP.
- Copy your SMTP login and the SMTP key (not your account password).
- Add/verify a sender email address and domain.

2) Configure environment variables
- SMTP_HOST=smtp-relay.brevo.com
- SMTP_PORT=587 (STARTTLS) or 465 (SSL)
- SMTP_SECURE=false for 587, true for 465
- SMTP_USER=your Brevo SMTP login
- SMTP_PASS=your Brevo SMTP key
- SMTP_FROM=the verified sender email in Brevo
- SMTP_FROM_NAME=optional friendly display name
- Also set: MONGO_URL, JWT_SECRET, FRONTEND_URL/FRONTEND_URLS, PORT

3) Dev‑friendly behavior
- If SMTP credentials are missing, the server logs the email instead of sending.
- If SMTP auth fails and `NODE_ENV` is not `production`, send is simulated when `EMAIL_SIMULATE_ON_ERROR=true`.

4) Test
- Start the API with your `.env` in place and trigger any action that sends an email (e.g., newsletter subscribe or password reset).
- Check server logs for either a successful send or a simulated email output.

5) Security
- Do not commit real secrets. `.env` is ignored by git.
- Rotate any keys that may have been accidentally shared.

### Password reset flow

1. User submits email at `/auth/forgot-password` (frontend page: `/forgot-password`).
2. Backend generates a token (30 min expiry) and emails `${CLIENT_URL}/reset-password?token=...&email=...`.
3. User sets new password at that link via `/auth/reset-password`.


