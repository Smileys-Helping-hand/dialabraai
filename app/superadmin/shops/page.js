'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search, Star, StarOff, ExternalLink, Settings2,
  Trash2, CheckCircle, XCircle, RefreshCw, AlertCircle, Store,
} from 'lucide-react';

const STATUS_BADGE = {
  active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-red-500/15 text-red-400 border-red-500/20',
  pending:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

export default function SuperAdminShops() {
  const [shops,   setShops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [busy,    setBusy]    = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/shops', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      setShops(await res.json());
      setError('');
    } catch {
      setError('Could not load shops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const patch = async (slug, data) => {
    setBusy(slug);
    try {
      await fetch('/api/superadmin/shops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...data }),
      });
      await load();
    } finally {
      setBusy('');
    }
  };

  const del = async (shop) => {
    if (!confirm(`Delete shop "${shop.name}"? This cannot be undone.`)) return;
    setBusy(shop.slug);
    try {
      await fetch(`/api/superadmin/shops?slug=${encodeURIComponent(shop.slug)}`, { method: 'DELETE' });
      await load();
    } finally {
      setBusy('');
    }
  };

  const visible = shops.filter((s) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.slug.includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-flame">Management</p>
          <h1 className="text-2xl font-black text-white">All Shops</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/50 transition hover:text-white/80">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/admin/setup" className="rounded-xl bg-flame/20 px-4 py-2 text-sm font-bold text-flame border border-flame/20 transition hover:bg-flame/30">
            + New Shop
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shops…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none focus:ring-2 focus:ring-flame/10 transition"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 bg-white/3">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Shop</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Orders</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Revenue</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 rounded-lg shimmer bg-white/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/30">
                  {search ? 'No shops match your search.' : 'No shops yet.'}
                </td>
              </tr>
            ) : (
              visible.map((shop) => {
                const isBusy = busy === shop.slug;
                return (
                  <tr key={shop.slug} className="transition hover:bg-white/3">
                    {/* Shop identity */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/60 to-flame/60">
                          {shop.logoUrl
                            ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" />
                            : <Store className="h-4 w-4 text-cream/70" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-white">{shop.name || shop.slug}</p>
                            {shop.featured && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
                          </div>
                          <p className="text-xs text-white/35">/{shop.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[shop.status] || STATUS_BADGE.active}`}>
                        {shop.status || 'active'}
                      </span>
                    </td>

                    {/* Orders */}
                    <td className="px-4 py-4 text-right font-semibold text-white">{shop.orderCount ?? 0}</td>

                    {/* Revenue */}
                    <td className="px-4 py-4 text-right font-semibold text-white">
                      R{Number(shop.revenue || 0).toFixed(0)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View public */}
                        <a
                          href={`/shop/${shop.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 hover:text-white/70"
                          title="View public page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>

                        {/* Admin */}
                        <Link
                          href={`/admin/orders?shop=${shop.slug}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 hover:text-white/70"
                          title="Open shop admin"
                        >
                          <Settings2 className="h-3.5 w-3.5" />
                        </Link>

                        {/* Feature toggle */}
                        <button
                          disabled={isBusy}
                          onClick={() => patch(shop.slug, { featured: !shop.featured })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 hover:text-gold disabled:opacity-30"
                          title={shop.featured ? 'Unfeature' : 'Feature'}
                        >
                          {shop.featured
                            ? <StarOff className="h-3.5 w-3.5" />
                            : <Star    className="h-3.5 w-3.5" />
                          }
                        </button>

                        {/* Activate / Deactivate */}
                        <button
                          disabled={isBusy}
                          onClick={() => patch(shop.slug, { status: shop.status === 'active' ? 'inactive' : 'active' })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 disabled:opacity-30"
                          title={shop.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {shop.status === 'active'
                            ? <XCircle     className="h-3.5 w-3.5 hover:text-red-400" />
                            : <CheckCircle className="h-3.5 w-3.5 hover:text-emerald-400" />
                          }
                        </button>

                        {/* Delete */}
                        <button
                          disabled={isBusy}
                          onClick={() => del(shop)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                          title="Delete shop"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white/25">{visible.length} of {shops.length} shops shown</p>
    </div>
  );
}
