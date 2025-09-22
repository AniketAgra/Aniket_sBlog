import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import mdStyles from '../styles/components/MarkdownContent.module.css';
import styles from '../styles/components/PostDetail.module.css';
import PropTypes from 'prop-types';

function Tag({ label }) {
  return <span className={styles.tag}>{label}</span>;
}

Tag.propTypes = { label: PropTypes.string.isRequired };

export default function ProjectDetail() {
  const { slug, id } = useParams();
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
    const key = typeof id === 'string' && id.length ? id : slug;
    const res = await fetch(`/api/projects/${encodeURIComponent(key)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to load project');
        if (active) setState({ data, loading: false, error: null });
      } catch (e) {
        if (active) setState({ data: null, loading: false, error: e.message });
      }
    })();
    return () => { active = false; };
  }, [slug, id]);

  const tagList = useMemo(() => {
    const d = state.data;
    if (!d) return [];
    const arr = [
      ...(Array.isArray(d.languages) ? d.languages : []),
      ...(Array.isArray(d.tags) ? d.tags : []),
      ...(Array.isArray(d.keywords) ? d.keywords : []),
    ].map(String);
    const uniq = Array.from(new Set(arr.map((t) => t.trim()).filter(Boolean)));
    return uniq.map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
  }, [state.data]);

  if (state.loading) return <div className={styles.centerBox}>Loading…</div>;
  if (state.error) return (
    <div className={styles.centerBox}>
      <div className={styles.error}>{state.error}</div>
      <Link className={styles.button} to="/projects">Back to projects</Link>
    </div>
  );
  if (!state.data) return null;

  const p = state.data;

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

      <section className={styles.content}>
        <ReactMarkdown className={mdStyles.markdown} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {String(p.content || '')}
        </ReactMarkdown>
      </section>

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
