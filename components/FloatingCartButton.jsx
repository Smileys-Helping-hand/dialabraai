'use client';

import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useShop } from './ShopProvider';

export default function FloatingCartButton({ itemCount, total }) {
  const router = useRouter();
  const { shopSlug } = useShop();

  if (itemCount === 0) return null;

  const q = shopSlug && shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';

  return (
    <button
      onClick={() => router.push(`/order${q}`)}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-primary px-5 py-3.5 text-cream shadow-[0_8px_32px_-8px_rgba(6, 95, 70,0.6)] transition-all duration-300 hover:shadow-[0_12px_40px_-8px_rgba(16, 185, 129,0.6)] hover:scale-105 active:scale-95 animate-bounce-subtle"
      aria-label={`View cart — ${itemCount} items`}
    >
      <div className="relative shrink-0">
        <ShoppingCart className="h-5 w-5" />
        <span key={itemCount} className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-black text-primary animate-scale-bounce">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      </div>
      <div className="text-left leading-none">
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Your cart</p>
        <p className="text-sm font-black">R{total.toFixed(2)}</p>
      </div>
      <ArrowRight className="h-4 w-4 opacity-60" />
    </button>
  );
}
