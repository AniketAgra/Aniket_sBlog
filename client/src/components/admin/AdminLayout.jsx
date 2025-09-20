import GradientBackground from './GradientBackground';
import GlassCard from './GlassCard';

export default function AdminLayout({ sidebar, children }) {
  return (
    <div className="relative min-h-[calc(100vh-5rem)]">
      <GradientBackground />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 md:px-6">
        <div className="hidden  shrink-0 md:block">
          <GlassCard className="sticky top-8 p-0 overflow-hidden">{sidebar}</GlassCard>
        </div>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
