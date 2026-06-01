'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Users, RefreshCw, AlertCircle, Search, ShoppingBag,
  TrendingUp, Phone, Mail, Clock, Store, Filter, Download,
} from 'lucide-react';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(n) {
  return `R ${Number(n || 0).toFixed(2)}`;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [shops,     setShops]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [shopFilter, setShopFilter] = useState('');
  const [sort, setSort] = useState('lastOrderAt');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (shopFilter) params.set('shop', shopFilter);
      if (search)     params.set('search', search);
      params.set('limit', '200');

      const [custRes, shopsRes] = await Promise.all([
        fetch(`/api/superadmin/customers?${params}`, { cache: 'no-store' }),
        fetch('/api/superadmin/shops', { cache: 'no-store' }),
      ]);
      if (custRes.ok)  setCustomers(await custRes.json());
      if (shopsRes.ok) setShops(await shopsRes.json());
      setError('');
    } catch {
      setError('Could not load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [shopFilter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(), 400);
    return () => clearTimeout(t);
  }, [search]);

  const sorted = useMemo(() => {
    return [...customers].sort((a, b) => {
      if (sort === 'lastOrderAt')  return new Date(b.lastOrderAt) - new Date(a.lastOrderAt);
      if (sort === 'totalSpent')   return b.totalSpent - a.totalSpent;
      if (sort === 'orderCount')   return b.orderCount - a.orderCount;
      return 0;
    });
  }, [customers, sort]);

  const summary = useMemo(() => ({
    total:        customers.length,
    totalOrders:  customers.reduce((s, c) => s + c.orderCount, 0),
    totalRevenue: customers.reduce((s, c) => s + c.totalSpent, 0),
    avgSpend:     customers.length ? customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length : 0,
  }), [customers]);

  const exportCsv = () => {
    const rows = [
      ['Name', 'Phone', 'Email', 'Shop', 'Orders', 'Total Spent', 'Last Order'],
      ...sorted.map(c => [c.name, c.phone, c.email, c.shopSlug, c.orderCount, c.totalSpent.toFixed(2), c.lastOrderAt]),
    ];
    const csv = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-flame">Management</p>
          <h1 className="text-2xl font-black text-white">Customers</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/50 transition hover:text-white/80">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/50 transition hover:text-white/80">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', value: summary.total,                        icon: Users      },
          { label: 'Total Orders',    value: summary.totalOrders,                  icon: ShoppingBag },
          { label: 'Total Revenue',   value: formatCurrency(summary.totalRevenue), icon: TrendingUp },
          { label: 'Avg Spend',       value: formatCurrency(summary.avgSpend),     icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/35">{label}</p>
              <Icon className="h-4 w-4 text-white/20" />
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
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
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone or email…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none transition"
          />
        </div>
        <select
          value={shopFilter}
          onChange={e => setShopFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-flame/40 transition"
        >
          <option value="">All Shops</option>
          {shops.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-flame/40 transition"
        >
          <option value="lastOrderAt">Sort: Recent</option>
          <option value="totalSpent">Sort: Highest Spend</option>
          <option value="orderCount">Sort: Most Orders</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 bg-white/3">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Shop</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Orders</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Total Spent</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 rounded-lg shimmer bg-white/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/30">
                  No customers found
                </td>
              </tr>
            ) : (
              sorted.map((c, i) => (
                <tr key={`${c.phone}-${c.shopSlug}-${i}`} className="hover:bg-white/2 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/8 text-xs font-black text-white/60 shrink-0">
                        {c.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{c.name || '—'}</p>
                        <div className="flex items-center gap-1 text-xs text-white/35">
                          <ShoppingBag className="h-3 w-3" />
                          {c.completedCount} completed, {c.pendingCount} pending
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                          <Phone className="h-3 w-3 text-white/25" /> {c.phone}
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <Mail className="h-3 w-3 text-white/20" /> {c.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-white/6 px-2 py-1 text-xs font-mono text-white/50">
                      {c.shopSlug || 'default'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-white/80">{c.orderCount}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{formatCurrency(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-right text-xs text-white/40">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" /> {formatDate(c.lastOrderAt)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {sorted.length > 0 && (
          <div className="border-t border-white/6 px-4 py-2 text-xs text-white/30">
            Showing {sorted.length} customer{sorted.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
