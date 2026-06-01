'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Palette, X, Sparkles, RotateCcw, Undo2,
  Grid, List, Monitor, Sidebar, Image, SplitSquareHorizontal, Minus,
  Loader2, Check, Save, Copy, Download, Upload,
} from 'lucide-react';
import { useTheme } from './ThemeEngine';
import { THEME_PRESETS, RADIUS_MAP } from '@/lib/theme-presets';
import { SHOP_FONTS } from '@/components/ShopProvider';

// ─── Sub-components ───────────────────────────────────────────────────────────

function PresetSwatch({ preset, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(preset.key)}
      title={preset.desc}
      className={`group relative flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all ${
        active ? 'ring-2 ring-[var(--te-accent,#10B981)] bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      <div
        className="h-10 w-10 rounded-lg flex items-center justify-center text-xl overflow-hidden relative shadow-md"
        style={{ background: preset.colors.background }}
      >
        <span>{preset.emoji}</span>
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{ background: `linear-gradient(90deg, ${preset.colors.primary}, ${preset.colors.accent})` }}
        />
      </div>
      <span className={`text-[10px] font-bold ${active ? 'text-white' : 'text-white/50'}`}>{preset.name}</span>
      {active && (
        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 flex items-center justify-center">
          <Check className="h-2 w-2 text-white" />
        </div>
      )}
    </button>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-1">
      {options.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
            value === v ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {label}
        </button>
      ))}
    </div>
  );
}

const RADIUS_STEPS = ['none', 'sm', 'md', 'lg', 'xl', 'full'];

function RadiusSlider({ value, onChange }) {
  const idx = RADIUS_STEPS.indexOf(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>Sharp</span>
        <span className="font-mono text-white/60">{RADIUS_MAP[value] || '20px'}</span>
        <span>Pill</span>
      </div>
      <input
        type="range"
        min={0} max={RADIUS_STEPS.length - 1}
        value={idx === -1 ? 3 : idx}
        onChange={(e) => onChange(RADIUS_STEPS[Number(e.target.value)])}
        className="w-full h-1.5 rounded-full accent-[var(--te-accent,#10B981)] cursor-pointer"
      />
      <div className="flex justify-between">
        {RADIUS_STEPS.map((r) => (
          <div
            key={r}
            className={`h-4 w-4 border-2 transition-colors ${value === r ? 'border-white bg-white/20' : 'border-white/20'}`}
            style={{ borderRadius: RADIUS_MAP[r] }}
          />
        ))}
      </div>
    </div>
  );
}

const SHADOW_OPTIONS = [
  'none', 'sm', 'md', 'warm', 'lg', 'brutal', 'glass', 'neon',
];

// ─── Main panel ───────────────────────────────────────────────────────────────
const ADMIN_SESSION_KEY = 'dab-admin-session';

export default function ThemeCustomizerPanel() {
  const { theme, prevTheme, applyPreset, applyPartial, resetTheme, undo, runAI, panelOpen, setPanelOpen, isCustomized } = useTheme();

  const [aiPrompt,   setAiPrompt]   = useState('');
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiMsg,      setAiMsg]      = useState(null); // { ok: bool, text: string }
  const [saved,      setSaved]      = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [adminMode,  setAdminMode]  = useState(false);
  const panelRef = useRef(null);

  // Determine visibility: admins only (or ?customize=1)
  useEffect(() => {
    const isAdmin = Boolean(localStorage.getItem(ADMIN_SESSION_KEY));
    const isPreview = new URLSearchParams(window.location.search).get('customize') === '1';
    setAdminMode(isAdmin || isPreview);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setPanelOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen, setPanelOpen]);

  if (!adminMode) return null;

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiMsg(null);
    await new Promise((r) => setTimeout(r, 700)); // brief "generating" pause
    const ok = runAI(aiPrompt);
    setAiMsg(ok
      ? { ok: true,  text: `Applied "${aiPrompt}"` }
      : { ok: false, text: 'No match. Try: dark, glass, minimal, brutal, blue, pink, gold…' }
    );
    setAiLoading(false);
    if (ok) setAiPrompt('');
    setTimeout(() => setAiMsg(null), 3000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // localStorage already updated by ThemeEngine on every change.
    // Future Pro feature: POST to /api/shops/bootstrap to persist to DB.
  };

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const handleImportJSON = () => {
    const json = prompt('Paste a Graze theme JSON:');
    if (!json) return;
    try {
      const parsed = JSON.parse(json);
      if (parsed.colors && parsed.radius) {
        applyPartial(parsed);
      }
    } catch {
      alert('Invalid theme JSON.');
    }
  };

  return (
    <>
      {/* ── Floating trigger ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setPanelOpen((o) => !o)}
        title="Theme Command Palette (Ctrl+K)"
        aria-label="Theme Command Palette"
        className={`fixed bottom-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          panelOpen
            ? 'bg-white text-charcoal rotate-90 scale-110'
            : isCustomized
            ? 'bg-flame text-cream shadow-glow animate-pulse-glow'
            : 'bg-[#1C1917] text-white/70 hover:bg-[#2D2521] hover:text-white hover:scale-110'
        }`}
      >
        {panelOpen ? <X className="h-5 w-5" /> : <Palette className="h-5 w-5" />}
      </button>

      {/* ── Panel ────────────────────────────────────────────────────────── */}
      {panelOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-20 left-6 z-50 w-80 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111]/95 shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-2xl animate-slide-up"
          style={{ maxHeight: 'calc(100dvh - 100px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-flame" />
              <span className="text-sm font-bold text-white">Command Palette</span>
              <kbd className="hidden sm:inline-block rounded bg-white/8 px-1.5 py-0.5 font-mono text-[9px] text-white/40">⌘K</kbd>
            </div>
            <div className="flex items-center gap-1">
              {/* Current theme badge */}
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-bold text-white/50 capitalize">
                {theme.name || theme.key}
              </span>
              <button onClick={() => setPanelOpen(false)} className="ml-1 text-white/30 hover:text-white transition">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ scrollbarWidth: 'none' }}>

            {/* Presets */}
            <section>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">Archetypes</p>
              <div className="grid grid-cols-5 gap-1">
                {Object.values(THEME_PRESETS).map((p) => (
                  <PresetSwatch key={p.key} preset={p} active={theme.key === p.key} onClick={applyPreset} />
                ))}
              </div>
            </section>

            {/* AI */}
            <section>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">AI Vibe</p>
              <div className="relative">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAI()}
                  placeholder="dark cyberpunk, minimal white, ocean blue…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3.5 pr-16 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:outline-none transition"
                />
                <button
                  onClick={handleAI}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg bg-flame/80 px-2.5 py-1.5 text-[11px] font-bold text-cream disabled:opacity-40 hover:bg-flame transition"
                >
                  {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Go
                </button>
              </div>
              {aiMsg && (
                <p className={`mt-1.5 text-[11px] ${aiMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                  {aiMsg.ok ? '✓ ' : '✗ '}{aiMsg.text}
                </p>
              )}
            </section>

            {/* Colours */}
            <section>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">Colours</p>
              <div className="space-y-1.5">
                {[
                  { key: 'primary',    label: 'Primary'    },
                  { key: 'accent',     label: 'Accent'     },
                  { key: 'background', label: 'Background' },
                  { key: 'surface',    label: 'Surface'    },
                ].map(({ key, label }) => {
                  const val = theme.colors[key] || '#000000';
                  const isRgba = val.startsWith('rgba');
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2 cursor-pointer hover:bg-white/8 transition"
                    >
                      {isRgba ? (
                        <div className="h-6 w-6 shrink-0 rounded-md border border-white/20" style={{ background: val }} />
                      ) : (
                        <input
                          type="color"
                          value={val}
                          onChange={(e) => applyPartial({ colors: { [key]: e.target.value } })}
                          className="h-6 w-6 shrink-0 cursor-pointer rounded-md border-none bg-transparent p-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/80">{label}</p>
                        <p className="font-mono text-[10px] text-white/35 truncate">{val}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Font */}
            <section>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">Font</p>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(SHOP_FONTS).map(([key, font]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPartial({ font: key })}
                    className={`flex flex-col items-center gap-0.5 rounded-xl border p-2 transition ${
                      theme.font === key
                        ? 'border-white/30 bg-white/12 text-white'
                        : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'
                    }`}
                  >
                    <span className="text-xl font-bold leading-none">{font.sample}</span>
                    <span className="text-[10px]">{font.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Layout */}
            <section>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">Layout</p>
              <div className="space-y-2">
                <div>
                  <p className="mb-1 text-[10px] text-white/40">Product feed</p>
                  <ToggleGroup
                    value={theme.productFeed}
                    onChange={(v) => applyPartial({ productFeed: v })}
                    options={[
                      { value: 'grid',    label: 'Grid',    icon: Grid   },
                      { value: 'list',    label: 'List',    icon: List   },
                      { value: 'masonry', label: 'Masonry', icon: Sidebar },
                    ]}
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] text-white/40">Navigation</p>
                  <ToggleGroup
                    value={theme.navStyle}
                    onChange={(v) => applyPartial({ navStyle: v })}
                    options={[
                      { value: 'top',     label: 'Top bar', icon: Monitor },
                      { value: 'sidebar', label: 'Sidebar', icon: Sidebar },
                    ]}
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] text-white/40">Hero style</p>
                  <ToggleGroup
                    value={theme.heroStyle}
                    onChange={(v) => applyPartial({ heroStyle: v })}
                    options={[
                      { value: 'cover',   label: 'Cover',  icon: Image               },
                      { value: 'split',   label: 'Split',  icon: SplitSquareHorizontal },
                      { value: 'minimal', label: 'Clean',  icon: Minus               },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* Effects */}
            <section>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">Effects</p>
              <div className="space-y-1.5">
                {[
                  { key: 'glass',  label: 'Glassmorphism', desc: 'Frosted panels + backdrop blur' },
                  { key: 'aurora', label: 'Aurora BG',      desc: 'Animated colour gradient' },
                  { key: 'noise',  label: 'Noise texture',  desc: 'Subtle film grain overlay' },
                ].map(({ key, label, desc }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 hover:bg-white/8 transition"
                  >
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={Boolean(theme[key])}
                        onChange={(e) => applyPartial({ [key]: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`h-5 w-9 rounded-full transition-colors duration-200 ${theme[key] ? 'bg-flame' : 'bg-white/15'}`}>
                        <div className={`m-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${theme[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/80">{label}</p>
                      <p className="text-[10px] text-white/35">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Style */}
            <section>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">Style</p>
              <div className="space-y-4 rounded-xl border border-white/8 bg-white/4 p-3">
                <div>
                  <p className="mb-2 text-[10px] text-white/40">Border radius</p>
                  <RadiusSlider value={theme.radius} onChange={(v) => applyPartial({ radius: v })} />
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] text-white/40">Shadow depth</p>
                  <div className="flex flex-wrap gap-1">
                    {SHADOW_OPTIONS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => applyPartial({ shadow: v })}
                        className={`rounded-lg px-2 py-1 text-[10px] font-semibold capitalize transition ${
                          theme.shadow === v
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Export/Import */}
            <section>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/35">Share</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyJSON}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs font-semibold text-white/60 transition hover:text-white hover:bg-white/5"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
                <button
                  onClick={handleImportJSON}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs font-semibold text-white/60 transition hover:text-white hover:bg-white/5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Import JSON
                </button>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 border-t border-white/8 px-4 py-3 shrink-0">
            <button
              onClick={undo}
              disabled={!prevTheme}
              title="Undo last change"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/40 transition hover:text-white hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={resetTheme}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/50 transition hover:border-white/20 hover:text-white/80"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-flame/80 py-2 text-xs font-bold text-cream transition hover:bg-flame active:scale-95"
            >
              {saved
                ? <><Check className="h-3.5 w-3.5" /> Saved!</>
                : <><Save className="h-3.5 w-3.5" /> Save to shop</>
              }
            </button>
          </div>
        </div>
      )}
    </>
  );
}
