'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Search, ChevronRight, Flame, Zap, Store, TrendingUp, Clock,
  MessageCircle, ArrowRight, Star, Sparkles, MapPin,
} from 'lucide-react';
import ShopCard, { ShopCardSkeleton } from '@/components/ShopCard';

// ─── Data ────────────────────────────────────────────────────────────────────

const FILTERS = [
  { label: 'All',           value: '',        emoji: '🍽️' },
  { label: 'Braai & Grill', value: 'braai',   emoji: '🔥' },
  { label: 'Burgers',       value: 'burger',  emoji: '🍔' },
  { label: 'Pizza',         value: 'pizza',   emoji: '🍕' },
  { label: 'Chicken',       value: 'chicken', emoji: '🍗' },
  { label: 'Healthy',       value: 'healthy', emoji: '🥗' },
  { label: 'Desserts',      value: 'desserts',emoji: '🍰' },
  { label: 'Drinks',        value: 'drinks',  emoji: '🥤' },
];

const TRUST_STATS = [
  { icon: Store,      value: '50+',    label: 'Local shops'   },
  { icon: TrendingUp, value: '5 000+', label: 'Orders placed' },
  { icon: Clock,      value: '30 min', label: 'Avg ready time'},
  { icon: Star,       value: '4.8',    label: 'Avg rating'    },
];

const FEATURES = [
  {
    emoji: '📋',
    title: 'Structured orders',
    desc:  'No more chaotic WhatsApp threads. Every order lands in one place, organised and ready to act on.',
  },
  {
    emoji: '⏱️',
    title: 'Order timers',
    desc:  'Customers see a live countdown. Shops get alerts if an order sits too long. No forgotten customers.',
  },
  {
    emoji: '💬',
    title: 'WhatsApp-native',
    desc:  'One tap confirms an order on WhatsApp. The connection stays — now with the structure you need.',
  },
  {
    emoji: '📊',
    title: 'Sales dashboard',
    desc:  'Revenue, best sellers, inventory — visible at a glance. Built for owners who are in the kitchen, not at a desk.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-flame/20 bg-flame/8 px-3.5 py-1.5 text-sm font-semibold text-flame">
      {children}
    </span>
  );
}

