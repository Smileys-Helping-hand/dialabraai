'use client';
import { useRouter } from 'next/navigation';

export default function FloatingCartButton({ itemCount, total }) {
  const router = useRouter();

  if (itemCount === 0) return null;

  return (
    <button
      onClick={() => router.push('/order')}
      className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-flame to-orange text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform animate-bounce-subtle"
      aria-label={`View cart with ${itemCount} items`}
    >
      <div className="relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </div>
      <div className="text-left">
        <p className="text-xs font-semibold opacity-90">View Cart</p>
        <p className="text-sm font-bold">R{total.toFixed(2)}</p>
      </div>
    </button>
  );
}
