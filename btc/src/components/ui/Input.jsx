export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-medium tracking-widest uppercase text-[#111111]">{label}</label>}
      <input
        className={`w-full border border-[#E2DDD6] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#C8C0B4] focus:outline-none focus:border-[#111111] transition-colors duration-200 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  );
}
