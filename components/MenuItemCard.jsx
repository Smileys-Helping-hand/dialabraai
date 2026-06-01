'use client';

import Image from 'next/image';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// ─── List view (horizontal row) ───────────────────────────────────────────────
function MenuItemListCard({ item, onAdd, onEdit, onDelete }) {
  const adminMode = Boolean(onEdit || onDelete);
  return (
    <article
      className={`group flex items-center gap-4 rounded-[var(--te-radius,20px)] border border-charcoal/8 bg-white px-4 py-3 shadow-glow-primary transition-all duration-300 hover:-translate-y-0.5 ${onAdd ? 'cursor-pointer hover:border-flame/25 hover:shadow-card' : ''}`}
      onClick={onAdd ? () => onAdd(item) : undefined}
      role={onAdd ? 'button' : 'article'}
      tabIndex={onAdd ? 0 : -1}
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
        {item.image_url
          ? <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" unoptimized />
          : <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-[11px] font-bold uppercase tracking-wide text-flame">{item.category}</p>
        <h3 className="truncate font-bold text-charcoal leading-tight">{item.name}</h3>
        {item.description && <p className="mt-0.5 line-clamp-1 text-xs text-charcoal/55">{item.description}</p>}
      </div>

      {/* Price + action */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-black text-primary text-base">{formatPrice(item.price)}</span>
        {onAdd && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(item); }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-cream shadow-glow transition hover:shadow-glow-lg hover:scale-110 active:scale-95"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
        {adminMode && (
          <div className="flex gap-1">
            {onEdit && <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="rounded-lg border border-charcoal/12 px-2 py-1 text-xs font-semibold text-charcoal hover:border-primary/25"><Pencil className="h-3 w-3" /></button>}
            {onDelete && <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"><Trash2 className="h-3 w-3" /></button>}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Masonry view (tall image, compact text) ──────────────────────────────────
function MenuItemMasonryCard({ item, onAdd, onEdit, onDelete }) {
  const height = item.image_url
    ? (item.name.length > 20 ? 'h-64' : 'h-72')
    : 'h-48';
  const adminMode = Boolean(onEdit || onDelete);
  return (
    <article
      className={`group relative overflow-hidden rounded-[var(--te-radius,20px)] border border-charcoal/8 bg-white shadow-glow-primary transition-all duration-300 ${onAdd ? 'cursor-pointer hover:border-flame/25 hover:shadow-card-hover hover:-translate-y-1' : ''} ${height}`}
      onClick={onAdd ? () => onAdd(item) : undefined}
      role={onAdd ? 'button' : 'article'}
      tabIndex={onAdd ? 0 : -1}
    >
      {/* Full-bleed image */}
      {item.image_url
        ? <Image src={item.image_url} alt={item.name} fill className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]" sizes="(max-width:768px)50vw,33vw" unoptimized />
        : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-[#FDF3D2] text-5xl">🍽️</div>
      }
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      {/* Category badge */}
      <div className="absolute left-2.5 top-2.5">
        <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">{item.category}</span>
      </div>
      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">{item.name}</h3>
            <span className="text-xs font-black text-gold">{formatPrice(item.price)}</span>
          </div>
          {onAdd && (
            <button onClick={(e) => { e.stopPropagation(); onAdd(item); }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-cream shadow-glow hover:scale-110 active:scale-95 transition">
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function MenuItemCard({ item, onAdd, onEdit, onDelete, feedStyle = 'grid' }) {
  const adminMode = Boolean(onEdit || onDelete);

  if (feedStyle === 'list' && !adminMode) return <MenuItemListCard item={item} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />;
  if (feedStyle === 'masonry' && !adminMode) return <MenuItemMasonryCard item={item} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />;

  // Default: grid card

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[var(--te-radius,24px)] bg-white border border-charcoal/8 shadow-card shadow-glow-primary transition-all duration-300 ${
        onAdd ? 'cursor-pointer hover:-translate-y-1.5 hover:border-flame/20' : ''
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
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
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
