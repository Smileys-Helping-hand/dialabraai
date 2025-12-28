'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AuthModal({ isOpen, onClose, mode: initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        onClose();
      } else {
        if (!name || !phone) {
          setError('Please provide your name and phone number');
          setLoading(false);
          return;
        }
        await signUp(email, password, name, phone);
        onClose();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  return (
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
            <h2 className="text-2xl font-heading text-primary">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-charcoal/70">
              {mode === 'signin'
                ? 'Sign in to access your order history and saved packs'
                : 'Sign up to save orders and create quick reorder packs'}
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

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <label className="space-y-1 block">
                <span className="text-sm font-semibold text-charcoal">Full Name</span>
                <input
                  type="text"
                  className="w-full border border-charcoal/15 rounded-2xl p-3 focus:border-orange focus:ring-2 focus:ring-orange/30"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-sm font-semibold text-charcoal">Phone Number</span>
                <input
                  type="tel"
                  className="w-full border border-charcoal/15 rounded-2xl p-3 focus:border-orange focus:ring-2 focus:ring-orange/30"
                  placeholder="0123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </label>
            </>
          )}

          <label className="space-y-1 block">
            <span className="text-sm font-semibold text-charcoal">Email</span>
            <input
              type="email"
              className="w-full border border-charcoal/15 rounded-2xl p-3 focus:border-orange focus:ring-2 focus:ring-orange/30"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-semibold text-charcoal">Password</span>
            <input
              type="password"
              className="w-full border border-charcoal/15 rounded-2xl p-3 focus:border-orange focus:ring-2 focus:ring-orange/30"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          <button
            type="submit"
            className="button-primary w-full disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-flame hover:text-orange font-semibold"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="text-center pt-4 border-t border-charcoal/10">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-charcoal/70 hover:text-charcoal"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}
