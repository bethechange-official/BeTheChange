export function SectionHeading({ label, title, subtitle, center = false, className = '' }) {
  return (
    <div className={`${center ? 'text-center' : ''} ${className}`}>
      {label && (
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#8A8580] mb-3 font-sans">{label}</p>
      )}
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#111111] leading-tight">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-sm text-[#8A8580] leading-relaxed max-w-xl font-sans font-light">{subtitle}</p>
      )}
    </div>
  );
}
