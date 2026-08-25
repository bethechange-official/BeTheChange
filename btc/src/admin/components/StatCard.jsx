export function StatCard({ title, value, icon: Icon, change, trend = 'up', description, bgAccent = 'bg-white' }) {
  return (
    <div className={`p-6 rounded-xl border border-gray-200/80 shadow-2xs ${bgAccent} hover:shadow-xs transition-all duration-300 flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-gray-100/80 text-gray-800 flex items-center justify-center">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">{value}</h3>
        {(change || description) && (
          <div className="flex items-center gap-2 text-xs">
            {change && (
              <span className={`font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend === 'up' ? '↑' : '↓'} {change}
              </span>
            )}
            {description && <span className="text-gray-400 font-light">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
