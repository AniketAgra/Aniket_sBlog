import { useEffect, useState } from 'react';

export default function Projects() {
  const [state, setState] = useState({ items: [], loading: true, error: null });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if(!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to load projects');
        setState({ items: data.items || [], loading: false, error: null });
      } catch (e) {
        setState({ items: [], loading: false, error: e.message });
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Projects</h1>
        <p className="mt-2 text-sm text-gray-400 max-w-2xl">Things I’ve built, experimented with, and shipped.</p>
      </header>
      {state.loading && <div className="text-gray-400">Loading…</div>}
      {state.error && <div className="text-red-400">{state.error}</div>}
      <div className="grid gap-5 sm:gap-6 md:gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {state.items.map(p => (
          <div key={p._id} className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10">
            {p.coverImageUrl && <img src={p.coverImageUrl} alt={p.title} className="h-44 sm:h-48 w-full object-cover"/>}
            <div className="px-4 sm:px-5 py-4">
              <div className="text-[11px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</div>
              <h2 className="mt-1.5 text-[1.05rem] sm:text-lg font-bold leading-snug">{p.title}</h2>
              {p.tagline && <p className="text-sm text-gray-300 mt-1.5">{p.tagline}</p>}
              <div className="mt-3 flex items-center gap-3 text-sm">
                {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Demo</a>}
                {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Repo</a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
