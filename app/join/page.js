'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Flame, ArrowRight, ArrowLeft, Loader2, Store, Palette, Menu, Rocket } from 'lucide-react';
import { Suspense } from 'react';

const STEPS = [
  { icon: Store,   label: 'Your business'   },
  { icon: Palette, label: 'Your brand'       },
  { icon: Menu,    label: 'Categories'      },
  { icon: Rocket,  label: 'Go live!'         },
];

const FONT_OPTIONS = [
  { key: 'jakarta',  label: 'Modern',   sample: 'Aa', style: { fontFamily: 'Plus Jakarta Sans, sans-serif' } },
  { key: 'playfair', label: 'Elegant',  sample: 'Aa', style: { fontFamily: 'Playfair Display, serif' } },
  { key: 'syne',     label: 'Bold',     sample: 'Aa', style: { fontFamily: 'Syne, sans-serif' } },
  { key: 'nunito',   label: 'Friendly', sample: 'Aa', style: { fontFamily: 'Nunito, sans-serif' } },
  { key: 'space',    label: 'Sharp',    sample: 'Aa', style: { fontFamily: 'Space Grotesk, sans-serif' } },
  { key: 'oswald',   label: 'Strong',   sample: 'Aa', style: { fontFamily: 'Oswald, sans-serif' } },
];

