'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderStatusBadge from '../../../components/OrderStatusBadge';

export default function OrderTrackingPage({ params }) {
  const { id } = params || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formattedDate = useMemo(() => {
    if (!order?.created_at) return '';
    return new Date(order.created_at).toLocaleString();
  }, [order]);

  useEffect(() => {
    if (!id) return;
    let active = true;

    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/orders/get?id=${id}`);
        if (!active) return;
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        if (active) setError(err.message || 'Order not found.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrder();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrder, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id]);

  useEffect(() => {
    if (searchParams?.get('refresh') === '1' && router) {
      router.replace(`/order/${id}`);
    }
  }, [searchParams, router, id]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 pb-28">
      {/* Loading State with Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="section-surface p-6">
            <div className="h-8 bg-charcoal/10 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-charcoal/10 rounded w-1/4"></div>
          </div>
          <div className="card p-6 space-y-3">
            <div className="h-6 bg-charcoal/10 rounded w-1/4"></div>
            <div className="h-4 bg-charcoal/10 rounded w-full"></div>
            <div className="h-4 bg-charcoal/10 rounded w-full"></div>
            <div className="h-4 bg-charcoal/10 rounded w-3/4"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="section-surface p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">Order Not Found</h2>
            <p className="text-charcoal/70">{error}</p>
          </div>
          <button
            onClick={() => router.push('/menu')}
            className="brand-button inline-block"
          >
            ← Back to Menu
          </button>
        </div>
      )}

      {/* Success State */}
      {!loading && !error && order && (
        <div className="space-y-4">
          {/* Auto-refresh indicator */}
          <div className="text-center">
            <p className="text-xs text-charcoal/50">
              🔄 Auto-refreshing every 10 seconds
            </p>
          </div>

          {/* Order Header */}
          <div className="section-surface p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-heading text-primary">Order #{order.id.slice(0, 8)}</h1>
                <p className="text-sm text-charcoal/70">Placed on {formattedDate}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {/* Payment Status Banner */}
            <div className={`p-4 rounded-2xl border-2 ${
              order.paid 
                ? 'bg-green-50 border-green-300' 
                : 'bg-amber-50 border-amber-300'
            }`}>
              <p className={`text-sm font-semibold ${
                order.paid ? 'text-green-800' : 'text-amber-800'
              }`}>
                {order.paid ? '✓ Payment Received' : '⏳ Payment Required on Collection'}
              </p>
            </div>
          </div>

          {/* Items List */}
          <div className="card p-6 space-y-4">
            <h2 className="font-heading text-xl text-primary flex items-center gap-2">
              <span>🍖</span> Your Items
            </h2>
            {Array.isArray(order.items) && order.items.length > 0 ? (
              <ul className="space-y-3">
                {order.items.map((item, index) => (
                  <li key={`${item.name}-${index}`} className="flex justify-between items-center border-b border-charcoal/10 pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="font-semibold text-charcoal text-lg">{item.name}</p>
                      {item.notes && <p className="text-sm text-charcoal/60 mt-1">Note: {item.notes}</p>}
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold rounded-full">
                        ×{item.quantity}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-charcoal/60">No items recorded for this order.</p>
            )}

            {/* Total */}
            <div className="pt-3 border-t-2 border-charcoal/10 flex justify-between items-center">
              <span className="text-lg font-bold text-charcoal">Total</span>
              <span className="text-2xl font-bold text-primary">R{Number(order.total_price || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Customer & Order Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-6 space-y-3">
              <h3 className="font-heading text-lg text-primary flex items-center gap-2">
                <span>👤</span> Customer Details
              </h3>
              <div className="space-y-2">
                <p className="text-base font-semibold text-charcoal">{order.customer_name}</p>
                <p className="text-sm text-charcoal/70">📞 {order.customer_phone}</p>
                {order.customer_email && (
                  <p className="text-sm text-charcoal/70">📧 {order.customer_email}</p>
                )}
              </div>
              {order.notes && (
                <div className="pt-3 border-t border-charcoal/10">
                  <p className="text-xs text-charcoal/60 mb-1">Special Instructions:</p>
                  <p className="text-sm text-charcoal bg-cream/50 p-2 rounded-lg">{order.notes}</p>
                </div>
              )}
            </div>

            <div className="card p-6 space-y-3">
              <h3 className="font-heading text-lg text-primary flex items-center gap-2">
                <span>💳</span> Payment Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-charcoal/70">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.paid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-charcoal/70">Method:</span>
                  <span className="text-sm font-semibold text-charcoal">
                    {order.paid ? 'In-Store' : 'On Collection'}
                  </span>
                </div>
                <div className="pt-2 border-t border-charcoal/10">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-charcoal">Total Amount:</span>
                    <span className="text-xl font-bold text-primary">R{Number(order.total_price || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && order && (
        <div className="md:hidden fixed inset-x-0 bottom-0 bg-white/95 border-t border-charcoal/10 px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-charcoal/70">Status</p>
            <p className="font-semibold text-primary capitalize">{order.status}</p>
          </div>
          <button
            type="button"
            className="button-secondary flex-1 justify-center"
            onClick={() => router.push('/menu')}
            aria-label="Return to menu"
          >
            Browse more items
          </button>
        </div>
      )}
    </div>
  );
}
