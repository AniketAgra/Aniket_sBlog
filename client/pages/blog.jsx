import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { BlogCard, BlogSearchFilter, SignInPrompt } from '../src/components';
import styles from '../src/styles/components/Blog.module.css';

export default function Blog() {
  const [state, setState] = useState({ items: [], loading: true, error: null });
  const [filters, setFilters] = useState({ q: '', category: 'all' });
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
  }, [state.items, filters]);

  return (
    <div className={styles.blogContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              Latest Articles
            </h1>
            <p className={styles.description}>
              Explore insights, tutorials and reflections on the latest in
              technology.
            </p>
          </div>
        </div>

  {/* Category filter */}
        <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <BlogSearchFilter
            value={filters}
            onChange={setFilters}
          />
        </div>

        {state.loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingText}>Loading…</div>
          </div>
        )}

        {state.error && (
          <div className={styles.errorContainer}>
            <div className={styles.errorText}>{state.error}</div>
          </div>
        )}

        {/* Grid of posts with gating for unauthenticated users */}
        <div className={styles.grid}>
          {(currentUser ? filteredItems : filteredItems.slice(0, 3)).map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>

        {/* Show more button for logged-out users when there are more posts */}
        {!currentUser && filteredItems.length > 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowPrompt(true)}
              style={{
                background: '#111827',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Show more
            </button>
          </div>
        )}

        {/* Inline sign-in prompt */}
        {showPrompt && !currentUser && (
          <SignInPrompt onClose={() => setShowPrompt(false)} message="Create a free account or sign in to view all blog posts." />
        )}
        
      </div>
    </div>
  );
}
