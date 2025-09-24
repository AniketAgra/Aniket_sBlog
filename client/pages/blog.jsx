import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { BlogCard, BlogSearchFilter, SignInPrompt } from '../src/components';
import styles from '../src/styles/components/Blog.module.css';

export default function Blog() {
  const [state, setState] = useState({ items: [], loading: true, error: null });
  const [filters, setFilters] = useState({ q: '', category: 'all', sort: 'newest' });
  const [showPrompt, setShowPrompt] = useState(false);
  const currentUser = useSelector((s) => s.user?.currentUser);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/posts');
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data?.error?.message || data?.message || 'Failed to load posts'
          );
        setState({ items: data.items || [], loading: false, error: null });
      } catch (e) {
        setState({ items: [], loading: false, error: e.message });
      }
    };
    load();
  }, []);

  // Build filtered list with case-insensitive AND matching across title, tagline, tags, and languages
  const filteredItems = useMemo(() => {
    const q = String(filters.q || '').trim().toLowerCase();
    const selected = String(filters.category || 'all').toLowerCase();

    // Split query into distinct tokens for AND matching
    const tokens = q ? Array.from(new Set(q.split(/\s+/).filter(Boolean))) : [];

    return state.items.filter((p) => {
      // Normalize arrays (tags + languages) to lower-case strings
      const tagsLower = [
        ...((Array.isArray(p.tags) ? p.tags : []).map((t) => String(t).toLowerCase())),
        ...((Array.isArray(p.languages) ? p.languages : []).map((t) => String(t).toLowerCase())),
        ...((Array.isArray(p.keywords) ? p.keywords : []).map((t) => String(t).toLowerCase())),
      ];

      // Category filter: match against any tag/language/keyword when not 'all'
      if (selected && selected !== 'all') {
        if (!tagsLower.includes(selected)) return false;
      }

      // Text search across title, tagline, tags, languages, and keywords
      if (tokens.length > 0) {
        const haystack = [
          String(p.title || ''),
          String(p.tagline || ''),
          ...(Array.isArray(p.tags) ? p.tags : []).map(String),
          ...(Array.isArray(p.languages) ? p.languages : []).map(String),
          ...(Array.isArray(p.keywords) ? p.keywords : []).map(String),
        ]
          .join(' ')
          .toLowerCase();

        // Require every token to be present (AND match)
        if (!tokens.every((t) => haystack.includes(t))) return false;
      }

      return true;
    });
  }, [state.items, filters.q, filters.category]);

  // Apply sorting based on selected sort option
  const sortedItems = useMemo(() => {
    const arr = [...filteredItems];
    const s = String(filters.sort || 'newest');
    const byDate = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    const byDateAsc = (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    const byTitle = (a, b) => String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' });
    const byTitleDesc = (a, b) => -byTitle(a, b);
    const byLikes = (a, b) => (b.likes || 0) - (a.likes || 0);
    switch (s) {
      case 'oldest':
        return arr.sort(byDateAsc);
      case 'az':
        return arr.sort(byTitle);
      case 'za':
        return arr.sort(byTitleDesc);
      case 'liked':
        return arr.sort(byLikes);
      case 'newest':
      default:
        return arr.sort(byDate);
    }
  }, [filteredItems, filters.sort]);

  return (
    <div className={styles.blogContainer}>
      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 id="blog-heading" className={styles.title}>
              Latest Articles
            </h1>
            <p className={styles.description}>
              Explore insights, tutorials and reflections on the latest in
              technology.
            </p>
          </div>
        </header>

        <div className={styles.divider} aria-hidden="true" />

        {/* Category filter */}
        <div className={styles.filterBar}>
          <BlogSearchFilter value={filters} onChange={setFilters} />
        </div>

        {state.loading && (
          <div className={styles.loadingContainer} role="status" aria-live="polite">
            <span className={styles.srOnly}>Loading posts</span>
            <div className={styles.loadingText}>Loading…</div>
          </div>
        )}

        {state.error && (
          <div className={styles.errorContainer} role="alert">
            <div className={styles.errorText}>{state.error}</div>
          </div>
        )}

  {!state.loading && !state.error && sortedItems.length === 0 && (
          <div className={styles.emptyState} role="status">No related posts found.</div>
        )}

        {/* Grid of posts with gating for unauthenticated users */}
        <section aria-labelledby="blog-heading" className={styles.grid}>
          {(currentUser ? sortedItems : sortedItems.slice(0, 3)).map((post) => (
            <BlogCard key={post._id} post={post} onRequireAuth={() => setShowPrompt(true)} />
          ))}
        </section>

        {/* Show more button for logged-out users when there are more posts */}
        {!currentUser && filteredItems.length > 3 && (
          <div className={styles.showMoreWrap}>
            <button
              type="button"
              onClick={() => setShowPrompt(true)}
              className={styles.showMoreBtn}
            >
              Show more
            </button>
          </div>
        )}

        {/* Inline sign-in prompt */}
        {showPrompt && !currentUser && (
          <SignInPrompt onClose={() => setShowPrompt(false)} message="Create a free account or sign in to view all blog posts and interact (like, comment)." />
        )}

      </div>
    </div>
  );
}
