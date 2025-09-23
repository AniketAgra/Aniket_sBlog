import PropTypes from 'prop-types';
import GlassCard from './GlassCard';

export default function StatCard({ label, value, icon, gradient = 'from-fuchsia-500 to-purple-500' }) {
  const Icon = icon;
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}> 
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div className="min-w-0">
          {/* Keep label to a single line to avoid height jumps across cards */}
          <div className="truncate whitespace-nowrap text-sm text-gray-400">{label}</div>
          <div className="text-2xl font-semibold text-white/90">{value}</div>
        </div>
      </div>
    </GlassCard>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  gradient: PropTypes.string,
};
