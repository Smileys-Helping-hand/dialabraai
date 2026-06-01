'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Bookmark, ChevronRight, ShoppingCart, X, Loader2, AlertCircle, Search, Sparkles, Share2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeEngine';
import CategoryTabs from '@/components/CategoryTabs';
import MenuItemCard from '@/components/MenuItemCard';
import PackItemCard from '@/components/PackItemCard';
import CartNotification from '@/components/CartNotification';
import FloatingCartButton from '@/components/FloatingCartButton';
import { useAuth } from '@/lib/auth';
import { getOrderPacks, getOrderPacksLocal, saveOrderPack, saveOrderPackLocal } from '@/lib/order-packs';
import { calculateTotal } from '@/lib/price';
import { loadCart, deriveMenuCategories, saveCart } from '@/lib/utils';
import { useShop } from '@/components/ShopProvider';

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white border border-charcoal/8 shadow-card">
      <div className="h-44 shimmer" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-2/3 rounded-lg shimmer" />
        <div className="h-3.5 w-1/2 rounded-lg shimmer" />
        <div className="h-10 w-full rounded-2xl shimmer" />
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { shop, shopSlug } = useShop();
  const { theme } = useTheme();
  const feedStyle = theme?.productFeed || 'grid';
  const [active, setActive] = useState('');
  const [items, setItems] = useState([]);
  const [packs, setPacks] = useState([]);
  const [savedOrderPacks, setSavedOrderPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null);
  const [menuSearch, setMenuSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);
  const [showSavePackModal, setShowSavePackModal] = useState(false);
  const [packName, setPackName] = useState('');
  const [savingPack, setSavingPack] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const query = shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';
        const res = await fetch(`/api/menu/list${query}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        const allItems = Array.isArray(data) ? data : [];
        setItems(allItems.filter((i) => !i.isPack));
        setPacks(allItems.filter((i) => i.isPack));
      } catch (err) {
        console.error('Menu fetch failed', err);
        setError('Unable to load menu right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
    setCart(loadCart(shopSlug));

    const loadSavedPacks = async () => {
      try {
        if (user) {
          setSavedOrderPacks(await getOrderPacks(user.uid, shopSlug));
        } else {
          setSavedOrderPacks(getOrderPacksLocal(shopSlug));
        }
      } catch { /* silent */ }
    };
    loadSavedPacks();
  }, [user, shopSlug]);

  useEffect(() => { saveCart(cart, shopSlug); }, [cart, shopSlug]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(menuSearch), 300);
    return () => clearTimeout(debounceRef.current);
  }, [menuSearch]);

  const categories = useMemo(() => deriveMenuCategories(items, shop.defaultMenuCategories), [items, shop.defaultMenuCategories]);

  useEffect(() => {
    if (!categories.length) return;
    if (!active || !categories.includes(active)) setActive(categories[0]);
  }, [active, categories]);

  const handleAddPack = (pack) => {
    setCart((prev) => {
      let next = [...prev];
      pack.items.forEach((packItem) => {
        const existing = next.find((e) => e.id === packItem.id);
        if (existing) {
          next = next.map((e) => e.id === packItem.id ? { ...e, quantity: e.quantity + packItem.quantity } : e);
        } else {
          next.push({ ...packItem });
        }
      });
      return next;
    });
    setNotification({ name: pack.name, price: pack.price });
  };

  const handleAdd = (item) => {
    setCart((prev) => {
      const existing = prev.find((e) => e.id === item.id);
      if (existing) return prev.map((e) => e.id === item.id ? { ...e, quantity: e.quantity + 1 } : e);
      return [...prev, { ...item, quantity: 1 }];
    });
    setNotification(item);
  };

  const handleSavePack = async () => {
    if (!packName.trim()) { alert('Please enter a pack name'); return; }
    if (cart.length === 0) { alert('Your cart is empty. Add items before saving a pack.'); return; }

    setSavingPack(true);
    try {
      if (user) {
        await saveOrderPack(user.uid, packName, cart, shopSlug);
      } else {
        saveOrderPackLocal(packName, cart, shopSlug);
      }
      setShowSavePackModal(false);
      setPackName('');
      if (user) {
        setSavedOrderPacks(await getOrderPacks(user.uid, shopSlug));
      } else {
        setSavedOrderPacks(getOrderPacksLocal(shopSlug));
      }
    } catch (err) {
      console.error('Failed to save pack:', err);
      alert('Failed to save pack. Please try again.');
    } finally {
      setSavingPack(false);
    }
  };

  const specials = useMemo(() => items.filter((i) => i.is_special), [items]);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try { await navigator.share({ title: `${shop.name} Menu`, url }); } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const categoryCounts = useMemo(() =>
    categories.reduce((acc, cat) => {
      acc[cat] = items.filter((i) => i.category === cat).length;
      return acc;
    }, {}),
  [categories, items]);

  const displayItems = useMemo(() => {
    let base = items.filter((i) => i.category === active);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      base = base.filter((i) =>
        i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      );
    }
    return base;
  }, [items, active, debouncedSearch]);
  const total = useMemo(() => calculateTotal(cart), [cart]);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const q = shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {notification && (
        <CartNotification item={notification} onClose={() => setNotification(null)} />
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-flame p-8 text-cream">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 right-16 h-24 w-24 rounded-full bg-gold/10" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gold/80">{shop.name}</p>
            <h1 className="text-3xl font-black leading-tight text-cream md:text-4xl">
              Browse the Menu
            </h1>
            <p className="text-sm text-cream/70">
              {categories.length > 0 ? `${categories.length} categories · ${items.length} items` : 'Loading menu…'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/40 bg-white/10 text-cream backdrop-blur transition hover:bg-white/20" title="Share this menu">
              <Share2 className="h-4 w-4" />
            </button>
            {cart.length > 0 && (
              <button onClick={() => setShowSavePackModal(true)} className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-cream backdrop-blur transition hover:bg-white/20">
                <Bookmark className="h-4 w-4" />
                Save Pack
              </button>
            )}
            <div className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-cream backdrop-blur">
              <ShoppingCart className="h-4 w-4 text-gold" />
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Specials */}
      {!loading && specials.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="font-display text-2xl font-extrabold text-charcoal">Today&apos;s Specials</h2>
            <span className="rounded-full bg-flame/10 px-2.5 py-1 text-xs font-bold text-flame border border-flame/20">{specials.length} on special</span>
          </div>
          <div className={feedStyle === 'list' ? 'flex flex-col gap-2.5' : 'grid gap-5 sm:grid-cols-2 md:grid-cols-3'}>
            {specials.map((item, i) => (
              <div key={item.id} className="relative animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="absolute -top-2 -right-2 z-10 rounded-full bg-flame px-2.5 py-1 text-[10px] font-black text-cream shadow-glow">Special</div>
                <MenuItemCard item={item} onAdd={handleAdd} feedStyle={feedStyle} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combo packs */}
      {packs.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <h2 className="text-2xl font-black text-charcoal">Combo Packs</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {packs.map((pack, i) => (
              <div key={pack.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <PackItemCard pack={pack} onAdd={handleAddPack} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved order packs */}
      {savedOrderPacks.length > 0 && (
        <div className="space-y-4 animate-slide-up delay-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <h2 className="text-2xl font-black text-charcoal">Your Saved Packs</h2>
            </div>
            <a
              href={`/account/packs${q}`}
              className="flex items-center gap-1 text-sm font-semibold text-flame hover:text-primary transition"
            >
              Manage all
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {savedOrderPacks.slice(0, 3).map((pack, i) => (
              <div key={pack.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <PackItemCard pack={pack} onAdd={handleAddPack} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs + search */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <CategoryTabs categories={categories} active={active} onChange={(cat) => { setActive(cat); setMenuSearch(''); setDebouncedSearch(''); }} counts={categoryCounts} />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder={`Search in ${active}…`}
              className="input-base pl-10 py-2.5 text-sm"
            />
            {menuSearch && (
              <button onClick={() => { setMenuSearch(''); setDebouncedSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-charcoal/40 hover:text-charcoal">
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Items grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-5 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-4xl mb-3">{menuSearch ? '🔍' : '🍽️'}</p>
          <p className="text-charcoal/60">
            {menuSearch
              ? `No items match "${menuSearch}" in ${active}.`
              : `No items in ${active} yet.`}
          </p>
          {menuSearch && (
            <button onClick={() => { setMenuSearch(''); setDebouncedSearch(''); }} className="mt-3 text-sm font-semibold text-flame hover:text-primary transition">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className={
          feedStyle === 'list'
            ? 'flex flex-col gap-2.5'
            : feedStyle === 'masonry'
            ? 'columns-2 md:columns-3 gap-4 [&>div]:mb-4 [&>div]:break-inside-avoid'
            : 'grid gap-5 sm:grid-cols-2 md:grid-cols-3'
        }>
          {displayItems.map((item, i) => (
            <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <MenuItemCard item={item} onAdd={handleAdd} feedStyle={feedStyle} />
            </div>
          ))}
        </div>
      )}

      <FloatingCartButton itemCount={cartCount} total={total} />

      {/* Save Pack Modal */}
      {showSavePackModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSavePackModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white shadow-dark p-7 space-y-5 animate-scale-bounce"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-charcoal">Save as Pack</h2>
              <button
                onClick={() => setShowSavePackModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-charcoal/10 text-charcoal/40 hover:text-charcoal transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-charcoal/60">
              Save your current cart ({cartCount} items) as a reusable pack for quick reordering.
            </p>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-charcoal">Pack Name</label>
              <input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                placeholder="e.g., Weekly Favourites"
                className="input-base"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSavePack(); }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSavePackModal(false)}
                disabled={savingPack}
                className="button-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePack}
                disabled={savingPack}
                className="button-primary flex-1 flex items-center justify-center gap-2"
              >
                {savingPack ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                ) : (
                  <><Bookmark className="h-4 w-4" /> Save Pack</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
