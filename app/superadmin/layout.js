'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Flame, LayoutDashboard, Store, ShoppingBag,
  LogOut, ChevronRight, ExternalLink, Code2, ScrollText, Megaphone,
} from 'lucide-react';

const NAV = [
  { href: '/superadmin/dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/superadmin/shops',     label: 'All Shops',      icon: Store            },
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
      <div className="flex min-h-screen items-center justify-center bg-[#0F0D0C]">
        <Flame className="h-8 w-8 animate-bounce-subtle text-flame" />
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="flex min-h-screen bg-[#0F0D0C]">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/6 bg-[#161210]">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/6 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-flame shadow-glow">
            <Flame className="h-5 w-5 text-cream" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Graze</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Super Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-flame/15 text-flame shadow-[inset_0_0_0_1px_rgba(16, 185, 129,0.2)]'
                    : 'text-white/45 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/6 p-3 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/30 transition hover:text-white/60"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View marketplace
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/30 transition hover:text-white/60"
          >
            <Store className="h-3.5 w-3.5" /> Shop admin
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-white/6 bg-[#161210] px-6">
          <h1 className="text-sm font-bold text-white/60">
            {NAV.find((n) => pathname.startsWith(n.href))?.label || 'Super Admin'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-flame text-xs font-black text-cream">
              M
            </span>
            <span className="text-sm font-semibold text-white/60">mraaziqp</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
