'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Grid, Package, Flame, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import ThemeCustomizerPanel from './ThemeCustomizerPanel';
import ThemeEngine, { useTheme } from './ThemeEngine';
import { useShop } from './ShopProvider';

// ─── Sidebar nav (only when navStyle === 'sidebar') ───────────────────────────
function SidebarNav() {
  const pathname  = usePathname();
  const { shop, shopSlug } = useShop();
  const q = shopSlug && shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';

  const links = [
    { href: '/',          label: 'Explore', icon: Store   },
    { href: `/home${q}`,  label: 'Shop',    icon: Flame   },
    { href: `/menu${q}`,  label: 'Menu',    icon: Grid    },
    { href: `/order${q}`, label: 'Order',   icon: Package },
  ];

  return (
    <aside
      className="hidden md:flex w-56 shrink-0 flex-col min-h-screen sticky top-0 border-r"
      style={{
        borderColor: 'rgba(var(--color-charcoal)/0.08)',
        background: 'var(--te-surface, rgba(255,255,255,0.7))',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex h-16 items-center gap-3 border-b px-5" style={{ borderColor: 'rgba(var(--color-charcoal)/0.06)' }}>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, var(--te-primary,#762C1B), var(--te-accent,#E46A28))` }}
        >
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-black" style={{ color: 'var(--te-text,#1A1715)' }}>Graze</p>
          {shop.name && shop.name !== 'Shopfront' && (
            <p className="text-[10px] font-medium truncate max-w-[6rem]" style={{ color: 'var(--te-text,#1A1715)', opacity: 0.5 }}>{shop.name}</p>
          )}
        </div>
      </Link>

      {/* Links */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const base  = href.split('?')[0];
          const active = pathname === href || (base !== '/' && pathname?.startsWith(base));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
              style={active
                ? { background: 'rgba(var(--color-primary)/0.1)', color: 'var(--te-primary,#762C1B)' }
                : { color: 'var(--te-text,#1A1715)', opacity: 0.55 }
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-40" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── InnerLayout: reads theme context and switches structure ──────────────────
function InnerLayout({ children }) {
  const { theme } = useTheme();

  if (theme.navStyle === 'sidebar') {
    return (
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="flex flex-1 flex-col min-w-0">
          <div className="md:hidden"><Navbar /></div>
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export default function LayoutWrapper({ children }) {
  return (
    <ThemeEngine>
      <InnerLayout>{children}</InnerLayout>
      <ThemeCustomizerPanel />
    </ThemeEngine>
  );
}
