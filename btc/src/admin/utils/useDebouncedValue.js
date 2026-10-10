import { useEffect, useState } from 'react';

// Returns `value` once it has stopped changing for `delay` ms. Used for admin list searches so the
// server is queried after the user pauses typing, not on every keystroke.
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
