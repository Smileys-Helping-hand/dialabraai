'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Flame, LayoutDashboard, Store, ShoppingBag,
  LogOut, ChevronRight, ExternalLink, Code2, ScrollText, Megaphone,
  Users, Crown, UserRound,
} from 'lucide-react';

const NAV = [
  { href: '/superadmin/dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/superadmin/shops',     label: 'All Shops',      icon: Store            },
  { href: '/superadmin/owners',    label: 'Shop Owners',    icon: Crown            },
  { href: '/superadmin/customers', label: 'Customers',      icon: Users            },
  { href: '/superadmin/orders',    label: 'All Orders',     icon: ShoppingBag      },
  { href: '/superadmin/developer', label: 'Developer',      icon: Code2            },
  { href: '/superadmin/logs',      label: 'API Logs',       icon: ScrollText       },
  { href: '/superadmin/ads',       label: 'Ad Campaigns',   icon: Megaphone        },
];

export default function SuperAdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/superadmin' || pathname === '/superadmin/login') {
      setLoading(false);
      return;
    }
    try {
      const s = JSON.parse(localStorage.getItem('sa_session') || 'null');
      // Session valid for 8 hours
      if (s?.username && Date.now() - s.ts < 8 * 60 * 60 * 1000) {
        setAuthed(true);
      } else {
        router.replace('/superadmin/login');
      }
    } catch {
      router.replace('/superadmin/login');
    }
    setLoading(false);
  }, [pathname, router]);

  const logout = () => {
    localStorage.removeItem('sa_session');
    router.push('/superadmin/login');
  };

  // Login page renders without shell
  if (pathname === '/superadmin' || pathname === '/superadmin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080809]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.4)]">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/20">Loading</p>
        </div>
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="flex min-h-screen" style={{ background: '#08090A' }}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="flex w-64 shrink-0 flex-col" style={{ background: '#0D0E10', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <div className="flex h-[60px] items-center gap-3 px-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_4px_16px_rgba(16,185,129,0.35)]">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white tracking-tight">Graze Platform</p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/30">Super Admin</p>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex flex-1 flex-col gap-0.5 p-2.5 pt-3">
          <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20">Platform</p>
          {NAV.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? 'sa-nav-active text-emerald-400'
                    : 'text-white/40 hover:bg-white/4 hover:text-white/75'
                }`}
              >
                <Icon className={`h-[15px] w-[15px] shrink-0 ${active ? 'text-emerald-400' : 'text-white/30'}`} />
                {label}
                {active && <ChevronRight className="ml-auto h-3 w-3 text-emerald-500/60" />}
              </Link>
            );
          })}
          <p className="mb-1.5 mt-3 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20">Developer</p>
          {NAV.slice(5).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? 'sa-nav-active text-emerald-400'
                    : 'text-white/40 hover:bg-white/4 hover:text-white/75'
                }`}
              >
                <Icon className={`h-[15px] w-[15px] shrink-0 ${active ? 'text-emerald-400' : 'text-white/30'}`} />
                {label}
                {active && <ChevronRight className="ml-auto h-3 w-3 text-emerald-500/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2.5 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-white/25 transition hover:bg-white/4 hover:text-white/55"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" /> View marketplace
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-white/25 transition hover:bg-white/4 hover:text-white/55"
          >
            <Store className="h-3.5 w-3.5 shrink-0" /> Shop admin
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-red-400/50 transition hover:bg-red-500/8 hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="flex h-[60px] items-center justify-between px-6 shrink-0" style={{ background: '#0D0E10', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-emerald-500/70" />
            <h1 className="text-[13px] font-semibold text-white/50">
              {NAV.find((n) => pathname.startsWith(n.href))?.label || 'Super Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-px w-24 bg-white/5" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-[11px] font-black text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                M
              </div>
              <span className="text-[12px] font-medium text-white/45">mraaziqp</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
