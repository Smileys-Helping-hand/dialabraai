'use client';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export default function MenuItemCard({ item, onAdd, onEdit, onDelete }) {
  const handleAdd = () => {
    if (onAdd) onAdd(item);
  };

  const adminMode = Boolean(onEdit || onDelete);

  return (
    <article
      className="card group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_0_10px_#E46A28]"
      onClick={onAdd ? handleAdd : undefined}
      onKeyDown={(e) => {
        if (onAdd && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleAdd();
        }
      }}
      role={onAdd ? 'button' : 'article'}
      tabIndex={onAdd ? 0 : -1}
      aria-label={onAdd ? `Add ${item.name} to your order` : item.name}
    >
      <div className="relative h-44 w-full overflow-hidden rounded-xl bg-cream shadow-[0_0_12px_-4px_rgba(228,106,40,0.45)]">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-flame">Braai Fire</div>
        )}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-flame">{item.category}</p>
          <h3 className="font-heading text-xl text-primary leading-tight">{item.name}</h3>
          {item.description && <p className="text-base text-charcoal/75 leading-relaxed">{item.description}</p>}
        </div>
        <span className="font-bold text-gold text-xl">{formatPrice(item.price)}</span>
      </div>
      {onAdd && (
        <button
          className="button-primary mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            handleAdd();
          }}
          type="button"
          aria-label={`Add ${item.name} to cart`}
        >
          Add to Order
        </button>
      )}
      {adminMode && (
        <div className="mt-auto flex items-center gap-3">
          {onEdit && (
            <button
              type="button"
              className="button-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              aria-label={`Edit ${item.name}`}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="button-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              aria-label={`Delete ${item.name}`}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}
