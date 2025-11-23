'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, persistAdminSession, getStoredAdminSession } from '../../../lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = getStoredAdminSession();
    if (existing?.access_token) {
      router.replace('/admin/orders');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supabase) {
      setError('Supabase is not configured. Please add your project keys.');
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message || 'Unable to sign in.');
      setLoading(false);
      return;
    }

    if (data?.session) {
      persistAdminSession(data.session);
      router.replace('/admin/orders');
    } else {
      setError('No session returned from Supabase.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-charcoal/60">Admin Portal</p>
            <h1 className="text-2xl font-heading text-primary">Sign in to manage orders</h1>
          </div>
          <Link href="/" className="text-sm text-orange hover:underline">
            Back home
          </Link>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-charcoal/80 mb-1">Email</label>
            <input
              className="w-full border border-orange/20 rounded-lg p-3 bg-white focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none"
              type="email"
              placeholder="admin@dialabraai.co.za"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/80 mb-1">Password</label>
            <input
              className="w-full border border-orange/20 rounded-lg p-3 bg-white focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="button-primary w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-charcoal/60 mt-4">Access restricted to Dial-A-Braai staff.</p>
      </div>
    </div>
  );
}
