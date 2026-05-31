'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, User, Phone, Mail, MessageSquare,
  ArrowLeft, Loader2, AlertCircle, Bookmark, Trash2,
  Plus, Minus, MessageCircle, CheckCircle2,
} from 'lucide-react';
import CartItem from '@/components/CartItem';
import SaveCartModal from '@/components/SaveCartModal';
import { useAuth } from '@/lib/auth';
import { calculateTotal } from '@/lib/price';
import { clearCart, isNonEmpty, isValidPhone, loadCart, saveCart, loadCustomerInfo, saveCustomerInfo } from '@/lib/utils';
import { useShop } from '@/components/ShopProvider';
import { buildWhatsappOrderLink } from '@/lib/shop-config';

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

export default function OrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { shop, shopSlug } = useShop();

  const [cart,          setCart]          = useState([]);
  const [customer,      setCustomer]      = useState({ name: '', phone: '', email: '', notes: '' });
  const [submitting,    setSubmitting]    = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [error,         setError]         = useState('');
  const [fieldErrors,   setFieldErrors]   = useState({});
  const [savedCustomer, setSavedCustomer] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

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
    if (!isNonEmpty(customer.name))     errs.name  = 'Please enter your full name.';
    if (!isValidPhone(customer.phone))  errs.phone = 'Enter a valid phone number (8–15 digits).';
    if (customer.email && !customer.email.includes('@')) errs.email = 'Enter a valid email address.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!cart.length) { setError('Your cart is empty — add some items first.'); return; }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customer_name:  customer.name.trim(),
          customer_phone: customer.phone.trim(),
          customer_email: customer.email.trim(),
          notes:          customer.notes.trim(),
          total_price:    total,
          userId:         user?.uid || null,
          shop_slug:      shopSlug,
        }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      saveCustomerInfo({ name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() }, shopSlug);
      clearCart(shopSlug);
      setCart([]);
      router.push(`/success?orderId=${data.id}${q ? `&shop=${encodeURIComponent(shopSlug)}` : ''}`);
    } catch {
      setError('Something went wrong. Please try again or contact the shop directly.');
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
            <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-flame">Your details</p>
            <h1 className="font-display text-3xl font-extrabold text-charcoal">Complete your order</h1>
            <p className="mt-1 text-sm text-charcoal/55">
              {shop.name} will use these to confirm and prepare your order.
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

            <Field label="Email" error={fieldErrors.email}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                  placeholder="jane@email.com  (optional — for order updates)"
                  className={`input-base pl-10 ${fieldErrors.email ? 'border-red-400 focus:border-red-400' : ''}`}
                />
              </div>
            </Field>

            <Field label="Notes / Special requests">
              <div className="relative">
                <MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-charcoal/35" />
                <textarea
                  value={customer.notes}
                  onChange={(e) => setCustomer((c) => ({ ...c, notes: e.target.value }))}
                  placeholder="e.g. No onions, extra sauce, collect at 13:00…"
                  rows={3}
                  className="input-base pl-10 resize-none"
                />
              </div>
            </Field>

            {/* Payment methods */}
            {shop.paymentMethods && (
              <div className="rounded-2xl border border-gold/25 bg-gold/8 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5">Payment accepted</p>
                <p className="text-sm text-charcoal/75">{shop.paymentMethods}</p>
              </div>
            )}

            {/* WhatsApp note */}
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <MessageCircle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <p className="text-sm text-emerald-800">
                <strong>After placing your order</strong>, you can confirm it directly with {shop.name} on WhatsApp — one tap, all details pre-filled.
              </p>
            </div>

            {/* Desktop submit */}
            <button
              type="submit"
              disabled={submitting || cart.length === 0}
              className="hidden lg:flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-cream shadow-glow transition-all hover:shadow-glow-lg hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Placing order…</>
              ) : (
                <><CheckCircle2 className="h-5 w-5" /> Place Order · R{total.toFixed(2)}</>
              )}
            </button>
          </form>
        </section>

        {/* ── RIGHT: Order summary ──────────────────────────────────────────── */}
        <aside className="flex flex-col gap-4">
          <div className="sticky top-20 space-y-4">

            <div className="rounded-3xl border border-charcoal/8 bg-white shadow-card">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-charcoal/6 px-5 py-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-flame" />
                  <h2 className="font-display text-base font-bold text-charcoal">
                    Your order · {cartCount} item{cartCount !== 1 ? 's' : ''}
                  </h2>
                </div>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(true)}
                    className="flex items-center gap-1 rounded-xl border border-charcoal/10 px-2.5 py-1.5 text-xs font-semibold text-charcoal/60 transition hover:text-charcoal hover:border-charcoal/20"
                  >
                    <Bookmark className="h-3.5 w-3.5" /> Save pack
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="max-h-72 overflow-y-auto px-5 py-3 space-y-2">
                {cart.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-3xl mb-2">🛒</p>
                    <p className="text-sm text-charcoal/50">Your cart is empty.</p>
                    <Link href={menuHref} className="mt-3 inline-block text-sm font-semibold text-flame hover:text-primary transition">
                      Browse the menu →
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-charcoal/60">Total</span>
                    <span className="font-display text-2xl font-black text-primary">R{total.toFixed(2)}</span>
                  </div>
                  {shop.orderTerms && (
                    <p className="mt-1.5 text-xs text-charcoal/40 leading-relaxed">{shop.orderTerms}</p>
                  )}
                </div>
              )}
            </div>

            {/* Shop info */}
            <div className="rounded-2xl border border-charcoal/8 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-cream text-xs font-black">
                {shop.shortName?.slice(0, 2) || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-charcoal truncate">{shop.name}</p>
                {shop.estimatedReadyTime && (
                  <p className="text-xs text-charcoal/50">Ready in ~{shop.estimatedReadyTime}</p>
                )}
              </div>
            </div>

          </div>
        </aside>
      </div>

      {/* Mobile sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-charcoal/8 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div>
            <p className="text-xs text-charcoal/50">Total</p>
            <p className="font-display text-lg font-black text-primary">R{total.toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-cream shadow-glow transition-all disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Placing…</>
            ) : (
              <><CheckCircle2 className="h-4 w-4" /> Place Order</>
            )}
          </button>
        </div>
      </div>

      {/* Bottom padding on mobile for sticky footer */}
      <div className="h-24 lg:hidden" />

      <SaveCartModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} cart={cart} shopSlug={shopSlug} />
    </div>
  );
}
