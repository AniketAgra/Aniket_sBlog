import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../src/styles/components/Home.module.css';

export default function Home() {
    const [state, setState] = useState({ items: [], loading: true, error: null });
    const navigate = useNavigate();
    const [projectsState, setProjectsState] = useState({ items: [], loading: true, error: null });

    useEffect(() => {
        const load = async () => {
            try {
                // Only need 4 posts for the layout: 1 big (most liked) + 3 small (recent)
                const res = await fetch('/api/posts?limit=4');
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to load posts');
                setState({ items: data.items || [], loading: false, error: null });
            } catch (e) {
                setState({ items: [], loading: false, error: e.message });
            }
        };
        load();
    }, []);

    // Fetch projects for the projects section
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const res = await fetch('/api/projects?limit=12');
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to load projects');
                setProjectsState({ items: data.items || [], loading: false, error: null });
            } catch (e) {
                setProjectsState({ items: [], loading: false, error: e.message });
            }
        };
        loadProjects();
    }, []);

    // The latest (by date) is still used in the hero "Latest:" link
    const latestByDate = useMemo(() => state.items?.[0] || null, [state.items]);

    // Choose the most-liked post among the fetched items
    const mostLiked = useMemo(() => {
        const items = state.items || [];
        if (!items.length) return null;
        return items.reduce((max, cur) => (cur.likes > (max?.likes || 0) ? cur : max), items[0]);
    }, [state.items]);

    // Other posts: recent by createdAt, excluding the most-liked one; take up to 3
    const otherRecent = useMemo(() => {
        const items = (state.items || []).filter(p => (mostLiked ? p._id !== mostLiked._id : true));
        return items.slice(0, 3);
    }, [state.items, mostLiked]);

    // Compute most liked projects
    const topProjects = useMemo(() => {
        const items = projectsState.items || [];
        if (!items.length) return [];
        const sorted = [...items].sort((a, b) => (b.likes || 0) - (a.likes || 0));
        return sorted.slice(0, 4);
    }, [projectsState.items]);

    const featuredProject = topProjects[0];
    const otherTopProjects = topProjects.slice(1, 4);

    return (
        <div className={styles.homeRoot}>
            <div className={styles.container}>
                {/* Featured hero with the most recent post */}
                <section className={styles.hero}>
                    <div className={styles.heroShade} />
                    <div className={styles.heroContent}>
                        <div className={styles.eyebrow}>
                            <span>Tech Tales</span>
                            <span>•</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <h1 className={styles.heroTitle}>Tech Tales</h1>
                        <p className={styles.heroSubtitle}>
                            Exploring the intersection of technology, design, and culture.
                        </p>
                        <div className={styles.ctaRow}>
                            <button className={styles.buttonPrimary} onClick={() => navigate('/blog')}>Read Blog</button>
                            <button className={styles.buttonSecondary} onClick={() => navigate('/projects')}>View Projects</button>
                        </div>
                        {/* If there is a featured post, show its title as a highlight link */}
            {latestByDate && (
                            <div style={{ marginTop: '1.25rem', color: '#cbd5e1', fontSize: '.875rem' }}>
                Latest: <Link to={`/blog/${latestByDate.slug}`} style={{ color: 'wheat', fontWeight: 700 }}>{latestByDate.title}</Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Latest Posts grid */}
                <h2 className={styles.sectionTitle}>Latest Posts</h2>

                {state.loading && <div className={styles.empty}>Loading…</div>}
                {state.error && <div className={styles.empty}>Error: {state.error}</div>}

                {!state.loading && !state.error && (
                    <div className={styles.grid}>
                        {mostLiked && (
                            <Link to={`/blog/${mostLiked.slug}`} className={styles.tileLink} style={{ gridColumn: '1 / -1' }}>
                                <article className={styles.tile} style={{ minHeight: '12rem', position: 'relative' }}>
                                    {/* Most Liked badge on the right */}
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            background: '#22c55e',
                                            color: '#0b111f',
                                            fontWeight: 800,
                                            fontSize: '.75rem',
                                            padding: '6px 10px',
                                            borderRadius: '999px',
                                            letterSpacing: '.02em',
                                        }}
                                    >
                                        MOST LIKED
                                    </span>
                                    <div>
                                        <div className={styles.tileMeta}>{new Date(mostLiked.createdAt).toLocaleDateString()}</div>
                                        <h3 className={styles.tileTitle} style={{ fontSize: '1.35rem' }}>{mostLiked.title}</h3>
                                        {mostLiked.tagline && <p className={styles.tileDesc}>{mostLiked.tagline}</p>}
                                    </div>
                                    <div className={styles.tileMeta}>
                                        {/* Show likes and views if available */}
                                        {(typeof mostLiked.likes === 'number' ? `${mostLiked.likes} likes` : '')}
                                        {mostLiked.views ? ` · ${mostLiked.views} views` : ''}
                                    </div>
                                </article>
                            </Link>
                        )}

                        {otherRecent.map((p) => (
                            <Link key={p._id} to={`/blog/${p.slug}`} className={styles.tileLink}>
                                <article className={styles.tile}>
                                    <div>
                                        <div className={styles.tileMeta}>{new Date(p.createdAt).toLocaleDateString()}</div>
                                        <h3 className={styles.tileTitle}>{p.title}</h3>
                                        {p.tagline && <p className={styles.tileDesc}>{p.tagline}</p>}
                                    </div>
                                    <div className={styles.tileMeta}>
                                        {(typeof p.likes === 'number' ? `${p.likes} likes` : '')}
                                        {p.views ? ` · ${p.views} views` : ''}
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Projects section */}
                <h2 className={styles.sectionTitle} style={{ marginTop: '2.75rem' }}>Projects</h2>
                {projectsState.loading && <div className={styles.empty}>Loading…</div>}
                {projectsState.error && <div className={styles.empty}>Error: {projectsState.error}</div>}

                {!projectsState.loading && !projectsState.error && topProjects.length > 0 && (
                    <div className={styles.projectsGrid}>
                        {/* Left: featured most-liked project */}
                        {featuredProject && (
                            <a href={featuredProject.demoUrl || featuredProject.repoUrl || '#'} target="_blank" rel="noreferrer" className={styles.projectFeature}>
                                {featuredProject.coverImageUrl && (
                                    <div className={styles.projectFeatureMedia}>
                                        <img src={featuredProject.coverImageUrl} alt={featuredProject.title} />
                                    </div>
                                )}
                                <div className={styles.projectFeatureBody}>
                                    <div className={styles.tileMeta}>{new Date(featuredProject.createdAt).toLocaleDateString()}</div>
                                    <h3 className={styles.tileTitle} style={{ fontSize: '1.25rem' }}>{featuredProject.title}</h3>
                                    {featuredProject.tagline && <p className={styles.tileDesc}>{featuredProject.tagline}</p>}
                                    <div className={styles.tileMeta}>
                                        {(typeof featuredProject.likes === 'number' ? `${featuredProject.likes} likes` : '')}
                                        {featuredProject.views ? ` · ${featuredProject.views} views` : ''}
                                    </div>
                                </div>
                            </a>
                        )}

                        {/* Right: remaining top 3 stacked */}
                        <div className={styles.projectList}>
                            {otherTopProjects.map(p => (
                                <a key={p._id} href={p.demoUrl || p.repoUrl || '#'} target="_blank" rel="noreferrer" className={styles.projectListItem}>
                                    {p.coverImageUrl && (
                                        <div className={styles.projectThumb}><img src={p.coverImageUrl} alt={p.title} /></div>
                                    )}
                                    <div className={styles.projectListBody}>
                                        <div className={styles.tileMeta}>{new Date(p.createdAt).toLocaleDateString()}</div>
                                        <h4 className={styles.tileTitle}>{p.title}</h4>
                                        {p.tagline && <p className={styles.tileDesc}>{p.tagline}</p>}
                                        <div className={styles.tileMeta}>
                                            {(typeof p.likes === 'number' ? `${p.likes} likes` : '')}
                                            {p.views ? ` · ${p.views} views` : ''}
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Author spotlight section */}
                <section aria-labelledby="author-spotlight" style={{ marginTop: '3rem', background: '#1f1630', borderRadius: '14px', padding: '24px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '999px', overflow: 'hidden', background: '#2a2142', flex: '0 0 auto' }}>
                            <img src="https://i.pravatar.cc/144?img=47" alt="Sophia Carter avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: '1 1 420px', minWidth: 220 }}>
                            <h3 id="author-spotlight" style={{ margin: 0, color: '#e2e8f0', fontSize: '1.125rem' }}>Sophia Carter</h3>
                            <p style={{ margin: '6px 0 0 0', color: '#9aa3b2', lineHeight: 1.5 }}>
                                Tech enthusiast, writer, and designer. Passionate about exploring the latest trends and innovations in technology.
                            </p>
                            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                                <a href="#" aria-label="X (Twitter)" style={{ color: '#94a3b8' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2H21.5l-7.54 8.61L23 22h-7.21l-5.64-6.49L3.6 22H.34l8.05-9.2L1 2h7.28l5.08 5.77L18.24 2Zm-1.26 18h2.01L7.11 4H5.01L16.98 20Z"/></svg>
                                </a>
                                <a href="#" aria-label="GitHub" style={{ color: '#94a3b8' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5A11.5 11.5 0 0 0 .5 12.3c0 5.23 3.4 9.67 8.13 11.24.6.12.82-.26.82-.58v-2.1c-3.3.73-4-1.58-4-1.58-.55-1.43-1.33-1.8-1.33-1.8-1.08-.75.08-.73.08-.73 1.2.08 1.83 1.26 1.83 1.26 1.07 1.86 2.82 1.32 3.5 1 .1-.8.42-1.32.76-1.62-2.64-.31-5.43-1.36-5.43-6.06 0-1.34.46-2.44 1.24-3.3-.13-.3-.54-1.55.12-3.22 0 0 1-.33 3.3 1.25a11.3 11.3 0 0 1 6 0c2.29-1.58 3.29-1.25 3.29-1.25.66 1.67.25 2.92.12 3.22.78.86 1.24 1.96 1.24 3.3 0 4.72-2.8 5.74-5.46 6.04.43.38.81 1.1.81 2.22v3.29c0 .33.22.71.82.59A11.5 11.5 0 0 0 23.5 12.3 11.5 11.5 0 0 0 12 .5Z"/></svg>
                                </a>
                                <a href="#" aria-label="LinkedIn" style={{ color: '#94a3b8' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5.001 2.5 2.5 0 0 0 0-5Zm.02 5.75H2V22h3V9.25Zm6 0H8.98V22H12V15c0-1.86.35-3.67 2.66-3.67 2.27 0 2.3 2.12 2.3 3.78V22H20v-7.52c0-3.67-1.97-5.38-4.6-5.38-2.11 0-3.04 1.15-3.4 1.95h-.04V9.25Z"/></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

