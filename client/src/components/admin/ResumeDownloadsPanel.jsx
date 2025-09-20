import { useEffect, useState } from 'react';

export default function ResumeDownloadsPanel() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/resume-downloads?limit=10', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load resume downloads');
        const json = await res.json();
        if (!abort) setData(json);
      } catch (e) {
        if (!abort) setError(e.message);
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, []);

  return (
    <div className="mt-10">
      <h3 className="mb-3 text-lg font-semibold">Recent Resume Downloads</h3>
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">IP</th>
                <th className="px-3 py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((row) => (
                <tr key={row._id} className="border-t border-white/10">
                  <td className="px-3 py-2">{row.username || row.name || row.userId}</td>
                  <td className="px-3 py-2">{row.email || '-'}</td>
                  <td className="px-3 py-2">{row.ip || '-'}</td>
                  <td className="px-3 py-2">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-500">No downloads yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
