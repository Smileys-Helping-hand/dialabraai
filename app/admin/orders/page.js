'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import AdminOrderCard from '@/components/AdminOrderCard';
import AdminStatusButtons from '@/components/AdminStatusButtons';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { useShop } from '@/components/ShopProvider';
import { Search, Printer, MessageCircle, Bell, BellOff, Clock, AlertTriangle, Phone } from 'lucide-react';

// How many minutes before an order is considered "waiting too long"
const ALERT_AFTER_MINS = 15;

function ageLabel(createdAt) {
  if (!createdAt) return '';
  const mins = Math.floor((Date.now() - new Date(createdAt)) / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

function isLate(order) {
  if (!order?.created_at) return false;
  if (order.status === 'completed' || order.status === 'ready') return false;
  const mins = Math.floor((Date.now() - new Date(order.created_at)) / 60000);
  return mins >= ALERT_AFTER_MINS;
}

function buildWaLink(order, shopName) {
  if (!order?.customer_phone) return null;
  const num = String(order.customer_phone).replace(/\D/g, '');
  if (!num || num.length < 8) return null;
  const waNum = num.startsWith('0') ? `27${num.slice(1)}` : num;
  const msg = `Hi ${order.customer_name}! Your order #${order.id?.slice(0, 8)} from ${shopName} is ${order.status}. Thank you!`;
  return `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
}

export default function AdminOrdersPage() {
  const { shop, shopSlug } = useShop();
  const [orders,       setOrders]       = useState([]);
  const [selectedId,   setSelectedId]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [isUpdating,   setIsUpdating]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const prevPendingRef = useRef(0);
  const selected = useMemo(() => orders.find((o) => o.id === selectedId) || null, [orders, selectedId]);

  const filteredOrders = useMemo(() => orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_phone?.includes(q) ||
      o.id?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, searchQuery, statusFilter]);

  const pendingCount = useMemo(() => orders.filter((o) => o.status === 'pending').length, [orders]);
  const lateCount    = useMemo(() => orders.filter(isLate).length, [orders]);

  // Request browser notifications
  const requestNotifs = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === 'granted');
  };

  const fetchOrders = async () => {
    try {
      const q   = shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';
      const res = await fetch(`/api/orders/list${q}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json() || [];
      setOrders(data);
      if (data.length > 0) setSelectedId((prev) => prev || data[0].id);

      // Detect new pending orders and alert
      const newPending = data.filter((o) => o.status === 'pending').length;
      if (newPending > prevPendingRef.current) {
        setNewOrderAlert(true);
        if (notifEnabled && Notification.permission === 'granted') {
          new Notification(`🔥 New order on ${shop.name}!`, {
            body: `${newPending} pending order${newPending > 1 ? 's' : ''} waiting.`,
            icon: '/favicon.ico',
          });
        }
        setTimeout(() => setNewOrderAlert(false), 5000);
      }
      prevPendingRef.current = newPending;
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if permission already granted
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifEnabled(true);
    }
    fetchOrders();
    const t = setInterval(fetchOrders, 10000);
    return () => clearInterval(t);
  }, [shopSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (status) => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status, shop_slug: shopSlug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Update failed');
      setOrders((prev) => prev.map((o) => o.id === json.order.id ? json.order : o));
    } catch (err) { setError(err.message); }
    finally { setIsUpdating(false); }
  };

  const togglePaid = async () => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, paid: !selected.paid, shop_slug: shopSlug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Update failed');
      setOrders((prev) => prev.map((o) => o.id === json.order.id ? json.order : o));
    } catch (err) { setError(err.message); }
    finally { setIsUpdating(false); }
  };

  const printReceipt = () => {
    if (!selected) return;
    const w = window.open('', '', 'width=800,height=600');
    w.document.write(`<html><head><title>Receipt #${selected.id.slice(0,8)}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;max-width:480px;margin:auto}
      h1{color:#E46A28;margin-bottom:4px}.sub{color:#888;font-size:13px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}td{padding:8px 4px;border-bottom:1px solid #eee}
      .total{font-size:1.1em;font-weight:bold;margin-top:12px}
      .btn{margin-top:20px;padding:10px 24px;background:#E46A28;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:15px}
      @media print{.btn{display:none}}</style></head><body>
      <h1>🔥 ${shop.name}</h1>
      <div class="sub">Order #${selected.id.slice(0,10)} · ${new Date(selected.created_at).toLocaleString()}</div>
      <p><b>Customer:</b> ${selected.customer_name}<br>
         <b>Phone:</b> ${selected.customer_phone}<br>
         ${selected.customer_email ? `<b>Email:</b> ${selected.customer_email}<br>` : ''}
         ${selected.notes ? `<b>Notes:</b> ${selected.notes}` : ''}</p>
      <table>${(selected.items||[]).map(i=>`<tr><td>${i.name}</td><td>×${i.quantity}</td><td>R${(Number(i.price)*Number(i.quantity)).toFixed(2)}</td></tr>`).join('')}</table>
      <div class="total">Total: R${Number(selected.total_price||0).toFixed(2)} · ${selected.paid?'Paid':'Pay on collection'}</div>
      <button class="btn" onclick="window.print()">Print Receipt</button>
      </body></html>`);
    w.document.close();
  };

  const customerWaLink = selected ? buildWaLink(selected, shop.name) : null;

  return (
    <div className="min-h-screen bg-[#F8F7F4] px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-4">

        {/* ── Alert banner for new orders ─────────────────────────── */}
        {newOrderAlert && (
          <div className="animate-slide-down flex items-center gap-3 rounded-2xl border border-flame/30 bg-flame/10 px-5 py-3">
            <Bell className="h-5 w-5 shrink-0 text-flame animate-bounce-subtle" />
            <p className="font-semibold text-primary">New order received!</p>
          </div>
        )}

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-flame">Live</p>
            <h1 className="font-display text-2xl font-extrabold text-charcoal flex items-center gap-2">
              Orders
              {pendingCount > 0 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-flame text-[11px] font-black text-cream animate-pulse-glow">
                  {pendingCount}
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {lateCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                {lateCount} overdue
              </div>
            )}
            <button
              onClick={notifEnabled ? () => setNotifEnabled(false) : requestNotifs}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                notifEnabled
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-charcoal/15 bg-white text-charcoal/60 hover:border-primary/25'
              }`}
              title={notifEnabled ? 'Notifications on' : 'Enable notifications'}
            >
              {notifEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
              {notifEnabled ? 'Alerts on' : 'Enable alerts'}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-200">{error}</p>}

        {/* ── Search + filter ─────────────────────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone or ID…"
              className="input-base pl-10 text-sm py-2.5"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-charcoal/12 bg-white px-3 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-primary/30"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
          </select>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              className="rounded-xl border border-charcoal/12 bg-white px-3 py-2.5 text-sm font-semibold text-charcoal/60 hover:text-charcoal transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Main grid ───────────────────────────────────────────── */}
        <div className="grid gap-5 md:grid-cols-[320px_1fr]">

          {/* Order list */}
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl shimmer" />
              ))
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-charcoal/8 bg-white px-5 py-8 text-center">
                <p className="text-3xl mb-2">📦</p>
                <p className="text-sm text-charcoal/50">
                  {searchQuery || statusFilter !== 'all' ? 'No orders match your filters.' : 'No orders yet.'}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedId(order.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    order.id === selectedId
                      ? 'border-primary/30 bg-primary/5 shadow-glow'
                      : isLate(order)
                      ? 'border-red-200 bg-red-50 hover:border-red-300'
                      : 'border-charcoal/8 bg-white hover:border-primary/20 hover:shadow-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-bold text-charcoal truncate">{order.customer_name}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-charcoal/50 mb-1.5">#{order.id?.slice(0, 10)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-charcoal/45">
                      <Clock className="h-3 w-3" />
                      {ageLabel(order.created_at)}
                      {isLate(order) && (
                        <span className="ml-1 text-red-500 font-bold">⚠ Overdue</span>
                      )}
                    </div>
                    <span className="text-xs font-black text-primary">R{Number(order.total_price||0).toFixed(0)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Detail panel */}
          <div className="rounded-3xl border border-charcoal/8 bg-white p-6">
            {!selected ? (
              <div className="flex h-full items-center justify-center py-16 text-center">
                <div>
                  <p className="text-4xl mb-3">👈</p>
                  <p className="text-sm text-charcoal/50">Select an order to view details</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Order header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-extrabold text-charcoal">{selected.customer_name}</h2>
                    <p className="text-xs text-charcoal/45 mt-0.5">
                      #{selected.id?.slice(0, 10)} · {ageLabel(selected.created_at)}
                      {isLate(selected) && <span className="ml-2 text-red-500 font-bold">⚠ Overdue!</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={selected.status} />
                    <button onClick={printReceipt} className="flex h-9 w-9 items-center justify-center rounded-xl border border-charcoal/12 text-charcoal/50 hover:text-charcoal transition" title="Print receipt">
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contact row */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-charcoal/8 bg-[#FAFAF8] px-3 py-2 text-sm text-charcoal/70">
                    <Phone className="h-3.5 w-3.5" />
                    {selected.customer_phone}
                  </div>
                  {customerWaLink && (
                    <a
                      href={customerWaLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp customer
                    </a>
                  )}
                  {selected.customer_email && (
                    <a href={`mailto:${selected.customer_email}`} className="text-sm text-charcoal/50 underline underline-offset-2 hover:text-charcoal self-center">
                      {selected.customer_email}
                    </a>
                  )}
                </div>

                {/* Status controls */}
                <div className="rounded-2xl border border-charcoal/8 bg-[#FAFAF8] p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-charcoal/45">Update status</p>
                  <AdminStatusButtons currentStatus={selected.status} onUpdate={updateStatus} isUpdating={isUpdating} />
                  <button
                    disabled={isUpdating}
                    onClick={togglePaid}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
                      selected.paid
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-primary text-cream shadow-glow hover:shadow-glow-lg'
                    }`}
                  >
                    {selected.paid ? '✓ Payment received' : 'Mark as paid'}
                  </button>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-charcoal/45">Items</p>
                  {(selected.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-[#FAFAF8] px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">{item.quantity}</span>
                        <span className="text-sm font-semibold text-charcoal">{item.name}</span>
                      </div>
                      <span className="text-sm font-black text-primary">R{(Number(item.price)*Number(item.quantity)).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-charcoal/8 pt-2">
                    <span className="text-sm text-charcoal/60">Total</span>
                    <span className="font-display text-xl font-black text-primary">R{Number(selected.total_price||0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">Customer note</p>
                    <p className="text-sm text-amber-900">{selected.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
