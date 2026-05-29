'use client';

import Link from 'next/link';
import { MapPin, Clock, MessageCircle, ChevronRight, Star } from 'lucide-react';

function getCategoryEmoji(category) {
  const map = {
    braai: '🔥', grill: '🔥', bbq: '🔥',
    pizza: '🍕', pasta: '🍝',
    burger: '🍔', burgers: '🍔',
    chicken: '🍗', wings: '🍗',
    seafood: '🦞', fish: '🐟',
    dessert: '🍰', desserts: '🍰', cake: '🎂',
    drinks: '🥤', coffee: '☕', juice: '🍊',
    vegan: '🥗', salad: '🥗', healthy: '🥗',
    sushi: '🍣', asian: '🥢',
    indian: '🍛', curry: '🍛',
    meals: '🍽️', featured: '⭐', bundles: '📦',
  };
  const key = (category || '').toLowerCase();
  return map[key] || '🍽️';
}

function ShopAvatar({ shop }) {
  if (shop.logoUrl) {
    return (
      <img
        src={shop.logoUrl}
        alt={shop.name}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <span className="text-2xl font-black text-white">
      {(shop.shortName || shop.name || 'S').slice(0, 2).toUpperCase()}
    </span>
  );
}

function ShopHero({ shop }) {
  if (shop.heroImageUrl) {
    return (
      <img
        src={shop.heroImageUrl}
        alt={shop.name}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    );
  }
  const accent = shop.accentColor || '#E46A28';
  const primary = shop.primaryColor || '#762C1B';
  return (
    <div
      className="h-full w-full transition duration-500 group-hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${primary} 0%, ${accent} 60%, #F4C056 100%)`,
      }}
    />
  );
}

export default function ShopCard({ shop, index = 0 }) {
  const menuHref = shop.slug && shop.slug !== 'default'
    ? `/menu?shop=${encodeURIComponent(shop.slug)}`
    : '/menu';

  const waLink = shop.whatsappNumber
    ? `https://wa.me/${shop.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${shop.name}! I found you on the marketplace and would like to order.`)}`
    : null;

  const categories = (shop.defaultMenuCategories || []).slice(0, 3);

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-charcoal/8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden bg-cream">
        <ShopHero shop={shop} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Ready time badge */}
        {shop.estimatedReadyTime && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {shop.estimatedReadyTime}
          </div>
        )}

        {/* Logo avatar — overlapping cover/body */}
        <div
          className="absolute -bottom-6 left-5 h-14 w-14 overflow-hidden rounded-2xl border-2 border-white shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)]"
          style={{ backgroundColor: shop.primaryColor || '#762C1B' }}
        >
          <ShopAvatar shop={shop} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5 pt-8">
        {/* Name + tagline */}
        <div>
          <h3 className="font-heading text-xl font-bold text-charcoal leading-tight line-clamp-1">
            {shop.name}
          </h3>
          {shop.tagline && (
            <p className="mt-0.5 text-sm text-charcoal/60 line-clamp-1">{shop.tagline}</p>
          )}
        </div>

        {/* Location */}
        {shop.locationSummary && (
          <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{shop.locationSummary}</span>
          </div>
        )}

        {/* Category tags */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-charcoal/70 border border-charcoal/10"
              >
                {getCategoryEmoji(cat)} {cat}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link
            href={menuHref}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-cream shadow-glow transition-all duration-200 hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            View Menu
            <ChevronRight className="h-4 w-4" />
          </Link>

          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:scale-[1.05]"
              aria-label={`WhatsApp ${shop.name}`}
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white border border-charcoal/8 shadow-card">
      <div className="h-48 shimmer" />
      <div className="flex flex-col gap-3 p-5 pt-8">
        <div className="h-5 w-2/3 rounded-lg shimmer" />
        <div className="h-3.5 w-1/2 rounded-lg shimmer" />
        <div className="flex gap-1.5">
          <div className="h-6 w-16 rounded-full shimmer" />
          <div className="h-6 w-20 rounded-full shimmer" />
        </div>
        <div className="mt-2 h-12 w-full rounded-2xl shimmer" />
      </div>
    </div>
  );
}
