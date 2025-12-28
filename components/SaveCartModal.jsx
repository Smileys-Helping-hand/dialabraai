'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { saveOrderPack, saveOrderPackLocal } from '@/lib/order-packs';
import AuthModal from './AuthModal';

export default function SaveCartModal({ isOpen, onClose, cart }) {
  const [packName, setPackName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!packName.trim()) {
      setError('Please enter a name for your pack');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (user) {
        await saveOrderPack(user.uid, packName.trim(), cart);
      } else {
        saveOrderPackLocal(packName.trim(), cart);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save pack:', err);
      setError('Failed to save pack. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="card max-w-md w-full p-8 space-y-6 animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading text-primary">Save Order Pack</h2>
              <p className="text-sm text-charcoal/70">
                Save this cart for quick reordering later
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-charcoal/50 hover:text-charcoal"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!user && (
            <div className="rounded-lg bg-gold/10 border border-gold/30 p-4">
              <p className="text-sm text-charcoal/80 mb-2">
                <strong>Note:</strong> You're saving this as a guest. For cloud sync across devices,{' '}
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-flame hover:text-orange font-semibold underline"
                >
                  create an account
                </button>
                .
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <label className="space-y-1 block">
              <span className="text-sm font-semibold text-charcoal">Pack Name</span>
              <input
                type="text"
                className="w-full border border-charcoal/15 rounded-2xl p-3 focus:border-orange focus:ring-2 focus:ring-orange/30"
                placeholder="e.g., Family BBQ, Weekend Braai"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                required
              />
            </label>

            <div className="rounded-lg bg-cream p-4 space-y-2">
              <p className="text-sm font-semibold text-charcoal">Items in this pack:</p>
              <ul className="space-y-1">
                {cart.map((item) => (
                  <li key={item.id} className="text-sm text-charcoal/80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-flame"></span>
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              className="button-primary w-full disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Pack'}
            </button>
          </form>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} mode="signup" />
    </>
  );
}
