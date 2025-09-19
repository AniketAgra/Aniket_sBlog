export default function PublishBar({ loading, label = 'Publish', onClick }) {
  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 disabled:opacity-60"
      >
        <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-fuchsia-500/30 via-purple-500/30 to-cyan-500/30 blur-md transition-opacity group-hover:opacity-80" />
        {loading ? 'Publishing…' : label}
      </button>
    </div>
  );
}
