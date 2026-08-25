export function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) {
  const base = 'inline-flex items-center justify-center font-sans font-medium tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#111111] text-white hover:bg-[#2a2a2a] active:scale-[0.98]',
    outline: 'border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white active:scale-[0.98]',
    ghost: 'text-[#111111] hover:bg-[#F3EFE8] active:scale-[0.98]',
    white: 'bg-white text-[#111111] hover:bg-[#FAF9F6] active:scale-[0.98]',
  };
  const sizes = {
    sm: 'text-[10px] px-4 py-2',
    md: 'text-[11px] px-6 py-3',
    lg: 'text-[11px] px-8 py-4',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> : null}
      {children}
    </button>
  );
}
