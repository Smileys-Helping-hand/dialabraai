'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {
  getOrderPacks,
  deleteOrderPack,
  getOrderPacksLocal,
  deleteOrderPackLocal,
} from '@/lib/order-packs';
import { loadCart, saveCart } from '@/lib/utils';

export default function OrderPacksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    const fetchPacks = async () => {
      try {
        if (user) {
          const userPacks = await getOrderPacks(user.uid);
          setPacks(userPacks);
        } else {
          const localPacks = getOrderPacksLocal();
          setPacks(localPacks);
        }
      } catch (err) {
        console.error('Failed to load packs:', err);
        setError('Failed to load your order packs');
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, [user, authLoading]);

  const handleDelete = async (packId) => {
    if (!confirm('Are you sure you want to delete this pack?')) return;

    try {
      if (user) {
        await deleteOrderPack(user.uid, packId);
      } else {
        deleteOrderPackLocal(packId);
      }
      setPacks((prev) => prev.filter((p) => p.id !== packId));
    } catch (err) {
      console.error('Failed to delete pack:', err);
      alert('Failed to delete pack. Please try again.');
    }
  };

  const handleLoadPack = (pack) => {
    const currentCart = loadCart();
    const newCart = [...currentCart, ...pack.items];
    saveCart(newCart);
    router.push('/menu');
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream rounded w-1/3"></div>
          <div className="h-32 bg-cream rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="section-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-flame font-semibold">Quick Reorder</p>
            <h1 className="text-3xl font-heading text-primary">My Order Packs</h1>
            <p className="text-sm text-charcoal/75">
              Saved cart templates for quick reordering
            </p>
          </div>
          <button
            onClick={() => router.push('/menu')}
            className="button-secondary"
          >
            Browse Menu
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {packs.length === 0 ? (
        <div className="card p-8 text-center space-y-4">
          <svg
            className="w-16 h-16 mx-auto text-charcoal/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <div>
            <h2 className="text-xl font-heading text-primary mb-2">No saved packs yet</h2>
            <p className="text-charcoal/70 mb-4">
              Create your first order pack to make reordering faster
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="button-primary inline-flex"
            >
              Start Building a Pack
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {packs.map((pack) => (
            <article key={pack.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-xl text-primary">{pack.name}</h3>
                  <p className="text-xs text-charcoal/60">
                    {pack.items?.length || 0} items • Created{' '}
                    {new Date(pack.createdAt?.seconds ? pack.createdAt.seconds * 1000 : pack.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <ul className="space-y-1 border-t border-charcoal/10 pt-3">
                {pack.items?.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="text-sm text-charcoal/80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-flame"></span>
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                  </li>
                ))}
                {pack.items?.length > 3 && (
                  <li className="text-sm text-charcoal/60 italic">
                    +{pack.items.length - 3} more items
                  </li>
                )}
              </ul>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleLoadPack(pack)}
                  className="button-primary flex-1"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleDelete(pack.id)}
                  className="button-danger px-4"
                  aria-label="Delete pack"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
