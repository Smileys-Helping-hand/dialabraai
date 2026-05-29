'use client';

import Image from 'next/image';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function MenuItemCard({ item, onAdd, onEdit, onDelete }) {
  const adminMode = Boolean(onEdit || onDelete);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-charcoal/8 shadow-card transition-all duration-300 ${
        onAdd ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-1 hover:border-flame/20' : ''
      }`}
      onClick={onAdd ? () => onAdd(item) : undefined}
      onKeyDown={(e) => {
        if (onAdd && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onAdd(item);
        }
      }}
      role={onAdd ? 'button' : 'article'}
      tabIndex={onAdd ? 0 : -1}
      aria-label={onAdd ? `Add ${item.name} to your order` : item.name}
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-cream">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        {/* Placeholder */}
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream to-[#FDF3D2] text-4xl ${item.image_url ? 'hidden' : ''}`}>
          🍽️
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Tag className="h-3 w-3" />
            {item.category}
          </span>
        </div>

        {/* Add button overlay (shows on hover) */}
        {onAdd && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/10">
            <div className="scale-0 transition-transform duration-200 group-hover:scale-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-glow">
                <Plus className="h-6 w-6 text-cream" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-bold text-charcoal leading-tight line-clamp-2">
            {item.name}
          </h3>
          <span className="shrink-0 rounded-xl bg-gold/15 px-2.5 py-1 text-sm font-black text-primary border border-gold/20">
            {formatPrice(item.price)}
          </span>
        </div>

        {item.description && (
          <p className="text-sm text-charcoal/60 leading-relaxed line-clamp-2">{item.description}</p>
        )}

        {/* Stock indicator */}
        {typeof item.stock === 'number' && item.stock <= 5 && item.stock > 0 && (
          <p className="text-xs font-semibold text-amber-600">
            Only {item.stock} left!
          </p>
        )}

        {/* Actions */}
        {onAdd && (
          <button
            className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-primary py-2.5 text-sm font-bold text-cream shadow-glow transition-all duration-200 hover:shadow-glow-lg active:scale-[0.98]"
            onClick={(e) => { e.stopPropagation(); onAdd(item); }}
            type="button"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="h-4 w-4" />
            Add to Order
          </button>
        )}

        {adminMode && (
          <div className="mt-auto flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-charcoal/15 py-2.5 text-sm font-semibold text-charcoal transition hover:border-primary/30 hover:text-primary"
                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                onClick={(e) => { e.stopPropagation(); onDelete(item); }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
