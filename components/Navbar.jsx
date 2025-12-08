'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const navLinks = [
  { href: '/home', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/order', label: 'Order' },
  // Admin link hidden - access directly via /admin/orders
];

export default function Navbar() {
  const pathname = usePathname();
  const activeMap = useMemo(
    () =>
      navLinks.reduce((map, link) => {
        map[link.href] = pathname?.startsWith(link.href);
        return map;
      }, {}),
    [pathname]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-gradient-to-r from-cream/95 via-[#FFF4E2]/95 to-cream/95 backdrop-blur">
      <div className="container flex items-center justify-between gap-4 py-3">
        <Link
          href="/home"
          className="flex items-center gap-3 text-xl font-heading text-primary"
          aria-label="Dial-A-Braai home"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-cream font-semibold border-2 border-gold shadow-[0_10px_20px_-12px_rgba(118,44,27,0.45)]">
            DB
          </span>
          <div className="leading-tight text-base">
            <span className="block font-semibold">Dial-A-Braai</span>
            <span className="block text-xs text-charcoal/70">Halal braai, Cape Town</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-base font-semibold md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-4 py-2 transition-colors border ${
                activeMap[link.href]
                  ? 'bg-primary text-cream border-gold shadow-[0_0_10px_#E46A28]'
                  : 'text-charcoal border-transparent hover:border-gold hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/order"
          className="brand-button text-base font-semibold"
          aria-label="Start an order"
        >
          Order now
        </Link>
      </div>

      <nav className="md:hidden border-t border-gold/30 bg-white/80 backdrop-blur">
        <div className="container flex items-center justify-between overflow-x-auto py-2 text-base font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 border ${
                activeMap[link.href]
                  ? 'bg-primary text-cream border-gold shadow-[0_0_10px_#E46A28]'
                  : 'text-charcoal border-transparent hover:border-gold'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
