'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { auth, persistAdminSession, getStoredAdminSession } from '../../../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { SHOP_CONFIG } from '@/lib/shop-config';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = getStoredAdminSession();
    if (existing?.uid) {
      router.replace('/admin/orders');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!auth) {
      setError('Firebase is not configured. Please add your project keys.');
      return;
    }

    setLoading(true);
    try {
      let userCredential;
      if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCredential.user, { displayName: name.trim() });
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      if (userCredential.user) {
        persistAdminSession(userCredential.user);
        router.replace(mode === 'signup' ? '/admin/setup' : '/admin/orders');
      } else {
        setError('Unable to sign in.');
      }
    } catch (authError) {
      setError(authError.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="mb-4 inline-flex items-center text-sm text-primary/70 hover:text-primary hover:underline">
            ← Back home
          </Link>
          <p className="text-xs uppercase tracking-wide text-charcoal/60">Admin Portal</p>
          <h1 className="text-2xl font-heading text-primary">
            {mode === 'signin' ? 'Sign in to manage your shop' : 'Create your shop owner account'}
          </h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1">Name</label>
              <input
                className="w-full border border-primary/20 rounded-lg p-3 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                type="text"
                placeholder="Store owner name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-charcoal/80 mb-1">Email</label>
            <input
              className="w-full border border-primary/20 rounded-lg p-3 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              type="email"
              placeholder="admin@yourshop.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/80 mb-1">Password</label>
            <div className="relative">
              <input
                className="w-full border border-primary/20 rounded-lg p-3 pr-11 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="button-primary w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-charcoal/70">
          <span>Access is restricted to {SHOP_CONFIG.name} staff.</span>
          <button
            type="button"
            onClick={() => {
              setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
              setError('');
            }}
            className="text-primary font-semibold hover:underline"
          >
            {mode === 'signin' ? 'New seller? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
