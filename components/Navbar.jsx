'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Store, Menu as MenuIcon, X, Flame, ChevronRight } from 'lucide-react';
import AccountButton from './AccountButton';
import { useShop } from './ShopProvider';

export default function Navbar() {
  const pathname  = usePathname();
  const { shop, shopSlug } = useShop();
  const [open, setOpen] = useState(false);

  const isMarketplace = pathname === '/';
  const hasShop       = shopSlug && shopSlug !== 'default';

  // Build the query or path prefix depending on which routing style is active
  const q     = hasShop ? `?shop=${encodeURIComponent(shopSlug)}` : '';
  const isSlugPath = pathname?.startsWith(`/shop/${shopSlug}`);
  const prefix = isSlugPath ? `/shop/${shopSlug}` : '';

  // Resolve a href using path-style if we're in a /shop/[slug] context, else ?shop=
  const href = (page) => {
    if (page === '/') return '/';
    if (isSlugPath) return `${prefix}${page === '/home' ? '' : `/${page.replace('/', '')}`}`;
    return `${page}${q}`;
  };

  const inShopContext = hasShop || pathname?.startsWith('/menu') || pathname?.startsWith('/order') || pathname?.startsWith('/home') || pathname?.startsWith('/shop/');

  const shopLinks = useMemo(() => [
    { key: 'home',  label: 'Shop',  path: '/home'  },
    { key: 'menu',  label: 'Menu',  path: '/menu'  },
    { key: 'order', label: 'Order', path: '/order' },
  ], []);

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    const bare = path.replace(/\?.*/, '');
    return pathname?.startsWith(bare);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-charcoal/8 bg-white/92 shadow-[0_1px_16px_-6px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75" aria-label="Graze home">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-flame shadow-glow">
              {shop.logoUrl && isMarketplace === false
                ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" />
                : <Flame className="h-4.5 w-4.5 text-cream" />
              }
            </div>
            <div className="leading-none">
              <span className="block text-[15px] font-extrabold tracking-tight text-charcoal">
                {inShopContext && !isMarketplace && hasShop ? shop.name : 'Graze'}
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-charcoal/40">
                {inShopContext && !isMarketplace && hasShop ? (shop.tagline?.slice(0, 28) || 'Local ordering') : 'Local ordering'}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {/* Always: Explore */}
            <Link
              href="/"
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                isActive('/') ? 'bg-primary text-cream shadow-glow' : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              Explore
            </Link>

            {/* Shop-specific links when in context */}
            {inShopContext && shopLinks.map(({ key, label, path }) => (
              <Link
                key={key}
                href={href(path)}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  isActive(path) ? 'bg-primary text-cream shadow-glow' : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <AccountButton />

            {inShopContext && (
              <Link
                href={href('/order')}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-cream shadow-glow transition-all hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Order now
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}

            <button
              onClick={() => setOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-charcoal/10 text-charcoal/60 md:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <nav className="animate-slide-down border-t border-charcoal/8 bg-white/95 backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
            <div className="container mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive('/') ? 'bg-primary text-cream' : 'text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal'
                }`}
              >
                <Store className="h-4 w-4" /> Explore all shops
              </Link>

              {inShopContext && shopLinks.map(({ key, label, path }) => (
                <Link
                  key={key}
                  href={href(path)}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive(path) ? 'bg-primary text-cream' : 'text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal'
                  }`}
                >
                  {label}
                </Link>
              ))}

              {inShopContext && (
                <Link
                  href={href('/order')}
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-cream shadow-glow"
                >
                  Order now
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
