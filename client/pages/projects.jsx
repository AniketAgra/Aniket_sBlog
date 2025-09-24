import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import SignInPrompt from '../src/components/SignInPrompt';
import { Pagination, ProjectCard, ProjectsFilterBar } from '../src/components';
import useProjectsQuery from '../src/hooks/useProjectsQuery';
import styles from '../src/styles/components/Projects.module.css';

export default function Projects() {
  const currentUser = useSelector((s) => s.user?.currentUser);
  const [showPrompt, setShowPrompt] = useState(false);
  const {
    items,
    loading,
    error,
    page,
    totalPages,
    facets,
    query,
    setPage,
    setSort,
    setQ,
    setView,
    toggleFilter,
    clearFilters,
  } = useProjectsQuery({ limit: 9, sort: 'newest', order: 'desc', view: 'grid' });

  // Client-side fallback search (mirrors posts page behavior)
  const visibleItems = useMemo(() => {
    const qText = String(query.q || '').trim().toLowerCase();
    if (!qText) return items;
    const tokens = Array.from(new Set(qText.split(/\s+/).filter(Boolean)));
    if (!tokens.length) return items;
    return items.filter((p) => {
      const haystack = [
        String(p.title || ''),
        String(p.tagline || ''),
        ...(Array.isArray(p.tags) ? p.tags : []).map(String),
        ...(Array.isArray(p.languages) ? p.languages : []).map(String),
        ...(Array.isArray(p.keywords) ? p.keywords : []).map(String),
      ]
        .join(' ')
        .toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }, [items, query.q]);

  return (
    <div className={styles.projectsContainer}>
      <div className={styles.contentWrapper}>
        {/* Gradient hero with centered title and search/filter inside */}
  <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-900/20 via-purple-900/20 to-cyan-900/20 px-5 py-10 shadow-glow sm:px-7 sm:py-12 mb-6 sm:mb-8">
          {/* soft radial glow backdrop */}
          <span aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.22),transparent_70%)]" />
          <span aria-hidden className="pointer-events-none absolute -bottom-40 left-8 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.18),transparent_70%)] blur-md" />
          {/* right-side glow similar to posts page */}
          <span aria-hidden className="pointer-events-none absolute -z-10 right-[-120px] top-[-60px] h-[420px] w-[540px] rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.28),transparent_70%)] blur-[42px]" />

          <header className="sm:mt-8 mb-4 text-center sm:mb-5">
            <h1 className="inline-block mx-auto text-5xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 via-purple-400 to-sky-400 bg-clip-text text-transparent [-webkit-text-fill-color:transparent] [-webkit-background-clip:text] sm:text-6xl">
              My Projects .
            </h1>
            <p className="mx-auto mt-2 max-w-3xl text-sm text-gray-300">
              Explore a selection of my recent projects, showcasing my skills and experience in web and mobile development.
            </p>
          </header>

          <ProjectsFilterBar
            q={query.q}
            onQ={setQ}
            sort={query.sort}
            onSort={setSort}
            view={query.view}
            onView={setView}
            facets={facets}
            activeTags={query.tags || []}
            activeLanguages={query.languages || []}
            onToggleTag={(v) => toggleFilter('tags', v)}
            onToggleLanguage={(v) => toggleFilter('languages', v)}
            onClear={clearFilters}
          />
        </section>

      {loading && <div className="text-gray-400">Loading…</div>}
      {error && <div className="text-red-400">{error}</div>}

  {!loading && !error && visibleItems.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-gray-300">No projects found.</div>
      )}

  {visibleItems.length > 0 && (() => {
        const gated = currentUser ? visibleItems : visibleItems.slice(0, 3);
        return (
          query.view === 'list' ? (
            <div className="flex flex-col gap-3 my-4 sm:my-6">
              {gated.map((p) => (<ProjectCard key={p._id || p.slug} project={p} variant="list" />))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 my-4 sm:my-6">
              {gated.map((p) => (<ProjectCard key={p._id || p.slug} project={p} variant="grid" />))}
            </div>
          )
        );
      })()}

      {/* Show more CTA for signed-out users */}
      {!currentUser && visibleItems.length > 3 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowPrompt(true)}
            className="rounded-full border border-fuchsia-600/40 bg-gradient-to-b from-violet-600/20 to-indigo-500/15 px-4 py-2 font-bold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition hover:border-fuchsia-600/60 hover:shadow-[0_0_0_3px_rgba(147,51,234,0.16),0_8px_20px_rgba(99,102,241,0.18)]"
          >
            Show more
          </button>
        </div>
      )}

      {currentUser && (
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      )}

      {showPrompt && !currentUser && (
        <div className="mt-10">
          <SignInPrompt onClose={() => setShowPrompt(false)} message="Create a free account or sign in to view all projects and interact with them." />
        </div>
      )}
    </div>
    </div>
  );
}
