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
  { label: 'All',              value: '',       emoji: '🌟' },
  { label: 'Food & Beverage',  value: 'food',   emoji: '🍽️' },
  { label: 'Retail',           value: 'retail', emoji: '🛍️' },
  { label: 'Services',         value: 'services', emoji: '💇' },
  { label: 'Events',           value: 'events', emoji: '🎉' },
  { label: 'Entertainment',    value: 'entertainment', emoji: '🎨' },
  { label: 'Wellness',         value: 'wellness', emoji: '🧘' },
  { label: 'Local Favorites',  value: 'featured', emoji: '❤️' },
];

const TRUST_STATS = [
  { icon: Store,      value: '100+',   label: 'Local businesses' },
  { icon: TrendingUp, value: '10 000+', label: 'Happy customers' },
  { icon: Clock,      value: '24/7',   label: 'Always open'    },
  { icon: Star,       value: '★★★★★', label: 'Community loved'  },
];

const FEATURES = [
  {
    emoji: '🏪',
    title: 'Easy discovery',
    desc:  'Browse local shops, services & events. Filter by what you need. Find hidden gems in your community.',
  },
  {
    emoji: '💌',
    title: 'Direct connection',
    desc:  'Chat with shop owners on WhatsApp. Place orders, ask questions, build relationships with locals.',
  },
  {
    emoji: '⏰',
    title: 'Real-time updates',
    desc:  'Track your order status live. Get alerts when it\'s ready. No surprises, ever.',
  },
  {
    emoji: '❤️',
    title: 'Support local',
    desc:  'Spend with small businesses & creators. Help your community thrive. Every order matters.',
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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FAFAFB] via-[#F4F5F7] to-[#EAECEF] border-b border-charcoal/5">
        {/* Animated dynamic background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
        
        {/* Soft parallax-like float blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[rgba(var(--color-flame),0.12)] blur-3xl animate-float" />
        <div className="pointer-events-none absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-[rgba(var(--color-primary),0.08)] blur-3xl animate-float delay-500" />
        <div className="pointer-events-none absolute bottom-4 right-1/4 h-64 w-64 rounded-full bg-[rgba(var(--color-flame),0.06)] blur-2xl animate-float delay-300" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-16 text-center">

          {/* Badge with pulse ring */}
          <div className="animate-scale-in-soft mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(var(--color-flame),0.2)] bg-[rgba(var(--color-flame),0.08)] px-4 py-2 text-xs font-black uppercase tracking-wider text-[rgb(var(--color-flame))] shadow-[0_4px_16px_rgba(var(--color-primary),0.1)]">
              <Sparkles className="h-3.5 w-3.5 animate-bounce-subtle" />
              Discover local businesses — no app needed
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-scale-in-soft delay-100 font-display mb-6 text-4xl font-black leading-[1.05] tracking-tight text-charcoal sm:text-5xl md:text-7xl">
            Find & support<br />
            <span className="relative inline-block mt-2">
              <span className="text-gradient-flame">your local community.</span>
              {/* Dynamic theme underline squiggle */}
              <svg className="absolute -bottom-2.5 left-0 w-full text-[rgb(var(--color-flame))]" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none">
                <path d="M2 6 Q75 2 150 6 Q225 10 298 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" className="opacity-60" />
              </svg>
            </span>
          </h1>

          <p className="animate-slide-up delay-250 mx-auto mb-10 max-w-lg text-lg text-charcoal/60 leading-relaxed">
            Discover restaurants, shops, services & events. Connect with your community. Zero friction.
          </p>

          {/* Search bar with glowing ring */}
          <div className="animate-slide-up delay-300 mx-auto max-w-lg">
            <div className="group relative">
              <Search className="pointer-events-none absolute left-4.5 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/30 transition-colors group-focus-within:text-[rgb(var(--color-flame))]" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search by shop name, type, or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-charcoal/10 bg-white/80 pl-12 pr-12 py-4 text-base text-charcoal shadow-sm transition-all duration-300 backdrop-blur-md placeholder:text-charcoal/35 focus:border-[rgba(var(--color-flame),0.4)] focus:outline-none focus:ring-4 focus:ring-[rgba(var(--color-primary),0.08)] focus:shadow-[0_8px_30px_rgba(var(--color-primary),0.12)]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-xl bg-charcoal/5 px-2.5 py-1.5 text-xs font-bold text-charcoal/50 hover:bg-charcoal/10 hover:text-charcoal transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Trust stats with dynamic float and high-end borders */}
          <div className="animate-fade-in delay-500 mt-12 flex flex-wrap justify-center gap-4">
            {TRUST_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="group flex items-center gap-2.5 rounded-2xl border border-charcoal/8 bg-white/60 px-5 py-3 backdrop-blur-md shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(var(--color-flame),0.08)] text-[rgb(var(--color-flame))] group-hover:scale-110 transition duration-300">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="text-left leading-none">
                  <span className="block text-base font-black text-charcoal">{value}</span>
                  <span className="block text-xs font-bold text-charcoal/40 mt-0.5">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 opacity-30 hover:opacity-60 transition duration-300">
          <div className="w-5 h-8.5 rounded-full border-2 border-charcoal/20 flex justify-center p-1">
            <span className="w-1 h-1.5 rounded-full bg-charcoal/70 animate-scroll-dot" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Scroll</span>
        </div>

        {/* Soft bottom fade into main content */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ─── SHOPS ─────────────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-6xl">

          {/* Section label */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-black uppercase tracking-widest text-[rgb(var(--color-flame))]">🌍 Browse</p>
              <h2 className="font-display text-3xl font-extrabold text-charcoal">
                {search ? `Results for "${search}"` : 'Local Businesses & Events'}
              </h2>
            </div>
            {!loading && !search && (
              <div className="rounded-full bg-charcoal/4 px-3 py-1.5 text-xs font-bold text-charcoal/50">
                {shops.length} {shops.length === 1 ? 'business' : 'businesses'} nearby
              </div>
            )}
          </div>

          {/* Filter chips with momentum scroll */}
          <div 
            className="mb-10 flex gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth overscroll-x-contain" 
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
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
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[rgb(var(--color-flame))]">Why Graze</p>
            <h2 className="font-display text-4xl font-extrabold text-charcoal">
              Built for the shop owner. Loved by customers.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ emoji, title, desc }, i) => (
              <div
                key={title}
                className="animate-slide-up flex flex-col gap-3 rounded-3xl border border-charcoal/6 bg-white p-6 transition-all duration-300 hover:border-[rgba(var(--color-flame),0.2)] hover:shadow-card hover:-translate-y-0.5"
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[#047857] to-flame px-4 py-20">
        {/* Decorative */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-cream backdrop-blur-sm">
            <Store className="h-4 w-4 text-gold" />
            For all business owners
          </div>

          <h2 className="font-display mb-4 text-4xl font-extrabold leading-tight text-cream sm:text-5xl">
            Build your online presence.<br />
            <span className="text-gold">Zero friction. Zero commission.</span>
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-base text-cream/70 leading-relaxed">
            Whether it's food, retail, services or events — load your details, share your link, and start connecting
            with customers immediately. No fees, no middleman. Just you and your community.
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

      {/* ─── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-slate-50 to-white px-4 py-16 border-t border-slate-100">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[rgb(var(--color-flame))]">💬 Community Love</p>
            <h2 className="font-display text-3xl font-extrabold text-charcoal">Loved by shops & customers</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Sarah', role: 'Restaurant Owner', text: '"Finally, orders don\'t get lost in WhatsApp. My business is more organized than ever."', emoji: '👩‍💼' },
              { name: 'Thabo', role: 'Coffee Shop', text: '"Customers love the simplicity. No app download needed. Pure genius."', emoji: '☕' },
              { name: 'Amira', role: 'Event Planner', text: '"The easiest way to reach my clients. Bookings are now traceable and professional."', emoji: '📋' },
            ].map(({ name, role, text, emoji }, i) => (
              <div key={name} className="animate-slide-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{emoji}</span>
                  <div>
                    <p className="font-bold text-charcoal">{name}</p>
                    <p className="text-xs text-charcoal/60">{role}</p>
                  </div>
                </div>
                <p className="text-sm text-charcoal/70 italic">"{text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[rgb(var(--color-flame))]">🚀 Easy</p>
            <h2 className="font-display text-3xl font-extrabold text-charcoal">Get started in minutes</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: '01', emoji: '🔍', title: 'Browse',     desc: 'Discover restaurants, shops, services & events near you. Filter by what you need.' },
              { step: '02', emoji: '🛒', title: 'Select',     desc: 'Pick items, build your order. We save your info so next time is instant.' },
              { step: '03', emoji: '💬', title: 'Confirm',    desc: 'Message on WhatsApp to confirm. Track your order in real time.' },
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
