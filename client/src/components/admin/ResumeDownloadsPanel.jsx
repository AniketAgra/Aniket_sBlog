import { useEffect, useMemo, useState } from 'react';
import { HiOutlineCloudArrowDown, HiOutlineCalendar, HiOutlineUserGroup, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import GlassCard from './GlassCard';
import StatCard from './StatCard';
import DateInput from './DateInput';

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-t border-white/10">
      <td className="px-3 py-3"><div className="h-4 w-28 rounded bg-white/10" /></td>
      <td className="px-3 py-3"><div className="h-4 w-48 rounded bg-white/10" /></td>
      <td className="px-3 py-3"><div className="h-4 w-24 rounded bg-white/10" /></td>
      <td className="px-3 py-3"><div className="h-4 w-32 rounded bg-white/10" /></td>
    </tr>
  );
}

export default function ResumeDownloadsPanel() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 10 });
  const [stats, setStats] = useState({ total: 0, monthCount: 0, uniqueVisitors: 0, topUsers: [] });
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  // We soft-handle errors in UI via empty states; keeping minimal state

  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / (data?.pageSize || 10))), [data]);

  // Fetch stats
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoadingStats(true);
        const res = await fetch('/api/admin/resume-downloads/stats', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load stats');
        const json = await res.json();
        if (!abort) setStats(json);
      } catch (e) {
        // soft-fail stats
      } finally {
        if (!abort) setLoadingStats(false);
      }
    })();
    return () => { abort = true; };
  }, []);

  // Fetch table
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: '10' });
        if (q) params.set('q', q);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
        const res = await fetch(`/api/admin/resume-downloads?${params}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load resume downloads');
        const json = await res.json();
        if (!abort) setData(json);
      } catch (e) {
        // swallow error; table will show empty state
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [q, page, dateFrom, dateTo]);

  return (
    <div className="mt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* <h2 className="text-lg font-semibold text-white">Resume Downloads Data</h2> */}
        {/* search & filters */}
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <div className="relative w-full">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value); }}
              placeholder="Search Username, Email, User agent, IP…"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-fuchsia-500/40"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateInput
            value={dateFrom}
            onChange={(e) => { setPage(1); setDateFrom(e.target.value); }}
            placeholder="From"
          />
          <DateInput
            value={dateTo}
            onChange={(e) => { setPage(1); setDateTo(e.target.value); }}
            placeholder="To"
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Downloads" value={stats.total} icon={HiOutlineCloudArrowDown} gradient="from-fuchsia-500 to-purple-500" />
        <StatCard label="Monthly Downloads" value={stats.monthCount} icon={HiOutlineCalendar} gradient="from-violet-500 to-indigo-500" />
        <StatCard label="Unique Visitors" value={stats.uniqueVisitors} icon={HiOutlineUserGroup} gradient="from-cyan-500 to-sky-500" />
        <GlassCard className="p-5">
          <div className="text-sm text-gray-400 mb-2">Top Users</div>
          {loadingStats && <div className="text-xs text-gray-500">Loading…</div>}
          {!loadingStats && (
            <div className="space-y-2">
              {stats.topUsers?.length ? stats.topUsers.map((row, idx) => (
                <div key={`${row.username}-${idx}`} className="flex items-center gap-3">
                  <div className="w-28 truncate text-xs text-gray-300">{row.username}</div>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-white/10">
                    <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500" style={{ width: `${Math.min(100, (row.count / (stats.topUsers[0]?.count || 1)) * 100)}%` }} />
                  </div>
                  <div className="w-10 text-right text-xs text-gray-400">{row.count}</div>
                </div>
              )) : <div className="text-xs text-gray-500">No data</div>}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto custom-scrollbar rounded-xl ring-1 ring-white/10">
        <GlassCard className="p-0">
          <table className="min-w-full text-sm relative">
            <thead className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/10 bg-white/5">
              <tr className="text-left text-gray-300/90">
                <th className="px-3 py-2 font-medium tracking-wide">Username</th>
                <th className="px-3 py-2 font-medium tracking-wide">Email</th>
                <th className="px-3 py-2 font-medium tracking-wide">IP</th>
                <th className="px-3 py-2 font-medium tracking-wide">User Agent</th>
                <th className="px-3 py-2 font-medium tracking-wide">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
              {!loading && data.items.map((row) => (
                <tr key={row._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-3 py-3">{row.username || 'anonymous'}</td>
                  <td className="px-3 py-3">{row.email || '—'}</td>
                  <td className="px-3 py-3 font-mono text-xs">{row.ip || '—'}</td>
                  <td className="px-3 py-3 max-w-[280px] truncate text-xs text-gray-400" title={row.userAgent}>{row.userAgent || '—'}</td>
                  <td className="px-3 py-3">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-500">No downloads found</td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <div>Page {data.page || page} of {totalPages}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 disabled:opacity-50">Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
