'use client';

import Link from 'next/link';
import { Check, X, MessageCircle, Flame, ArrowRight, Shield, Zap, Star, Store } from 'lucide-react';

const PLANS = [
  {
    name: 'Basic',
    price: 'Free',
    sub: 'Always free — no card needed',
    accent: false,
    cta: 'Start free',
    ctaHref: '/join',
    features: [
      { text: 'Marketplace listing',           yes: true  },
      { text: 'Unlimited orders',              yes: true  },
      { text: 'Menu management (up to 30 items)', yes: true },
      { text: 'WhatsApp order integration',   yes: true  },
      { text: 'Basic order dashboard',         yes: true  },
      { text: 'Customer order tracking',       yes: true  },
      { text: 'Order packs (saved carts)',     yes: true  },
      { text: 'Last 7 days analytics',         yes: true  },
      { text: 'QR code for your shop',         yes: false },
      { text: 'Daily specials feature',        yes: false },
      { text: 'Custom branding & fonts',       yes: false },
      { text: 'Full analytics & reporting',    yes: false },
      { text: 'Priority marketplace placement',yes: false },
      { text: 'CSV order export',              yes: false },
    ],
  },
  {
    name: 'Pro',
    price: 'R249',
    sub: 'per month · cancel anytime',
    accent: true,
    badge: 'Most popular',
    cta: 'Start 14-day free trial',
    ctaHref: '/join?plan=pro',
    features: [
      { text: 'Everything in Basic',           yes: true  },
      { text: 'Unlimited menu items',          yes: true  },
      { text: 'QR code + marketing kit',       yes: true  },
      { text: 'Daily specials feature',        yes: true  },
      { text: 'Custom branding & fonts',       yes: true  },
      { text: 'Full analytics (all time)',     yes: true  },
      { text: 'Priority marketplace placement',yes: true  },
      { text: 'CSV order export',              yes: true  },
      { text: 'WhatsApp customer auto-reply',  yes: true  },
      { text: 'Operating hours display',       yes: true  },
      { text: 'Payment methods per shop',      yes: true  },
      { text: 'Multiple storefronts',          yes: false },
      { text: 'White-label (remove Graze branding)', yes: false },
      { text: 'API access',                    yes: false },
    ],
  },
  {
    name: 'Business',
    price: 'R499',
    sub: 'per month · priority support',
    accent: false,
    cta: 'Contact us',
    ctaHref: 'https://wa.me/27837864913?text=Hi!+I%27d+like+to+discuss+the+Business+plan.',
    ctaExternal: true,
    features: [
      { text: 'Everything in Pro',             yes: true  },
      { text: 'Up to 5 storefronts',           yes: true  },
      { text: 'White-label option',            yes: true  },
      { text: 'API access',                    yes: true  },
      { text: 'Dedicated support (WhatsApp)',  yes: true  },
      { text: 'Featured shop placement',       yes: true  },
      { text: 'Custom domain support',         yes: true  },
      { text: 'Onboarding call',               yes: true  },
      { text: 'Commission: 0% always',         yes: true  },
      { text: 'Customer data ownership',       yes: true  },
      { text: 'Bulk pricing for chains',       yes: true  },
      { text: 'SLA uptime guarantee',          yes: true  },
      { text: 'Custom integrations',           yes: true  },
      { text: 'Account manager',               yes: true  },
    ],
  },
];

const GUARANTEES = [
  { icon: '🚫', title: 'Zero commission. Ever.', desc: 'Uber Eats charges 15–30% per order. We charge R0. Your revenue is your revenue.' },
  { icon: '👤', title: 'You own your customers.', desc: 'No algorithm decides who sees your shop. You have direct WhatsApp contact with every person who orders.' },
  { icon: '⏱️', title: '5-minute setup.', desc: 'Load your menu, get a link, share it. That\'s literally the whole process.' },
  { icon: '🔓', title: 'Cancel anytime.', desc: 'No lock-in contracts. No penalties. If you stop, you stop. Your data is yours to keep.' },
];

