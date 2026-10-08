export function SectionHeading({ label, title, subtitle, center = false, light = false, className = '' }) {
  return (
    <div className={`${center ? 'text-center mx-auto' : ''} ${className}`}>
      {label && (
        <p className={`inline-flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase mb-4 font-sans font-medium ${light ? 'text-[#C9B8A3]' : 'text-[#A2785A]'}`}>
          <span className={`h-px w-8 ${light ? 'bg-[#C9B8A3]/60' : 'bg-[#A2785A]/60'}`} />
          {label}
        </p>
      )}
      <h2 className={`font-serif font-light text-[2.1rem] sm:text-5xl lg:text-[3.6rem] leading-[1.05] tracking-[-0.01em] ${light ? 'text-[#F8F5F0]' : 'text-[#1F1A16]'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-5 text-sm sm:text-[15px] leading-relaxed max-w-xl font-sans font-light ${center ? 'mx-auto' : ''} ${light ? 'text-[#F8F5F0]/60' : 'text-[#8C8178]'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
