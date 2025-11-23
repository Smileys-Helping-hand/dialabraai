'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderStatusBadge from '../../../components/OrderStatusBadge';
import { supabase } from '../../../lib/supabase';

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
    if (!supabase) {
      setError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        setError(fetchError?.message || 'Order not found.');
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();

    const channel = supabase
      .channel(`orders-status-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload) => {
          if (payload.new) setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    if (searchParams?.get('refresh') === '1' && router) {
      router.replace(`/order/${id}`);
    }
  }, [searchParams, router, id]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 pb-28">
      {loading && <p className="text-center text-muted">Loading your order...</p>}
      {error && !loading && <p className="text-center text-red-600">{error}</p>}
      {!loading && !error && order && (
        <div className="space-y-4">
          <div className="section-surface p-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-heading text-primary">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-sm text-charcoal/70">Placed on {formattedDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className={`text-sm font-semibold ${order.paid ? 'text-green-700' : 'text-charcoal'}`}>
                {order.paid ? 'Payment confirmed in store.' : 'Payment required on collection.'}
              </span>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-heading text-xl text-primary">Items</h2>
            {Array.isArray(order.items) && order.items.length > 0 ? (
              <ul className="space-y-3">
                {order.items.map((item, index) => (
                  <li key={`${item.name}-${index}`} className="flex justify-between border-b border-charcoal/10 pb-2">
                    <div>
                      <p className="font-semibold text-charcoal">{item.name}</p>
                      {item.notes && <p className="text-xs text-muted">{item.notes}</p>}
                    </div>
                    <span className="font-semibold text-primary">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No items recorded for this order.</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-6 space-y-2">
              <h3 className="font-heading text-lg text-primary">Customer</h3>
              <p className="text-sm text-charcoal">{order.customer_name}</p>
              <p className="text-sm text-muted">{order.customer_phone}</p>
              {order.notes && <p className="text-sm text-charcoal">Notes: {order.notes}</p>}
            </div>
            <div className="card p-6 space-y-2">
              <h3 className="font-heading text-lg text-primary">Payment</h3>
              <p className="text-sm text-charcoal">Status: {order.paid ? 'Payment Received' : 'Payment required on collection.'}</p>
              <p className="text-sm text-charcoal">Total: R{Number(order.total_price || 0).toFixed(2)}</p>
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
