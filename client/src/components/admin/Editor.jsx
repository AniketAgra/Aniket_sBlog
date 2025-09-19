import GlassCard from './GlassCard';

export default function Editor({ label = 'Content', value, onChange, rows = 12 }) {
  return (
    <GlassCard className="p-0">
      <div className="p-5">
        <label className="mb-2 block text-sm font-medium text-gray-200">{label}</label>
        <textarea
          className="h-auto min-h-[200px] w-full resize-y rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-gray-100 placeholder:text-gray-500 focus:border-fuchsia-500/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your post here... (Markdown supported)"
        />
        <div className="mt-2 text-xs text-gray-500">Markdown supported</div>
      </div>
    </GlassCard>
  );
}
