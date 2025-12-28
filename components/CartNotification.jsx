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
      <div className="bg-white border-2 border-orange rounded-2xl shadow-2xl p-4 max-w-sm flex items-center gap-4 transform hover:scale-105 transition-transform">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-gold animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary truncate">
            Added to cart!
          </p>
          <p className="text-xs text-charcoal/75 truncate">
            {item.name} • {formatPrice(item.price)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-charcoal/50 hover:text-charcoal"
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
