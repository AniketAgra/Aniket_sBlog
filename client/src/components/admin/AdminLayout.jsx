import GradientBackground from './GradientBackground';
import GlassCard from './GlassCard';

export default function AdminLayout({ sidebar, children }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <GradientBackground />
      <div className="mx-auto flex max-w-7xl gap-5 px-4 py-6 md:px-6">
        <div className="hidden w-64 shrink-0 md:block">
          <GlassCard className="sticky top-6 p-0 overflow-hidden">{sidebar}</GlassCard>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
