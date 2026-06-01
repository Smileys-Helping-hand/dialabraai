'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, Star, StarOff, ExternalLink, Settings2,
  Trash2, CheckCircle, XCircle, RefreshCw, AlertCircle, Store,
  Plus, Pencil, X, Phone, TrendingUp,
} from 'lucide-react';

const STATUS_BADGE = {
  active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-red-500/15 text-red-400 border-red-500/20',
  pending:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#1A1510] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4 sticky top-0 bg-[#1A1510] z-10">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { slug: '', name: '', shortName: '', tagline: '', whatsappNumber: '', logoUrl: '', heroImageUrl: '', status: 'active' };

export default function SuperAdminShops() {
  const [shops,   setShops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [busy,    setBusy]    = useState('');
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [formErr, setFormErr] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/shops', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      setShops(await res.json());
      setError('');
    } catch {
      setError('Could not load shops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const patch = async (slug, data) => {
    setBusy(slug);
    try {
      await fetch('/api/superadmin/shops', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, ...data }) });
      await load();
    } finally { setBusy(''); }
  };

  const del = async (shop) => {
    if (!confirm(`Delete shop "${shop.name}"? This cannot be undone.`)) return;
    setBusy(shop.slug);
    try {
      await fetch(`/api/superadmin/shops?slug=${encodeURIComponent(shop.slug)}`, { method: 'DELETE' });
      await load();
    } finally { setBusy(''); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setFormErr(''); setModal('create'); };
  const openEdit   = (shop) => {
    setForm({ slug: shop.slug, name: shop.name||'', shortName: shop.shortName||'', tagline: shop.tagline||'', whatsappNumber: shop.whatsappNumber||'', logoUrl: shop.logoUrl||'', heroImageUrl: shop.heroImageUrl||'', status: shop.status||'active' });
    setFormErr(''); setModal({ shop });
  };

  const save = async () => {
    setSaving(true); setFormErr('');
    try {
      if (modal === 'create' && (!form.slug || !form.name)) { setFormErr('Slug and name are required'); setSaving(false); return; }
      const method = modal === 'create' ? 'POST' : 'PATCH';
      const res = await fetch('/api/superadmin/shops', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setModal(null); load();
    } catch (e) { setFormErr(e.message); } finally { setSaving(false); }
  };

  const visible = useMemo(() => shops.filter(s => {
    const ms = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.slug.includes(search.toLowerCase());
    const mf = !statusFilter || s.status === statusFilter;
    return ms && mf;
  }), [shops, search, statusFilter]);

  const summary = useMemo(() => ({
    total: shops.length, active: shops.filter(s=>s.status==='active').length,
    featured: shops.filter(s=>s.featured).length, revenue: shops.reduce((s,sh)=>s+(sh.revenue||0),0),
  }), [shops]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-flame">Management</p>
          <h1 className="text-2xl font-black text-white">All Shops</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/50 transition hover:text-white/80">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-flame/20 px-4 py-2 text-sm font-bold text-flame border border-flame/20 transition hover:bg-flame/30">
            <Plus className="h-4 w-4" /> New Shop
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Shops', value: summary.total, icon: Store },
          { label: 'Active', value: summary.active, icon: CheckCircle },
          { label: 'Featured', value: summary.featured, icon: Star },
          { label: 'Total Revenue', value: `R ${summary.revenue.toFixed(0)}`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/35">{label}</p>
              <Icon className="h-4 w-4 text-white/20" />
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shops…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none transition" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-flame/40 transition">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 bg-white/3">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Shop</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Details</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Orders</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Revenue</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                <td key={j} className="px-4 py-4"><div className="h-4 rounded-lg shimmer bg-white/5" /></td>
              ))}</tr>
            )) : visible.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-white/30">{search ? 'No shops match.' : 'No shops yet.'}</td></tr>
            ) : visible.map((shop) => {
              const isBusy = busy === shop.slug;
              return (
                <tr key={shop.slug} className="transition hover:bg-white/3">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/60 to-flame/60">
                        {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4 text-cream/70" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-white">{shop.name || shop.slug}</p>
                          {shop.featured && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
                        </div>
                        <p className="text-xs text-white/35 font-mono">/{shop.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-0.5">
                      {shop.tagline && <p className="text-xs text-white/50 truncate max-w-[160px]">{shop.tagline}</p>}
                      {shop.whatsappNumber && <div className="flex items-center gap-1 text-xs text-white/30"><Phone className="h-3 w-3" /> {shop.whatsappNumber}</div>}
                      {shop.createdAt && <p className="text-xs text-white/25">Added {new Date(shop.createdAt).toLocaleDateString()}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[shop.status] || STATUS_BADGE.active}`}>
                      {shop.status || 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-white">{shop.orderCount ?? 0}</td>
                  <td className="px-4 py-4 text-right font-semibold text-white">R {Number(shop.revenue||0).toFixed(0)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(shop)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 hover:text-white/70" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <a href={`/shop/${shop.slug}`} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 hover:text-white/70" title="View">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <Link href={`/admin/orders?shop=${shop.slug}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 hover:text-white/70" title="Admin">
                        <Settings2 className="h-3.5 w-3.5" />
                      </Link>
                      <button disabled={isBusy} onClick={() => patch(shop.slug, { featured: !shop.featured })} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 hover:text-gold disabled:opacity-30" title="Feature">
                        {shop.featured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                      </button>
                      <button disabled={isBusy} onClick={() => patch(shop.slug, { status: shop.status==='active'?'inactive':'active' })} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 disabled:opacity-30" title="Toggle">
                        {shop.status==='active' ? <XCircle className="h-3.5 w-3.5 hover:text-red-400" /> : <CheckCircle className="h-3.5 w-3.5 hover:text-emerald-400" />}
                      </button>
                      <button disabled={isBusy} onClick={() => del(shop)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t border-white/6 px-4 py-2">
          <p className="text-xs text-white/25">{visible.length} of {shops.length} shops</p>
        </div>
      </div>

      {modal !== null && (
        <Modal title={modal === 'create' ? 'Create New Shop' : `Edit: ${modal.shop?.name}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">Slug * <span className="text-white/25 font-normal">(URL)</span></label>
                <input value={form.slug} onChange={e => setForm(f=>({...f,slug:e.target.value.toLowerCase().replace(/\s+/g,'-')}))} disabled={modal!=='create'}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none disabled:opacity-40 font-mono" placeholder="my-shop" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">Shop Name *</label>
                <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none" placeholder="My Shop" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">Short Name</label>
                <input value={form.shortName} onChange={e => setForm(f=>({...f,shortName:e.target.value}))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none" placeholder="MyShop" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">WhatsApp Number</label>
                <input value={form.whatsappNumber} onChange={e => setForm(f=>({...f,whatsappNumber:e.target.value}))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none" placeholder="27811234567" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/50">Tagline</label>
              <input value={form.tagline} onChange={e => setForm(f=>({...f,tagline:e.target.value}))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none" placeholder="Best braai in town" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/50">Logo URL</label>
              <input value={form.logoUrl} onChange={e => setForm(f=>({...f,logoUrl:e.target.value}))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none" placeholder="https://…" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/50">Hero Image URL</label>
              <input value={form.heroImageUrl} onChange={e => setForm(f=>({...f,heroImageUrl:e.target.value}))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none" placeholder="https://…" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/50">Status</label>
              <div className="flex gap-2">
                {['active','inactive','pending'].map(s => (
                  <button key={s} onClick={() => setForm(f=>({...f,status:s}))}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold capitalize transition ${form.status===s ? STATUS_BADGE[s] : 'border-white/10 bg-white/3 text-white/30 hover:bg-white/5'}`}>{s}</button>
                ))}
              </div>
            </div>
            {formErr && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {formErr}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setModal(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/50 hover:text-white transition">Cancel</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-flame px-5 py-2 text-sm font-bold text-white transition hover:bg-flame/80 disabled:opacity-50">
                {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {modal === 'create' ? 'Create Shop' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
