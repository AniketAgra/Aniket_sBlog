import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

function StatusPill({ verified }) {
  const label = verified ? 'Active' : 'Unverified';
  const color = verified ? 'bg-emerald-600/20 text-emerald-300' : 'bg-yellow-600/20 text-yellow-200';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}
StatusPill.propTypes = { verified: PropTypes.bool.isRequired };

export default function SubscribersTable() {
  const [data, setData] = useState({ items: [], total: 0, page: 1 });
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const pages = useMemo(() => Math.max(1, Math.ceil(data.total / limit)), [data.total, limit]);

  const fetchPage = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/admin/subscribers?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load subscribers');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [limit, search]);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  const onExport = () => {
    const header = ['Email', 'Source', 'Verified', 'Subscription Date'];
    const rows = data.items.map((s) => [s.email, s.source || '', s.verified ? 'Yes' : 'No', new Date(s.createdAt).toISOString()]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPage(1)}
            placeholder="Search subscribers..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={() => fetchPage(1)} className="absolute right-1 top-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500">Search</button>
        </div>
        <button onClick={onExport} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">Export</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left">
              <th className="px-4 py-3 font-medium">Email Address</th>
              <th className="px-4 py-3 font-medium">Subscription Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-red-400">{error}</td></tr>
            )}
            {!loading && !error && data.items.map((s) => (
              <tr key={s._id} className="border-t border-white/10">
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3"><StatusPill verified={s.verified} /></td>
                <td className="px-4 py-3">{s.source || '-'}</td>
              </tr>
            ))}
            {!loading && !error && data.items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No subscribers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-400">
        <button disabled={data.page <= 1} onClick={() => fetchPage(data.page - 1)} className="rounded-md border border-white/10 px-2 py-1 enabled:hover:bg-white/5">Previous</button>
        <span className="px-2">{data.page}</span>
        <button disabled={data.page >= pages} onClick={() => fetchPage(data.page + 1)} className="rounded-md border border-white/10 px-2 py-1 enabled:hover:bg-white/5">Next</button>
        <span className="ml-2">Showing {data.items.length} of {data.total} subscribers</span>
      </div>
    </div>
  );
}
