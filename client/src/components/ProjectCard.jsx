import PropTypes from 'prop-types';
import { useMemo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from '../styles/components/ProjectCard.module.css';
// Prompt is shown by parent Projects page; this component signals via onRequireAuth

export default function ProjectCard({ project, variant = 'grid', onRequireAuth }) {
  const currentUser = useSelector((s) => s.user?.currentUser);
  // Like state persisted per project
  const storageKey = useMemo(() => {
    const id = project?._id || project?.slug || project?.title || 'unknown';
    return `liked:project:${id}`;
  }, [project?._id, project?.slug, project?.title]);

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(typeof project?.likes === 'number' ? Number(project.likes) : 0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!currentUser) { setLiked(false); setLikes(0); return; }
    try {
      const v = localStorage.getItem(storageKey);
      setLiked(v === '1');
    } catch {
      /* ignore */
    }
  }, [storageKey, currentUser]);

  // Fetch live counters (likes) to reflect DB state on cards
  useEffect(() => {
    let active = true;
    const id = project?._id || project?.slug;
    if (!id || !currentUser) return () => { active = false; };
  (async () => {
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(id)}/counters`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) return;
        if (!active) return;
    if (typeof data?.likes === 'number') setLikes(Number(data.likes));
    if (typeof data?.liked === 'boolean') setLiked(!!data.liked);
      } catch (_) { /* silent */ }
    })();
    return () => { active = false; };
  }, [project?._id, project?.slug, currentUser]);

  const toggleLike = async () => {
    if (!currentUser) { onRequireAuth?.(); return; }
    if (!project?._id || busy) return;
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      setBusy(true);
      const res = await fetch(`/api/projects/${encodeURIComponent(project._id)}/like`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to like');
      try {
        if (data?.liked) localStorage.setItem(storageKey, '1');
        else localStorage.removeItem(storageKey);
      } catch { /* ignore */ }
      if (typeof data?.liked === 'boolean') setLiked(!!data.liked);
      if (typeof data?.likes === 'number') setLikes(Number(data.likes));
    } catch (_) {
      setLiked((v) => !v);
      setLikes((n) => n + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  };
  // Helper to truncate long descriptions with an ellipsis
  const truncate = (text, limit = 100) => {
    if (!text) return '';
    const s = String(text).trim();
    return s.length > limit ? s.slice(0, Math.max(0, limit)).trimEnd() + '...' : s;
  };

  const uniqueTags = useMemo(() => {
    const arr = [
      ...(Array.isArray(project?.languages) ? project.languages : []),
      ...(Array.isArray(project?.tags) ? project.tags : []),
    ]
      .map((t) => String(t).trim())
      .filter(Boolean);
    const uniqLower = [...new Set(arr.map((t) => t.toLowerCase()))];
    return uniqLower.map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  }, [project?.languages, project?.tags]);

  const to = project._id ? `/projects/${project._id}` : `/projects/${project.slug}`;

  if (variant === 'list') {
    return (
      <article className={styles.listCard}>
        {project.coverImageUrl && (
          <Link to={to} className="block shrink-0">
            <img src={project.coverImageUrl} alt={project.title} className={styles.listThumb} />
          </Link>
        )}
        <div className={styles.listBody}>
          <div className={styles.listHeader}>
            <Link to={to} className="hover:underline">
              <h3 className={styles.listTitle}>{project.title}</h3>
            </Link>
            <div className={styles.listHeaderActions}>
              <button
                type="button"
                aria-pressed={liked}
                aria-label={liked ? 'Unlike project' : 'Like project'}
                onClick={toggleLike}
                disabled={busy}
                className={styles.likeBtn}
                title={currentUser ? `${liked ? 'Unlike' : 'Like'} • ${Number(likes) || 0} likes` : 'Sign in to like'}
              >
                <svg
                  className={styles.likeIcon}
                  width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#f43f5e' : 'none'} stroke="#fda4af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>
                </svg>
              </button>
              <div className={styles.actionGroup}>
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${styles.actionLink} ${styles.iconBtn}`}
                    aria-label="Open demo"
                    title="Open demo"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <path d="M15 3h6v6"></path>
                      <path d="M10 14 21 3"></path>
                    </svg>
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${styles.actionLink} ${styles.iconBtn}`}
                    aria-label="Open repository"
                    title="Open repository"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.3.1 2 .1 2.9 1.6 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.4-5.5-6.1 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.6.1-3.4 0 0 1-.3 3.4 1.2a11.6 11.6 0 0 1 6.2 0C18.7 3 19.8 3.3 19.8 3.3c.6 1.8.2 3.1.1 3.4.8.9 1.2 2 1.2 3.3 0 4.7-2.8 5.8-5.5 6.1.4.3.7 1 .7 2v3c0 .4.3.7.8.6A12 12 0 0 0 12 .5Z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
          {project.tagline && (
            <p className={styles.listTagline}>{truncate(project.tagline, 110)}</p>
          )}
          {uniqueTags.length > 0 && (
            <div className={styles.listTags}>
              {uniqueTags.slice(0, 4).map((tag) => (
                <span key={tag} className={`${styles.tag} ${styles.tagGradient}`}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <Link to={to} className="block">
        <div className={styles.media}>
          {project.coverImageUrl && (
            <img src={project.coverImageUrl} alt={project.title} className={styles.img} />
          )}
          <div className={styles.mediaGradient} />
        </div>
        <div className={styles.content}>
          {/* Reserve stable vertical space for header/date/title/description so tags align across cards */}
          <div className={styles.meta}>
            <div className={styles.date}>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}</div>
            <h3 className={styles.title}>{project.title}</h3>
            {/* Always render tagline block to keep height consistent, even if empty */}
            <p className={styles.tagline}>{project.tagline ? truncate(project.tagline, 80) : ''}</p>
          </div>
          <div className={styles.tagsRow}>
            {uniqueTags.slice(0, 5).map((tag) => (
              <span key={tag} className={`${styles.tag} ${styles.tagGradient}`}>{tag}</span>
            ))}
          </div>
        </div>
      </Link>
      <div className={styles.actions}>
        <button
          type="button"
          aria-pressed={liked}
          aria-label={liked ? 'Unlike project' : 'Like project'}
          onClick={toggleLike}
          disabled={busy}
          className={`${styles.likeBtn} ${styles.tagGradient}`}
          title={currentUser ? `${liked ? 'Unlike' : 'Like'} • ${Number(likes) || 0} likes` : 'Sign in to like'}
        >
          <svg
            className={styles.likeIcon}
            width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#f43f5e' : 'none'} stroke="#fda4af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>
          </svg>
        </button>
        <div className={styles.actionGroup}>
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className={`${styles.actionLink} ${styles.iconBtn}`}
              aria-label="Open demo"
              title="Open demo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <path d="M15 3h6v6"></path>
                <path d="M10 14 21 3"></path>
              </svg>
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className={`${styles.actionLink} ${styles.iconBtn}`}
              aria-label="Open repository"
              title="Open repository"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.3.1 2 .1 2.9 1.6 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.4-5.5-6.1 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.6.1-3.4 0 0 1-.3 3.4 1.2a11.6 11.6 0 0 1 6.2 0C18.7 3 19.8 3.3 19.8 3.3c.6 1.8.2 3.1.1 3.4.8.9 1.2 2 1.2 3.3 0 4.7-2.8 5.8-5.5 6.1.4.3.7 1 .7 2v3c0 .4.3.7.8.6A12 12 0 0 0 12 .5Z"/>
              </svg>
            </a>
          )}
        </div>
  </div>
    </article>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    _id: PropTypes.string,
    slug: PropTypes.string,
    title: PropTypes.string.isRequired,
    tagline: PropTypes.string,
  likes: PropTypes.number,
    coverImageUrl: PropTypes.string,
    createdAt: PropTypes.string,
    languages: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    demoUrl: PropTypes.string,
    repoUrl: PropTypes.string,
  }).isRequired,
  variant: PropTypes.oneOf(['grid', 'list']),
  onRequireAuth: PropTypes.func,
};
