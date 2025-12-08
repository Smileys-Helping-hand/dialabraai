'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CartItem from '../../components/CartItem';
import { calculateTotal } from '../../lib/price';
import { clearCart, isNonEmpty, isValidPhone, loadCart, saveCart } from '../../lib/utils';

export default function OrderPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = loadCart();
    if (stored.length) setCart(stored);
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const increment = (id) =>
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: Number(item.quantity || 0) + 1 } : item)));

  const decrement = (id) =>
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, Number(item.quantity || 0) - 1) } : item))
        .filter((item) => item.quantity > 0),
    );

  const remove = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const total = useMemo(() => calculateTotal(cart), [cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!cart.length) {
      setError('Add at least one item to your order.');
      return;
    }

    if (!isNonEmpty(customer.name)) {
      setError('Please provide your full name.');
      return;
    }

    if (!isValidPhone(customer.phone)) {
      setError('Enter a reachable phone number (8-15 digits).');
      return;
    }

    // Optional email validation
    if (customer.email && !customer.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customer_name: customer.name.trim(),
          customer_phone: customer.phone.trim(),
          customer_email: customer.email.trim(),
          notes: customer.notes.trim(),
          total_price: total,
        }),
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      const data = await res.json();
      clearCart();
      setCart([]);
      router.push(`/success?orderId=${data.id}`);
    } catch (err) {
      console.error('Order creation failed', err);
      setError('Something went wrong placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-flame font-semibold">Your Order</p>
            <h1 className="text-3xl font-heading text-primary">Your Order</h1>
            <p className="text-sm text-charcoal/75">You only pay when collecting your meal. Please confirm your details below.</p>
          </div>
          <span className="rounded-full bg-cream px-3 py-1 text-xs text-charcoal/70 border border-gold/50">VAT-free</span>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-lg bg-cream p-4 text-charcoal">Your cart is empty. Head back to the menu to add your favourites.</div>
        ) : (
          cart.map((item) => (
            <CartItem key={item.id} item={item} onIncrement={increment} onDecrement={decrement} onRemove={remove} />
          ))
        )}

        <div className="flex items-center justify-between pt-4 border-t border-orange/10">
          <div>
            <p className="font-heading text-lg text-primary">Total</p>
            <p className="text-xs text-charcoal/60">Pay in-person on collection or delivery.</p>
          </div>
          <p className="text-2xl text-gold font-bold">R{total.toFixed(2)}</p>
        </div>
      </section>

      <section className="card p-6 space-y-4 relative">
        <div>
          <p className="text-sm uppercase tracking-wide text-flame font-semibold">Customer</p>
          <h2 className="text-2xl font-heading text-primary">Collection details</h2>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm">{error}</div>}

        <form className="space-y-3 pb-24" onSubmit={handleSubmit}>
          <label className="space-y-1 block">
            <span className="text-sm font-semibold text-charcoal">Full Name</span>
            <input
              className="w-full border border-charcoal/15 rounded-2xl p-3 focus:border-orange focus:ring-2 focus:ring-orange/30"
              placeholder="Full Name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              aria-label="Full Name"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-sm font-semibold text-charcoal">Contact Number</span>
            <input
              className="w-full border border-charcoal/15 rounded-2xl p-3 focus:border-orange focus:ring-2 focus:ring-orange/30"
              placeholder="Contact Number"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              aria-label="Contact Number"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-sm font-semibold text-charcoal">Email (Optional - for order updates)</span>
            <input
              type="email"
              className="w-full border border-charcoal/15 rounded-2xl p-3 focus:border-orange focus:ring-2 focus:ring-orange/30"
              placeholder="your@email.com"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              aria-label="Email"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-sm font-semibold text-charcoal">Notes (Optional)</span>
            <textarea
              className="w-full border border-charcoal/15 rounded-2xl p-3 focus:border-orange focus:ring-2 focus:ring-orange/30"
              placeholder="Sauce heat, delivery vs. collection, timing"
              value={customer.notes}
              onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
              rows={4}
              aria-label="Notes"
            />
          </label>
          <div className="md:hidden fixed left-0 right-0 bottom-0 bg-white/95 border-t border-charcoal/10 px-4 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-charcoal/70">Total</p>
              <p className="text-xl font-bold text-gold">R{total.toFixed(2)}</p>
            </div>
            <button
              type="submit"
              className="button-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
          <div className="hidden md:block pt-2">
            <button
              type="submit"
              className="button-primary w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
