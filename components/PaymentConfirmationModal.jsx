'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'cash', label: '💵 Cash', color: 'bg-green-100 text-green-800' },
  { value: 'eft', label: '🏦 Bank Transfer (EFT)', color: 'bg-blue-100 text-blue-800' },
  { value: 'card', label: '💳 Card', color: 'bg-purple-100 text-purple-800' },
  { value: 'online', label: '🔗 Online Payment', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'crypto', label: '₿ Cryptocurrency', color: 'bg-yellow-100 text-yellow-800' },
];

export default function PaymentConfirmationModal({ quote, isOpen, onClose, onConfirm }) {
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !quote) return null;

  const handleConfirm = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setConfirming(true);
    setError('');

    try {
      const res = await fetch(`/api/quotes/${quote.id}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: selectedMethod,
          payment_reference: reference,
        }),
      });

      if (!res.ok) throw new Error('Failed to confirm payment');

      const data = await res.json();
      onConfirm(data.quote);
      onClose();
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError('Failed to confirm payment. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const selectedMethodConfig = PAYMENT_METHODS.find((m) => m.value === selectedMethod);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-charcoal/10 px-6 py-4">
          <div>
            <h2 className="font-semibold text-charcoal text-lg">Confirm Payment</h2>
            <p className="text-sm text-charcoal/60 mt-0.5">Quote #{quote.id.substring(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-charcoal/5 transition"
          >
            <X className="h-5 w-5 text-charcoal/60" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Amount */}
          <div className="rounded-xl border border-gold/25 bg-gold/8 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-flame mb-1">Amount</p>
            <p className="font-display text-2xl font-bold text-charcoal">
              R{quote.shop_quoted_price?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-charcoal/60 mt-1">{quote.customer_name}</p>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-3">
              Payment Method
            </label>
            <div className="grid gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setSelectedMethod(method.value)}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left font-semibold transition-all ${
                    selectedMethod === method.value
                      ? 'border-primary bg-primary/5'
                      : 'border-charcoal/10 hover:border-charcoal/20'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Number */}
          {(selectedMethod === 'eft' || selectedMethod === 'online' || selectedMethod === 'crypto') && (
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Reference / Transaction ID (optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., TXN123456"
                className="input-base"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-charcoal/10 px-6 py-4">
          <button
            onClick={onClose}
            disabled={confirming}
            className="flex-1 rounded-lg border border-charcoal/15 px-4 py-2.5 font-semibold text-charcoal transition hover:border-charcoal/30 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-cream transition hover:scale-105 disabled:opacity-50"
          >
            {confirming ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Confirming…</>
            ) : (
              <><CheckCircle2 className="h-4 w-4" /> Confirm Payment</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