// Business categories - now generic for all types
const BUSINESS_CATEGORIES = [
  // Food & Beverage
  'Restaurant', 'Café', 'Bakery', 'Catering', 'Food Truck',
  'Pizza', 'Burgers', 'Chicken', 'Seafood', 'Vegan', 'Healthy',
  'Asian', 'Indian', 'Italian', 'Mexican', 'Braai & Grill',
  'Desserts', 'Ice Cream', 'Smoothies', 'Coffee Shop',
  // Retail & Shopping
  'Clothing', 'Shoes', 'Accessories', 'Beauty & Cosmetics',
  'Electronics', 'Home Goods', 'Books', 'Vintage & Secondhand',
  'Sports Equipment', 'Toys & Games',
  // Services
  'Hair Salon', 'Spa & Wellness', 'Fitness', 'Photography',
  'Cleaning Services', 'Laundry', 'Car Wash', 'Repairs',
  // Entertainment & Hobbies
  'Flowers & Gifts', 'Art & Craft Supplies', 'Music Store',
  'Printing & Design', 'Events & Planning',
  // Other
  'Mixed / Other'
];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map(({ icon: Icon, label }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
            i < current  ? 'bg-emerald-500 text-white'
            : i === current ? 'bg-primary text-cream shadow-glow'
            : 'bg-charcoal/8 text-charcoal/35'
          }`}>
            {i < current ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
          </div>
          <span className={`text-xs font-semibold hidden sm:block ${i === current ? 'text-primary' : 'text-charcoal/35'}`}>{label}</span>
          {i < STEPS.length - 1 && <div className={`h-0.5 w-6 rounded-full ${i < current ? 'bg-emerald-500' : 'bg-charcoal/10'}`} />}
        </div>
      ))}
    </div>
  );
}

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan') || 'free';

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    name: '', slug: '', tagline: '', whatsappNumber: '',
    supportPhoneDisplay: '', supportEmail: '', locationSummary: '',
    estimatedReadyTime: '30-45 minutes',
    primaryColor: '#065F46', accentColor: '#10B981',
    fontChoice: 'jakarta',
    defaultMenuCategories: [],
    operatingHours: '', paymentMethods: 'Cash on collection',
    utmSource: '', utmMedium: '', utmCampaign: '', utmContent: '',
    campaignId: '',
  });

  // Capture UTM params and track click
  useEffect(() => {
    if (!searchParams) return;

    const utmSource = searchParams.get('utm_source') || '';
    const utmMedium = searchParams.get('utm_medium') || '';
    const utmCampaign = searchParams.get('utm_campaign') || '';
    const utmContent = searchParams.get('utm_content') || '';

    if (utmSource || utmCampaign) {
      // Set UTM fields in form
      setForm(f => ({
        ...f,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
      }));

      // Track the click (fire-and-forget)
      fetch('/api/track/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          path: '/join',
          referrer: document.referrer,
        }),
      }).catch(err => console.error('Failed to track click:', err));
    }
  }, [searchParams]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const autoSlug = (name) => {
    const s = slugify(name);
    set('slug', s);
    set('name', name);
  };

  const toggleCategory = (cat) => {
    set('defaultMenuCategories',
      form.defaultMenuCategories.includes(cat)
        ? form.defaultMenuCategories.filter((c) => c !== cat)
        : [...form.defaultMenuCategories, cat]
    );
  };

  const next = () => {
    setError('');
    if (step === 0) {
      if (!form.name.trim()) { setError('Please enter your business name.'); return; }
      if (!form.slug.trim()) { setError('Please set a shop URL slug.'); return; }
      if (!form.whatsappNumber.trim()) { setError('WhatsApp number is required.'); return; }
    }
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/shops/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          shortName: form.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),
          currencySymbol: 'R',
          orderTerms: 'Pay on collection unless otherwise arranged.',
          isOpen: true,
          utmSource: form.utmSource,
          utmMedium: form.utmMedium,
          utmCampaign: form.utmCampaign,
          utmContent: form.utmContent,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not create shop');
      setResult(json);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Step 0: Business info ────────────────────────────────────────────
  if (step === 0) return (
    <>
      <StepIndicator current={0} />
      <h2 className="font-display text-2xl font-extrabold text-charcoal mb-1">Tell us about your business</h2>
      <p className="text-sm text-charcoal/55 mb-6">This is what customers will see on the marketplace.</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-charcoal block mb-1.5">Business name <span className="text-flame">*</span></label>
          <input value={form.name} onChange={(e) => autoSlug(e.target.value)} className="input-base" placeholder="Mama's Braai Kitchen" />
        </div>

        <div>
          <label className="text-sm font-semibold text-charcoal block mb-1.5">Shop URL slug <span className="text-flame">*</span></label>
          <div className="flex items-center rounded-xl border-2 border-charcoal/12 bg-white overflow-hidden focus-within:border-flame/40">
            <span className="px-3 text-sm text-charcoal/40 bg-charcoal/4 h-full flex items-center py-3 border-r border-charcoal/12">graze.app/shop/</span>
            <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} className="flex-1 px-3 py-3 text-sm focus:outline-none" placeholder="mamas-braai" />
          </div>
          <p className="text-xs text-charcoal/40 mt-1">Only letters, numbers and hyphens. This can't be changed later.</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-charcoal block mb-1.5">Tagline</label>
          <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} className="input-base" placeholder="Best braai in the street" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-charcoal block mb-1.5">WhatsApp number <span className="text-flame">*</span></label>
            <input value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} className="input-base" placeholder="27821234567" />
            <p className="text-xs text-charcoal/40 mt-1">Include country code (27 for SA)</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-charcoal block mb-1.5">Contact phone</label>
            <input value={form.supportPhoneDisplay} onChange={(e) => set('supportPhoneDisplay', e.target.value)} className="input-base" placeholder="082 123 4567" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-charcoal block mb-1.5">Email</label>
            <input type="email" value={form.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} className="input-base" placeholder="hello@yourshop.co.za" />
          </div>
          <div>
            <label className="text-sm font-semibold text-charcoal block mb-1.5">Location / area</label>
            <input value={form.locationSummary} onChange={(e) => set('locationSummary', e.target.value)} className="input-base" placeholder="Stellenbosch, Western Cape" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-charcoal block mb-1.5">Avg. ready time</label>
            <input value={form.estimatedReadyTime} onChange={(e) => set('estimatedReadyTime', e.target.value)} className="input-base" placeholder="30-45 minutes" />
          </div>
          <div>
            <label className="text-sm font-semibold text-charcoal block mb-1.5">Payment accepted</label>
            <input value={form.paymentMethods} onChange={(e) => set('paymentMethods', e.target.value)} className="input-base" placeholder="Cash, SnapScan, EFT" />
          </div>
        </div>
      </div>
    </>
  );

  // ── Step 1: Brand ────────────────────────────────────────────────────
  if (step === 1) return (
    <>
      <StepIndicator current={1} />
      <h2 className="font-display text-2xl font-extrabold text-charcoal mb-1">Make it yours</h2>
      <p className="text-sm text-charcoal/55 mb-6">Set your brand colours and choose your font. You can always change this later.</p>

      <div className="space-y-6">
        {/* Colours */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-charcoal">Brand colours</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: 'primaryColor',  label: 'Primary (buttons, headings)' },
              { key: 'accentColor',   label: 'Accent (highlights)' },
            ].map(({ key, label }) => (
              <label key={key} className="space-y-1 block">
                <span className="text-xs font-semibold text-charcoal/60">{label}</span>
                <div className="flex items-center gap-3 rounded-xl border border-charcoal/12 bg-white p-2">
                  <input type="color" value={form[key]} onChange={(e) => set(key, e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border-none bg-transparent p-0" />
                  <span className="font-mono text-sm text-charcoal/70">{form[key]}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Font */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-charcoal">Display font</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {FONT_OPTIONS.map(({ key, label, sample, style }) => (
              <button key={key} type="button" onClick={() => set('fontChoice', key)}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition ${
                  form.fontChoice === key ? 'border-flame bg-flame/5' : 'border-charcoal/10 hover:border-flame/30'
                }`}>
                <span style={style} className="text-2xl font-bold text-charcoal">{sample}</span>
                <span className="text-xs font-semibold text-charcoal/60">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hours */}
        <div>
          <label className="text-sm font-bold text-charcoal block mb-1.5">Operating hours</label>
          <input value={form.operatingHours} onChange={(e) => set('operatingHours', e.target.value)} className="input-base"
            placeholder="Mon–Fri 09:00–20:00 · Sat 10:00–18:00 · Sun Closed" />
        </div>

        {/* Preview */}
        <div className="rounded-2xl overflow-hidden border border-charcoal/10" style={{ background: form.accentColor + '15' }}>
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${form.primaryColor}, ${form.accentColor})` }} />
          <div className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-black" style={{ background: form.primaryColor }}>
              {form.name?.slice(0, 2).toUpperCase() || 'GR'}
            </div>
            <div>
              <p className="font-bold text-charcoal" style={{ color: form.primaryColor }}>{form.name || 'Your Shop Name'}</p>
              <p className="text-xs text-charcoal/50">{form.tagline || 'Your tagline'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── Step 2: Categories ───────────────────────────────────────────────
  if (step === 2) return (
    <>
      <StepIndicator current={2} />
      <h2 className="font-display text-2xl font-extrabold text-charcoal mb-1">What's your business type?</h2>
      <p className="text-sm text-charcoal/55 mb-6">Select your business categories. Customers use these to find you. Choose all that apply.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {BUSINESS_CATEGORIES.map((cat) => {
          const active = form.defaultMenuCategories.includes(cat);
          return (
            <button key={cat} type="button" onClick={() => toggleCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? 'bg-primary text-cream shadow-glow' : 'border border-charcoal/15 text-charcoal/65 hover:border-primary/30'
              }`}>
              {active && <Check className="inline h-3.5 w-3.5 mr-1" />}{cat}
            </button>
          );
        })}
      </div>

      {form.defaultMenuCategories.length === 0 && (
        <p className="text-sm text-charcoal/40">Select at least one business category above.</p>
      )}

      <div className="mt-6 rounded-2xl border border-charcoal/8 bg-[#FFFFFF] p-4">
        <p className="text-xs font-bold text-charcoal/50 mb-2">Your business categories:</p>
        {form.defaultMenuCategories.length === 0
          ? <p className="text-sm text-charcoal/35 italic">Nothing selected yet</p>
          : <p className="text-sm font-semibold text-charcoal">{form.defaultMenuCategories.join(' · ')}</p>
        }
      </div>
    </>
  );

  // ── Step 3: Done ─────────────────────────────────────────────────────
  if (step === 3 && result) return (
    <div className="text-center space-y-5">
      <div className="animate-scale-bounce inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <Rocket className="h-10 w-10 text-emerald-600" />
      </div>
      <h2 className="font-display text-3xl font-extrabold text-charcoal">You&apos;re live! 🎉</h2>
      <p className="text-charcoal/60">Your shop is on Graze. Share the link with your customers right now.</p>

      <div className="rounded-2xl border border-gold/25 bg-gold/8 p-5 text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Your public shop link</p>
        <p className="font-mono text-sm font-bold text-charcoal break-all">{typeof window !== 'undefined' ? `${window.location.origin}/shop/${form.slug}` : `/shop/${form.slug}`}</p>
      </div>

      <div className="flex flex-col gap-3">
        <Link href={`/admin/menu?shop=${form.slug}`} className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-bold text-cream shadow-glow transition hover:shadow-glow-lg">
          Add products / services <ArrowRight className="h-5 w-5" />
        </Link>
        <Link href={`/shop/${form.slug}`} className="flex items-center justify-center gap-2 rounded-2xl border border-charcoal/12 py-3.5 text-sm font-semibold text-charcoal transition hover:border-primary/25">
          Preview your shop →
        </Link>
        <Link href="/pricing" className="text-sm text-charcoal/45 hover:text-charcoal transition">
          Upgrade to Pro for analytics, QR codes &amp; more →
        </Link>
      </div>
    </div>
  );

  return null;
}

