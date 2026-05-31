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
  primaryColor: '#762C1B',
  accentColor: '#E46A28',
  goldColor: '#F4C056',
  creamColor: '#FFF4E2',
  charcoalColor: '#1A1715',
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
      primaryColor: shop.primaryColor || '#762C1B',
      accentColor: shop.accentColor || '#E46A28',
      goldColor: shop.goldColor || '#F4C056',
      creamColor: shop.creamColor || '#FFF4E2',
      charcoalColor: shop.charcoalColor || '#1A1715',
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
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="section-surface p-6 space-y-3">
        <p className="text-sm uppercase tracking-wide text-flame font-semibold">Onboarding</p>
        <h1 className="text-4xl font-heading text-primary">Create a shop page</h1>
        <p className="text-charcoal/80">Set up a new storefront, generate its public link, and start loading products.</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {steps.map((step, index) => (
            <span key={step} className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-charcoal">
              {index + 1}. {step}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
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

          <div className="rounded-3xl border border-charcoal/10 bg-white p-4 space-y-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-flame font-semibold">Visual Style</p>
              <h2 className="text-xl font-heading text-primary">Shop colors</h2>
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
          <div className="rounded-3xl border border-charcoal/10 bg-white p-4 space-y-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-flame font-semibold">Operations</p>
              <h2 className="text-xl font-heading text-primary">Shop status &amp; hours</h2>
            </div>

            {/* Open/Closed toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-charcoal/10 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-charcoal">Shop is open</p>
                <p className="text-xs text-charcoal/55">Customers see a live Open / Closed badge on your card</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
                className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${form.isOpen ? 'bg-emerald-500' : 'bg-charcoal/20'}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${form.isOpen ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <Field label="Operating Hours" value={form.operatingHours} onChange={(v) => setForm({ ...form, operatingHours: v })} placeholder="Mon–Fri 09:00–21:00 · Sat 10:00–20:00 · Sun Closed" helper="Free text — shown on your marketplace card" />

            <Field label="Payment Methods" value={form.paymentMethods} onChange={(v) => setForm({ ...form, paymentMethods: v })} placeholder="Cash, SnapScan, EFT — Capitec 1234567890" helper="Shown to customers on checkout and order confirmation" />
          </div>

          {/* ── Font picker ─────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-charcoal/10 bg-white p-4 space-y-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-flame font-semibold">Typography</p>
              <h2 className="text-xl font-heading text-primary">Shop display font</h2>
              <p className="text-sm text-charcoal/60 mt-1">This controls all headings on your shop pages. Pick what fits your brand.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(SHOP_FONTS).map(([key, font]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, fontChoice: key })}
                  className={`flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-all ${
                    form.fontChoice === key
                      ? 'border-flame bg-flame/5 shadow-glow'
                      : 'border-charcoal/10 hover:border-flame/30'
                  }`}
                >
                  <span
                    className="text-2xl font-bold leading-none text-charcoal"
                    style={{ fontFamily: `var(--font-${key === 'space' ? 'space' : key})` }}
                  >
                    Aa
                  </span>
                  <span className="text-sm font-semibold text-charcoal">{font.label}</span>
                  <span className="text-xs text-charcoal/45">{font.sample}</span>
                  {form.fontChoice === key && (
                    <span className="mt-1 rounded-full bg-flame px-2 py-0.5 text-[10px] font-bold text-cream">Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-charcoal/10 bg-white p-4 space-y-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-flame font-semibold">Brand Assets</p>
              <h2 className="text-xl font-heading text-primary">Logo and hero image</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-charcoal/10 p-3">
                <Field label="Logo URL" value={form.logoUrl} onChange={(value) => setForm({ ...form, logoUrl: value })} placeholder="https://..." />
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                {(logoFile || form.logoUrl) && (
                  <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-cream">
                    <img
                      src={logoPreviewUrl || form.logoUrl}
                      alt="Logo preview"
                      className="h-28 w-full object-contain p-4"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3 rounded-2xl border border-charcoal/10 p-3">
                <Field label="Hero Image URL" value={form.heroImageUrl} onChange={(value) => setForm({ ...form, heroImageUrl: value })} placeholder="https://..." />
                <input type="file" accept="image/*" onChange={(e) => setHeroFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                {(heroFile || form.heroImageUrl) && (
                  <div className="overflow-hidden rounded-2xl border border-charcoal/10 bg-cream">
                    <img
                      src={heroPreviewUrl || form.heroImageUrl}
                      alt="Hero preview"
                      className="h-28 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-charcoal/60">
              Uploads go to Firebase Storage when you save, and the storefront will use them automatically.
            </p>
          </div>

          {error && <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700">{error}</div>}
          {result && (
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 space-y-2">
              <p className="font-semibold text-green-800">Shop created.</p>
              <p className="text-sm text-green-700 break-all">Public link: {result.publicUrl}</p>
              <p className="text-sm text-green-700 break-all">Admin setup: {result.adminUrl}</p>
            </div>
          )}

          <button type="submit" disabled={saving} className="button-primary w-full justify-center disabled:opacity-70">
            {saving ? 'Creating shop...' : 'Create shop page'}
          </button>
        </form>

        <aside className="space-y-4">
          <div
            className="card p-6 space-y-4 overflow-hidden"
            style={{
              '--preview-primary': form.primaryColor,
              '--preview-accent': form.accentColor,
              '--preview-gold': form.goldColor,
              '--preview-cream': form.creamColor,
              '--preview-charcoal': form.charcoalColor,
              background: 'linear-gradient(160deg, var(--preview-cream), #fff)',
            }}
          >
            <p className="text-sm uppercase tracking-wide text-flame font-semibold">Preview</p>
            <div className="rounded-[28px] border border-black/5 bg-white/85 p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] space-y-4">
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
            <div className="card p-6 space-y-3 text-center">
              <p className="text-sm uppercase tracking-wide text-flame font-semibold">QR Code</p>
              <p className="text-xs text-charcoal/60">Print or share this to let customers scan directly to your shop.</p>
              <div className="flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/shop/${form.slug}` : `https://graze.app/shop/${form.slug}`)}&color=762C1B&bgcolor=FFF4E2`}
                  alt="QR code"
                  className="rounded-2xl border border-charcoal/10 shadow-card"
                  width={180}
                  height={180}
                />
              </div>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/shop/${form.slug}` : `https://graze.app/shop/${form.slug}`)}&color=762C1B&bgcolor=FFF4E2`}
                download={`${form.slug}-qr.png`}
                target="_blank"
                rel="noreferrer"
                className="button-secondary text-sm inline-flex justify-center"
              >
                ⬇ Download QR (500×500)
              </a>
            </div>
          )}

          <div className="card p-6 space-y-3">
            <p className="text-sm uppercase tracking-wide text-flame font-semibold">Next steps</p>
            <ul className="space-y-2 text-sm text-charcoal/80">
              <li>1. Create the profile.</li>
              <li>2. Add menu items under admin menu.</li>
              <li>3. Share the public link with customers.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, helper, required = false }) {
  return (
    <label className="space-y-1 block sm:col-span-1">
      <span className="text-sm font-semibold text-charcoal">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-charcoal/15 p-3 focus:border-orange focus:ring-2 focus:ring-orange/20"
      />
      {helper ? <p className="text-xs text-charcoal/60">{helper}</p> : null}
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="space-y-1 block">
      <span className="text-sm font-semibold text-charcoal">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-charcoal/15 bg-white p-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-xl border-none bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-transparent bg-transparent px-2 py-2 text-sm uppercase tracking-wide focus:outline-none"
        />
      </div>
    </label>
  );
}
