import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import SignInPrompt from '../src/components/SignInPrompt';
import { Pagination, ProjectCard, ProjectsFilterBar } from '../src/components';
import useProjectsQuery from '../src/hooks/useProjectsQuery';

export default function Projects() {
  const currentUser = useSelector((s) => s.user?.currentUser);
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-6 text-center sm:mb-8">
        <h1 className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-4xl">
          My Projects
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

      {loading && <div className="text-gray-400">Loading…</div>}
      {error && <div className="text-red-400">{error}</div>}

  {!loading && !error && visibleItems.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-gray-300">No projects found.</div>
      )}

  {visibleItems.length > 0 && (
        query.view === 'list' ? (
          <div className="flex flex-col gap-3">
    {visibleItems.map((p) => (<ProjectCard key={p._id || p.slug} project={p} variant="list" />))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
    {visibleItems.map((p) => (<ProjectCard key={p._id || p.slug} project={p} variant="grid" />))}
          </div>
        )
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {!currentUser && (
        <div className="mt-10">
          <SignInPrompt message="Create a free account or sign in to like and comment on projects." />
        </div>
      )}
    </div>
  );
}
