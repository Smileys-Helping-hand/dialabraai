'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, AlertCircle, Filter } from 'lucide-react';

const STATUS_COLORS = {
  pending:    'bg-amber-500/15 text-amber-400 border-amber-500/20',
  preparing:  'bg-blue-500/15  text-blue-400  border-blue-500/20',
  ready:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  completed:  'bg-white/8 text-white/40 border-white/10',
};

export default function SuperAdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [shopFilter, setShopFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [shops,   setShops]   = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch all orders across all shops using existing list endpoint with no shop filter
      const [ordersRes, shopsRes] = await Promise.all([
        fetch('/api/orders/list', { cache: 'no-store' }),
        fetch('/api/superadmin/shops', { cache: 'no-store' }),
      ]);
      if (ordersRes.ok)  setOrders(await ordersRes.json());
      if (shopsRes.ok)   setShops(await shopsRes.json());
      setError('');
    } catch {
      setError('Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q) ||
        o.id?.toLowerCase().includes(q);
      const matchShop   = !shopFilter   || o.shop_slug === shopFilter;
      const matchStatus = !statusFilter || o.status    === statusFilter;
      return matchSearch && matchShop && matchStatus;
    });
  }, [orders, search, shopFilter, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-flame">Platform</p>
          <h1 className="text-2xl font-black text-white">All Orders</h1>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/50 transition hover:text-white/80">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none transition"
          />
        </div>

        <select
          value={shopFilter}
          onChange={(e) => setShopFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 focus:outline-none"
        >
          <option value="">All shops</option>
          {shops.map((s) => <option key={s.slug} value={s.slug}>{s.name || s.slug}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 focus:outline-none"
        >
          <option value="">All statuses</option>
          {['pending', 'preparing', 'ready', 'completed'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 bg-white/3">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Shop</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-3.5 rounded-lg shimmer bg-white/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-white/30">
                  {search || shopFilter || statusFilter ? 'No orders match your filters.' : 'No orders yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="transition hover:bg-white/3">
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{order.id?.slice(0, 12)}…</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{order.customer_name}</p>
                    <p className="text-xs text-white/35">{order.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">{order.shop_slug || 'default'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-white">R{Number(order.total_price || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-white/35">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white/25">{filtered.length} of {orders.length} orders shown</p>
    </div>
  );
}
