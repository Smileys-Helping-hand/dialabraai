'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Loader2 } from 'lucide-react';

export default function AdsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [shops, setShops] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    platform: 'Meta',
    utmSource: '',
    utmMedium: 'cpc',
    utmCampaign: '',
    utmContent: '',
    budgetZar: 0,
  });
  const [newError, setNewError] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [campsRes, shopsRes] = await Promise.all([
        fetch('/api/superadmin/campaigns'),
        fetch('/api/superadmin/shops'),
      ]);
      const camps = await campsRes.json();
      const shopsData = await shopsRes.json();
      setCampaigns(camps.campaigns || []);
      setShops(shopsData.shops || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCampaign = async () => {
    setNewError('');
    if (!newCampaign.name || !newCampaign.utmSource || !newCampaign.utmCampaign) {
      setNewError('Name, UTM source, and UTM campaign are required');
      return;
    }

    try {
      const res = await fetch('/api/superadmin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign),
      });
      if (!res.ok) throw new Error('Failed to create campaign');
      setNewCampaign({
        name: '',
        platform: 'Meta',
        utmSource: '',
        utmMedium: 'cpc',
        utmCampaign: '',
        utmContent: '',
        budgetZar: 0,
      });
      setShowNew(false);
      loadData();
    } catch (err) {
      setNewError(err.message);
    }
  };

  const deleteCampaign = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await fetch(`/api/superadmin/campaigns/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  const attributedShops = shops.filter(s => s.utm_source);

  if (loading) {
    return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Megaphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-charcoal">Ad Campaigns</h1>
          <p className="text-sm text-charcoal/50">Track campaign performance and shop attribution</p>
        </div>
      </div>

      {/* New Campaign Section */}
      {!showNew ? (
        <button
          onClick={() => setShowNew(true)}
          className="w-full px-6 py-4 rounded-2xl border border-charcoal/12 text-charcoal hover:border-primary/25 transition flex items-center justify-center gap-2 font-semibold"
        >
          <Plus className="h-5 w-5" /> New Campaign
        </button>
      ) : (
        <div className="rounded-2xl border border-charcoal/8 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-charcoal mb-4">Create New Campaign</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Campaign name"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
            />

            <select
              value={newCampaign.platform}
              onChange={(e) => setNewCampaign({ ...newCampaign, platform: e.target.value })}
              className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
            >
              <option>Meta</option>
              <option>Google</option>
              <option>TikTok</option>
            </select>

            <input
              type="text"
              placeholder="utm_source (e.g., meta)"
              value={newCampaign.utmSource}
              onChange={(e) => setNewCampaign({ ...newCampaign, utmSource: e.target.value })}
              className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
            />

            <input
              type="text"
              placeholder="utm_medium (e.g., cpc)"
              value={newCampaign.utmMedium}
              onChange={(e) => setNewCampaign({ ...newCampaign, utmMedium: e.target.value })}
              className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
            />

            <input
              type="text"
              placeholder="utm_campaign (required)"
              value={newCampaign.utmCampaign}
              onChange={(e) => setNewCampaign({ ...newCampaign, utmCampaign: e.target.value })}
              className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
            />

            <input
              type="text"
              placeholder="utm_content (optional)"
              value={newCampaign.utmContent}
              onChange={(e) => setNewCampaign({ ...newCampaign, utmContent: e.target.value })}
              className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
            />

            <input
              type="number"
              placeholder="Budget (ZAR)"
              value={newCampaign.budgetZar}
              onChange={(e) => setNewCampaign({ ...newCampaign, budgetZar: Number(e.target.value) })}
              className="px-3 py-2 border border-charcoal/12 rounded-xl text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {newError && <p className="text-sm text-red-600">{newError}</p>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowNew(false)}
              className="flex-1 px-4 py-2 rounded-xl border border-charcoal/12 text-charcoal hover:bg-charcoal/4 transition text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={addCampaign}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-cream hover:bg-primary/90 transition text-sm font-semibold"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Campaign Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map(camp => (
          <div key={camp.id} className="rounded-2xl border border-charcoal/8 bg-white p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-charcoal">{camp.name}</h3>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  camp.platform === 'Meta' ? 'bg-blue-500/10 text-blue-600' :
                  camp.platform === 'Google' ? 'bg-green-500/10 text-green-600' :
                  'bg-black/5 text-black'
                }`}>
                  {camp.platform}
                </span>
              </div>
              <button
                onClick={() => deleteCampaign(camp.id)}
                className="text-red-600 hover:text-red-700 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-charcoal/60 space-y-1">
              <p>{camp.utm_source} · {camp.utm_campaign}</p>
              {camp.budget_zar > 0 && <p>Budget: R{Number(camp.budget_zar).toLocaleString()}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-charcoal/8">
              <div>
                <p className="text-xs font-semibold uppercase text-charcoal/50">Clicks</p>
                <p className="text-lg font-bold text-charcoal">{camp.click_count || 0}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-charcoal/50">Conversions</p>
                <p className="text-lg font-bold text-emerald-600">{camp.conversion_count || 0}</p>
              </div>
            </div>

            {camp.click_count > 0 && (
              <div className="text-xs text-charcoal/60">
                Rate: {((camp.conversion_count / camp.click_count) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Attributed Shops */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-charcoal">Attributed Shops ({attributedShops.length})</h2>

        {attributedShops.length === 0 ? (
          <div className="rounded-2xl border border-charcoal/8 bg-white p-8 text-center text-charcoal/50">
            No shops attributed to campaigns yet
          </div>
        ) : (
          <div className="rounded-2xl border border-charcoal/8 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal/8 bg-charcoal/2">
                    <th className="px-4 py-3 text-left font-semibold text-charcoal">Shop</th>
                    <th className="px-4 py-3 text-left font-semibold text-charcoal">Joined</th>
                    <th className="px-4 py-3 text-left font-semibold text-charcoal">Campaign</th>
                    <th className="px-4 py-3 text-left font-semibold text-charcoal">Platform</th>
                  </tr>
                </thead>
                <tbody>
                  {attributedShops.map(shop => (
                    <tr key={shop.slug} className="border-b border-charcoal/8 hover:bg-charcoal/2 transition">
                      <td className="px-4 py-3 text-charcoal font-semibold">{shop.name}</td>
                      <td className="px-4 py-3 text-charcoal/60 text-xs">
                        {new Date(shop.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-charcoal/70 text-sm">{shop.utm_campaign}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-charcoal/8 text-charcoal">
                          {shop.utm_source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
