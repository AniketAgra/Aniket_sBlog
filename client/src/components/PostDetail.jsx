import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import mdStyles from '../styles/components/MarkdownContent.module.css';
import styles from '../styles/components/PostDetail.module.css';

function TagBadge({ label }) {
  return (
    <span className={styles.tag}>
      {label}
    </span>
  );
}
TagBadge.propTypes = { label: PropTypes.string.isRequired };

export default function PostDetail() {
  const { slug, id } = useParams();
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
    const key = typeof id === 'string' && id.length ? id : slug;
    const res = await fetch(`/api/posts/${encodeURIComponent(key)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to load post');
        if (active) setState({ data, loading: false, error: null });
      } catch (e) {
        if (active) setState({ data: null, loading: false, error: e.message });
      }
    })();
    return () => { active = false; };
  }, [slug, id]);

  const tagList = useMemo(() => {
    if (!state.data) return [];
    const arr = [
      ...(Array.isArray(state.data.languages) ? state.data.languages : []),
      ...(Array.isArray(state.data.tags) ? state.data.tags : []),
      ...(Array.isArray(state.data.keywords) ? state.data.keywords : []),
    ].map(String);
    const uniq = Array.from(new Set(arr.map((t) => t.trim()).filter(Boolean)));
    return uniq.map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
  }, [state.data]);

  if (state.loading) {
    return (
      <div className={styles.centerBox}>Loading…</div>
    );
  }

  if (state.error) {
    return (
      <div className={styles.centerBox}>
        <div className={styles.error}>{state.error}</div>
        <Link className={styles.button} to="/posts">Back to articles</Link>
      </div>
    );
  }

  if (!state.data) return null;

  const post = state.data;

  return (
    <article className={styles.container}>
      <nav className={styles.breadcrumbs}>
        <Link to="/" className={styles.breadcrumbLink}>Home</Link>
        <span className={styles.separator}>/</span>
        <Link to="/posts" className={styles.breadcrumbLink}>Articles</Link>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>
        {post.tagline && <p className={styles.tagline}>{post.tagline}</p>}
        <div className={styles.metaRow}>
          <div className={styles.metaLeft}>
            {post.authorName && <span>{post.authorName}</span>}
            {post.createdAt && (
              <span>
                <span className={styles.dot}>•</span>
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            )}
            {typeof post.views === 'number' && (
              <span>
                <span className={styles.dot}>•</span>
                {post.views} views
              </span>
            )}
          </div>
          {tagList.length > 0 && (
            <div className={styles.tagsRow}>
              {tagList.map((t) => (
                <TagBadge key={t} label={t} />
              ))}
            </div>
          )}
        </div>
        {post.coverImageUrl && (
          <div className={styles.coverWrap}>
            <img src={post.coverImageUrl} alt={post.title} className={styles.cover} />
          </div>
        )}
      </header>

      <section className={styles.content}>
        <ReactMarkdown
          className={mdStyles.markdown}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {String(post.content || '')}
        </ReactMarkdown>
      </section>

      {Array.isArray(post.comments) && post.comments.length > 0 && (
        <section className={styles.comments}>
          <h2 className={styles.sectionTitle}>Comments</h2>
          <ul className={styles.commentList}>
            {post.comments.map((c) => (
              <li key={c._id} className={styles.commentItem}>
                <div className={styles.commentHead}>
                  <strong>{c.username || 'Anonymous'}</strong>
                  <span className={styles.commentDate}>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className={styles.commentBody}>{c.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className={styles.footerBar}>
        <Link to="/posts" className={styles.buttonSecondary}>← Back to Articles</Link>
        {post.demoUrl && (
          <a href={post.demoUrl} target="_blank" rel="noreferrer" className={styles.button}>
            View Demo
          </a>
        )}
      </footer>
    </article>
  );
}