function FilterChip({ label, emoji, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-primary text-cream shadow-glow scale-105'
          : 'border border-charcoal/12 bg-white text-charcoal/65 hover:border-primary/25 hover:text-primary hover:scale-[1.02]'
      }`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [shops,        setShops]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    fetch('/api/shops/list')
      .then((r) => r.json())
      .then((d) => setShops(Array.isArray(d) ? d : []))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = shops;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.tagline?.toLowerCase().includes(q) ||
          s.locationSummary?.toLowerCase().includes(q) ||
          s.defaultMenuCategories?.some((c) => c.toLowerCase().includes(q)),
      );
    }
    if (filter) {
      r = r.filter((s) =>
        s.defaultMenuCategories?.some((c) => c.toLowerCase().includes(filter)),
      );
    }
    return r;
  }, [shops, search, filter]);

  const toggleFilter = (val) => setFilter((f) => (f === val ? '' : val));

  return (
    <div className="flex flex-col">

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF9F2] via-[#FFF4E2] to-[#FEF0D4]">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-flame/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -left-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-48 w-48 rounded-full bg-primary/8 blur-2xl" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-14 text-center">

          {/* Badge */}
          <div className="animate-fade-in mb-5">
            <HeroBadge>
              <Sparkles className="h-3.5 w-3.5" />
              Local food ordering — no app required
            </HeroBadge>
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up delay-75 font-display mb-4 text-5xl font-extrabold leading-[1.08] tracking-tight text-charcoal sm:text-6xl md:text-7xl">
            Order from shops<br />
            <span className="relative inline-block">
              <span className="text-gradient-flame">you actually love.</span>
              {/* Underline squiggle */}
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none">
                <path d="M2 6 Q75 2 150 6 Q225 10 298 6" stroke="#E46A28" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45"/>
              </svg>
            </span>
          </h1>

          <p className="animate-slide-up delay-150 mx-auto mb-8 max-w-lg text-lg text-charcoal/60 leading-relaxed">
            Browse local restaurants and shops. Build your order. Skip the WhatsApp thread.
          </p>

          {/* Search */}
          <div className="animate-slide-up delay-200 mx-auto max-w-lg">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/35" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search shops, food type or area…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input pl-12"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-charcoal/40 hover:text-charcoal"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Trust stats */}
          <div className="animate-fade-in delay-400 mt-10 flex flex-wrap justify-center gap-4">
            {TRUST_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-2xl border border-charcoal/8 bg-white/70 px-4 py-2.5 backdrop-blur-sm shadow-card">
                <Icon className="h-4 w-4 text-flame" />
                <span className="text-base font-black text-charcoal">{value}</span>
                <span className="text-sm text-charcoal/50">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Soft bottom fade into main content */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FAFAF8] to-transparent" />
      </section>

      {/* ─── SHOPS ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAFAF8] px-4 py-12">
        <div className="mx-auto max-w-6xl">

          {/* Section label */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-flame">Explore</p>
              <h2 className="font-display text-3xl font-extrabold text-charcoal">
                {search ? `Results for "${search}"` : 'All Shops'}
              </h2>
            </div>
            {!loading && !search && (
              <p className="text-sm text-charcoal/45">
                {shops.length} {shops.length === 1 ? 'shop' : 'shops'} available
              </p>
            )}
          </div>

          {/* Filter chips */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {FILTERS.map((f) => (
              <FilterChip
                key={f.value}
                label={f.label}
                emoji={f.emoji}
                active={filter === f.value}
                onClick={() => toggleFilter(f.value)}
              />
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <ShopCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mb-2 text-5xl">🔍</p>
              <h3 className="mb-1 font-display text-xl font-bold text-charcoal">No shops found</h3>
              <p className="mb-6 text-charcoal/50">
                {search ? 'Try a different search term.' : 'No shops are listed yet — be the first!'}
              </p>
              {search && (
                <button onClick={() => { setSearch(''); setFilter(''); }} className="button-secondary">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((shop, i) => (
                <div key={shop.slug} className="animate-slide-up" style={{ animationDelay: `${i * 55}ms` }}>
                  <ShopCard shop={shop} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── WHY GRAZE ─────────────────────────────────────────────────────── */}
      <section className="border-t border-charcoal/6 bg-white px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-flame">Why Graze</p>
            <h2 className="font-display text-4xl font-extrabold text-charcoal">
              Built for the shop owner. Loved by customers.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ emoji, title, desc }, i) => (
              <div
                key={title}
                className="animate-slide-up flex flex-col gap-3 rounded-3xl border border-charcoal/6 bg-[#FAFAF8] p-6 transition-all duration-300 hover:border-flame/20 hover:shadow-card hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="text-3xl">{emoji}</span>
                <h3 className="font-display text-base font-bold text-charcoal">{title}</h3>
                <p className="text-sm text-charcoal/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOR BUSINESSES ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[#8B3520] to-flame px-4 py-20">
        {/* Decorative */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-cream backdrop-blur-sm">
            <Store className="h-4 w-4 text-gold" />
            For business owners
          </div>

          <h2 className="font-display mb-4 text-4xl font-extrabold leading-tight text-cream sm:text-5xl">
            Stop taking orders on WhatsApp.<br />
            <span className="text-gold">Start using a real system.</span>
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-base text-cream/70 leading-relaxed">
            Load your menu, share your link, and start getting structured orders within the hour.
            No monthly fee, no commission — just your shop, online.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-2xl bg-cream px-6 py-3.5 text-base font-bold text-primary shadow-[0_8px_30px_-8px_rgba(0,0,0,0.3)] transition-all hover:bg-white hover:scale-[1.02] active:scale-[0.98]"
            >
              <Flame className="h-5 w-5 text-flame" />
              Set up your shop
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/27837864913?text=Hi!+I+want+to+list+my+shop+on+Graze."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-base font-semibold text-cream backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-[1.02]"
            >
              <MessageCircle className="h-5 w-5" />
              Chat to us first
            </a>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="bg-[#FAFAF8] px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-flame">Simple</p>
            <h2 className="font-display text-3xl font-extrabold text-charcoal">Three taps and you&apos;re done</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: '01', emoji: '🔍', title: 'Discover',  desc: 'Browse shops in the marketplace. Filter by cuisine, search by name or area.' },
              { step: '02', emoji: '🛒', title: 'Order',     desc: 'Pick your items, build your cart. We remember your details for next time.' },
              { step: '03', emoji: '💬', title: 'Connect',   desc: 'One tap to confirm on WhatsApp. Get a live update when your order is ready.' },
            ].map(({ step, emoji, title, desc }, i) => (
              <div key={step} className="animate-slide-up relative rounded-3xl border border-charcoal/6 bg-white p-6 shadow-card" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="absolute right-4 top-4 font-display text-5xl font-black text-charcoal/5">{step}</span>
                <span className="mb-3 block text-3xl">{emoji}</span>
                <h3 className="font-display mb-1.5 text-lg font-bold text-charcoal">{title}</h3>
                <p className="text-sm text-charcoal/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FLOATING WA ───────────────────────────────────────────────────── */}
      <a
        href="https://wa.me/27837864913?text=Hi!+I+want+to+list+my+shop+on+Graze."
        target="_blank"
        rel="noreferrer"
        aria-label="List your shop on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_-8px_rgba(5,150,105,0.55)] transition-all duration-300 hover:bg-emerald-600 hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">List your shop</span>
      </a>

    </div>
  );
}
