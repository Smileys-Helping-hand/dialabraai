'use client';
import { useState } from 'react';

/**
 * Email Dispatch Tester Component
 * Shows the current email mode (Real/Simulation) and allows testing
 */
export default function EmailDispatchTester() {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState(null);

  async function testDispatch() {
    setIsTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretKey: process.env.NEXT_PUBLIC_INTERNAL_API_KEY || 'test-key-change-me',
          to: 'test@example.com',
          subject: 'Test Email - Dial-A-Braai',
          body: '<h1>Test Email</h1><p>This is a test email from your Dial-A-Braai system.</p>',
          orderId: 'test-' + Date.now(),
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="bg-white border-4 border-charcoal/10 rounded-3xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-primary">📧 Email System Status</h3>
        {result && (
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            result.status === 'sent' 
              ? 'bg-green-100 text-green-800' 
              : result.status === 'simulated'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {result.status === 'sent' && '✅ REAL MODE'}
            {result.status === 'simulated' && '🧪 SIMULATION MODE'}
            {result.error && '❌ ERROR'}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {result && (
          <div className="p-4 bg-charcoal/5 rounded-2xl space-y-2">
            <p className="text-sm font-semibold text-charcoal/70">Last Test Result:</p>
            <div className="space-y-1 text-sm font-mono">
              {result.error ? (
                <p className="text-red-600">Error: {result.error}</p>
              ) : (
                <>
                  <p><strong>Status:</strong> {result.status}</p>
                  <p><strong>Provider:</strong> {result.provider}</p>
                  <p><strong>ID:</strong> {result.id}</p>
                  {result.note && (
                    <p className="text-amber-700 mt-2">💡 {result.note}</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <button
          onClick={testDispatch}
          disabled={isTesting}
          className={`w-full px-4 py-3 rounded-2xl font-bold text-lg transition ${
            isTesting
              ? 'bg-charcoal/20 text-charcoal/50 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {isTesting ? '⏳ Testing...' : '🧪 Test Email System'}
        </button>

        <p className="text-xs text-charcoal/60 text-center">
          Tests the hybrid email system. Add AWS credentials to .env for real emails.
        </p>
      </div>
    </div>
  );
}
