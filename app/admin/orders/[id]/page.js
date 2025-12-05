'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminStatusButtons from '../../../../components/AdminStatusButtons';
import OrderStatusBadge from '../../../../components/OrderStatusBadge';
import { supabase } from '../../../../lib/supabase';

const statusTimeline = ['pending', 'preparing', 'ready', 'completed'];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusIndex = useMemo(
    () => (order ? statusTimeline.indexOf(order.status) : -1),
    [order]
  );

  useEffect(() => {
    let active = true;
    if (!orderId) return;

    const fetchOrder = async () => {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (!active) return;
      if (error) {
        setError(error.message || 'Unable to load order.');
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();

    const channel = supabase
      ?.channel(`admin-order-${orderId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
        setOrder((prev) => {
          if (payload.eventType === 'DELETE') return null;
          return payload.new || prev;
        });
      })
      .subscribe();

    return () => {
      active = false;
      channel && supabase?.removeChannel(channel);
    };
  }, [orderId]);

  const updateStatus = async (status) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to update status');
      setOrder(json.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePaid = async () => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, paid: !order.paid }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to update payment status');
      setOrder(json.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (!order) return;
    const confirmed = window.confirm('Archive/delete this order? This action cannot be undone.');
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to delete order');
      router.push('/admin/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream px-4 py-8">
        <div className="max-w-4xl mx-auto card p-6">Loading order…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream px-4 py-8">
        <div className="max-w-4xl mx-auto card p-6 text-red-600">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream px-4 py-8">
        <div className="max-w-4xl mx-auto card p-6">Order not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-4xl mx-auto card p-6 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading text-primary">Order Details</h1>
            <p className="text-sm text-charcoal/70">
              {order.customer_name || 'Customer'} • {order.customer_phone || 'N/A'}
            </p>
            {order.created_at && (
              <p className="text-xs text-charcoal/60">
                Created: {new Date(order.created_at).toLocaleString()}
              </p>
            )}
            <div className="h-1 w-16 bg-gold mt-3 rounded-full" />
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-charcoal">Status timeline</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {statusTimeline.map((status, idx) => {
              const isDone = idx <= statusIndex;
              return (
                <div key={status} className="flex items-center gap-2 text-sm">
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      isDone ? 'bg-primary border-gold shadow-[0_0_6px_rgba(228,106,40,0.5)]' : 'bg-cream border-charcoal/20'
                    }`}
                    aria-label={`${status} ${isDone ? 'completed' : 'pending'}`}
                  />
                  <span className={isDone ? 'text-charcoal font-medium' : 'text-charcoal/60'}>
                    {status}
                  </span>
                  {idx < statusTimeline.length - 1 && (
                    <span className="hidden sm:inline text-charcoal/30">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <AdminStatusButtons currentStatus={order.status} onUpdate={updateStatus} isUpdating={isUpdating} />

        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={isUpdating}
            className={`button-primary w-auto px-4 ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={togglePaid}
            aria-label={order.paid ? 'Payment Received' : 'Mark as Paid'}
          >
            {order.paid ? 'Payment Received' : 'Mark as Paid'}
          </button>
          <button
            disabled={isDeleting}
            className={`button-danger w-auto px-4 ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={deleteOrder}
            aria-label="Delete or archive order"
          >
            {isDeleting ? 'Deleting…' : 'Delete / Archive'}
          </button>
        </div>

        <div className="border-t border-orange/10 pt-4 space-y-3">
          <div>
            <p className="font-semibold text-charcoal mb-1">Items</p>
            <ul className="space-y-2 text-sm text-charcoal/80">
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <li key={`${item.name}-${idx}`} className="flex justify-between gap-4">
                    <span>
                      {item.quantity || 1} × {item.name}
                    </span>
                    <span className="font-semibold text-charcoal">
                      R{Number(item.price || 0).toFixed(2)}
                    </span>
                  </li>
                ))
              ) : (
                <li>No items recorded</li>
              )}
            </ul>
            <p className="font-semibold text-primary text-base mt-2">
              Total: <span className="text-gold">R{Number(order.total_price || 0).toFixed(2)}</span>
            </p>
          </div>

          <div className="text-sm text-charcoal/80 space-y-1">
            <p className="font-semibold text-charcoal">Customer details</p>
            <p>Name: {order.customer_name || 'N/A'}</p>
            <p>Phone: {order.customer_phone || 'N/A'}</p>
            {order.notes && <p>Notes: {order.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
