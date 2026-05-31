'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store, ShoppingBag, TrendingUp, Clock,
  Star, ArrowUpRight, AlertCircle, RefreshCw,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? 'border-flame/20 bg-flame/8' : 'border-white/8 bg-white/4'}`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">{label}</p>
        <Icon className={`h-4 w-4 ${accent ? 'text-flame' : 'text-white/25'}`} />
      </div>
      <p className={`text-3xl font-black ${accent ? 'text-flame' : 'text-white'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-white/35">{sub}</p>}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [ts,      setTs]      = useState(Date.now());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      setStats(await res.json());
      setError('');
    } catch {
      setError('Could not load stats. Check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [ts]);

  const fmt = (n) => Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0 });
  const fmtR = (n) => `R ${Number(n || 0).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-flame">Platform overview</p>
          <h1 className="text-2xl font-black text-white">Super Admin Dashboard</h1>
        </div>
        <button
          onClick={() => setTs(Date.now())}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/50 transition hover:text-white/80"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Stat grid */}
      {loading && !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-white/8 bg-white/4 shimmer" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Today */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Today</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={ShoppingBag} label="Orders today"   value={fmt(stats.todayOrders)}  accent />
              <StatCard icon={TrendingUp}  label="Revenue today"  value={fmtR(stats.todayRevenue)} accent />
              <StatCard icon={Clock}       label="Pending orders" value={fmt(stats.pendingOrders)} />
              <StatCard icon={Store}       label="Active shops"   value={fmt(stats.activeShops)}  />
            </div>
          </div>

          {/* All time */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">All time</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Store}      label="Total shops"    value={fmt(stats.totalShops)}   />
              <StatCard icon={ShoppingBag}label="Total orders"   value={fmt(stats.totalOrders)}  />
              <StatCard icon={TrendingUp} label="Total revenue"  value={fmtR(stats.totalRevenue)} />
              <StatCard icon={ShoppingBag}label="This week"      value={fmt(stats.weekOrders)} sub={fmtR(stats.weekRevenue)} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top shops */}
            <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-white">Top Shops</p>
                <Link href="/superadmin/shops" className="flex items-center gap-1 text-xs text-flame hover:underline">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              {stats.topShops?.length === 0 ? (
                <p className="text-sm text-white/30">No shop data yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.topShops.map((s, i) => (
                    <div key={s.slug} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8 text-xs font-black text-white/50">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{s.name || s.slug}</p>
                        <p className="text-xs text-white/35">{s.orders} orders · R{Number(s.revenue).toFixed(0)}</p>
                      </div>
                      <Link href={`/superadmin/shops`} className="text-white/25 hover:text-flame transition">
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent shops */}
            <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-white">Newest Shops</p>
                <Link href="/superadmin/shops" className="flex items-center gap-1 text-xs text-flame hover:underline">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              {stats.recentShops?.length === 0 ? (
                <p className="text-sm text-white/30">No shops yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentShops.map((s) => (
                    <div key={s.slug} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-flame text-[10px] font-black text-cream">
                        {(s.name || s.slug).slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{s.name || s.slug}</p>
                        <p className="text-xs text-white/35">{new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Quick actions */}
      <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
        <p className="mb-4 text-sm font-bold text-white">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/admin/setup',          label: '+ Create new shop',     style: 'bg-flame/15 text-flame border-flame/20' },
            { href: '/superadmin/shops',     label: 'Manage shops',          style: 'bg-white/5 text-white/60 border-white/10' },
            { href: '/superadmin/orders',    label: 'All orders',            style: 'bg-white/5 text-white/60 border-white/10' },
            { href: '/admin/orders',         label: 'Shop order queue',      style: 'bg-white/5 text-white/60 border-white/10' },
            { href: '/',                     label: 'View marketplace',      style: 'bg-white/5 text-white/60 border-white/10' },
          ].map(({ href, label, style }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition hover:scale-[1.02] ${style}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
