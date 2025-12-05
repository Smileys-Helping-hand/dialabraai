'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminOrderCard from '../../../components/AdminOrderCard';
import AdminStatusButtons from '../../../components/AdminStatusButtons';
import OrderStatusBadge from '../../../components/OrderStatusBadge';
import { supabase } from '../../../lib/supabase';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) || null, [orders, selectedId]);

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        setError(error.message);
      } else {
        setOrders(data || []);
        if (data && data.length > 0) {
          setSelectedId((prev) => prev || data[0].id);
        }
      }
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      ?.channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => {
          const without = prev.filter((o) => o.id !== payload.new.id);
          const next = payload.eventType === 'DELETE' ? without : [payload.new, ...without];
          return next.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        });
        if (!selectedId) {
          setSelectedId(payload.new.id);
        }
      })
      .subscribe();

    return () => {
      active = false;
      channel && supabase?.removeChannel(channel);
    };
  }, [selectedId]);

  const updateStatus = async (status) => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to update status');
      const updated = json.order;
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePaid = async () => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, paid: !selected.paid }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Unable to update payment status');
      const updated = json.order;
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-flame font-semibold">Dashboard</p>
              <h1 className="text-3xl font-heading text-primary">Today’s Orders</h1>
              <div className="h-1 w-16 bg-gold mt-2 rounded-full" />
            </div>
            {loading && <span className="text-xs text-charcoal/70">Loading…</span>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && orders.length === 0 && <p className="text-sm text-charcoal/70">No orders yet.</p>}
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="card h-24 animate-pulse bg-gradient-to-br from-cream to-[#FDF3D2]" />
              ))
            : orders.map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onSelect={setSelectedId}
                  isSelected={order.id === selectedId}
                />
              ))}
        </div>
        <div className="md:col-span-2 card p-6 space-y-4">
          {selected ? (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-heading text-primary">Order Details</h2>
                  <p className="text-sm text-charcoal/70">
                    {selected.customer_name} • {selected.customer_phone}
                  </p>
                </div>
                <OrderStatusBadge status={selected.status} />
              </div>
              <AdminStatusButtons
                currentStatus={selected.status}
                onUpdate={updateStatus}
                isUpdating={isUpdating}
              />
              <div className="flex items-center gap-3">
                <span className="text-sm">Payment</span>
                <button
                  disabled={isUpdating}
                  className={`min-h-[48px] px-4 py-2 rounded-2xl text-sm font-semibold transition border-2 ${
                    selected.paid
                      ? 'bg-green-700 text-white border-green-800'
                      : 'bg-primary text-cream border-gold hover:shadow-[0_0_10px_#E46A28]'
                  } ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={togglePaid}
                  aria-label={selected.paid ? 'Payment Received' : 'Mark as Paid'}
                >
                  {selected.paid ? 'Payment Received' : 'Mark as Paid'}
                </button>
              </div>
              <div className="border-t border-orange/10 pt-4 text-sm space-y-2">
                <div className="space-y-1">
                  <p className="font-semibold text-charcoal">Items</p>
                  <ul className="list-disc list-inside text-charcoal/80">
                    {Array.isArray(selected.items) && selected.items.length > 0 ? (
                      selected.items.map((item, idx) => (
                        <li key={`${item.name}-${idx}`}>
                          {item.quantity || 1} × {item.name} — R{Number(item.price || 0).toFixed(2)}
                        </li>
                      ))
                    ) : (
                      <li>No items recorded</li>
                    )}
                  </ul>
                </div>
                <p className="font-semibold text-primary text-base">
                  Total: <span className="text-gold">R{Number(selected.total_price || 0).toFixed(2)}</span>
                </p>
                {selected.notes && <p className="text-sm text-charcoal/70">Notes: {selected.notes}</p>}
                {selected.created_at && (
                  <p className="text-xs text-charcoal/60">Created: {new Date(selected.created_at).toLocaleString()}</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-charcoal/70">Select an order to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
