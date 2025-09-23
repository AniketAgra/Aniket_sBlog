import PropTypes from 'prop-types';
import SelectMenu from './SelectMenu';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'title', label: 'Title A→Z' },
];

export default function ProjectsFilterBar({
  q,
  onQ,
  sort,
  onSort,
  view,
  onView,
  facets,
  activeTags = [],
  activeLanguages = [],
  onToggleTag,
  onToggleLanguage,
  onClear,
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1">
          {/* Single gradient border without inner ring to avoid double outline */}
          <div className="group relative rounded-3xl bg-gradient-to-r from-fuchsia-600/30 via-purple-600/30 to-cyan-600/30 p-[1.5px]">
            {/* Input shell */}
            <div className="relative flex items-center rounded-3xl bg-slate-900/60 backdrop-blur-md transition-colors group-hover:bg-slate-900/70 group-focus-within:bg-slate-900/70">
              {/* search icon */}
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              </span>

              <input
                type="search"
                placeholder="Search projects..."
                value={q || ''}
                onChange={(e) => onQ(e.target.value)}
                className="w-full rounded-3xl bg-transparent py-2.5 pl-11 pr-10 text-sm text-gray-100 placeholder:text-gray-400 outline-none border-0 ring-0 focus:outline-none focus:ring-0"
                aria-label="Search projects"
              />

              {/* clear button */}
              {q ? (
                <button
                  type="button"
                  onClick={() => onQ('')}
                  title="Clear search"
                  className="absolute right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/40"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.3 5.71L12 12.01l-6.3-6.3-1.4 1.41 6.29 6.29-6.3 6.3 1.41 1.41 6.3-6.3 6.29 6.29 1.41-1.41-6.3-6.3 6.3-6.29z"/></svg>
                  <span className="sr-only">Clear search</span>
                </button>
              ) : null}

              {/* subtle focus ring using shadow to avoid double border */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl ring-0 shadow-none group-focus-within:shadow-[0_0_0_2px_rgba(217,70,239,0.35)]"></span>
            </div>
          </div>
        </div>
        <SelectMenu options={sortOptions} value={sort} onChange={onSort} className="min-w-[9rem]" />
        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            title="Grid view"
            onClick={() => onView('grid')}
            className={`rounded-md p-2 text-gray-300 hover:bg-white/5 ${view === 'grid' ? 'bg-white/10 text-white' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 8v-8h8v8h-8z"/></svg>
          </button>
          <button
            type="button"
            title="List view"
            onClick={() => onView('list')}
            className={`rounded-md p-2 text-gray-300 hover:bg-white/5 ${view === 'list' ? 'bg-white/10 text-white' : ''}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>
          </button>
        </div>
      </div>

      {(facets?.tags?.length || facets?.languages?.length) && (
        <div className="-mx-1 mt-1 flex flex-wrap gap-2 sm:mx-0 sm:mt-0">
          {facets.languages?.slice(0, 10).map((l) => {
            const active = activeLanguages.includes(l.value);
            return (
              <button key={`lang-${l.value}`} type="button" onClick={() => onToggleLanguage(l.value)} className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset transition ${active ? 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30' : 'bg-white/5 text-gray-200 ring-white/10 hover:bg-white/10'}`}>
                {l.value}
              </button>
            );
          })}
          {facets.tags?.slice(0, 12).map((t) => {
            const active = activeTags.includes(t.value);
            return (
              <button key={`tag-${t.value}`} type="button" onClick={() => onToggleTag(t.value)} className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset transition ${active ? 'bg-fuchsia-500/20 text-fuchsia-200 ring-fuchsia-400/30' : 'bg-white/5 text-gray-200 ring-white/10 hover:bg-white/10'}`}>
                {t.value}
              </button>
            );
          })}
          {(activeLanguages.length || activeTags.length) ? (
            <button type="button" onClick={onClear} className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300 ring-1 ring-white/10 hover:bg-white/10">Clear</button>
          ) : null}
        </div>
      )}
    </div>
  );
}

ProjectsFilterBar.propTypes = {
  q: PropTypes.string,
  onQ: PropTypes.func.isRequired,
  sort: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['grid', 'list']).isRequired,
  onView: PropTypes.func.isRequired,
  facets: PropTypes.shape({ tags: PropTypes.array, languages: PropTypes.array }),
  activeTags: PropTypes.arrayOf(PropTypes.string),
  activeLanguages: PropTypes.arrayOf(PropTypes.string),
  onToggleTag: PropTypes.func.isRequired,
  onToggleLanguage: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};
