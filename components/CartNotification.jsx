'use client';
import { useEffect } from 'react';
import { formatPrice } from '@/lib/utils';

export default function CartNotification({ item, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 animate-slide-in-right"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-white/90 border-2 border-[rgb(var(--color-primary))]/20 backdrop-blur-xl rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.12)] shadow-glow-primary p-4 max-w-sm flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[rgba(var(--color-primary),0.1)] flex items-center justify-center">
          <svg
            className="w-5.5 h-5.5 text-[rgb(var(--color-primary))] animate-bounce-subtle"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-black text-charcoal">
            Added to cart!
          </p>
          <p className="text-xs font-bold text-charcoal/50 mt-0.5 truncate">
            {item.name} · {formatPrice(item.price)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-charcoal/30 hover:text-charcoal transition"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
