'use client';
import { useState, useEffect } from 'react';

export default function SiteLoginGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = sessionStorage.getItem('site_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Simple hardcoded authentication
    if (email === 'mraaziqp@gmail.com' && password === '114477') {
      sessionStorage.setItem('site_authenticated', 'true');
      setIsAuthenticated(true);
    } else {
      setError('Invalid email or password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rust"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-2xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rust/10 rounded-full mb-4">
              <span className="text-3xl">🍖</span>
            </div>
            <h2 className="text-4xl font-bold text-charcoal mb-2">
              Dial-A-Braai
            </h2>
            <p className="text-gray-500 text-sm">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r animate-shake">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-charcoal mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rust/20 focus:border-rust transition-all duration-200 outline-none text-charcoal"
                placeholder="mraaziqp@gmail.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-charcoal mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rust/20 focus:border-rust transition-all duration-200 outline-none text-charcoal"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rust hover:bg-rust/90 text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Halal braai delivered with care in Cape Town
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
