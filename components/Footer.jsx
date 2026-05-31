'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, AtSign, Mail, Phone, Flame, Store, ArrowUpRight } from 'lucide-react';
import { useShop } from './ShopProvider';

export default function Footer() {
  const { shop, shopSlug } = useShop();
  const pathname = usePathname();
  const isMarketplace = pathname === '/';
  const hasShop = shopSlug && shopSlug !== 'default';
  const q = hasShop ? `?shop=${encodeURIComponent(shopSlug)}` : '';

  const waLink = shop.whatsappNumber
    ? `https://wa.me/${String(shop.whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${shop.name}! I have a question.`)}`
    : null;

  return (
    <footer className="mt-16 border-t border-charcoal/10 bg-charcoal text-cream">
      {/* Main footer grid */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-flame shadow-glow border border-gold/20">
                <Flame className="h-6 w-6 text-cream" />
              </div>
              <div>
                <p className="text-base font-black text-cream tracking-tight">Shopfront</p>
                <p className="text-xs text-cream/40 uppercase tracking-widest">Local ordering platform</p>
              </div>
            </div>

            <p className="text-sm text-cream/60 leading-relaxed max-w-xs">
              The easiest way for local food businesses to take orders, and for customers to discover them. No app needed.
            </p>

            {/* Social */}
            <div className="flex gap-3">
              {waLink && (
                <a href={waLink} target="_blank" rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 transition hover:bg-emerald-500 hover:text-white">
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
              {shop.instagramUrl && (
                <a href={shop.instagramUrl} target="_blank" rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-cream/60 transition hover:bg-white/15 hover:text-cream">
                  <AtSign className="h-5 w-5" />
                </a>
              )}
              {shop.supportEmail && (
                <a href={`mailto:${shop.supportEmail}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-cream/60 transition hover:bg-white/15 hover:text-cream">
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Platform links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold">Platform</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Explore Shops' },
                { href: `/menu${q}`, label: 'Browse Menu' },
                { href: `/order${q}`, label: 'Place Order' },
                { href: '/account/orders', label: 'My Orders' },
                { href: '/pricing', label: 'Pricing & Plans' },
                { href: '/account/packs', label: 'My Order Packs' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-cream/60 transition hover:text-gold">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business / Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold">Business</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/join" className="flex items-center gap-1 text-sm font-semibold text-gold transition hover:text-gold/80">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  List your shop — free
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="flex items-center gap-1 text-sm text-cream/60 transition hover:text-gold">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Pricing &amp; plans
                </Link>
              </li>
              <li>
                <Link href="/admin" className="flex items-center gap-1 text-sm text-cream/60 transition hover:text-gold">
                  <Store className="h-3.5 w-3.5" />
                  Admin Login
                </Link>
              </li>
            </ul>

            {shop.supportPhoneDisplay && (
              <div className="mt-4 space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gold">Contact</h3>
                <a href={`tel:${shop.supportPhoneDial}`}
                  className="flex items-center gap-2 text-sm text-cream/60 transition hover:text-gold">
                  <Phone className="h-3.5 w-3.5" />
                  {shop.supportPhoneDisplay}
                </a>
                {shop.locationSummary && (
                  <p className="text-sm text-cream/40">{shop.locationSummary}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/8">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream/40">
            © {new Date().getFullYear()} Shopfront. Built for local businesses.
          </p>
          <div className="flex items-center gap-4">
            {shop.orderTerms && (
              <p className="hidden sm:block text-xs text-cream/30 max-w-xs text-right line-clamp-1">{shop.orderTerms}</p>
            )}
            <Link
              href="/admin"
              className="rounded-lg border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/20"
            >
              🔐 Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
