export const ORDER_STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

// These can't be undone (the API treats them as final), so ask before applying.
const IRREVERSIBLE = {
  CANCELLED: 'Cancel this order? Stock will be returned and this cannot be undone.',
  REFUNDED: 'Mark this order as refunded? This cannot be undone.',
};

/**
 * Status dropdown that only offers the transitions the API allows for this order
 * (`allowed` comes from the server), plus the current status.
 */
export function StatusSelect({ value, allowed = [], labels, onChange, disabled, className = '', ariaLabel }) {
  const options = [value, ...allowed.filter((s) => s !== value)];
  const isFinal = allowed.length === 0;

  const handleChange = (e) => {
    const next = e.target.value;
    if (next === value) return;
    const warning = IRREVERSIBLE[next];
    if (warning && !window.confirm(warning)) {
      e.target.value = value;
      return;
    }
    onChange(next);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled || isFinal}
      aria-label={ariaLabel}
      title={isFinal ? 'Final status — no further changes allowed' : undefined}
      className={`${className} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {options.map((status) => (
        <option key={status} value={status}>
          {labels[status] || status}{status === value && !isFinal ? ' (current)' : ''}
        </option>
      ))}
    </select>
  );
}
