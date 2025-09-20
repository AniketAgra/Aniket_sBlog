/*
  Reusable glassmorphism card with subtle gradient border and hover lift.
*/
export default function GlassCard({ as: Tag = 'div', className = '', children }) {
  return (
    <Tag
      className={[
        'glass-card relative rounded-2xl border border-white/10 p-3 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-md',
        'ring-1 ring-inset ring-white/5 hover:ring-white/10 transition-all duration-300',
        'hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]',
        className,
      ].join(' ')}
    >
      {/* gradient border glow */}
      <div className="pointer-events-none absolute inset-px rounded-[calc(theme(borderRadius.2xl)-1px)] bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-cyan-500/10" />
      <div className="relative z-10">{children}</div>
    </Tag>
  );
}
