'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, Clock, ChefHat, PackageCheck, ArrowLeft,
  MessageCircle, Copy, Check, RefreshCw, AlertCircle, Phone,
} from 'lucide-react';
import { useShop } from '@/components/ShopProvider';
import { buildWhatsappOrderLink } from '@/lib/shop-config';

// ─── Status timeline config ────────────────────────────────────────────────
const STEPS = [
  { key: 'pending',   label: 'Received',  icon: CheckCircle2, desc: 'Your order is in the queue.' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat,      desc: 'The kitchen is working on it.' },
  { key: 'ready',     label: 'Ready!',    icon: PackageCheck, desc: 'Come collect your order.' },
  { key: 'completed', label: 'Collected', icon: CheckCircle2, desc: 'Order complete. Enjoy!' },
];
const STEP_INDEX = { pending: 0, preparing: 1, ready: 2, completed: 3 };

// ─── Countdown hook ────────────────────────────────────────────────────────
function useCountdown(estimatedReadyTime) {
  const minutes = parseInt((estimatedReadyTime || '30').match(/\d+/)?.[0]) || 30;
  const [secs, setSecs] = useState(minutes * 60);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secs]);

  const mm  = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss  = String(secs % 60).padStart(2, '0');
  const pct = secs / (minutes * 60);
  return { mm, ss, pct, done: secs === 0 };
}

