'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import AuthModal from './AuthModal';

export default function AccountButton() {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
  };

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-cream border border-charcoal/20 hover:border-orange hover:shadow-md transition-all text-sm font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Sign In</span>
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/50 hover:bg-gold/30 transition-all text-sm font-semibold"
      >
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white font-bold">
          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
        </div>
        <span className="hidden md:inline">{user.name || 'Account'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-56 card p-2 z-50 space-y-1">
            <div className="px-3 py-2 border-b border-charcoal/10">
              <p className="text-sm font-semibold text-charcoal">{user.name}</p>
              <p className="text-xs text-charcoal/60">{user.email}</p>
            </div>
            <a
              href="/account/orders"
              className="block px-3 py-2 rounded-lg hover:bg-cream text-sm text-charcoal"
            >
              Order History
            </a>
            <a
              href="/account/packs"
              className="block px-3 py-2 rounded-lg hover:bg-cream text-sm text-charcoal"
            >
              My Order Packs
            </a>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