const FAQ = [
  {
    q: 'Do you take a cut of my orders?',
    a: 'No. Zero. Never. You keep 100% of everything your customers pay you. The subscription is the only cost.',
  },
  {
    q: 'What happens after the 14-day trial?',
    a: 'You can continue on the free Basic plan indefinitely, or you\'ll be asked if you\'d like to continue with Pro. We don\'t auto-charge you.',
  },
  {
    q: 'Can I use it for a non-food business?',
    a: 'Yes — the platform works for any product or service business. Clothing, crafts, hardware, flowers. The menu becomes a product catalogue.',
  },
  {
    q: 'Do my customers need to download an app?',
    a: 'No. Graze is a web app — it works in any browser. Customers can add it to their home screen for an app-like experience.',
  },
  {
    q: 'What about WhatsApp? Do you replace it?',
    a: 'We don\'t replace WhatsApp — we make it smarter. Every order has a one-tap WhatsApp confirm button. You keep the connection, you lose the chaos.',
  },
  {
    q: 'Can I migrate my existing WhatsApp order list?',
    a: 'Yes — use our bulk CSV import in the admin panel to paste your existing menu in seconds.',
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F9FAFB] via-[#F3F4F6] to-[#E5E7EB] px-4 py-16 text-center">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-flame/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-flame/20 bg-flame/8 px-4 py-2 text-sm font-semibold text-flame">
            <Zap className="h-3.5 w-3.5" />
            No commission. No lock-in. No nonsense.
          </div>
          <h1 className="font-display mb-4 text-5xl font-extrabold leading-tight tracking-tight text-charcoal">
            One price. Everything included.<br />
            <span className="text-gradient-flame">Keep 100% of your revenue.</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-charcoal/60">
            Graze gives your food business a full digital storefront — with marketplace listing, order management, analytics, WhatsApp integration and more. No commission. Ever.
          </p>
        </div>
      </section>

      {/* ── Comparison vs competitors ─────────────────────────────────── */}
      <section className="border-y border-charcoal/8 bg-charcoal px-4 py-6">
        <div className="mx-auto max-w-4xl grid gap-4 sm:grid-cols-3 text-center">
          {[
            { name: 'Graze', value: 'R0 commission', sub: '+ small flat subscription', good: true },
            { name: 'Uber Eats', value: '15–30% per order', sub: 'on top of your price', good: false },
            { name: 'Shopify', value: '$39+/month', sub: 'no marketplace included', good: false },
          ].map(({ name, value, sub, good }) => (
            <div key={name} className={`rounded-2xl border p-4 ${good ? 'border-gold/30 bg-gold/10' : 'border-white/8 bg-white/5'}`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">{name}</p>
              <p className={`text-xl font-black ${good ? 'text-gold' : 'text-white/70'}`}>{value}</p>
              <p className="text-xs text-white/40">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFFFF] px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-flame mb-1">Pricing</p>
            <h2 className="font-display text-4xl font-extrabold text-charcoal">Simple, honest pricing</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-6 ${
                  plan.accent
                    ? 'border-primary/30 bg-gradient-to-br from-primary to-flame text-cream shadow-glow-lg'
                    : 'border-charcoal/8 bg-white shadow-card'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-black text-primary shadow-glow-gold">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.accent ? 'text-cream/60' : 'text-charcoal/50'}`}>{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-display text-4xl font-black ${plan.accent ? 'text-cream' : 'text-charcoal'}`}>{plan.price}</span>
                    {plan.price !== 'Free' && <span className={`text-sm ${plan.accent ? 'text-cream/60' : 'text-charcoal/50'}`}>/mo</span>}
                  </div>
                  <p className={`text-xs mt-1 ${plan.accent ? 'text-cream/55' : 'text-charcoal/45'}`}>{plan.sub}</p>
                </div>

                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map(({ text, yes }) => (
                    <li key={text} className={`flex items-start gap-2 text-sm ${yes ? '' : 'opacity-40'}`}>
                      {yes
                        ? <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.accent ? 'text-gold' : 'text-emerald-500'}`} />
                        : <X    className="h-4 w-4 shrink-0 mt-0.5 text-charcoal/30" />
                      }
                      <span className={plan.accent ? 'text-cream/90' : 'text-charcoal/75'}>{text}</span>
                    </li>
                  ))}
                </ul>

                {plan.ctaExternal ? (
                  <a
                    href={plan.ctaHref}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all hover:scale-[1.02] ${
                      plan.accent
                        ? 'bg-cream text-primary shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] hover:bg-white'
                        : 'border border-charcoal/15 text-charcoal hover:border-primary/25 hover:text-primary'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />{plan.cta}
                  </a>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all hover:scale-[1.02] ${
                      plan.accent
                        ? 'bg-cream text-primary shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] hover:bg-white'
                        : 'bg-primary text-cream shadow-glow hover:shadow-glow-lg'
                    }`}
                  >
                    {plan.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-charcoal/40">
            All plans include: SSL security · South African hosting · POPIA-compliant data storage · 99.9% uptime SLA
          </p>
        </div>
      </section>

      {/* ── Guarantees ───────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-16 border-t border-charcoal/6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-flame mb-1">Our promise</p>
            <h2 className="font-display text-3xl font-extrabold text-charcoal">Built for business owners, not investors.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {GUARANTEES.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-charcoal/6 bg-[#FFFFFF] p-5">
                <span className="text-3xl shrink-0">{icon}</span>
                <div>
                  <p className="font-display font-bold text-charcoal mb-1">{title}</p>
                  <p className="text-sm text-charcoal/60 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="bg-[#FFFFFF] px-4 py-16 border-t border-charcoal/6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-extrabold text-charcoal">Questions answered</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-charcoal/8 bg-white p-5">
                <p className="font-display font-bold text-charcoal mb-2">{q}</p>
                <p className="text-sm text-charcoal/65 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[#047857] to-flame px-4 py-20 text-center">
        <div className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="font-display mb-4 text-4xl font-extrabold text-cream">Ready to stop losing money to WhatsApp chaos?</h2>
          <p className="mb-8 text-base text-cream/70">Set up your shop in 5 minutes. Free forever. Upgrade when you need it.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/join" className="inline-flex items-center gap-2 rounded-2xl bg-cream px-6 py-3.5 text-base font-bold text-primary shadow-[0_8px_30px_-8px_rgba(0,0,0,0.3)] transition hover:bg-white hover:scale-[1.02]">
              <Flame className="h-5 w-5 text-flame" /> Get started free
            </Link>
            <a href="https://wa.me/27837864913?text=Hi!+I+have+a+question+about+Graze." target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-base font-semibold text-cream backdrop-blur transition hover:bg-white/20 hover:scale-[1.02]">
              <MessageCircle className="h-5 w-5" /> Chat to us first
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
