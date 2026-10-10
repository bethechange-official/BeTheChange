export function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, as: Component = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-sans font-medium tracking-[0.22em] uppercase transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#1F1A16] text-[#F8F5F0] hover:bg-[#3A322B] active:scale-[0.98]',
    outline: 'border border-[#1F1A16] text-[#1F1A16] hover:bg-[#1F1A16] hover:text-[#F8F5F0] active:scale-[0.98]',
    ghost: 'text-[#1F1A16] hover:bg-[#EFE9E0] active:scale-[0.98]',
    white: 'bg-white text-[#1F1A16] hover:bg-white active:scale-[0.98]',
    clay: 'bg-[#A2785A] text-white hover:bg-[#8C6549] active:scale-[0.98]',
  };
  const sizes = {
    sm: 'text-[10px] px-5 py-2.5',
    md: 'text-[11px] px-7 py-3.5',
    lg: 'text-[11px] px-9 py-[1.1rem]',
  };
  const isButton = Component === 'button';
  return (
    <Component
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(isButton ? { disabled: loading || props.disabled } : {})}
      {...props}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
      {children}
    </Component>
  );
}
