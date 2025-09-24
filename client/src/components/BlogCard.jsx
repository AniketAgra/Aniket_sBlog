import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from '../styles/components/BlogCard.module.css';
// SignInPrompt is rendered by parent page; this component only signals via onRequireAuth

// Capitalize the first letter, rest lowercase
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Map a tag to an HSL hue in the site theme band (violet → pink).
function hueForTag(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash << 5) - hash + tag.charCodeAt(i);
    hash |= 0;
  }
  // Wider but still on-brand hue range (260–330): indigo→violet→magenta
  const min = 260;
  const max = 330;
  const span = max - min;
  const n = Math.abs(hash) % 1000;
  let h = Math.round(min + (n / 1000) * span);
  // Light keyword bias for cleaner associations
  const t = tag.toLowerCase();
  if (t.includes('react') || t.includes('next')) h = 300; // pinkish
  if (t === 'ts' || t.includes('typescript') || t.includes('node')) h = 265; // indigo-cyan tilt
  return h;
}

export default function BlogCard({ post, onRequireAuth }) {
  const currentUser = useSelector((s) => s.user?.currentUser);
  // Like state persisted per post
  const storageKey = useMemo(() => {
    const id = post?._id || post?.slug || post?.title || 'unknown';
    return `liked:post:${id}`;
  }, [post?._id, post?.slug, post?.title]);

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(typeof post?.likes === 'number' ? Number(post.likes) : 0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    // Only reflect saved like state for authenticated users
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
    const id = post?._id || post?.slug;
    if (!id || !currentUser) return () => { active = false; };
  (async () => {
      try {
    const res = await fetch(`/api/posts/${encodeURIComponent(id)}/counters`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) return;
        if (!active) return;
        if (typeof data?.likes === 'number') setLikes(Number(data.likes));
    if (typeof data?.liked === 'boolean') setLiked(!!data.liked);
      } catch (_) {
        // silent
      }
    })();
    return () => { active = false; };
  }, [post?._id, post?.slug, currentUser]);

  const onToggleLike = async (e) => {
    // Prevent Link navigation when clicking the like button
    e.preventDefault();
    e.stopPropagation();
  if (!currentUser) { onRequireAuth?.(); return; }
    if (!post?._id || busy) return;
    // optimistic toggle
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      setBusy(true);
      const res = await fetch(`/api/posts/${encodeURIComponent(post._id)}/like`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to like');
      // sync local storage to reflect server state
      // try {
      //   if (data?.liked) localStorage.setItem(storageKey, '1');
      //   else localStorage.removeItem(storageKey);
      // } catch {
      //   /* ignore */
      // }
      if (typeof data?.liked === 'boolean') setLiked(!!data.liked);
      if (typeof data?.likes === 'number') setLikes(Number(data.likes));
    } catch (_) {
      // revert on failure
      setLiked((v) => !v);
      setLikes((n) => n + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  };
  // Short excerpt from markdown
  const getExcerpt = (content) => {
    if (!content) return '';
    const stripped = content.replace(/[#*`]/g, '');
    return stripped.length > 150 ? stripped.slice(0, 150) + '…' : stripped;
  };

  // Merge tags + languages, remove dupes (case-insensitive), capitalize
  const allTags = [
    ...(Array.isArray(post.languages) ? post.languages : []),
    ...(Array.isArray(post.tags) ? post.tags : [])
  ];
  const uniqueCapitalizedTags = [
    ...new Set(allTags.map(t => t.toLowerCase()))
  ].map(capitalize);

  return (
    <>
  <Link to={`/posts/${post._id}` } className={styles.cardLink}>
      <div className={styles.cardContent}>
        {post.coverImageUrl && (
          <div className={styles.imageContainer}>
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className={styles.cardImage}
            />
            <div className={styles.imageOverlay} />
          </div>
        )}

        <div className={styles.cardBody}>
          <div className={styles.cardMeta}>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            {post.views && <span className={styles.metaDivider}>•</span>}
            {post.views && <span>{post.views} views</span>}
          </div>

          <h2 className={styles.cardTitle}>{post.title}</h2>

          {post.tagline ? (
            <p className={styles.cardTagline}>{post.tagline}</p>
          ) : (
            post.content && (
              <p className={styles.cardExcerpt}>{getExcerpt(post.content)}</p>
            )
          )}

          {uniqueCapitalizedTags.length > 0 && (
            <div className={styles.tagsContainer}>
              {uniqueCapitalizedTags.map((tag) => (
                <span
                  key={tag}
                  className={`${styles.tag} ${styles.tagPill}`}
                  style={{ '--h': hueForTag(tag) }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom-right like button (stays within card, doesn't navigate) */}
        <button
          type="button"
          className={styles.likeFab}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike post' : 'Like post'}
          title={currentUser ? `${liked ? 'Unlike' : 'Like'} • ${Number(likes) || 0} likes` : 'Sign in to like'}
          onClick={onToggleLike}
          disabled={busy}
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill={liked ? '#f43f5e' : 'none'} stroke="#fda4af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>
          </svg>
        </button>
      </div>
    </Link>
    </>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string,
    slug: PropTypes.string,
    title: PropTypes.string.isRequired,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    views: PropTypes.number,
  likes: PropTypes.number,
    tagline: PropTypes.string,
    content: PropTypes.string,
    coverImageUrl: PropTypes.string,
    languages: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onRequireAuth: PropTypes.func,
};
