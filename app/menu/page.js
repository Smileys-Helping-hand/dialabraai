'use client';
import { useEffect, useMemo, useState } from 'react';
import CategoryTabs from '@/components/CategoryTabs';
import MenuItemCard from '@/components/MenuItemCard';
import PackItemCard from '@/components/PackItemCard';
import CartNotification from '@/components/CartNotification';
import FloatingCartButton from '@/components/FloatingCartButton';
import { useAuth } from '@/lib/auth';
import { getOrderPacks, getOrderPacksLocal } from '@/lib/order-packs';
import { calculateTotal } from '@/lib/price';
import { loadCart, menuCategories, saveCart } from '@/lib/utils';

export default function MenuPage() {
  const [active, setActive] = useState(menuCategories[0]);
  const [items, setItems] = useState([]);
  const [packs, setPacks] = useState([]);
  const [savedOrderPacks, setSavedOrderPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu/list', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Request failed');
        }
        const data = await res.json();
        const allItems = Array.isArray(data) ? data : [];
        
        // Separate packs from regular items
        const regularItems = allItems.filter(item => !item.isPack);
        const packItems = allItems.filter(item => item.isPack);
        
        setItems(regularItems);
        setPacks(packItems);
      } catch (err) {
        console.error('Menu fetch failed', err);
        setError('Unable to load menu right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
    setCart(loadCart());

    // Load saved order packs
    const loadSavedPacks = async () => {
      try {
        if (user) {
          const userPacks = await getOrderPacks(user.uid);
          setSavedOrderPacks(userPacks);
        } else {
          const localPacks = getOrderPacksLocal();
          setSavedOrderPacks(localPacks);
        }
      } catch (err) {
        console.error('Failed to load saved packs:', err);
      }
    };

    loadSavedPacks();
  }, [user]);

  useEffect(() => {
    saveCart(cart);
  },

  const handleAddPack = (pack) => {
    // Add all items from the pack to cart
    setCart((prev) => {
      let newCart = [...prev];
      pack.items.forEach((packItem) => {
        const existing = newCart.find((entry) => entry.id === packItem.id);
        if (existing) {
          newCart = newCart.map((entry) =>
            entry.id === packItem.id
              ? { ...entry, quantity: entry.quantity + packItem.quantity }
              : entry
          );
        } else {
          newCart.push({ ...packItem });
        }
      });
      return newCart;
    });
    
    // Show notification for the pack
    setNotification({ name: pack.name, price: pack.price });
  }; [cart]);

  const displayItems = useMemo(() => items.filter((item) => item.category === active), [items, active]);

  const total = useMemo(() => calculateTotal(cart), [cart]);

  const handleAdd = (item) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) => (entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    
    // Show notification
    setNotification(item);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      {notification && (
        <CartNotification 
          item={notification} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="section-surface p-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-semibold text-flame uppercase tracking-wide">Menu</p>
          <h1 className="text-4xl font-heading text-primary leading-tight">Explore our selection of fresh seafood, tender meats, signature chicken, and homestyle sides.</h1>
          <p className="text-base text-charcoal/80">Browse by category and tap to add to your order.</p>
        </div>
        <div className="rounded-full bg-cream px-4 py-2 text-sm text-charcoal shadow-sm border border-charcoal/15">
          <span className="font-semibold text-flame">Cart Preview:</span> {cart.reduce((sum, item) => sum + item.quantity, 0)} items
        </div>
      </div>

      <CategoryTabs categories={menuCategories} active={active} onChange={setActive} />

      {/* Display menu packs if available */}
      {packs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-flame" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h2 className="text-2xl font-heading text-primary">Combo Packs</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {packs.map((pack) => (
              <PackItemCard key={pack.id} pack={pack} onAdd={handleAddPack} />
            ))}
          </div>
        </div>
      )}

      {/* Display saved order packs if available */}
      {savedOrderPacks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h2 className="text-2xl font-heading text-primary">Your Saved Packs</h2>
            </div>
            <a href="/account/packs" className="text-sm font-semibold text-flame hover:text-orange">
              Manage all →
            </a>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {savedOrderPacks.slice(0, 3).map((pack) => (
              <PackItemCard key={pack.id} pack={pack} onAdd={handleAddPack} />
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="card h-48 bg-gradient-to-br from-cream to-[#FDF3D2] animate-pulse border-[#1A1715]/10"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-6 text-red-700">{error}</div>
      ) : displayItems.length === 0 ? (
        <div className="rounded-xl bg-cream p-6 text-charcoal">We’re warming up the grill. Please check back shortly.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {displayItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAdd={handleAdd} />
          ))}
        </div>
      )}

      <FloatingCartButton 
        itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        total={total} 
      />
    </div>
  );
}
