'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { SHOP_CONFIG } from '@/lib/shop-config';
import { useShop } from '@/components/ShopProvider';
import { auth, clearAdminSession, getStoredAdminSession } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { shopSlug } = useShop();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const session = getStoredAdminSession();
    const loggedIn = !!session?.uid;
    
    // If not on login page and not logged in, redirect
    if (!loggedIn && pathname !== '/admin' && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsLoggedIn(loggedIn);
    }
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch {
      // Best-effort sign out
    }
    clearAdminSession();
    router.push('/admin/login');
  };

  const handleShopSwitch = (value) => {
    const nextSlug = (value || 'default').trim();
    router.push(`${pathname}?shop=${encodeURIComponent(nextSlug)}`);
  };

  useEffect(() => {
    const loadShops = async () => {
      try {
        const response = await fetch('/api/shops/list', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        setShops(Array.isArray(data) ? data : []);
      } catch {
        setShops([]);
      }
    };

    loadShops();
  }, []);

  // Show login page
  if (pathname === '/admin' || pathname === '/admin/login') {
    return children;
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-charcoal/60">Loading...</p>
      </div>
    );
  }

  // Show protected content
  return (
    <div className="min-h-screen bg-cream">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b-2 border-gold/30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-cream font-bold text-xl border-2 border-gold">
                  {SHOP_CONFIG.shortName}
                </span>
                <div>
                  <h1 className="text-xl font-heading font-bold text-primary">Admin Panel</h1>
                  <p className="text-xs text-charcoal/60">{SHOP_CONFIG.name} Management</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/home${shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : ''}`}
                className="px-4 py-2 text-sm font-semibold text-charcoal hover:text-primary transition"
              >
                View Website
              </Link>
              <label className="flex items-center gap-2 rounded-xl border border-charcoal/10 bg-white px-3 py-2 text-sm">
                <span className="text-charcoal/60">Shop</span>
                <select
                  value={shopSlug}
                  onChange={(e) => handleShopSwitch(e.target.value)}
                  className="max-w-[12rem] bg-transparent font-semibold text-charcoal outline-none"
                >
                  <option value="default">Default</option>
                  {shops.map((entry) => (
                    <option key={entry.slug} value={entry.slug}>
                      {entry.name || entry.slug}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => router.push('/admin/setup')}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                >
                  New
                </button>
              </label>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="bg-white border-b border-charcoal/10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <NavTab href="/admin/dashboard" active={pathname === '/admin/dashboard'} icon="📊">
              Dashboard
            </NavTab>
            <NavTab href="/admin/orders" active={pathname.startsWith('/admin/orders')} icon="📦">
              Orders
            </NavTab>
            <NavTab href="/admin/menu" active={pathname === '/admin/menu'} icon="🍖">
              Menu
            </NavTab>
            <NavTab href="/admin/stats" active={pathname === '/admin/stats'} icon="📈">
              Statistics
            </NavTab>
            <NavTab href="/admin/setup" active={pathname.startsWith('/admin/setup')} icon="🧭">
              Setup
            </NavTab>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-charcoal/10 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-charcoal/60">
          <p>{SHOP_CONFIG.name} Admin Panel • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

function NavTab({ href, active, icon, children }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-6 py-4 font-semibold text-base transition border-b-4 whitespace-nowrap ${
        active
          ? 'text-primary border-primary bg-primary/5'
          : 'text-charcoal/60 border-transparent hover:text-primary hover:border-charcoal/20'
      }`}
    >
      <span className="text-xl">{icon}</span>
      {children}
    </Link>
  );
}
