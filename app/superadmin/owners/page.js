'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Users, Plus, Trash2, Pencil, RefreshCw, AlertCircle, Search,
  Crown, CheckCircle, XCircle, ChevronDown, X, Store, ShoppingBag,
  TrendingUp, Mail, Phone, StickyNote, Calendar, ShieldCheck,
} from 'lucide-react';

const PLANS = [
  { key: 'free',       label: 'Free',       stage: 1, color: 'text-white/50 bg-white/8 border-white/10',        badge: 'bg-white/10 text-white/60' },
  { key: 'starter',    label: 'Starter',    stage: 2, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',    badge: 'bg-sky-500/15 text-sky-400' },
  { key: 'growth',     label: 'Growth',     stage: 3, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', badge: 'bg-violet-500/15 text-violet-400' },
  { key: 'pro',        label: 'Pro',        stage: 4, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',    badge: 'bg-amber-500/15 text-amber-400' },
  { key: 'enterprise', label: 'Enterprise', stage: 5, color: 'text-flame bg-flame/10 border-flame/20',          badge: 'bg-flame/15 text-flame' },
];

const PLAN_FEATURES = {
  free:       ['Basic shop listing', 'Up to 20 menu items', 'Order tracking'],
  starter:    ['Everything in Free', 'Email notifications', 'Basic analytics', 'Up to 100 menu items'],
  growth:     ['Everything in Starter', 'Advanced analytics', 'Priority support', 'Custom branding', 'Unlimited menu items'],
  pro:        ['Everything in Growth', 'API access', 'Ad campaigns', 'Multi-shop management', 'Webhook integrations'],
  enterprise: ['Everything in Pro', 'White-label branding', 'Dedicated account manager', 'SLA guarantee', 'Custom integrations'],
};

const STATUS_COLORS = {
  active:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  suspended: 'bg-red-500/15 text-red-400 border-red-500/20',
  churned:   'bg-white/8 text-white/30 border-white/10',
};

function PlanBadge({ plan }) {
  const p = PLANS.find(x => x.key === plan) || PLANS[0];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border ${p.badge} border-transparent`}>
      {p.stage >= 4 && <Crown className="h-3 w-3" />}
      Stage {p.stage} — {p.label}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1A1510] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
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

const EMPTY_FORM = { name: '', email: '', phone: '', plan: 'free', shopSlugs: '', notes: '', status: 'active', planExpiresAt: '' };

export default function OwnersPage() {
  const [owners,   setOwners]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [modal,    setModal]    = useState(null); // null | 'create' | { owner }
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = planFilter ? `?plan=${planFilter}` : '';
      const res = await fetch(`/api/superadmin/owners${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      setOwners(await res.json());
      setError('');
    } catch {
      setError('Could not load owners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [planFilter]);

  const filtered = useMemo(() => {
    if (!search) return owners;
    const q = search.toLowerCase();
    return owners.filter(o =>
      o.name?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.phone?.includes(q)
    );
  }, [owners, search]);

  const openCreate = () => { setForm(EMPTY_FORM); setFormErr(''); setModal('create'); };
  const openEdit   = (owner) => {
    setForm({
      name: owner.name,
      email: owner.email,
      phone: owner.phone || '',
      plan: owner.plan,
      shopSlugs: (owner.shopSlugs || []).join(', '),
      notes: owner.notes || '',
      status: owner.status || 'active',
      planExpiresAt: owner.planExpiresAt ? owner.planExpiresAt.slice(0,10) : '',
      _id: owner.id,
    });
    setFormErr('');
    setModal({ owner });
  };

  const save = async () => {
    setSaving(true);
    setFormErr('');
    try {
      const slugs = form.shopSlugs.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        plan: form.plan,
        shopSlugs: slugs,
        notes: form.notes,
        status: form.status,
        planExpiresAt: form.planExpiresAt || null,
      };

      let res;
      if (modal === 'create') {
        res = await fetch('/api/superadmin/owners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/superadmin/owners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: form._id, ...payload }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setModal(null);
      load();
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (owner) => {
    if (!confirm(`Delete owner "${owner.name}"? This cannot be undone.`)) return;
    await fetch(`/api/superadmin/owners?id=${encodeURIComponent(owner.id)}`, { method: 'DELETE' });
    load();
  };

  const upgradePlan = async (owner, newPlan) => {
    await fetch('/api/superadmin/owners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: owner.id, plan: newPlan }),
    });
    load();
  };

  // Summary stats
  const summary = useMemo(() => ({
    total: owners.length,
    active: owners.filter(o => o.status === 'active').length,
    premium: owners.filter(o => ['growth','pro','enterprise'].includes(o.plan)).length,
    revenue: owners.reduce((s, o) => s + (o.totalRevenue || 0), 0),
  }), [owners]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-flame">Management</p>
          <h1 className="text-2xl font-black text-white">Shop Owners</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/50 transition hover:text-white/80">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-flame/20 px-4 py-2 text-sm font-bold text-flame border border-flame/20 transition hover:bg-flame/30">
            <Plus className="h-4 w-4" /> Add Owner
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Owners',  value: summary.total,             icon: Users },
          { label: 'Active',        value: summary.active,            icon: CheckCircle },
          { label: 'Premium+',      value: summary.premium,           icon: Crown },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none transition"
          />
        </div>
        <select
          value={planFilter}
          onChange={e => setPlanFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 focus:outline-none focus:border-flame/40 transition"
        >
          <option value="">All Plans</option>
          {PLANS.map(p => <option key={p.key} value={p.key}>Stage {p.stage} — {p.label}</option>)}
        </select>
      </div>

      {/* Owners Table */}
      <div className="overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6 bg-white/3">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-white/30">Plan</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Shops</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Orders</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Revenue</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-white/30">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 rounded-lg shimmer bg-white/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-white/30">
                  No owners found
                </td>
              </tr>
            ) : (
              filtered.map(owner => (
                <>
                  <tr
                    key={owner.id}
                    className="hover:bg-white/2 transition cursor-pointer"
                    onClick={() => setExpanded(expanded === owner.id ? null : owner.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-sm font-black text-white/60">
                          {owner.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{owner.name}</p>
                          <p className="text-xs text-white/40">{owner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={owner.plan} />
                    </td>
                    <td className="px-4 py-3 text-right text-white/70">{owner.linkedShops ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-white/70">{owner.totalOrders ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-white/70">R {Number(owner.totalRevenue || 0).toFixed(0)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[owner.status] || STATUS_COLORS.active}`}>
                        {owner.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(owner)} className="rounded-lg p-1.5 text-white/30 hover:bg-white/8 hover:text-white transition">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => del(owner)} className="rounded-lg p-1.5 text-red-400/40 hover:bg-red-500/8 hover:text-red-400 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {expanded === owner.id && (
                    <tr key={`${owner.id}-exp`} className="bg-white/2">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Contact */}
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-white/30">Contact</p>
                            {owner.phone && (
                              <div className="flex items-center gap-2 text-sm text-white/70">
                                <Phone className="h-3.5 w-3.5 text-white/30" /> {owner.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-white/70">
                              <Mail className="h-3.5 w-3.5 text-white/30" /> {owner.email}
                            </div>
                            {owner.createdAt && (
                              <div className="flex items-center gap-2 text-xs text-white/35">
                                <Calendar className="h-3 w-3" />
                                Joined {new Date(owner.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {/* Plan details */}
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-white/30">Plan Details</p>
                            <PlanBadge plan={owner.plan} />
                            {owner.planExpiresAt && (
                              <p className="text-xs text-white/40">Expires: {new Date(owner.planExpiresAt).toLocaleDateString()}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {PLANS.filter(p => p.key !== owner.plan).map(p => (
                                <button
                                  key={p.key}
                                  onClick={() => upgradePlan(owner, p.key)}
                                  className={`rounded-lg border px-2 py-1 text-xs font-semibold transition hover:opacity-80 ${p.color}`}
                                >
                                  → {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Shops & notes */}
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-white/30">Linked Shops</p>
                            {(owner.shopSlugs || []).length === 0 ? (
                              <p className="text-xs text-white/30">No shops linked</p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {owner.shopSlugs.map(slug => (
                                  <span key={slug} className="rounded-lg bg-white/8 px-2 py-1 text-xs text-white/60 font-mono">{slug}</span>
                                ))}
                              </div>
                            )}
                            {owner.notes && (
                              <div className="mt-2 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-xs text-white/50">
                                <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {owner.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Plan comparison */}
      <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Plan Comparison</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {PLANS.map(p => (
            <div key={p.key} className={`rounded-xl border p-4 ${p.color}`}>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-bold text-sm">{p.label}</p>
                <span className="text-xs opacity-60">S{p.stage}</span>
              </div>
              <ul className="space-y-1.5">
                {PLAN_FEATURES[p.key].map(f => (
                  <li key={f} className="flex items-start gap-1.5 text-xs opacity-75">
                    <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs font-bold opacity-60">
                {owners.filter(o => o.plan === p.key).length} owners
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal !== null && (
        <Modal
          title={modal === 'create' ? 'Add Shop Owner' : `Edit: ${modal.owner?.name}`}
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">Full Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">Email *</label>
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none"
                  placeholder="+27 81 234 5678"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#1A1510] px-3 py-2 text-sm text-white focus:border-flame/40 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-white/50">Subscription Plan</label>
              <div className="grid grid-cols-5 gap-2">
                {PLANS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => setForm(f => ({ ...f, plan: p.key }))}
                    className={`rounded-xl border p-2 text-center transition ${
                      form.plan === p.key ? p.color : 'border-white/10 bg-white/3 text-white/30 hover:bg-white/5'
                    }`}
                  >
                    <p className="text-[10px] font-bold">S{p.stage}</p>
                    <p className="text-xs font-semibold">{p.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">Plan Expires</label>
                <input
                  type="date"
                  value={form.planExpiresAt}
                  onChange={e => setForm(f => ({ ...f, planExpiresAt: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-flame/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/50">Shop Slugs (comma separated)</label>
                <input
                  value={form.shopSlugs}
                  onChange={e => setForm(f => ({ ...f, shopSlugs: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none"
                  placeholder="my-shop, other-shop"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-white/50">Internal Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-flame/40 focus:outline-none resize-none"
                placeholder="Internal notes about this owner…"
              />
            </div>

            {formErr && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {formErr}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setModal(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/50 hover:text-white transition">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-flame px-5 py-2 text-sm font-bold text-white transition hover:bg-flame/80 disabled:opacity-50"
              >
                {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {modal === 'create' ? 'Create Owner' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
