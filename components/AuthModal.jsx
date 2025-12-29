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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-heading text-primary">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-charcoal/70">
            {mode === 'signin'
              ? 'Sign in to access your order history and saved packs'
              : 'Sign up to save orders and create quick reorder packs'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-charcoal">Full Name</span>
                <input
                  type="text"
                  className="w-full border-2 border-charcoal/15 rounded-xl p-3.5 focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-charcoal">Phone Number</span>
                <input
                  type="tel"
                  className="w-full border-2 border-charcoal/15 rounded-xl p-3.5 focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
                  placeholder="0123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </label>
            </>
          )}

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-charcoal">Email</span>
            <input
              type="email"
              className="w-full border-2 border-charcoal/15 rounded-xl p-3.5 focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-charcoal">Password</span>
            <input
              type="password"
              className="w-full border-2 border-charcoal/15 rounded-xl p-3.5 focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          <button
            type="submit"
            className="button-primary w-full disabled:opacity-60 mt-6 py-3.5 text-base font-semibold"
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-flame hover:text-orange font-semibold transition-colors"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="text-center pt-2 border-t border-charcoal/10">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-charcoal/60 hover:text-charcoal transition-colors"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}
