'use client';
import { formatPrice } from '@/lib/utils';

export default function PackItemCard({ pack, onAdd }) {
  const totalValue = pack.items?.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) || 0;
  const itemCount = pack.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <article className="card group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_0_10px_#E46A28]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gold/20 text-flame text-xs font-bold uppercase tracking-wide">
              Pack
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-flame">Combo Deal</p>
          </div>
          <h3 className="font-heading text-xl text-primary leading-tight">{pack.name}</h3>
          {pack.description && (
            <p className="text-sm text-charcoal/75 leading-relaxed">{pack.description}</p>
          )}
        </div>
        <div className="text-right">
          <span className="font-bold text-gold text-xl">{formatPrice(pack.price)}</span>
          {totalValue > pack.price && (
            <p className="text-xs text-charcoal/60 line-through">{formatPrice(totalValue)}</p>
          )}
        </div>
      </div>

      <div className="border-t border-charcoal/10 pt-3 space-y-2">
        <p className="text-xs font-semibold text-charcoal/70 uppercase tracking-wide">
          Includes ({itemCount} items):
        </p>
        <ul className="space-y-1">
          {pack.items?.map((item, idx) => (
            <li key={idx} className="text-sm text-charcoal/80 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-flame"></span>
              <span>
                {item.quantity}x {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {onAdd && (
        <button
          className="button-primary mt-auto"
          onClick={() => onAdd(pack)}
          type="button"
          aria-label={`Add ${pack.name} to cart`}
        >
          Add Pack to Order
        </button>
      )}
    </article>
  );
}
