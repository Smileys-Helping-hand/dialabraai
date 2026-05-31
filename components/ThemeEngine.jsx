'use client';

import {
  createContext, useContext, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { THEME_PRESETS, DEFAULT_THEME, RADIUS_MAP, SHADOW_MAP, AI_KEYWORD_MAP } from '@/lib/theme-presets';
import { SHOP_FONTS } from '@/components/ShopProvider';
import { useShop } from '@/components/ShopProvider';

// ─── Context ─────────────────────────────────────────────────────────────────
const ThemeContext = createContext({
  theme:        DEFAULT_THEME,
  prevTheme:    null,
  applyPreset:  () => {},
  applyPartial: () => {},
  resetTheme:   () => {},
  undo:         () => {},
  runAI:        () => false,
  panelOpen:    false,
  setPanelOpen: () => {},
  isCustomized: false,
});

export function useTheme() { return useContext(ThemeContext); }

// ─── DOM helpers ─────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  if (!hex || hex.startsWith('rgba')) return null;
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export function applyThemeToDom(t) {
  if (typeof document === 'undefined') return;
  const r = document.documentElement;

  r.setAttribute('data-theme',  t.key    || 'graze');
  r.setAttribute('data-glass',  t.glass  ? '1' : '0');
  r.setAttribute('data-aurora', t.aurora ? '1' : '0');
  r.setAttribute('data-noise',  t.noise  ? '1' : '0');

  r.style.setProperty('--te-bg',      t.colors.background);
  r.style.setProperty('--te-surface', t.colors.surface);
  r.style.setProperty('--te-text',    t.colors.text);
  r.style.setProperty('--te-primary', t.colors.primary);
  r.style.setProperty('--te-accent',  t.colors.accent);
  r.style.setProperty('--te-radius',  RADIUS_MAP[t.radius]  || RADIUS_MAP.lg);
  r.style.setProperty('--te-shadow',  SHADOW_MAP[t.shadow]  || SHADOW_MAP.md);

  // Also override the core Tailwind color vars for full coverage
  const rgb = (hex) => hexToRgb(hex);
  const primRgb = rgb(t.colors.primary);
  const acctRgb = rgb(t.colors.accent);
  const bgRgb   = rgb(t.colors.background);
  const textRgb = rgb(t.colors.text);
  if (primRgb) r.style.setProperty('--color-primary',  primRgb);
  if (acctRgb) r.style.setProperty('--color-flame',    acctRgb);
  if (bgRgb)   r.style.setProperty('--color-cream',    bgRgb);
  if (textRgb) r.style.setProperty('--color-charcoal', textRgb);

  if (t.font && SHOP_FONTS[t.font]) {
    r.style.setProperty('--font-shop-display', SHOP_FONTS[t.font].cssVar);
  }
}

export function resetThemeToDom() {
  if (typeof document === 'undefined') return;
  const r = document.documentElement;
  ['data-theme','data-glass','data-aurora','data-noise'].forEach((a) => r.removeAttribute(a));
  [
    '--te-bg','--te-surface','--te-text','--te-primary','--te-accent','--te-radius','--te-shadow',
    '--color-primary','--color-flame','--color-cream','--color-charcoal','--font-shop-display',
  ].forEach((v) => r.style.removeProperty(v));
}

// ─── AI parser ───────────────────────────────────────────────────────────────
function parseAIPrompt(prompt) {
  const lower = prompt.toLowerCase();

  // Direct keyword match
  for (const word of lower.split(/\s+/)) {
    if (AI_KEYWORD_MAP[word]) return { ...THEME_PRESETS[AI_KEYWORD_MAP[word]] };
  }

  // Inline hex color
  const hexMatch = prompt.match(/#([0-9a-fA-F]{3,6})\b/);

  // Color mood
  if (/\b(red|fire|hot|crimson|scarlet)\b/.test(lower))
    return { ...THEME_PRESETS.graze,  colors: { ...THEME_PRESETS.graze.colors,  primary: '#C0392B', accent: '#E74C3C' } };
  if (/\b(blue|ocean|cool|sky|cobalt)\b/.test(lower))
    return { ...THEME_PRESETS.minimal, colors: { ...THEME_PRESETS.minimal.colors, primary: '#2563EB', accent: '#3B82F6' } };
  if (/\b(green|nature|fresh|forest|emerald)\b/.test(lower))
    return { ...THEME_PRESETS.minimal, colors: { ...THEME_PRESETS.minimal.colors, primary: '#16A34A', accent: '#22C55E', background: '#F0FDF4' } };
  if (/\b(pink|rose|blush|magenta|coral)\b/.test(lower))
    return { ...THEME_PRESETS.glassmorphism, colors: { ...THEME_PRESETS.glassmorphism.colors, primary: '#EC4899', accent: '#F472B6' } };
  if (/\b(luxury|gold|premium|elegant|rich)\b/.test(lower))
    return { ...THEME_PRESETS.minimal, colors: { primary: '#B45309', accent: '#D97706', background: '#FAFAF5', surface: '#FFFBEB', text: '#1C1917' }, font: 'playfair', shadow: 'warm', radius: 'md' };
  if (/\b(teal|aqua|turquoise|cyan)\b/.test(lower))
    return { ...THEME_PRESETS.minimal, colors: { ...THEME_PRESETS.minimal.colors, primary: '#0D9488', accent: '#14B8A6' } };
  if (/\b(orange|sunset|tangerine)\b/.test(lower))
    return { ...THEME_PRESETS.graze };

  if (hexMatch)
    return { ...THEME_PRESETS.graze, colors: { ...THEME_PRESETS.graze.colors, primary: `#${hexMatch[1]}` } };

  return null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'graze_cmd_theme';

export default function ThemeEngine({ children }) {
  const { shopSlug } = useShop();
  const storageKey = `${STORAGE_KEY}:${shopSlug || 'default'}`;

  const [theme,      setTheme]      = useState(DEFAULT_THEME);
  const [prevTheme,  setPrevTheme]  = useState(null);   // for undo
  const [panelOpen,  setPanelOpen]  = useState(false);
  const [isCustomized, setCustomized] = useState(false);

  // Re-load when shop changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTheme(parsed);
        applyThemeToDom(parsed);
        setCustomized(parsed.key !== 'graze');
      } else {
        // Ensure DOM is clean when switching to a shop with no saved theme
        resetThemeToDom();
        setTheme(DEFAULT_THEME);
        setCustomized(false);
      }
    } catch { /* noop */ }
  }, [storageKey]);

  // ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setPanelOpen((o) => !o); }
      if (e.key === 'Escape' && panelOpen) setPanelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const commit = useCallback((next, customized = true) => {
    setPrevTheme((p) => p || theme); // save one undo level
    setTheme(next);
    applyThemeToDom(next);
    setCustomized(customized);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* noop */ }
  }, [theme, storageKey]);

  const applyPreset = useCallback((key) => {
    const preset = THEME_PRESETS[key];
    if (preset) commit(preset, key !== 'graze');
  }, [commit]);

  const applyPartial = useCallback((patch) => {
    const next = {
      ...theme,
      ...patch,
      colors: { ...theme.colors, ...(patch.colors || {}) },
    };
    commit(next);
  }, [theme, commit]);

  const undo = useCallback(() => {
    if (!prevTheme) return;
    setTheme(prevTheme);
    applyThemeToDom(prevTheme);
    setCustomized(prevTheme.key !== 'graze');
    setPrevTheme(null);
    try { localStorage.setItem(storageKey, JSON.stringify(prevTheme)); } catch { /* noop */ }
  }, [prevTheme, storageKey]);

  const resetTheme = useCallback(() => {
    setPrevTheme(theme);
    setTheme(DEFAULT_THEME);
    resetThemeToDom();
    setCustomized(false);
    try { localStorage.removeItem(storageKey); } catch { /* noop */ }
  }, [theme, storageKey]);

  const runAI = useCallback((prompt) => {
    const result = parseAIPrompt(prompt);
    if (!result) return false;
    commit(result);
    return true;
  }, [commit]);

  const value = useMemo(() => ({
    theme, prevTheme, applyPreset, applyPartial, resetTheme, undo, runAI,
    panelOpen, setPanelOpen, isCustomized,
  }), [theme, prevTheme, applyPreset, applyPartial, resetTheme, undo, runAI, panelOpen, isCustomized]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
