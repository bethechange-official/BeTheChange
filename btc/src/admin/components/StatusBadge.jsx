export function StatusBadge({ status, type = 'default' }) {
  let badgeStyles = 'bg-gray-100 text-gray-700 border-gray-200';

  const val = String(status || '').toLowerCase();

  if (type === 'order' || type === 'default') {
    switch (val) {
      case 'pending':
        badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'confirmed':
      case 'processing':
        badgeStyles = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'shipped':
        badgeStyles = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'delivered':
      case 'active':
      case 'paid':
        badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'cancelled':
      case 'inactive':
      case 'failed':
      case 'out of stock':
        badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'low stock':
        badgeStyles = 'bg-orange-50 text-orange-700 border-orange-200';
        break;
      case 'refunded':
        badgeStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      default:
        badgeStyles = 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${badgeStyles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {status}
    </span>
  );
}
