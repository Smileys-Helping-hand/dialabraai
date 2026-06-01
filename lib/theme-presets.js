/**
 * Theme archetypes for the Graze Command Palette.
 * Each preset defines the full visual identity: colors, typography,
 * layout, effects, and CSS variable overrides.
 */

export const THEME_PRESETS = {
  graze: {
    key:    'graze',
    name:   'Graze',
    emoji:  '🔥',
    desc:   'Warm, food-forward. The default.',
    colors: {
      primary:    '#065F46',
      accent:     '#10B981',
      background: '#F3F4F6',
      surface:    '#FFFFFF',
      text:       '#111827',
    },
    font:       'jakarta',
    radius:     'lg',          // css: 20px
    shadow:     'warm',
    productFeed:'grid',
    navStyle:   'top',
    heroStyle:  'cover',
    glass:      false,
    aurora:     false,
    noise:      false,
  },

  minimal: {
    key:    'minimal',
    name:   'Minimal',
    emoji:  '◻',
    desc:   'Clean whitespace, nothing extra.',
    colors: {
      primary:    '#111111',
      accent:     '#555555',
      background: '#FFFFFF',
      surface:    '#F5F5F5',
      text:       '#111111',
    },
    font:       'jakarta',
    radius:     'sm',          // css: 6px
    shadow:     'none',
    productFeed:'list',
    navStyle:   'top',
    heroStyle:  'split',
    glass:      false,
    aurora:     false,
    noise:      false,
  },

  neubrutalism: {
    key:    'neubrutalism',
    name:   'Neo Brutal',
    emoji:  '⬛',
    desc:   'Thick borders, hard shadows, zero curves.',
    colors: {
      primary:    '#000000',
      accent:     '#FFE500',
      background: '#FFFBEB',
      surface:    '#FFFFFF',
      text:       '#000000',
    },
    font:       'oswald',
    radius:     'none',        // css: 0px
    shadow:     'brutal',
    productFeed:'grid',
    navStyle:   'top',
    heroStyle:  'cover',
    glass:      false,
    aurora:     false,
    noise:      true,
  },

  glassmorphism: {
    key:    'glassmorphism',
    name:   'Glass',
    emoji:  '🫧',
    desc:   'Frosted panels, blur, aurora gradients.',
    colors: {
      primary:    '#6366F1',
      accent:     '#A855F7',
      background: '#0F172A',
      surface:    'rgba(255,255,255,0.06)',
      text:       '#F1F5F9',
    },
    font:       'space',
    radius:     'xl',          // css: 28px
    shadow:     'glass',
    productFeed:'grid',
    navStyle:   'top',
    heroStyle:  'cover',
    glass:      true,
    aurora:     true,
    noise:      false,
  },

  cyberpunk: {
    key:    'cyberpunk',
    name:   'Cyberpunk',
    emoji:  '⚡',
    desc:   'Dark canvas, neon accents, sharp edges.',
    colors: {
      primary:    '#FF007F',
      accent:     '#00FFFF',
      background: '#09090B',
      surface:    '#18181B',
      text:       '#F4F4F5',
    },
    font:       'oswald',
    radius:     'none',        // css: 0px
    shadow:     'neon',
    productFeed:'list',
    navStyle:   'sidebar',
    heroStyle:  'cover',
    glass:      false,
    aurora:     false,
    noise:      false,
  },
};

export const RADIUS_MAP = {
  none: '0px',
  sm:   '6px',
  md:   '12px',
  lg:   '20px',
  xl:   '28px',
  full: '9999px',
};

export const SHADOW_MAP = {
  none:   'none',
  sm:     '0 1px 4px rgba(0,0,0,0.08)',
  md:     '0 4px 16px rgba(0,0,0,0.12)',
  warm:   '0 8px 30px -8px rgba(118,44,27,0.25)',
  lg:     '0 12px 40px rgba(0,0,0,0.18)',
  brutal: '4px 4px 0px #000000',
  glass:  '0 8px 32px rgba(0,0,0,0.4)',
  neon:   '0 0 20px currentColor, 0 0 40px rgba(255,0,127,0.3)',
};

// Keyword → preset mapping for the AI parser
export const AI_KEYWORD_MAP = {
  dark: 'cyberpunk', night: 'cyberpunk', neon: 'cyberpunk', cyber: 'cyberpunk', futuristic: 'cyberpunk',
  glass: 'glassmorphism', blur: 'glassmorphism', aurora: 'glassmorphism', frosted: 'glassmorphism', purple: 'glassmorphism',
  brutal: 'neubrutalism', bold: 'neubrutalism', thick: 'neubrutalism', raw: 'neubrutalism', punk: 'neubrutalism',
  minimal: 'minimal', clean: 'minimal', simple: 'minimal', white: 'minimal', light: 'minimal', pure: 'minimal',
  warm: 'graze', food: 'graze', braai: 'graze', fire: 'graze', orange: 'graze', amber: 'graze',
};

export const DEFAULT_THEME = THEME_PRESETS.graze;
