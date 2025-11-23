'use client';

export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 w-full">
      {categories.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            className={`whitespace-nowrap rounded-2xl border px-4 py-2 min-h-[48px] text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame focus-visible:ring-offset-2 ${
              isActive
                ? 'bg-primary text-cream border-gold shadow-[0_0_10px_#E46A28]'
                : 'bg-cream border-charcoal/20 text-charcoal hover:border-primary'
            }`}
            onClick={() => onChange(cat)}
            type="button"
            aria-label={`Filter menu to ${cat}`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
