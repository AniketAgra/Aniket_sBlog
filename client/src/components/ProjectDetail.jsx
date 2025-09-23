import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import mdStyles from '../styles/components/MarkdownContent.module.css';
import stylesBase from '../styles/components/PostDetail.module.css';
import stylesProject from '../styles/components/ProjectDetail.module.css';
// Merge base and project CSS modules so we can add light project-only overrides
const styles = new Proxy({}, {
  get: (_, prop) => [stylesBase?.[prop], stylesProject?.[prop]].filter(Boolean).join(' '),
});
import PropTypes from 'prop-types';
import CommentsList from './CommentsList';
import { useSelector } from 'react-redux';
import SignInPrompt from './SignInPrompt';

function Tag({ label }) {
  return <span className={styles.tag}>{label}</span>;
}

Tag.propTypes = { label: PropTypes.string.isRequired };

export default function ProjectDetail() {
  const { slug, id } = useParams();
  const currentUser = useSelector((s) => s.user?.currentUser);
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    let active = true;
    if (!currentUser) { setState({ data: null, loading: false, error: null }); return; }
    (async () => {
      try {
    const key = typeof id === 'string' && id.length ? id : slug;
    const res = await fetch(`/api/projects/${encodeURIComponent(key)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to load project');
        if (active) {
          setState({ data, loading: false, error: null });
          setLiked(!!data.liked);
          setLikes(Number(data.likes || 0));
        }
      } catch (e) {
        if (active) setState({ data: null, loading: false, error: e.message });
      }
    })();
    return () => { active = false; };
  }, [slug, id, currentUser]);

  // Lightweight polling to keep likes and comments fresh
  useEffect(() => {
    let active = true;
    const key = typeof id === 'string' && id.length ? id : slug;
    if (!key) return undefined;
    if (!currentUser) return undefined;
  const tick = async () => {
      try {
    const res = await fetch(`/api/projects/${encodeURIComponent(key)}/counters`);
    const data = await res.json();
        if (!res.ok) return;
        if (!active) return;
  setState(prev => {
          if (!prev?.data) return { data: data, loading: false, error: null };
          return {
            ...prev,
            data: {
              ...prev.data,
        likes: data.likes ?? prev.data.likes,
        commentsCount: data.commentsCount ?? prev.data.commentsCount,
            },
          };
        });
  if (typeof data.likes === 'number') setLikes(Number(data.likes));
      } catch (_) { /* ignore */ }
    };
    const h = setInterval(tick, 10000);
    tick();
    return () => { active = false; clearInterval(h); };
  }, [slug, id, currentUser]);

  const tagList = useMemo(() => {
    // Merge tags/languages/keywords from DB and make them unique (case-insensitive)
    const d = state.data;
    if (!d) return [];
    const arr = [
      ...(Array.isArray(d.languages) ? d.languages : []),
      ...(Array.isArray(d.tags) ? d.tags : []),
      ...(Array.isArray(d.keywords) ? d.keywords : []),
    ]
      .map((t) => String(t).trim())
      .filter(Boolean);

    const uniqLower = [...new Set(arr.map((t) => t.toLowerCase()))];
    return uniqLower.map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  }, [state.data]);

  if (!currentUser) {
    return (
      <div className={styles.centerBox}>
        <SignInPrompt message="To view this project and its comments, please sign in or create an account." />
      </div>
    );
  }

  if (state.loading) return <div className={styles.centerBox}>Loading…</div>;
  if (state.error) return (
    <div className={styles.centerBox}>
      <div className={styles.error}>{state.error}</div>
      <Link className={styles.button} to="/projects">Back to projects</Link>
    </div>
  );
  if (!state.data) return null;

  const p = state.data;

  const onToggleLike = async () => {
    if (!p?._id) return;
    setLiked((v) => !v);
    setLikes((n) => n + (liked ? -1 : 1));
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(p._id)}/like`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to like');
      setLikes(Number(data.likes || 0));
      if (typeof data.liked === 'boolean') setLiked(!!data.liked);
    } catch (_) {
      setLiked((v) => !v);
      setLikes((n) => n + (liked ? -1 : 1));
    }
  };

  const normalizeMarkdown = (str) => {
    if (!str) return '';
    let s = String(str);
    s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    s = s.replace(/\r\n/g, '\n');
    return s;
  };

  return (
    <article className={styles.container}>
      <nav className={styles.breadcrumbs}>
        <Link to="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.separator}>/</span>
        <Link to="/projects" className={styles.breadcrumbLink}>Projects</Link>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>{p.title}</h1>
        {p.tagline && <p className={styles.tagline}>{p.tagline}</p>}
        <div className={styles.metaRow}>
          <div className={styles.metaLeft}>
            {p.authorName && <span>{p.authorName}</span>}
            {p.createdAt && (<span><span className={styles.dot}>•</span>{new Date(p.createdAt).toLocaleDateString()}</span>)}
            {typeof p.views === 'number' && (<span><span className={styles.dot}>•</span>{p.views} views</span>)}
          </div>
          {tagList.length > 0 && (
            <div className={styles.tagsRow}>
              {tagList.map((t) => <Tag key={t} label={t} />)}
            </div>
          )}
        </div>
        {p.coverImageUrl && (
          <div className={styles.coverWrap}>
            <img src={p.coverImageUrl} alt={p.title} className={styles.cover} />
          </div>
        )}
      </header>

      <div className={styles.actionBar}>
        <div className={styles.actionLeft}>
          <button type="button" className={`${styles.iconButton} ${liked ? styles.heartActive : ''}`} title={liked ? 'Unlike' : 'Like'} onClick={onToggleLike}>
            {/* Heart icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 21s-6.716-4.438-9.243-7.273C.615 11.32 1.028 7.97 3.343 6.15a5 5 0 016.657.516L12 8.8l2-2.134a5 5 0 016.657-.516c2.315 1.82 2.728 5.17.586 7.577C18.716 16.562 12 21 12 21z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className={styles.actionCount}>{Number(likes)}</span>
          </button>
          <a href="#comments" className={styles.iconButton} title="Comments">
            {/* Comment icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 12a8 8 0 01-8 8H6l-3 3V12a8 8 0 018-8h2a8 8 0 018 8z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <span className={styles.actionCount}>{Array.isArray(p.comments) ? p.comments.length : Number(p.commentsCount ?? 0)}</span>
          </a>
        </div>
        <div className={styles.actionRight}>
          <span className={styles.shareLabel}>Share:</span>
          <button type="button" className={styles.iconButton} onClick={async () => {
            try {
              const url = typeof window !== 'undefined' ? window.location.href : '';
              const title = p?.title || 'Check this out';
              if (navigator.share) { await navigator.share({ title, url }); return; }
              await navigator.clipboard.writeText(url);
              alert('Link copied to clipboard');
            } catch (err) { console.error(err); }
          }} title="Share">
            {/* Share icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
      </div>

  <section className={styles.content}>
        <ReactMarkdown className={mdStyles.markdown} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {normalizeMarkdown(p.content)}
        </ReactMarkdown>
      </section>

  {/* Comments */}
  <CommentsList entityType="project" entityKey={typeof id === 'string' && id.length ? id : (slug || String(p._id || ''))} />

      <footer className={styles.footerBar}>
        <Link to="/projects" className={styles.buttonSecondary}>← Back to Projects</Link>
        {p.demoUrl && (
          <a href={p.demoUrl} target="_blank" rel="noreferrer" className={styles.button}>View Demo</a>
        )}
        {p.repoUrl && (
          <a href={p.repoUrl} target="_blank" rel="noreferrer" className={styles.button}>View Repo</a>
        )}
      </footer>
    </article>
  );
}