// ─── Copy button ──────────────────────────────────────────────────────────
function CopyId({ id }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(id); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-1 inline-flex items-center gap-1 text-charcoal/35 hover:text-charcoal/70 transition" title="Copy order ID">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ─── Progress ring ────────────────────────────────────────────────────────
function Ring({ pct }) {
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <svg width="100" height="100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(var(--color-cream),1)" strokeWidth="6" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(var(--color-flame))" strokeWidth="6"
        strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`}
        className="transition-all duration-1000" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function OrderTrackingPage({ params }) {
  const { id }          = params || {};
  const searchParams    = useSearchParams();
  const { shop, shopSlug } = useShop();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const q       = shopSlug && shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';
  const menuHref = `/menu${q}`;
  const waLink  = order ? buildWhatsappOrderLink(id, shop) : null;

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/orders/get?id=${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Order not found');
      setOrder(await res.json());
      setError('');
    } catch (err) {
      setError(err.message || 'Order not found.');
    } finally {
      setLoading(false);
      setLastRefresh(Date.now());
    }
  };

  useEffect(() => {
    fetchOrder();
    const t = setInterval(fetchOrder, 10000);
    return () => clearInterval(t);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepIdx    = STEP_INDEX[order?.status] ?? 0;
  const formattedDate = useMemo(() => order?.created_at ? new Date(order.created_at).toLocaleString('en-ZA') : '', [order]);
  const { mm, ss, pct, done } = useCountdown(shop.estimatedReadyTime);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading && !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-4">
        {[80, 200, 160].map((h, i) => (
          <div key={i} className={`h-${h === 80 ? '20' : h === 200 ? '48' : '40'} rounded-3xl shimmer`} />
        ))}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (error && !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <h2 className="font-display text-2xl font-bold text-charcoal mb-2">Order not found</h2>
        <p className="text-charcoal/60 mb-6">{error}</p>
        <Link href={menuHref} className="brand-button inline-flex">Back to menu</Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-5 pb-28">

      {/* Back */}
      <Link href={menuHref} className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal/50 hover:text-charcoal transition">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>

      {/* ── Header card ────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-charcoal/8 bg-white px-6 py-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-flame mb-0.5">Order</p>
            <h1 className="font-display text-2xl font-extrabold text-charcoal leading-tight flex items-center gap-1">
              #{order.id?.slice(0, 10)}
              <CopyId id={order.id} />
            </h1>
            <p className="mt-0.5 text-xs text-charcoal/45">{formattedDate} · {shop.name}</p>
          </div>

          {/* Auto-refresh indicator */}
          <button onClick={fetchOrder} className="flex items-center gap-1 rounded-xl border border-charcoal/10 px-2.5 py-1.5 text-xs text-charcoal/40 hover:text-charcoal transition">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>

        {/* Payment */}
        <div className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ${
          order.paid
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {order.paid ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          {order.paid ? 'Payment received' : 'Pay on collection'}
        </div>
      </div>

      {/* ── Timer (only when not completed) ─────────────────────────────── */}
      {order.status !== 'completed' && (
        <div className="flex items-center gap-5 rounded-3xl border border-charcoal/8 bg-white px-6 py-5 shadow-card">
          <div className="relative shrink-0">
            <Ring pct={pct} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-lg font-black text-charcoal leading-none">
                {done ? '✓' : `${mm}:${ss}`}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-charcoal/40">{done ? 'Ready' : 'left'}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-flame">Estimated wait</p>
            <p className="font-display text-xl font-extrabold text-charcoal">
              {done ? 'Your order is ready!' : shop.estimatedReadyTime}
            </p>
            <p className="text-sm text-charcoal/50 mt-0.5">
              {done ? `Head to ${shop.name} to collect.` : 'We\'ll update this as it progresses.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Status timeline ──────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-charcoal/8 bg-white px-6 py-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-widest text-charcoal/45 mb-4">Live status</p>
        <div className="relative space-y-0">
          {STEPS.map(({ key, label, icon: Icon, desc }, i) => {
            const done    = i <= stepIdx;
            const current = i === stepIdx;
            return (
              <div key={key} className="relative flex gap-4">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className={`absolute left-[18px] top-9 h-8 w-0.5 ${done ? 'bg-flame' : 'bg-charcoal/10'} transition-colors duration-500`} />
                )}
                {/* Icon node */}
                <div className={`relative z-10 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  current
                    ? 'bg-flame text-cream shadow-glow animate-pulse-glow'
                    : done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-charcoal/6 text-charcoal/25'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                {/* Text */}
                <div className={`pb-7 ${i === STEPS.length - 1 ? 'pb-0' : ''}`}>
                  <p className={`text-sm font-bold ${done ? 'text-charcoal' : 'text-charcoal/35'}`}>{label}</p>
                  {current && <p className="text-xs text-charcoal/55 mt-0.5">{desc}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Items ───────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-charcoal/8 bg-white px-6 py-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-widest text-charcoal/45 mb-3">Your items</p>
        <div className="space-y-2 mb-4">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-[#FFFFFF] px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                  {item.quantity}
                </span>
                <span className="text-sm font-semibold text-charcoal">{item.name}</span>
              </div>
              <span className="text-sm font-black text-primary">R{(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-charcoal/8 pt-3">
          <span className="text-sm text-charcoal/60">Total</span>
          <span className="font-display text-xl font-black text-primary">R{Number(order.total_price || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* ── Contact actions ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-[0_6px_24px_-6px_rgba(5,150,105,0.4)] transition hover:bg-emerald-600 hover:scale-[1.01]"
          >
            <MessageCircle className="h-5 w-5" />
            Chat with {shop.name} on WhatsApp
          </a>
        )}
        {shop.supportPhoneDial && (
          <a
            href={`tel:${shop.supportPhoneDial}`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-charcoal/10 bg-white py-3 text-sm font-semibold text-charcoal transition hover:border-primary/25"
          >
            <Phone className="h-4 w-4" />
            Call {shop.name}
          </a>
        )}
      </div>

      {/* Mobile sticky footer */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-charcoal/8 bg-white/95 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-charcoal/45 capitalize">{order.status}</p>
            <p className="text-base font-black text-primary">R{Number(order.total_price || 0).toFixed(2)}</p>
          </div>
          <Link href={menuHref} className="flex items-center gap-2 rounded-xl border border-charcoal/10 px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:border-primary/25">
            Order more →
          </Link>
        </div>
      </div>
    </div>
  );
}
