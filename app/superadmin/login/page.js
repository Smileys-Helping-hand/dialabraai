'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Eye, EyeOff, Shield } from 'lucide-react';

export default function SuperAdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass]  = useState(false);
  const [error,    setError]     = useState('');
  const [loading,  setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem('sa_session', JSON.stringify({ username: data.username, ts: Date.now() }));
        router.replace('/superadmin/dashboard');
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0D0C] px-4">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-flame shadow-[0_0_40px_rgba(228,106,40,0.4)]">
            <Flame className="h-8 w-8 text-cream" />
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-white">Graze</p>
            <p className="text-sm text-white/40">Super Admin Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/8 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-2">
            <Shield className="h-4 w-4 text-gold" />
            <p className="text-sm font-semibold text-white/60">Restricted access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-flame/50 focus:outline-none focus:ring-2 focus:ring-flame/15 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 focus:border-flame/50 focus:outline-none focus:ring-2 focus:ring-flame/15 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-flame py-3.5 text-sm font-bold text-cream shadow-[0_8px_30px_rgba(228,106,40,0.3)] transition-all hover:shadow-[0_8px_40px_rgba(228,106,40,0.5)] hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          Graze Platform · Super Admin only
        </p>
      </div>
    </div>
  );
}
