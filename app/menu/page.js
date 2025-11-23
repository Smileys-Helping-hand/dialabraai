'use client';
import { useEffect, useMemo, useState } from 'react';
import CategoryTabs from '@/components/CategoryTabs';
import MenuItemCard from '@/components/MenuItemCard';
import { loadCart, menuCategories, saveCart } from '@/lib/utils';

export default function MenuPage() {
  const [active, setActive] = useState(menuCategories[0]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu/list');
        if (!res.ok) {
          throw new Error('Request failed');
        }
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Menu fetch failed', err);
        setError('Unable to load menu right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
    setCart(loadCart());
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const displayItems = useMemo(() => items.filter((item) => item.category === active), [items, active]);

  const handleAdd = (item) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) => (entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
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
    </div>
  );
}
