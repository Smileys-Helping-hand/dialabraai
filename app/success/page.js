'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, Package, ArrowRight, Clock, Copy, Check } from 'lucide-react';
import { useShop } from '@/components/ShopProvider';
import { buildWhatsappOrderLink } from '@/lib/shop-config';

function useCountdown(minutes) {
  const [secs, setSecs] = useState(() => {
    const m = parseInt(minutes) || 30;
    return m * 60;
  });

  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secs]);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const pct = secs / ((parseInt(minutes) || 30) * 60);

  return { mm, ss, pct, done: secs === 0 };
}

function ProgressRing({ pct }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <svg width="130" height="130" className="-rotate-90">
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgb(var(--color-cream))" strokeWidth="8" />
      <circle
        cx="65" cy="65" r={r} fill="none"
        stroke="rgb(var(--color-flame))"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        className="transition-all duration-1000"
      />
    </svg>
  );
}

function CopyOrderId({ id }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <button
      onClick={copy}
      className="group flex items-center gap-2 rounded-2xl border-2 border-gold/30 bg-cream/50 px-5 py-3 transition hover:border-gold/60 hover:bg-cream"
    >
      <span className="font-mono text-2xl font-black text-primary tracking-wider">{id}</span>
      {copied
        ? <Check className="h-4 w-4 text-emerald-600" />
        : <Copy className="h-4 w-4 text-charcoal/30 transition group-hover:text-charcoal/60" />
      }
    </button>
  );
}

export default function SuccessPage({ searchParams }) {
  const { shop, shopSlug } = useShop();
  const orderId   = searchParams?.orderId;
  const q         = shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';
  const waLink    = buildWhatsappOrderLink(orderId, shop);
  const trackHref = orderId ? `/order/${orderId}${q}` : `/order${q}`;
  const menuHref  = `/menu${q}`;

  // Parse "30-45 minutes" → take first number
  const readyMinutes = parseInt((shop.estimatedReadyTime || '30').match(/\d+/)?.[0]) || 30;
  const { mm, ss, pct, done } = useCountdown(readyMinutes);

  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const STEPS = [
    { icon: '📥', label: 'Order received',  done: true  },
    { icon: '👨‍🍳', label: 'Being prepared', done: false },
    { icon: '✅', label: 'Ready for you',   done: false },
  ];

  return (
    <div className={`mx-auto max-w-2xl px-4 py-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

      {/* ── Celebration header ───────────────────────────────────────────── */}
      <div className="mb-6 text-center">
        <div className="animate-scale-bounce mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="font-display text-4xl font-extrabold text-charcoal">Order placed! 🎉</h1>
        <p className="mt-2 text-base text-charcoal/60">
          {shop.name} has received your order and is getting started.
        </p>
      </div>

      {/* ── Order ID ────────────────────────────────────────────────────── */}
      {orderId && (
        <div className="mb-6 flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/45">Your order number</p>
          <CopyOrderId id={orderId} />
          <p className="text-xs text-charcoal/40">Tap to copy · show this when collecting</p>
        </div>
      )}

      {/* ── Timer ───────────────────────────────────────────────────────── */}
      <div className="mb-6 overflow-hidden rounded-3xl border border-charcoal/8 bg-white shadow-card">
        <div className="flex items-center gap-6 px-6 py-6">
          {/* Ring */}
          <div className="relative shrink-0">
            <ProgressRing pct={pct} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-black text-charcoal leading-none">
                {done ? '✓' : `${mm}:${ss}`}
              </span>
              <span className="text-xs text-charcoal/45 mt-0.5">
                {done ? 'Ready!' : 'remaining'}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-flame mb-1">Est. ready in</p>
            <p className="font-display text-2xl font-extrabold text-charcoal leading-tight">
              {done ? 'Your order is ready!' : shop.estimatedReadyTime}
            </p>
            <p className="mt-1 text-sm text-charcoal/55">
              {done
                ? `Head over to ${shop.name} to collect.`
                : "We'll update this as your order progresses."}
            </p>
          </div>
        </div>

        {/* Status steps */}
        <div className="border-t border-charcoal/6 px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map(({ icon, label, done: stepDone }, i) => (
              <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all duration-300 ${
                  i === 0 ? 'bg-emerald-100 ring-2 ring-emerald-400 ring-offset-2 animate-pulse-glow' : 'bg-charcoal/6'
                }`}>
                  {icon}
                </div>
                <p className={`text-xs font-semibold text-center ${i === 0 ? 'text-emerald-700' : 'text-charcoal/40'}`}>
                  {label}
                </p>
                {i < STEPS.length - 1 && (
                  <div className="absolute" style={{ /* connector handled by flex gap */ }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-3">
        {/* WhatsApp — primary CTA */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white shadow-[0_8px_30px_-8px_rgba(5,150,105,0.4)] transition-all hover:bg-emerald-600 hover:scale-[1.01] active:scale-[0.99]"
        >
          <MessageCircle className="h-5 w-5" />
          Confirm on WhatsApp with {shop.name}
        </a>

        {/* Track */}
        {orderId && (
          <Link
            href={trackHref}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-primary/20 bg-cream py-3.5 text-sm font-bold text-primary transition-all hover:border-primary/40 hover:bg-cream"
          >
            <Package className="h-4 w-4" />
            Track live order status
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* ── Payment methods ─────────────────────────────────────────────── */}
      {shop.paymentMethods && (
        <div className="rounded-3xl border border-gold/25 bg-gold/8 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Payment accepted</p>
          <p className="text-sm text-charcoal/75">{shop.paymentMethods}</p>
        </div>
      )}

      {/* ── Next steps ──────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-charcoal/8 bg-[#FFFFFF] p-5">
        <p className="mb-3 text-sm font-bold text-charcoal">What happens next?</p>
        <ol className="space-y-2.5">
          {[
            `${shop.name} prepares your order — estimated ${shop.estimatedReadyTime}.`,
            `When it's ready, you'll be notified. Keep an eye on WhatsApp.`,
            orderId
              ? `Show order #${orderId} when you collect.`
              : shop.orderTerms || 'Pay on collection unless arranged otherwise.',
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-flame/15 text-xs font-black text-flame">
                {i + 1}
              </span>
              <span className="text-sm text-charcoal/65">{text}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Footer link ─────────────────────────────────────────────────── */}
      <div className="mt-6 text-center">
        <Link href={menuHref} className="text-sm font-semibold text-charcoal/45 transition hover:text-charcoal">
          ← Back to menu
        </Link>
      </div>

    </div>
  );
}
