'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store, ShoppingBag, TrendingUp, Clock,
  Star, ArrowUpRight, AlertCircle, RefreshCw,
  Users, Crown, UserRound,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <div className={`rounded-xl p-5 ${accent ? '' : ''}`} style={accent
      ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }
      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">{label}</p>
        <Icon className={`h-3.5 w-3.5 ${accent ? 'text-emerald-400' : 'text-white/20'}`} />
      </div>
      <p className={`text-[28px] font-bold leading-none tracking-tight ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="mt-1.5 text-[11px] text-white/30">{sub}</p>}
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
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400/70">Platform overview</p>
          <h1 className="text-[22px] font-bold text-white tracking-tight">Super Admin Dashboard</h1>
        </div>
        <button
          onClick={() => setTs(Date.now())}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-white/40 transition hover:text-white/75"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
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
            <div key={i} className="h-28 rounded-xl shimmer-dark" style={{ border: '1px solid rgba(255,255,255,0.05)' }} />
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Platform</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Store}      label="Total shops"    value={fmt(stats.totalShops)}   />
              <StatCard icon={ShoppingBag}label="Total orders"   value={fmt(stats.totalOrders)}  />
              <StatCard icon={TrendingUp} label="Total revenue"  value={fmtR(stats.totalRevenue)} />
              <StatCard icon={ShoppingBag}label="This week"      value={fmt(stats.weekOrders)} sub={fmtR(stats.weekRevenue)} />
            </div>
          </div>

          {/* Owners & Customers */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Owners & Customers</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Crown}      label="Total owners"   value={fmt(stats.totalOwners)}   />
              <StatCard icon={Crown}      label="Premium owners" value={fmt(stats.premiumOwners)} accent />
              <StatCard icon={Users}      label="Customers"      value={fmt(stats.totalCustomers)} />
              <StatCard icon={UserRound}  label="Free plan"      value={fmt(stats.freeOwners)}    />
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
            { href: '/superadmin/shops',     label: '+ New Shop',           style: 'bg-flame/15 text-flame border-flame/20' },
            { href: '/superadmin/owners',    label: '+ Add Owner',          style: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
            { href: '/superadmin/customers', label: 'View Customers',       style: 'bg-white/5 text-white/60 border-white/10' },
            { href: '/superadmin/orders',    label: 'All Orders',           style: 'bg-white/5 text-white/60 border-white/10' },
            { href: '/superadmin/ads',       label: 'Ad Campaigns',         style: 'bg-white/5 text-white/60 border-white/10' },
            { href: '/superadmin/developer', label: 'Developer Console',    style: 'bg-white/5 text-white/60 border-white/10' },
            { href: '/',                     label: 'View Marketplace',     style: 'bg-white/5 text-white/60 border-white/10' },
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
