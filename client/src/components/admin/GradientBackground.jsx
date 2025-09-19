export default function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-fuchsia-500/25 via-purple-500/15 to-cyan-500/25 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-sky-500/25 via-indigo-500/15 to-pink-500/25 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_900px_at_0%_0%,rgba(124,58,237,0.08),transparent_60%),radial-gradient(900px_900px_at_100%_100%,rgba(14,165,233,0.08),transparent_60%)]" />
    </div>
  );
}
