'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getOrderHistory } from '@/lib/order-packs';
import { formatPrice } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/home');
      return;
    }

    const fetchOrders = async () => {
      try {
        const userOrders = await getOrderHistory(user.uid);
        // Sort by date, newest first
        userOrders.sort((a, b) => {
          const dateA = a.created_at?.seconds ? a.created_at.seconds * 1000 : 0;
          const dateB = b.created_at?.seconds ? b.created_at.seconds * 1000 : 0;
          return dateB - dateA;
        });
        setOrders(userOrders);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError('Failed to load your order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading, router]);

  const handleReorder = (order) => {
    // Load order items into cart and navigate to menu
    if (typeof window !== 'undefined') {
      localStorage.setItem('dialabraai_cart', JSON.stringify(order.items));
      router.push('/order');
    }
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
        <div>
          <p className="text-sm uppercase tracking-wide text-flame font-semibold">Your Orders</p>
          <h1 className="text-3xl font-heading text-primary">Order History</h1>
          <p className="text-sm text-charcoal/75">
            View your past orders and reorder with one click
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {orders.length === 0 ? (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <div>
            <h2 className="text-xl font-heading text-primary mb-2">No orders yet</h2>
            <p className="text-charcoal/70 mb-4">
              Place your first order to start building your history
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="button-primary inline-flex"
            >
              Browse Menu
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading text-lg text-primary">
                      Order #{order.id.substring(0, 8)}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-charcoal/60">
                    {new Date(
                      order.created_at?.seconds ? order.created_at.seconds * 1000 : order.created_at
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gold">
                    {formatPrice(order.total_price)}
                  </p>
                  <p className="text-xs text-charcoal/60">
                    {order.items?.length || 0} items
                  </p>
                </div>
              </div>

              <div className="border-t border-charcoal/10 pt-3">
                <p className="text-xs font-semibold text-charcoal/70 uppercase tracking-wide mb-2">
                  Items:
                </p>
                <ul className="space-y-1">
                  {order.items?.map((item, idx) => (
                    <li key={idx} className="text-sm text-charcoal/80 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-flame"></span>
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleReorder(order)}
                  className="button-secondary flex-1"
                >
                  Reorder
                </button>
                <button
                  onClick={() => router.push(`/order/${order.id}`)}
                  className="button-secondary flex-1"
                >
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