export default function JoinPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-[#F3F4F6] to-[#E5E7EB] px-4 py-12">
      <div className="mx-auto max-w-xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-charcoal/50 hover:text-charcoal transition">
            <ArrowLeft className="h-4 w-4" /> Back to marketplace
          </Link>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-flame shadow-glow mx-auto mb-3">
            <Flame className="h-7 w-7 text-cream" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-charcoal">List your shop on Graze</h1>
          <p className="text-sm text-charcoal/50 mt-1">Free forever. No commission. Takes 5 minutes.</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-charcoal/8 bg-white shadow-card-hover px-6 py-8">
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-flame" /></div>}>
            <JoinFormInner />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-charcoal/35">
          By joining you agree to our <Link href="/pricing" className="underline hover:text-charcoal">platform terms</Link>.
          Zero commission. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

// Inner component needs Suspense for useSearchParams
function JoinFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan') || 'free';

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    name: '', slug: '', tagline: '', whatsappNumber: '',
    supportPhoneDisplay: '', supportEmail: '', locationSummary: '',
    estimatedReadyTime: '30-45 minutes',
    primaryColor: '#065F46', accentColor: '#10B981',
    fontChoice: 'jakarta',
    defaultMenuCategories: [],
    operatingHours: '', paymentMethods: 'Cash on collection',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const autoSlug = (name) => { set('slug', slugify(name)); set('name', name); };
  const toggleCategory = (cat) => set('defaultMenuCategories',
    form.defaultMenuCategories.includes(cat)
      ? form.defaultMenuCategories.filter((c) => c !== cat)
      : [...form.defaultMenuCategories, cat]
  );

  const next = () => {
    setError('');
    if (step === 0) {
      if (!form.name.trim()) { setError('Please enter your business name.'); return; }
      if (!form.slug.trim()) { setError('Please set a shop URL slug.'); return; }
      if (!form.whatsappNumber.trim()) { setError('WhatsApp number is required.'); return; }
    }
    if (step === 2 && form.defaultMenuCategories.length === 0) {
      setError('Please select at least one cuisine type.'); return;
    }
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/shops/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          shortName: form.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(),
          currencySymbol: 'R',
          orderTerms: 'Pay on collection unless otherwise arranged.',
          isOpen: true,
          utmSource: form.utmSource,
          utmMedium: form.utmMedium,
          utmCampaign: form.utmCampaign,
          utmContent: form.utmContent,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not create shop');
      setResult(json);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (step === 0) return (
    <>
      <StepIndicator current={0} />
      <h2 className="font-display text-2xl font-extrabold text-charcoal mb-1">Tell us about your business</h2>
      <p className="text-sm text-charcoal/55 mb-5">This is what customers will see on the marketplace.</p>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-charcoal block mb-1.5">Business name <span className="text-flame">*</span></label>
          <input value={form.name} onChange={(e) => autoSlug(e.target.value)} className="input-base" placeholder="Mama's Braai Kitchen" autoFocus />
        </div>
        <div>
          <label className="text-sm font-semibold text-charcoal block mb-1.5">Shop URL <span className="text-flame">*</span></label>
          <div className="flex items-center rounded-xl border-2 border-charcoal/12 bg-white overflow-hidden focus-within:border-flame/40">
            <span className="px-3 py-3 text-sm text-charcoal/40 border-r border-charcoal/10">graze.app/shop/</span>
            <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} className="flex-1 px-3 py-3 text-sm focus:outline-none" placeholder="mamas-braai" />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-charcoal block mb-1.5">Tagline</label>
          <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} className="input-base" placeholder="Best braai in the street" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-charcoal block mb-1.5">WhatsApp number <span className="text-flame">*</span></label>
            <input value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} className="input-base" placeholder="27821234567" />
          </div>
          <div>
            <label className="text-sm font-semibold text-charcoal block mb-1.5">Location</label>
            <input value={form.locationSummary} onChange={(e) => set('locationSummary', e.target.value)} className="input-base" placeholder="Cape Town, WC" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-charcoal block mb-1.5">Ready time</label>
            <input value={form.estimatedReadyTime} onChange={(e) => set('estimatedReadyTime', e.target.value)} className="input-base" placeholder="30-45 minutes" />
          </div>
          <div>
            <label className="text-sm font-semibold text-charcoal block mb-1.5">Payment</label>
            <input value={form.paymentMethods} onChange={(e) => set('paymentMethods', e.target.value)} className="input-base" placeholder="Cash, SnapScan" />
          </div>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <button onClick={next} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-bold text-cream shadow-glow transition hover:shadow-glow-lg">
        Next: Your brand <ArrowRight className="h-5 w-5" />
      </button>
    </>
  );

  if (step === 1) return (
    <>
      <StepIndicator current={1} />
      <h2 className="font-display text-2xl font-extrabold text-charcoal mb-1">Make it yours</h2>
      <p className="text-sm text-charcoal/55 mb-5">Brand colours and font — can be changed anytime.</p>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-bold text-charcoal mb-2">Brand colours</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[{ key: 'primaryColor', label: 'Primary' }, { key: 'accentColor', label: 'Accent' }].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 rounded-xl border border-charcoal/12 bg-white p-2.5">
                <input type="color" value={form[key]} onChange={(e) => set(key, e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-charcoal">{label}</p>
                  <p className="font-mono text-xs text-charcoal/45">{form[key]}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-charcoal mb-2">Font style</p>
          <div className="grid gap-2 grid-cols-3">
            {FONT_OPTIONS.map(({ key, label, sample, style }) => (
              <button key={key} type="button" onClick={() => set('fontChoice', key)}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition ${form.fontChoice === key ? 'border-flame bg-flame/5' : 'border-charcoal/10 hover:border-flame/30'}`}>
                <span style={style} className="text-2xl font-bold text-charcoal">{sample}</span>
                <span className="text-xs font-semibold text-charcoal/55">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-charcoal block mb-1.5">Operating hours</label>
          <input value={form.operatingHours} onChange={(e) => set('operatingHours', e.target.value)} className="input-base" placeholder="Mon–Fri 09:00–20:00 · Sat 10:00–18:00" />
        </div>
        {/* Live preview */}
        <div className="rounded-2xl overflow-hidden border border-charcoal/10">
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${form.primaryColor}, ${form.accentColor})` }} />
          <div className="p-4 flex items-center gap-3 bg-white">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: form.primaryColor }}>
              {form.name?.slice(0, 2).toUpperCase() || 'GR'}
            </div>
            <div>
              <p className="font-bold" style={{ color: form.primaryColor }}>{form.name || 'Your Shop'}</p>
              <p className="text-xs text-charcoal/50">{form.tagline || 'Your tagline'}</p>
            </div>
          </div>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex gap-3">
        <button onClick={() => setStep(0)} className="flex items-center gap-2 rounded-2xl border border-charcoal/12 px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-primary/25">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-bold text-cream shadow-glow transition hover:shadow-glow-lg">
          Next: Cuisine <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </>
  );

  if (step === 2) return (
    <>
      <StepIndicator current={2} />
      <h2 className="font-display text-2xl font-extrabold text-charcoal mb-1">What do you serve?</h2>
      <p className="text-sm text-charcoal/55 mb-5">Pick your cuisine types. Customers filter by these.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {BUSINESS_CATEGORIES.map((cat) => {
          const active = form.defaultMenuCategories.includes(cat);
          return (
            <button key={cat} type="button" onClick={() => toggleCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-primary text-cream shadow-glow' : 'border border-charcoal/15 text-charcoal/65 hover:border-primary/30'}`}>
              {active && <Check className="inline h-3 w-3 mr-1" />}{cat}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="flex gap-3 mt-5">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 rounded-2xl border border-charcoal/12 px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-primary/25">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={submit} disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-bold text-cream shadow-glow transition hover:shadow-glow-lg disabled:opacity-50">
          {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating your shop…</> : <><Rocket className="h-5 w-5" /> Launch my shop!</>}
        </button>
      </div>
      {error && !saving && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </>
  );

  if (step === 3 && result) return (
    <div className="text-center space-y-5">
      <div className="animate-scale-bounce inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <Rocket className="h-10 w-10 text-emerald-600" />
      </div>
      <h2 className="font-display text-3xl font-extrabold text-charcoal">You&apos;re live! 🎉</h2>
      <p className="text-charcoal/60">Share this link and your first order could arrive today.</p>
      <div className="rounded-2xl border border-gold/25 bg-gold/8 p-4 text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5">Your shop link</p>
        <p className="font-mono text-sm font-bold text-charcoal break-all">
          {typeof window !== 'undefined' ? `${window.location.origin}/shop/${form.slug}` : `/shop/${form.slug}`}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Link href={`/admin/menu?shop=${form.slug}`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-bold text-cream shadow-glow transition hover:shadow-glow-lg">
          Add your menu items <ArrowRight className="h-5 w-5" />
        </Link>
        <Link href={`/shop/${form.slug}`}
          className="flex items-center justify-center gap-2 rounded-2xl border border-charcoal/12 py-3 text-sm font-semibold text-charcoal hover:border-primary/25 transition">
          Preview your shop →
        </Link>
        <Link href="/pricing" className="text-xs text-charcoal/35 hover:text-charcoal transition">
          Upgrade to Pro for QR codes, analytics &amp; priority placement →
        </Link>
      </div>
    </div>
  );

  return null;
}
