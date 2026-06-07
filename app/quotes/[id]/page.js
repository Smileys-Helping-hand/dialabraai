'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { useShop } from '@/components/ShopProvider';
import { calculateTotal } from '@/lib/price';

export default function QuoteDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  const { shopSlug } = useShop();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  const q = shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Quote not found');
        return r.json();
      })
      .then((d) => setQuote(d.quote))
      .catch((err) => {
        console.error('Failed to fetch quote:', err);
        setError('Could not load this quote. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAccept = async () => {
    if (!quote) return;
    setAccepting(true);
    try {
      const res = await fetch(`/api/quotes/${id}/accept`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to accept');
      const data = await res.json();
      setQuote(data.quote);
    } catch (err) {
      console.error('Failed to accept quote:', err);
      setError('Failed to accept quote. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-charcoal/60">Loading quote...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href={`/quotes/history${q}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-charcoal/50 hover:text-charcoal">
          <ArrowLeft className="h-4 w-4" />
          Back to quotes
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">{error || 'Quote not found'}</p>
        </div>
      </div>
    );
  }

  const items = quote.items || [];
  const estimatedTotal = calculateTotal(items);

  const statusConfig = {
    pending: { label: 'Waiting for quote', badge: 'bg-amber-100 text-amber-800' },
    quoted: { label: 'Quote ready for review', badge: 'bg-blue-100 text-blue-800' },
    accepted: { label: 'Quote accepted', badge: 'bg-green-100 text-green-800' },
    rejected: { label: 'Quote declined', badge: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[quote.status] || statusConfig.pending;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href={`/quotes/history${q}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-charcoal/50 hover:text-charcoal">
        <ArrowLeft className="h-4 w-4" />
        Back to quotes
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-flame mb-1">Quote #{quote.id.substring(0, 12)}</p>
            <h1 className="font-display text-3xl font-bold text-charcoal">Review your quote</h1>
          </div>
          <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${config.badge}`}>
            {config.label}
          </span>
        </div>
        <p className="text-charcoal/60">
          Requested on {new Date(quote.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-6 mb-6">
        <h2 className="font-semibold text-charcoal mb-4">Items in your quote</h2>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between pb-3 border-b border-charcoal/6 last:pb-0 last:border-b-0">
              <div>
                <p className="font-semibold text-charcoal">{item.name}</p>
                <p className="text-sm text-charcoal/60">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-charcoal">R{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-6 mb-6">
        <h2 className="font-semibold text-charcoal mb-4">Pricing</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-charcoal/65">Estimated total</span>
            <span className="font-semibold text-charcoal">R{estimatedTotal.toFixed(2)}</span>
          </div>
          {quote.shop_quoted_price !== null && (
            <div className="flex items-center justify-between pt-3 border-t border-charcoal/10">
              <span className="font-semibold text-charcoal">Final quoted price</span>
              <span className="font-display text-2xl font-bold text-primary">R{quote.shop_quoted_price.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-6 mb-6">
          <h2 className="font-semibold text-charcoal mb-2">Your notes</h2>
          <p className="text-charcoal/70 whitespace-pre-wrap">{quote.notes}</p>
        </div>
      )}

      {/* Status-specific sections */}
      {quote.status === 'pending' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Waiting for the shop</p>
              <p className="text-sm text-amber-800 mt-1">The shop owner is reviewing your request. You'll receive an email and WhatsApp notification when your quote is ready.</p>
            </div>
          </div>
        </div>
      )}

      {quote.status === 'quoted' && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 mb-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-blue-900">Quote ready for review</p>
              <p className="text-sm text-blue-800 mt-1">The shop has sent you a quote. Review the items and price above, then accept or decline.</p>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {accepting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Accepting…</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Accept this quote</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {quote.status === 'accepted' && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Quote accepted!</p>
              <p className="text-sm text-green-800 mt-1">
                Your quote has been accepted. The shop will contact you shortly to confirm delivery or pickup details.
              </p>
              {quote.accepted_at && (
                <p className="text-xs text-green-700 mt-2">
                  Accepted on {new Date(quote.accepted_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
