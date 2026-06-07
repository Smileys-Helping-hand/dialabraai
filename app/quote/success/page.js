'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Home, MessageCircle } from 'lucide-react';
import { useShop } from '@/components/ShopProvider';

export default function QuoteSuccessPage() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId');
  const { shop, shopSlug } = useShop();

  const q = shopSlug !== 'default' ? `?shop=${encodeURIComponent(shopSlug)}` : '';

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <h1 className="font-display text-4xl font-extrabold text-charcoal">
          Quote request sent!
        </h1>
        <p className="mt-3 text-lg text-charcoal/65">
          {shop.name} will review your items and send you a custom quote soon.
        </p>

        {quoteId && (
          <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/8 px-5 py-4 text-center">
            <p className="text-sm text-charcoal/55">Quote Reference</p>
            <p className="mt-1 font-mono text-sm font-bold text-charcoal">{quoteId}</p>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">What happens next?</p>
              <ul className="mt-2 space-y-1.5 text-sm text-blue-800">
                <li>✓ {shop.name} will review your items</li>
                <li>✓ You'll receive a quote via email and WhatsApp</li>
                <li>✓ You can accept or modify the quote</li>
                <li>✓ Once accepted, your order will be confirmed</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/quotes/history${q}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-bold text-cream shadow-glow transition-all hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            View your quotes
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/menu${q}`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-charcoal/15 px-6 py-3.5 text-base font-bold text-charcoal transition-all hover:border-charcoal/30 hover:bg-charcoal/2"
          >
            <Home className="h-4 w-4" />
            Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
}
