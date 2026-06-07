'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, AlertCircle, User, Phone, Mail, MessageSquare,
  CheckCircle2, MessageCircle, FileText,
} from 'lucide-react';
import CartItem from '@/components/CartItem';
import { useAuth } from '@/lib/auth';
import { calculateTotal } from '@/lib/price';
import { clearCart, isNonEmpty, isValidPhone, loadCart, saveCart, loadCustomerInfo, saveCustomerInfo } from '@/lib/utils';
import { useShop } from '@/components/ShopProvider';

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-charcoal">
        {label}
        {required && <span className="ml-0.5 text-flame">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

export default function QuotePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { shop, shopSlug } = useShop();

  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [savedCustomer, setSavedCustomer] = useState(null);

  const q = shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';
  const menuHref = `/menu${q}`;

  useEffect(() => {
    const stored = loadCart(shopSlug);
    if (stored.length) setCart(stored);

    const saved = loadCustomerInfo(shopSlug);
    if (saved) {
      setSavedCustomer(saved);
    }
    if (user && !saved) {
      setCustomer((c) => ({ ...c, name: user.name || '', phone: user.phone || '', email: user.email || '' }));
    }
  }, [user, shopSlug]);

  useEffect(() => { saveCart(cart, shopSlug); }, [cart, shopSlug]);

  const increment = (id) =>
    setCart((p) => p.map((i) => i.id === id ? { ...i, quantity: (i.quantity || 0) + 1 } : i));

  const decrement = (id) =>
    setCart((p) =>
      p.map((i) => i.id === id ? { ...i, quantity: Math.max(0, (i.quantity || 0) - 1) } : i)
        .filter((i) => i.quantity > 0),
    );

  const remove = (id) => setCart((p) => p.filter((i) => i.id !== id));

  const total = useMemo(() => calculateTotal(cart), [cart]);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const validate = () => {
    const errs = {};
    if (!isNonEmpty(customer.name)) errs.name = 'Please enter your full name.';
    if (!isValidPhone(customer.phone)) errs.phone = 'Enter a valid phone number (8–15 digits).';
    if (!customer.email.includes('@')) errs.email = 'Enter a valid email address.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!cart.length) {
      setError('Add items to your quote request first.');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/quotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customer_name: customer.name.trim(),
          customer_phone: customer.phone.trim(),
          customer_email: customer.email.trim(),
          customer_id: user?.uid || null,
          notes: customer.notes.trim(),
          shop_slug: shopSlug,
        }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      saveCustomerInfo({ name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() }, shopSlug);
      clearCart(shopSlug);
      setCart([]);
      router.push(`/quote/success?quoteId=${data.id}${q ? `&shop=${encodeURIComponent(shopSlug)}` : ''}`);
    } catch {
      setError('Failed to send quote request. Please try again or contact the shop.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">

      {/* Back */}
      <Link href={menuHref} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-charcoal/50 transition hover:text-charcoal">
        <ArrowLeft className="h-4 w-4" />
        Back to menu
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">

        {/* ── LEFT: Customer form ───────────────────────────────────────────── */}
        <section>
          <div className="mb-6">
            <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-flame">Custom quote</p>
            <h1 className="font-display text-3xl font-extrabold text-charcoal">Request a quote</h1>
            <p className="mt-1 text-sm text-charcoal/55">
              {shop.name} will review your items and send you a custom quote.
            </p>
          </div>

          {/* Saved info banner */}
          {savedCustomer && !customer.name && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-gold/25 bg-gold/8 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/20">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-charcoal">Welcome back, {savedCustomer.name}!</p>
                <p className="text-xs text-charcoal/60 mt-0.5">We saved your details from last time.</p>
                <button
                  type="button"
                  onClick={() => setCustomer((c) => ({ ...c, ...savedCustomer, notes: '' }))}
                  className="mt-2 text-sm font-semibold text-flame underline underline-offset-2 hover:text-primary transition"
                >
                  Use saved details →
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required error={fieldErrors.name}>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Jane Smith"
                    className={`input-base pl-10 ${fieldErrors.name ? 'border-red-400 focus:border-red-400' : ''}`}
                  />
                </div>
              </Field>

              <Field label="Phone Number" required error={fieldErrors.phone}>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                    placeholder="082 000 0000"
                    className={`input-base pl-10 ${fieldErrors.phone ? 'border-red-400 focus:border-red-400' : ''}`}
                  />
                </div>
              </Field>
            </div>

            <Field label="Email" required error={fieldErrors.email}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                  placeholder="jane@email.com"
                  className={`input-base pl-10 ${fieldErrors.email ? 'border-red-400 focus:border-red-400' : ''}`}
                />
              </div>
            </Field>

            <Field label="Special Notes / Requirements">
              <div className="relative">
                <MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-charcoal/35" />
                <textarea
                  value={customer.notes}
                  onChange={(e) => setCustomer((c) => ({ ...c, notes: e.target.value }))}
                  placeholder="Any special requirements, delivery notes, or questions…"
                  rows={3}
                  className="input-base pl-10 resize-none"
                />
              </div>
            </Field>

            {/* Info box */}
            <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <FileText className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>{shop.name} will review your request</strong> and send you a custom quote via email and WhatsApp — usually within 24 hours.
              </p>
            </div>

            {/* Desktop submit */}
            <button
              type="submit"
              disabled={submitting || cart.length === 0}
              className="hidden lg:flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-cream shadow-glow transition-all hover:shadow-glow-lg hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Sending quote request…</>
              ) : (
                <><CheckCircle2 className="h-5 w-5" /> Send Quote Request</>
              )}
            </button>
          </form>
        </section>

        {/* ── RIGHT: Quote summary ──────────────────────────────────────────── */}
        <aside className="flex flex-col gap-4">
          <div className="sticky top-20 space-y-4">

            <div className="rounded-3xl border border-charcoal/8 bg-white shadow-card">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-charcoal/6 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-flame" />
                  <h2 className="font-display text-base font-bold text-charcoal">
                    Quote items · {cartCount}
                  </h2>
                </div>
              </div>

              {/* Items */}
              <div className="max-h-72 overflow-y-auto px-5 py-3 space-y-2">
                {cart.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="text-sm text-charcoal/50">Your quote is empty.</p>
                    <Link href={menuHref} className="mt-3 inline-block text-sm font-semibold text-flame hover:text-primary transition">
                      Add items from menu →
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <CartItem key={item.id} item={item} onIncrement={increment} onDecrement={decrement} onRemove={remove} />
                  ))
                )}
              </div>

              {/* Total */}
              {cart.length > 0 && (
                <div className="border-t border-charcoal/6 px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-charcoal/55">Estimate</span>
                    <span className="font-display text-2xl font-bold text-charcoal">
                      R{total.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-charcoal/50">Final price set after review</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile submit */}
      {cart.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="lg:hidden fixed bottom-4 left-4 right-4 flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-cream shadow-glow transition-all hover:shadow-glow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Sending…</>
          ) : (
            <><CheckCircle2 className="h-5 w-5" /> Send Quote Request</>
          )}
        </button>
      )}
    </div>
  );
}
