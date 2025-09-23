import { useEffect, useMemo, useState } from 'react';
import SectionHeader from './SectionHeader';
import GlassCard from './GlassCard';
import ConfirmModal from '../ConfirmModal';
import { AiOutlineSearch } from 'react-icons/ai';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineUpload } from 'react-icons/hi';

export default function ManageProjects() {
  const [data, setData] = useState({ items: [], total: 0, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, title: '' });
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    if (!query) return data.items;
    const q = query.toLowerCase();
    return data.items.filter((p) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.tagline || '').toLowerCase().includes(q) ||
      (p.tags || []).some((t) => (t || '').toLowerCase().includes(q)) ||
      (p.languages || []).some((t) => (t || '').toLowerCase().includes(q))
    );
  }, [data.items, query]);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
  const qs = new URLSearchParams({ limit: '50', ...(statusFilter !== 'all' ? { status: statusFilter } : {}) });
  const res = await fetch(`/api/admin/projects?${qs.toString()}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load projects');
        const json = await res.json();
        if (!abort) setData(json);
      } catch (e) {
        if (!abort) setError(e.message);
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [statusFilter]);

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      setData((d) => ({ ...d, items: d.items.filter((p) => p._id !== id), total: Math.max(0, d.total - 1) }));
    }
  };

  return (
    <div>
      <SectionHeader title="Manage Projects" subtitle="Edit or remove your projects" />

  {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <AiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            placeholder="Search projects…"
            className="w-full rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <div className="text-xs text-gray-400">{filtered.length} of {data.total} projects</div>
        </div>
      </div>

      {error && (
        <GlassCard className="p-4">
          <div className="text-sm text-red-400">{error}</div>
        </GlassCard>
      )}

      {/* Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[680px] w-full text-sm">
            <thead className="bg-white/[0.03]">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-gray-300">Project Title</th>
                <th className="px-4 py-3 font-medium text-gray-300">Date Published</th>
                <th className="px-4 py-3 font-medium text-gray-300">Tags</th>
                <th className="px-4 py-3 font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 font-medium text-gray-300 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 w-48 rounded bg-white/10" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-32 rounded bg-white/10" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-white/10" /></td>
                  <td className="px-4 py-4"><div className="h-6 w-20 rounded-full bg-white/10" /></td>
                  <td className="px-4 py-4 text-right"><div className="ml-auto h-8 w-28 rounded bg-white/10" /></td>
                </tr>
              ))}

              {!loading && filtered.map((p, idx) => (
                <tr key={p._id} className={idx % 2 ? 'bg-white/[0.015]' : ''}>
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="font-medium text-white/90 hover:text-white transition-colors">{p.title}</div>
                        <div className="mt-1 text-[11px] text-gray-400 line-clamp-1">{p.tagline}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(p.tags || []).slice(0, 3).map((t) => (
                        <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-gray-300 ring-1 ring-inset ring-white/10">{t}</span>
                      ))}
                      {(p.tags?.length || 0) > 3 && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-gray-300 ring-1 ring-inset ring-white/10">+{p.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {String(p.status || 'published') === 'draft' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 ring-1 ring-inset ring-amber-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        Draft
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Published
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <a
                        href={`/projects/${p.slug || p._id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View"
                        className="group rounded-lg p-2 text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40"
                        aria-label={`View ${p.title}`}
                      >
                        <HiOutlineEye size={18} />
                      </a>
                      <a
                        href={`/dashboard?tab=edit-project&id=${p._id}`}
                        title="Edit"
                        className="group rounded-lg p-2 text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40"
                        aria-label={`Edit ${p.title}`}
                      >
                        <HiOutlinePencil size={18} />
                      </a>
                      {String(p.status || 'published') === 'draft' && (
                        <button
                          type="button"
                          title="Publish"
                          onClick={async () => {
                            const res = await fetch(`/api/admin/projects/${p._id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ status: 'published' })
                            });
                            if (res.ok) {
                              const updated = await res.json();
                              setData((d) => ({ ...d, items: d.items.map((it) => it._id === p._id ? updated : it) }));
                            }
                          }}
                          className="group rounded-lg p-2 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          aria-label={`Publish ${p.title}`}
                        >
                          <HiOutlineUpload size={18} />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setConfirmDelete({ open: true, id: p._id, title: p.title })}
                        className="group rounded-lg p-2 text-gray-300 hover:text-red-200 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                        aria-label={`Delete ${p.title}`}
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <div className="h-10 w-10 rounded-full bg-white/5 ring-1 ring-inset ring-white/10 flex items-center justify-center">
                        <AiOutlineSearch className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-400">No projects found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmDelete.open}
        title="Delete project?"
        message={`This action cannot be undone. Delete “${confirmDelete.title}”?`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirmDelete({ open: false, id: null, title: '' })}
        onConfirm={async () => {
          const id = confirmDelete.id;
          setConfirmDelete((s) => ({ ...s, open: false }));
          await handleDelete(id);
        }}
      />
    </div>
  );
}
