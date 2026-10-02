const WORDMARKS = [
  { name: "Meridian", className: "font-playfair" },
  { name: "STELLEX", className: "font-oswald uppercase" },
  { name: "Luminar", className: "font-montserrat" },
  { name: "OVERLAND", className: "font-roboto-slab uppercase" },
  { name: "Kinetic", className: "font-raleway" },
];

export function TrustedBy() {
  return (
    <div className="w-full mt-8 md:mt-10 animate-fade-up stagger-5">
      <p className="text-left text-xs tracking-[0.25em] uppercase text-brand-dark/50 mb-6 md:mb-8 font-helvetica-neue">
        Backed by
      </p>
      <div className="flex flex-wrap items-center justify-start gap-6 md:gap-12 lg:gap-16 animate-fade-up stagger-6">
        {WORDMARKS.map((mark) => (
          <span
            key={mark.name}
            className={`text-lg md:text-xl lg:text-2xl text-brand-dark/80 whitespace-nowrap ${mark.className}`}
          >
            {mark.name}
          </span>
        ))}
      </div>
    </div>
  );
}
