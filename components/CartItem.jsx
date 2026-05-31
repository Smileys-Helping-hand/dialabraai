'use client';

import { Minus, Plus, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  const lineTotal = Number(item.price || 0) * Number(item.quantity || 1);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-charcoal/8 bg-white px-4 py-3">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-bold text-charcoal">{item.name}</p>
        <p className="text-xs text-charcoal/50">{formatPrice(item.price)} each</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onDecrement(item.id)}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-charcoal/12 bg-[#FAFAF8] text-charcoal/60 transition hover:border-primary/25 hover:text-primary active:scale-95"
          aria-label={`Decrease ${item.name}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-black text-charcoal">{item.quantity}</span>
        <button
          onClick={() => onIncrement(item.id)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-cream shadow-glow transition hover:shadow-glow-lg active:scale-95"
          aria-label={`Increase ${item.name}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Line total */}
      <span className="w-16 text-right text-sm font-black text-primary">{formatPrice(lineTotal)}</span>

      {/* Remove */}
      {onRemove && (
        <button
          onClick={() => onRemove(item.id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-charcoal/30 transition hover:bg-red-50 hover:text-red-500"
          aria-label={`Remove ${item.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
