import PropTypes from 'prop-types';

export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  const prev = () => onPage(Math.max(1, page - 1));
  const next = () => onPage(Math.min(totalPages, page + 1));
  // show small window of pages
  const window = 2;
  const start = Math.max(1, page - window);
  const end = Math.min(totalPages, page + window);
  const pages = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <button type="button" onClick={prev} disabled={page === 1} className="rounded-full bg-white/5 p-2 text-gray-300 ring-1 ring-white/10 enabled:hover:bg-white/10 disabled:opacity-50">
        <span className="sr-only">Previous</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      {pages.map((p) => (
        <button key={p} type="button" onClick={() => onPage(p)} className={`h-8 w-8 rounded-full text-sm ring-1 ring-white/10 ${p === page ? 'bg-fuchsia-500 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>{p}</button>
      ))}
      <button type="button" onClick={next} disabled={page === totalPages} className="rounded-full bg-white/5 p-2 text-gray-300 ring-1 ring-white/10 enabled:hover:bg-white/10 disabled:opacity-50">
        <span className="sr-only">Next</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
      </button>
    </nav>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired,
};
