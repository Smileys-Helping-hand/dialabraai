'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useShop } from '@/components/ShopProvider';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Loader2, FileText, ChevronRight } from 'lucide-react';

function QuoteCard({ quote, shopSlug }) {
  const statusConfig = {
    pending: { label: 'Waiting for quote', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    quoted: { label: 'Quote ready', color: 'text-blue-600', bg: 'bg-blue-50', icon: FileText },
    accepted: { label: 'Accepted', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
    rejected: { label: 'Declined', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
  };

  const config = statusConfig[quote.status] || statusConfig.pending;
  const Icon = config.icon;

  const q = shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';

  return (
    <Link href={`/quotes/${quote.id}${q}`}>
      <div className="rounded-2xl border border-charcoal/10 bg-white p-5 transition-all hover:border-primary/25 hover:shadow-md cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bg}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <h3 className="font-semibold text-charcoal">Quote #{quote.id.substring(0, 8)}</h3>
            </div>
            <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
            <p className="mt-2 text-sm text-charcoal/65">{quote.items.length} item{quote.items.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            {quote.shop_quoted_price ? (
              <p className="text-lg font-bold text-charcoal">R{quote.shop_quoted_price.toFixed(2)}</p>
            ) : (
              <p className="text-sm text-charcoal/50">Awaiting price</p>
            )}
            <p className="mt-1 text-xs text-charcoal/50">
              {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-charcoal/6">
          <p className="text-xs text-charcoal/50">{quote.customer_name}</p>
          <ChevronRight className="h-4 w-4 text-charcoal/30" />
        </div>
      </div>
    </Link>
  );
}

export default function QuotesHistoryPage() {
  const { user } = useAuth();
  const { shopSlug } = useShop();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const q = shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    fetch(`/api/quotes/list?customer_email=${encodeURIComponent(user.email)}&shop_slug=${shopSlug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.quotes && Array.isArray(d.quotes)) {
          setQuotes(d.quotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch quotes:', err);
        setError('Could not load your quotes. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [user?.email, shopSlug]);

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-charcoal mb-3">Sign in to view quotes</h1>
        <p className="text-charcoal/60 mb-6">You need to be logged in to see your quote history.</p>
        <Link href={`/account${q}`} className="inline-block rounded-2xl bg-primary px-6 py-3 font-bold text-cream hover:scale-105 transition-transform">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/menu${q}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-charcoal/50 transition hover:text-charcoal">
        <ArrowLeft className="h-4 w-4" />
        Back to menu
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal">Your quotes</h1>
        <p className="mt-1 text-charcoal/60">Track all your quote requests and their status</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 mb-6">
          <AlertCircle className="inline h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-charcoal/60">Loading your quotes...</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-8 text-center">
          <FileText className="h-12 w-12 text-charcoal/20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-charcoal mb-2">No quotes yet</h2>
          <p className="text-charcoal/60 mb-6">Start by requesting a quote for custom items</p>
          <Link href={`/quote${q}`} className="inline-block rounded-2xl bg-primary px-6 py-3 font-bold text-cream hover:scale-105 transition-transform">
            Request a quote
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} shopSlug={shopSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
