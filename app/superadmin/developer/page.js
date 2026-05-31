'use client';

import { useState, useEffect } from 'react';
import { Code2, Copy, Trash2, Plus, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function DeveloperPage() {
  const [apps, setApps] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [tab, setTab] = useState('keys');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const res = await fetch('/api/superadmin/apps');
      const data = await res.json();
      setApps(data.apps || []);
      if (data.apps?.length > 0) {
        setSelectedAppId(data.apps[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedApp = apps.find(a => a.id === selectedAppId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Code2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-charcoal">Developer Console</h1>
          <p className="text-sm text-charcoal/50">Manage API keys, webhooks, and app health</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left: App List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-charcoal/8 bg-white p-4 space-y-2">
              <p className="text-xs font-bold uppercase text-charcoal/50 mb-3">Registered Apps</p>
              {apps.map(app => (
                <button
                  key={app.id}
                  onClick={() => { setSelectedAppId(app.id); setTab('keys'); }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${
                    selectedAppId === app.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-charcoal/4'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`h-2 w-2 rounded-full shrink-0 mt-1 ${app.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">{app.name}</p>
                      <p className="text-xs text-charcoal/40">{app.type}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-3">
            {selectedApp ? (
              <div className="space-y-4">
                {/* App Header */}
                <div className="rounded-2xl border border-charcoal/8 bg-white p-6">
                  <h2 className="font-display text-xl font-bold text-charcoal mb-1">{selectedApp.name}</h2>
                  <div className="flex gap-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedApp.type === 'owned' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-600'
                    }`}>
                      {selectedApp.type}
                    </span>
                    <span className="text-charcoal/60">{selectedApp.slug}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-charcoal/8">
                  {[
                    { id: 'keys', label: 'API Keys' },
                    { id: 'webhooks', label: 'Webhooks' },
                    { id: 'health', label: 'Health' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`px-4 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
                        tab === t.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-charcoal/50 hover:text-charcoal'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {tab === 'keys' && <ApiKeysTab appId={selectedAppId} />}
                {tab === 'webhooks' && <WebhooksTab appId={selectedAppId} />}
                {tab === 'health' && <HealthTab appId={selectedAppId} />}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-charcoal/50">No apps registered yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ApiKeysTab({ appId }) {
  const [keys, setKeys] = useState([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState(['orders:read', 'stats:read']);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKeys();
  }, [appId]);

  const loadKeys = async () => {
    try {
      const res = await fetch(`/api/superadmin/api-keys?appId=${appId}`);
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (err) {
      console.error('Failed to load keys:', err);
    }
  };

  const generateKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          name: newKeyName,
          scopes: newKeyScopes,
        }),
      });
      const data = await res.json();
      setGeneratedKey(data.key);
      setNewKeyName('');
      setNewKeyScopes(['orders:read', 'stats:read']);
      loadKeys();
    } catch (err) {
      console.error('Failed to generate key:', err);
    } finally {
      setLoading(false);
    }
  };

  const revokeKey = async (keyId) => {
    if (!confirm('Revoke this API key? It will stop working immediately.')) return;
    try {
      await fetch(`/api/superadmin/api-keys/${keyId}`, { method: 'DELETE' });
      loadKeys();
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="space-y-4">
      {generatedKey && (
        <div className="rounded-2xl border border-gold/30 bg-gold/8 p-4">
          <p className="text-xs font-bold text-primary mb-2">🔑 Your API Key (shown once)</p>
          <div className="flex gap-2">
            <code className="flex-1 font-mono text-sm text-charcoal break-all bg-white px-2 py-1 rounded">{generatedKey.fullKey}</code>
            <button
              onClick={() => copyToClipboard(generatedKey.fullKey)}
              className="px-3 py-1 bg-primary text-cream rounded hover:bg-primary/90 transition"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-red-600 mt-2">⚠️ Save this key now. You won't be able to see it again.</p>
        </div>
      )}

      {!showGenerate ? (
        <button
          onClick={() => setShowGenerate(true)}
          className="w-full px-4 py-3 rounded-2xl border border-charcoal/12 text-charcoal hover:border-primary/25 transition flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Generate New Key
        </button>
      ) : (
        <div className="rounded-2xl border border-charcoal/8 bg-white p-4 space-y-3">
          <input
            type="text"
            placeholder="Key name (e.g., Production)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="w-full px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
          />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-charcoal">Scopes</p>
            {['orders:read', 'stats:read', 'shops:read', 'webhooks:write'].map(scope => (
              <label key={scope} className="flex items-center gap-2 text-sm text-charcoal/70">
                <input
                  type="checkbox"
                  checked={newKeyScopes.includes(scope)}
                  onChange={(e) => setNewKeyScopes(e.target.checked ? [...newKeyScopes, scope] : newKeyScopes.filter(s => s !== scope))}
                  className="w-4 h-4"
                />
                {scope}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGenerate(false)}
              className="flex-1 px-3 py-2 rounded-xl border border-charcoal/12 text-charcoal hover:bg-charcoal/4 transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={generateKey}
              disabled={!newKeyName.trim() || loading}
              className="flex-1 px-3 py-2 rounded-xl bg-primary text-cream hover:bg-primary/90 transition text-sm disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-charcoal/8 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/8 bg-charcoal/2">
                <th className="px-4 py-2 text-left font-semibold text-charcoal">Prefix</th>
                <th className="px-4 py-2 text-left font-semibold text-charcoal">Label</th>
                <th className="px-4 py-2 text-left font-semibold text-charcoal">Scopes</th>
                <th className="px-4 py-2 text-left font-semibold text-charcoal">Last Used</th>
                <th className="px-4 py-2 text-right font-semibold text-charcoal">Action</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(key => (
                <tr key={key.id} className="border-b border-charcoal/8 hover:bg-charcoal/2 transition">
                  <td className="px-4 py-2 font-mono text-xs text-charcoal/60">{key.key_prefix}</td>
                  <td className="px-4 py-2 text-charcoal">{key.name}</td>
                  <td className="px-4 py-2 text-charcoal/60 text-xs">{(key.scopes || []).join(', ')}</td>
                  <td className="px-4 py-2 text-charcoal/60 text-xs">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : '–'}</td>
                  <td className="px-4 py-2 text-right">
                    {key.revoked_at ? (
                      <span className="text-xs text-red-600">Revoked</span>
                    ) : (
                      <button onClick={() => revokeKey(key.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function WebhooksTab({ appId }) {
  const [webhooks, setWebhooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState(['new_order']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWebhooks();
  }, [appId]);

  const loadWebhooks = async () => {
    try {
      const res = await fetch(`/api/superadmin/webhooks?appId=${appId}`);
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch (err) {
      console.error('Failed to load webhooks:', err);
    }
  };

  const addWebhook = async () => {
    if (!url.trim() || events.length === 0) return;
    setLoading(true);
    try {
      await fetch('/api/superadmin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, url, events }),
      });
      setUrl('');
      setEvents(['new_order']);
      setShowForm(false);
      loadWebhooks();
    } catch (err) {
      console.error('Failed to add webhook:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (id) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      await fetch(`/api/superadmin/webhooks/${id}`, { method: 'DELETE' });
      loadWebhooks();
    } catch (err) {
      console.error('Failed to delete webhook:', err);
    }
  };

  const toggleEvent = (event) => {
    setEvents(events.includes(event) ? events.filter(e => e !== event) : [...events, event]);
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 rounded-2xl border border-charcoal/12 text-charcoal hover:border-primary/25 transition flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Webhook
        </button>
      ) : (
        <div className="rounded-2xl border border-charcoal/8 bg-white p-4 space-y-3">
          <input
            type="url"
            placeholder="https://your-app.com/webhooks/graze"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
          />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-charcoal">Events to subscribe</p>
            {['new_order', 'order_status_change', 'shop_created'].map(event => (
              <label key={event} className="flex items-center gap-2 text-sm text-charcoal/70">
                <input
                  type="checkbox"
                  checked={events.includes(event)}
                  onChange={() => toggleEvent(event)}
                  className="w-4 h-4"
                />
                {event}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-3 py-2 rounded-xl border border-charcoal/12 text-charcoal hover:bg-charcoal/4 transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={addWebhook}
              disabled={!url.trim() || events.length === 0 || loading}
              className="flex-1 px-3 py-2 rounded-xl bg-primary text-cream hover:bg-primary/90 transition text-sm disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {webhooks.map(hook => (
          <div key={hook.id} className="rounded-2xl border border-charcoal/8 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-charcoal truncate">{hook.url}</p>
                <p className="text-xs text-charcoal/50 mt-1">{(hook.events || []).join(', ')}</p>
                {hook.fail_count > 0 && <p className="text-xs text-red-600 mt-1">Failed: {hook.fail_count}x</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full shrink-0 ${hook.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <button onClick={() => deleteWebhook(hook.id)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthTab({ appId }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 10000);
    return () => clearInterval(interval);
  }, [appId]);

  const loadHealth = async () => {
    try {
      const res = await fetch(`/api/superadmin/health?appId=${appId}`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error('Failed to load health:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary" />;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-charcoal/8 bg-white p-4">
        <p className="text-xs font-semibold uppercase text-charcoal/50 mb-1">Last Seen</p>
        <p className="text-2xl font-bold text-charcoal">
          {health.lastSeen ? new Date(health.lastSeen).toLocaleString() : '–'}
        </p>
      </div>
      <div className="rounded-2xl border border-charcoal/8 bg-white p-4">
        <p className="text-xs font-semibold uppercase text-charcoal/50 mb-1">24h Error Rate</p>
        <p className="text-2xl font-bold text-red-600">{health.errorRate || 0}%</p>
      </div>
      <div className="rounded-2xl border border-charcoal/8 bg-white p-4">
        <p className="text-xs font-semibold uppercase text-charcoal/50 mb-1">24h Calls</p>
        <p className="text-2xl font-bold text-charcoal">{health.calls24h || 0}</p>
      </div>
      <div className="rounded-2xl border border-charcoal/8 bg-white p-4">
        <p className="text-xs font-semibold uppercase text-charcoal/50 mb-1">Avg Duration</p>
        <p className="text-2xl font-bold text-charcoal">{health.avgDurationMs || 0}ms</p>
      </div>
    </div>
  );
}
