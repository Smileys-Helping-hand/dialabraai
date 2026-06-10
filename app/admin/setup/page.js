'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import firebaseApp from '@/lib/firebase';
import { useShop } from '@/components/ShopProvider';
import { SHOP_FONTS } from '@/components/ShopProvider';

const emptyForm = {
  slug: '',
  name: '',
  shortName: '',
  tagline: '',
  description: '',
  supportPhoneDisplay: '',
  supportPhoneDial: '',
  supportEmail: '',
  instagramHandle: '',
  instagramUrl: '',
  whatsappNumber: '',
  locationSummary: '',
  serviceAreas: '',
  orderTerms: '',
  estimatedReadyTime: '',
  currencySymbol: 'R',
  defaultMenuCategories: '',
  primaryColor: '#065F46',
  accentColor: '#10B981',
  goldColor: '#34D399',
  creamColor: '#F3F4F6',
  charcoalColor: '#111827',
  logoUrl: '',
  heroImageUrl: '',
  fontChoice: 'jakarta',
  isOpen: true,
  operatingHours: '',
  paymentMethods: '',
};

const steps = [
  'Create the shop profile',
  'Load menu items for that shop',
  'Share the generated public link',
];

export default function ShopSetupPage() {
  const searchParams = useSearchParams();
  const { shop, shopSlug, refreshShop } = useShop();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [heroPreviewUrl, setHeroPreviewUrl] = useState('');

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      slug: searchParams.get('shop') || shopSlug || '',
      name: shop.name || '',
      shortName: shop.shortName || '',
      tagline: shop.tagline || '',
      description: shop.description || '',
      supportPhoneDisplay: shop.supportPhoneDisplay || '',
      supportPhoneDial: shop.supportPhoneDial || '',
      supportEmail: shop.supportEmail || '',
      instagramHandle: shop.instagramHandle || '',
      instagramUrl: shop.instagramUrl || '',
      whatsappNumber: shop.whatsappNumber || '',
      locationSummary: shop.locationSummary || '',
      serviceAreas: shop.serviceAreas || '',
      orderTerms: shop.orderTerms || '',
      estimatedReadyTime: shop.estimatedReadyTime || '',
      currencySymbol: shop.currencySymbol || 'R',
      defaultMenuCategories: Array.isArray(shop.defaultMenuCategories) ? shop.defaultMenuCategories.join(', ') : '',
      primaryColor: shop.primaryColor || '#065F46',
      accentColor: shop.accentColor || '#10B981',
      goldColor: shop.goldColor || '#34D399',
      creamColor: shop.creamColor || '#F3F4F6',
      charcoalColor: shop.charcoalColor || '#111827',
      logoUrl: shop.logoUrl || '',
      heroImageUrl: shop.heroImageUrl || '',
      fontChoice: shop.fontChoice || 'jakarta',
      isOpen: shop.isOpen !== false,
      operatingHours: shop.operatingHours || '',
      paymentMethods: shop.paymentMethods || '',
    }));
  }, [searchParams, shop, shopSlug]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [logoFile]);

  useEffect(() => {
    if (!heroFile) {
      setHeroPreviewUrl('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(heroFile);
    setHeroPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [heroFile]);

  const previewUrl = useMemo(() => {
    const slug = form.slug.trim().toLowerCase();
    return slug ? `/home?shop=${encodeURIComponent(slug)}` : '';
  }, [form.slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setResult(null);

    try {
      const uploadAsset = async (file, prefix) => {
        if (!file) return '';
        if (!firebaseApp) {
          throw new Error('Firebase Storage is not configured. Set the Firebase public env vars before uploading shop images.');
        }

        const storage = getStorage(firebaseApp);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const assetRef = ref(storage, `${prefix}/${form.slug || 'shop'}/${Date.now()}-${safeName}`);
        const snapshot = await uploadBytes(assetRef, file, {
          contentType: file.type || 'application/octet-stream',
        });

        return getDownloadURL(snapshot.ref);
      };

      const logoUrl = logoFile ? await uploadAsset(logoFile, 'shop-logos') : form.logoUrl;
      const heroImageUrl = heroFile ? await uploadAsset(heroFile, 'shop-hero-images') : form.heroImageUrl;

      const response = await fetch('/api/shops/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          logoUrl,
          heroImageUrl,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Unable to create shop profile');
      }

      setResult(json);
      setLogoFile(null);
      setHeroFile(null);
      await refreshShop();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="section-surface p-8 space-y-4 bg-gradient-to-r from-primary/95 to-flame/95 text-white rounded-3xl shadow-2xl border border-white/20 animate-fade-in">
          <p className="text-sm uppercase tracking-widest font-semibold opacity-90">🚀 Store Onboarding</p>
          <h1 className="text-5xl font-heading font-bold">Create Your Shop</h1>
          <p className="text-white/90 text-lg">Set up your beautiful storefront, configure your menu, and start accepting orders in minutes.</p>
          <div className="flex flex-wrap gap-3 pt-4">
            {steps.map((step, index) => (
              <span key={step} className="rounded-full border border-white/40 bg-white/15 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition-all duration-300 transform hover:scale-105 animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="inline-block w-6 h-6 mr-2 rounded-full bg-white/30 text-center text-xs leading-6">{index + 1}</span>{step}
              </span>
            ))}
          </div>
        </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <form onSubmit={handleSubmit} className="card p-8 space-y-6 bg-white rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow duration-500 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Shop Slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: value })} placeholder="shakes-n-cakes" helper="Used in the public link" required />
            <Field label="Shop Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="Shakes n Cakes" required />
            <Field label="Short Name" value={form.shortName} onChange={(value) => setForm({ ...form, shortName: value })} placeholder="SN" />
            <Field label="WhatsApp Number" value={form.whatsappNumber} onChange={(value) => setForm({ ...form, whatsappNumber: value })} placeholder="2782..." />
            <Field label="Support Phone" value={form.supportPhoneDisplay} onChange={(value) => setForm({ ...form, supportPhoneDisplay: value })} placeholder="081 234 5678" />
            <Field label="Support Email" value={form.supportEmail} onChange={(value) => setForm({ ...form, supportEmail: value })} placeholder="hello@shop.co.za" />
          </div>

          <Field label="Tagline" value={form.tagline} onChange={(value) => setForm({ ...form, tagline: value })} placeholder="Fresh cakes, shakes and treats" />
          <Field label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} placeholder="Tell customers what makes this shop special." />
          <Field label="Instagram Handle" value={form.instagramHandle} onChange={(value) => setForm({ ...form, instagramHandle: value })} placeholder="@shakesncakes" />
          <Field label="Instagram URL" value={form.instagramUrl} onChange={(value) => setForm({ ...form, instagramUrl: value })} placeholder="https://instagram.com/shakesncakes" />
          <Field label="Location Summary" value={form.locationSummary} onChange={(value) => setForm({ ...form, locationSummary: value })} placeholder="Pickup and delivery in your area" />
          <Field label="Service Areas" value={form.serviceAreas} onChange={(value) => setForm({ ...form, serviceAreas: value })} placeholder="Town Centre, Suburbs, Nearby Estates" />
          <Field label="Order Terms" value={form.orderTerms} onChange={(value) => setForm({ ...form, orderTerms: value })} placeholder="Pay on collection or delivery" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ready Time" value={form.estimatedReadyTime} onChange={(value) => setForm({ ...form, estimatedReadyTime: value })} placeholder="20-30 minutes" />
            <Field label="Currency Symbol" value={form.currencySymbol} onChange={(value) => setForm({ ...form, currencySymbol: value })} placeholder="R" />
            <Field label="Default Categories" value={form.defaultMenuCategories} onChange={(value) => setForm({ ...form, defaultMenuCategories: value })} placeholder="Cakes, Shakes, Snacks" helper="Comma-separated" />
          </div>

          <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 space-y-5 shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div>
              <p className="text-sm uppercase tracking-widest text-primary font-semibold">🎨 Visual Style</p>
              <h2 className="text-2xl font-heading text-slate-900 mt-1">Brand Colors</h2>
              <p className="text-sm text-slate-600 mt-2">Choose colors that represent your brand personality</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ColorField label="Primary" value={form.primaryColor} onChange={(value) => setForm({ ...form, primaryColor: value })} />
              <ColorField label="Accent" value={form.accentColor} onChange={(value) => setForm({ ...form, accentColor: value })} />
              <ColorField label="Gold" value={form.goldColor} onChange={(value) => setForm({ ...form, goldColor: value })} />
              <ColorField label="Cream" value={form.creamColor} onChange={(value) => setForm({ ...form, creamColor: value })} />
              <ColorField label="Charcoal" value={form.charcoalColor} onChange={(value) => setForm({ ...form, charcoalColor: value })} />
            </div>
            <p className="text-xs text-charcoal/60">
              These colors drive the storefront shell, buttons, and the live preview on the right.
            </p>
          </div>

          {/* ── Open/Closed + Hours + Payment ──────────────────────────── */}
          <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 space-y-5 shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div>
              <p className="text-sm uppercase tracking-widest text-primary font-semibold">⏰ Operations</p>
              <h2 className="text-2xl font-heading text-slate-900 mt-1">Shop Status &amp; Hours</h2>
              <p className="text-sm text-slate-600 mt-2">Let customers know when you're open and how to reach you</p>
            </div>

            {/* Open/Closed toggle */}
            <div className="flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 hover:border-slate-300 transition-all duration-300 group">
              <div>
                <p className="text-sm font-bold text-slate-800">Shop is open</p>
                <p className="text-xs text-slate-500">Customers see a live Open / Closed badge</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
                className={`relative h-8 w-14 rounded-full transition-all duration-500 transform group-hover:scale-105 ${form.isOpen ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30' : 'bg-gradient-to-r from-slate-300 to-slate-400 shadow-md'}`}
              >
                <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-500 ${form.isOpen ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <Field label="Operating Hours" value={form.operatingHours} onChange={(v) => setForm({ ...form, operatingHours: v })} placeholder="Mon–Fri 09:00–21:00 · Sat 10:00–20:00 · Sun Closed" helper="Free text — shown on your marketplace card" />

            <Field label="Payment Methods" value={form.paymentMethods} onChange={(v) => setForm({ ...form, paymentMethods: v })} placeholder="Cash, SnapScan, EFT — Capitec 1234567890" helper="Shown to customers on checkout and order confirmation" />
          </div>

          {/* ── Font picker ─────────────────────────────────────────────── */}
          <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 space-y-5 shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div>
              <p className="text-sm uppercase tracking-widest text-primary font-semibold">✍️ Typography</p>
              <h2 className="text-2xl font-heading text-slate-900 mt-1">Shop Display Font</h2>
              <p className="text-sm text-slate-600 mt-2">Choose a font that reflects your brand personality for all headings</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(SHOP_FONTS).map(([key, font]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, fontChoice: key })}
                  className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    form.fontChoice === key
                      ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20'
                      : 'border-slate-200 hover:border-primary/50 hover:shadow-md bg-white'
                  }`}
                >
                  <span
                    className="text-3xl font-bold leading-none text-slate-900"
                    style={{ fontFamily: `var(--font-${key === 'space' ? 'space' : key})` }}
                  >
                    Aa
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{font.label}</span>
                  <span className="text-xs text-slate-500">{font.sample}</span>
                  {form.fontChoice === key && (
                    <span className="mt-1 rounded-full bg-gradient-to-r from-primary to-flame px-3 py-1 text-[11px] font-bold text-white">✓ Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 space-y-5 shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div>
              <p className="text-sm uppercase tracking-widest text-primary font-semibold">🖼️ Brand Assets</p>
              <h2 className="text-2xl font-heading text-slate-900 mt-1">Logo & Hero Image</h2>
              <p className="text-sm text-slate-600 mt-2">Upload high-quality images to make your storefront stand out</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-5 hover:border-slate-300 transition-all duration-300">
                <Field label="Logo URL" value={form.logoUrl} onChange={(value) => setForm({ ...form, logoUrl: value })} placeholder="https://..." />
                <label className="block">
                  <span className="sr-only">Upload logo</span>
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="w-full text-sm cursor-pointer file:cursor-pointer file:py-2.5 file:px-4 file:rounded-xl file:border-2 file:border-slate-200 file:bg-gradient-to-r file:from-primary/10 file:to-primary/5 file:text-primary file:font-semibold hover:file:border-primary hover:file:bg-primary/15 transition-all duration-300" />
                </label>
                {(logoFile || form.logoUrl) && (
                  <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-md">
                    <img
                      src={logoPreviewUrl || form.logoUrl}
                      alt="Logo preview"
                      className="h-32 w-full object-contain p-6"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-5 hover:border-slate-300 transition-all duration-300">
                <Field label="Hero Image URL" value={form.heroImageUrl} onChange={(value) => setForm({ ...form, heroImageUrl: value })} placeholder="https://..." />
                <label className="block">
                  <span className="sr-only">Upload hero image</span>
                  <input type="file" accept="image/*" onChange={(e) => setHeroFile(e.target.files?.[0] || null)} className="w-full text-sm cursor-pointer file:cursor-pointer file:py-2.5 file:px-4 file:rounded-xl file:border-2 file:border-slate-200 file:bg-gradient-to-r file:from-primary/10 file:to-primary/5 file:text-primary file:font-semibold hover:file:border-primary hover:file:bg-primary/15 transition-all duration-300" />
                </label>
                {(heroFile || form.heroImageUrl) && (
                  <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-md">
                    <img
                      src={heroPreviewUrl || form.heroImageUrl}
                      alt="Hero preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-charcoal/60">
              Uploads go to Firebase Storage when you save, and the storefront will use them automatically.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 p-5 space-y-2 shadow-md animate-pulse">
              <p className="font-semibold text-red-800 flex items-center gap-2">⚠️ Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {result && (
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-6 space-y-3 shadow-lg animate-slide-in">
              <p className="font-semibold text-emerald-800 flex items-center gap-2 text-lg">✓ Success! Your shop is live</p>
              <div className="space-y-2 text-sm text-emerald-700">
                <p><span className="font-bold">Public link:</span> <a href={result.publicUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{result.publicUrl}</a></p>
                <p><span className="font-bold">Admin setup:</span> <a href={result.adminUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{result.adminUrl}</a></p>
              </div>
            </div>
          )}

          <button type="submit" disabled={saving} className="button-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-flame hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105 active:scale-95 py-3.5 font-semibold text-lg">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin">⟳</span> Creating shop...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">🚀 Create shop page</span>
            )}
          </button>
        </form>

        <aside className="space-y-4">
          <div
            className="card p-8 space-y-5 overflow-hidden rounded-3xl shadow-2xl border border-white/30 animate-fade-in-up" style={{ animationDelay: '250ms' }}
            style={{
              '--preview-primary': form.primaryColor,
              '--preview-accent': form.accentColor,
              '--preview-gold': form.goldColor,
              '--preview-cream': form.creamColor,
              '--preview-charcoal': form.charcoalColor,
              background: `linear-gradient(135deg, ${form.creamColor}33, rgba(255,255,255,0.9))`,
            }}
          >
            <p className="text-sm uppercase tracking-widest text-primary font-semibold">👁️ Live Preview</p>
            <div className="rounded-[28px] border-2 border-white/40 backdrop-blur-xl bg-white/90 p-6 shadow-2xl space-y-4 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl text-white font-bold" style={{ background: 'var(--preview-primary)' }}>
                  {form.logoUrl || logoPreviewUrl ? (
                    <img
                      src={logoPreviewUrl || form.logoUrl}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    form.shortName || 'SS'
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-heading" style={{ color: 'var(--preview-primary)' }}>{form.name || 'Your shop'}</h2>
                  <p className="text-sm" style={{ color: 'var(--preview-charcoal)' }}>{form.tagline || 'Add a tagline to explain what you sell.'}</p>
                </div>
              </div>
              {(form.heroImageUrl || heroPreviewUrl) && (
                <div className="overflow-hidden rounded-[24px] border border-black/5">
                  <img
                    src={heroPreviewUrl || form.heroImageUrl}
                    alt="Hero preview"
                    className="h-44 w-full object-cover"
                  />
                </div>
              )}
              <div className="rounded-2xl p-4 space-y-2 text-sm" style={{ background: 'var(--preview-cream)' }}>
                <p><strong>Slug:</strong> {form.slug || 'not set'}</p>
                <p><strong>Public URL:</strong> {previewUrl || 'not ready yet'}</p>
                <p><strong>WhatsApp:</strong> {form.whatsappNumber || 'not set'}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: 'var(--preview-primary)' }} type="button">
                  Order now
                </button>
                <button className="rounded-full border px-4 py-2 text-sm font-semibold" style={{ borderColor: 'var(--preview-gold)', color: 'var(--preview-primary)' }} type="button">
                  View menu
                </button>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {form.slug && (
            <div className="card p-8 space-y-5 text-center rounded-3xl shadow-xl border-2 border-slate-100 hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-white to-slate-50 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div>
                <p className="text-sm uppercase tracking-widest text-primary font-semibold">📱 QR Code</p>
                <p className="text-xs text-slate-600 mt-2">Print or share to let customers scan directly to your shop</p>
              </div>
              <div className="flex justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/shop/${form.slug}` : `https://graze.app/shop/${form.slug}`)}&color=762C1B&bgcolor=FFF4E2`}
                  alt="QR code"
                  className="rounded-2xl border-2 border-white shadow-lg"
                  width={200}
                  height={200}
                />
              </div>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/shop/${form.slug}` : `https://graze.app/shop/${form.slug}`)}&color=762C1B&bgcolor=FFF4E2`}
                download={`${form.slug}-qr.png`}
                target="_blank"
                rel="noreferrer"
                className="button-secondary text-sm inline-flex justify-center gap-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                ⬇️ Download QR (500×500)
              </a>
            </div>
          )}

          <div className="card p-8 space-y-5 rounded-3xl shadow-xl border-2 border-slate-100 hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-white to-slate-50 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <p className="text-sm uppercase tracking-widest text-primary font-semibold">🎯 Next Steps</p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-300">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-primary to-flame text-white font-bold text-xs">1</span>
                <span className="font-medium">Create the profile above</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-300">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-primary to-flame text-white font-bold text-xs">2</span>
                <span className="font-medium">Add menu items in the Admin Menu section</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-300">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-primary to-flame text-white font-bold text-xs">3</span>
                <span className="font-medium">Share the public link with customers</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, helper, required = false }) {
  return (
    <label className="space-y-2 block sm:col-span-1 group">
      <span className="text-sm font-semibold text-slate-700 group-focus-within:text-primary transition-colors duration-300">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border-2 border-slate-200 p-3.5 text-slate-900 placeholder-slate-400 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-lg hover:border-slate-300 bg-white/50 hover:bg-white"
      />
      {helper ? <p className="text-xs text-slate-500 transition-colors duration-300 group-focus-within:text-slate-600">{helper}</p> : null}
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="space-y-2 block group hover:bg-slate-50 p-3 rounded-2xl transition-colors duration-300">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-2.5 transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-md">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border-2 border-slate-200 transition-transform duration-300 hover:scale-110 active:scale-95"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2.5 text-sm uppercase tracking-wide font-semibold text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:bg-white"
        />
      </div>
    </label>
  );
}
