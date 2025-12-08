'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Simple password check - in production, use proper authentication
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple password: "admin123" - you can change this
    if (password === 'admin123') {
      // Store in localStorage for session
      localStorage.setItem('adminLoggedIn', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Incorrect password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-[#FFF4E2] to-cream px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-gold/30 rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-cream font-bold text-3xl border-4 border-gold shadow-xl mb-4">
              DB
            </div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">Admin Login</h1>
            <p className="text-charcoal/70">Enter your password to access the dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-charcoal mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-charcoal/20 rounded-2xl focus:outline-none focus:border-primary transition"
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-red-800 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full brand-button text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a href="/home" className="text-primary hover:text-primary/80 font-semibold transition">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
