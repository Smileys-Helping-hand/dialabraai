'use client';

export default function CategoryTabs({ categories, active, onChange, counts = {} }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {categories.map((cat) => {
        const isActive = active === cat;
        const count    = counts[cat];
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-label={`Filter to ${cat}`}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-primary text-cream shadow-glow scale-105'
                : 'border border-charcoal/10 bg-white text-charcoal/65 hover:border-primary/25 hover:text-primary hover:scale-[1.02]'
            }`}
          >
            {cat}
            {count !== undefined && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
                isActive ? 'bg-white/20 text-cream' : 'bg-charcoal/8 text-charcoal/50'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
