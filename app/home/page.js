'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, Clock, MessageCircle, Star, Flame, ArrowLeft, Phone, AtSign } from 'lucide-react';
import { useShop } from '@/components/ShopProvider';

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-charcoal/10 bg-white/70 px-4 py-2.5 backdrop-blur-sm">
      <Icon className="h-4 w-4 text-flame" />
      <div>
        <p className="text-xs text-charcoal/50">{label}</p>
        <p className="text-sm font-bold text-charcoal">{value}</p>
      </div>
    </div>
  );
}

export default function ShopHomePage() {
  const { shop, shopSlug } = useShop();
  const q = shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const waLink = shop.whatsappNumber
    ? `https://wa.me/${String(shop.whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${shop.name}! I'd like to place an order.`)}`
    : null;

  const highlights = [
    'Order in minutes — no WhatsApp back-and-forth',
    'Save your favourite combos as Order Packs',
    'Track your order status in real time',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Back to marketplace */}
      <div className="container mx-auto max-w-6xl px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-charcoal/60 transition hover:text-charcoal hover:bg-charcoal/5"
        >
          <ArrowLeft className="h-4 w-4" />
          All shops
        </Link>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Cover image or gradient */}
        <div className="relative h-72 w-full overflow-hidden md:h-96">
          {shop.heroImageUrl ? (
            <img
              src={shop.heroImageUrl}
              alt={shop.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, ${shop.primaryColor || '#762C1B'} 0%, ${shop.accentColor || '#E46A28'} 60%, #F4C056 100%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Shop identity */}
          <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-10 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gold/80">
              {(shop.defaultMenuCategories || []).slice(0, 2).join(' · ')}
            </p>
            <h1 className="text-4xl font-black text-white leading-tight md:text-5xl">
              {shop.name}
            </h1>
            {shop.tagline && (
              <p className="mt-1 text-base text-white/70">{shop.tagline}</p>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="container mx-auto max-w-6xl px-4">
          <div className={`flex flex-wrap gap-3 py-5 transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {shop.estimatedReadyTime && (
              <StatPill icon={Clock} label="Ready in" value={shop.estimatedReadyTime} />
            )}
            {shop.locationSummary && (
              <StatPill icon={Star} label="Location" value={shop.locationSummary} />
            )}
            {shop.currencySymbol && (
              <StatPill icon={Flame} label="Currency" value={shop.currencySymbol} />
            )}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className={`container mx-auto max-w-6xl px-4 py-8 transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
        <div className="grid gap-8 md:grid-cols-2 items-start">

          {/* Left: description + highlights */}
          <div className="space-y-6">
            {shop.description && (
              <div className="section-surface p-6 space-y-2">
                <p className="text-sm font-semibold uppercase tracking-widest text-flame">About</p>
                <p className="text-base text-charcoal/80 leading-relaxed">{shop.description}</p>
              </div>
            )}

            <div className="rounded-3xl border border-charcoal/8 bg-white p-6 space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-charcoal/50">Why order here</p>
              <ul className="space-y-3">
                {highlights.map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20">
                      <span className="h-2 w-2 rounded-full bg-flame" />
                    </span>
                    <span className="text-sm text-charcoal/75">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div className="rounded-3xl border border-charcoal/8 bg-white p-6 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-widest text-charcoal/50">Connect</p>
              <div className="flex flex-wrap gap-3">
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
                {shop.supportPhoneDial && (
                  <a
                    href={`tel:${shop.supportPhoneDial}`}
                    className="flex items-center gap-2 rounded-2xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:border-primary/30"
                  >
                    <Phone className="h-4 w-4" />
                    {shop.supportPhoneDisplay}
                  </a>
                )}
                {shop.instagramUrl && (
                  <a
                    href={shop.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-2xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:border-primary/30"
                  >
                    <AtSign className="h-4 w-4" />
                    {shop.instagramHandle}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: CTA cards */}
          <div className="space-y-4">
            {/* Menu preview card */}
            <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-primary to-flame p-8 text-cream">
              <p className="text-xs font-bold uppercase tracking-widest text-gold/80 mb-3">Menu</p>
              <h2 className="text-3xl font-black leading-tight mb-2">
                Browse {shop.name}&apos;s full menu
              </h2>
              <p className="text-sm text-cream/70 mb-6">
                {(shop.defaultMenuCategories || []).length} categories · Updated regularly
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {(shop.defaultMenuCategories || []).map((cat) => (
                  <span key={cat} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-cream/90">
                    {cat}
                  </span>
                ))}
              </div>

              <Link
                href={`/menu${q}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cream py-3.5 text-base font-black text-primary shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] transition hover:bg-white"
              >
                View Full Menu
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Quick order card */}
            <div className="rounded-3xl border border-charcoal/8 bg-white p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-charcoal/50 mb-1">Quick Order</p>
                <p className="text-charcoal/70 text-sm">Already know what you want? Jump straight to checkout.</p>
              </div>
              <Link
                href={`/order${q}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-cream shadow-glow transition hover:shadow-glow-lg hover:scale-[1.01]"
              >
                <Flame className="h-4 w-4" />
                Place Order Now
              </Link>
            </div>

            {/* Terms */}
            {shop.orderTerms && (
              <p className="text-xs text-charcoal/40 px-2 leading-relaxed">{shop.orderTerms}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
