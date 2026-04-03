export type ThemeId = 'amber' | 'cyber' | 'emerald' | 'crimson' | 'arctic' | 'anime' | 'persian';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  // CSS variable values
  vars: {
    '--hive-bg': string;
    '--hive-surface': string;
    '--hive-panel': string;
    '--hive-border': string;
    '--hive-accent': string;
    '--hive-accent-dim': string;
    '--hive-accent-glow': string;
    '--hive-accent-text': string;
    '--hive-accent-muted': string;
    '--hive-hex-fill': string;   // hex pattern SVG fill (url-encoded hex color)
    '--hive-scrollbar': string;
  };
  // Tailwind-incompatible values exposed for inline use
  accentHex: string;       // raw hex for drop-shadow / box-shadow
  accentRgb: string;       // "r, g, b" for rgba()
  queenGradient: string;   // queen cell background gradient
  bgPattern: string;       // hex pattern color (url-encoded)
}

export const THEMES: Record<ThemeId, Theme> = {
  amber: {
    id: 'amber',
    name: 'Amber Hive',
    description: 'Classic warm gold — the original hive',
    accentHex: '#f59e0b',
    accentRgb: '245, 158, 11',
    queenGradient: 'linear-gradient(135deg, #2a1e08 0%, #3d2a00 50%, #2a1e08 100%)',
    bgPattern: '%23f59e0b08',
    vars: {
      '--hive-bg': '#18171f',
      '--hive-surface': '#201f28',
      '--hive-panel': '#272533',
      '--hive-border': '#32303f',
      '--hive-accent': '#f59e0b',
      '--hive-accent-dim': '#d97706',
      '--hive-accent-glow': '#fbbf24',
      '--hive-accent-text': '#fcd34d',
      '--hive-accent-muted': 'rgba(245,158,11,0.15)',
      '--hive-hex-fill': 'rgba(245,158,11,0.05)',
      '--hive-scrollbar': '#f59e0b44',
    },
  },

  cyber: {
    id: 'cyber',
    name: 'Cyber Blue',
    description: 'Cold neon blue — neural network aesthetic',
    accentHex: '#38bdf8',
    accentRgb: '56, 189, 248',
    queenGradient: 'linear-gradient(135deg, #0d1a2e 0%, #142440 50%, #0d1a2e 100%)',
    bgPattern: '%2338bdf808',
    vars: {
      '--hive-bg': '#0e1520',
      '--hive-surface': '#141d2e',
      '--hive-panel': '#192438',
      '--hive-border': '#243048',
      '--hive-accent': '#38bdf8',
      '--hive-accent-dim': '#0ea5e9',
      '--hive-accent-glow': '#7dd3fc',
      '--hive-accent-text': '#bae6fd',
      '--hive-accent-muted': 'rgba(56,189,248,0.12)',
      '--hive-hex-fill': 'rgba(56,189,248,0.05)',
      '--hive-scrollbar': '#38bdf844',
    },
  },

  emerald: {
    id: 'emerald',
    name: 'Emerald Matrix',
    description: 'Deep green — organic hive intelligence',
    accentHex: '#10b981',
    accentRgb: '16, 185, 129',
    queenGradient: 'linear-gradient(135deg, #0d2a1a 0%, #143d24 50%, #0d2a1a 100%)',
    bgPattern: '%2310b98108',
    vars: {
      '--hive-bg': '#0f1a14',
      '--hive-surface': '#15221a',
      '--hive-panel': '#1a2c20',
      '--hive-border': '#24382a',
      '--hive-accent': '#10b981',
      '--hive-accent-dim': '#059669',
      '--hive-accent-glow': '#34d399',
      '--hive-accent-text': '#6ee7b7',
      '--hive-accent-muted': 'rgba(16,185,129,0.12)',
      '--hive-hex-fill': 'rgba(16,185,129,0.05)',
      '--hive-scrollbar': '#10b98144',
    },
  },

  crimson: {
    id: 'crimson',
    name: 'Crimson Core',
    description: 'Deep red — high-alert command mode',
    accentHex: '#f43f5e',
    accentRgb: '244, 63, 94',
    queenGradient: 'linear-gradient(135deg, #2a0d12 0%, #3d1018 50%, #2a0d12 100%)',
    bgPattern: '%23f43f5e08',
    vars: {
      '--hive-bg': '#1a0e12',
      '--hive-surface': '#221318',
      '--hive-panel': '#2a181e',
      '--hive-border': '#38202a',
      '--hive-accent': '#f43f5e',
      '--hive-accent-dim': '#e11d48',
      '--hive-accent-glow': '#fb7185',
      '--hive-accent-text': '#fda4af',
      '--hive-accent-muted': 'rgba(244,63,94,0.12)',
      '--hive-hex-fill': 'rgba(244,63,94,0.05)',
      '--hive-scrollbar': '#f43f5e44',
    },
  },

  arctic: {
    id: 'arctic',
    name: 'Arctic White',
    description: 'Light mode — clean precision engineering',
    accentHex: '#6366f1',
    accentRgb: '99, 102, 241',
    queenGradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #eef2ff 100%)',
    bgPattern: '%236366f108',
    vars: {
      '--hive-bg': '#f8fafc',
      '--hive-surface': '#f1f5f9',
      '--hive-panel': '#e8edf5',
      '--hive-border': '#cbd5e1',
      '--hive-accent': '#6366f1',
      '--hive-accent-dim': '#4f46e5',
      '--hive-accent-glow': '#818cf8',
      '--hive-accent-text': '#4338ca',
      '--hive-accent-muted': 'rgba(99,102,241,0.1)',
      '--hive-hex-fill': 'rgba(99,102,241,0.05)',
      '--hive-scrollbar': '#6366f144',
    },
  },

  anime: {
    id: 'anime',
    name: 'Anime / GITS',
    description: 'Ghost in the Shell — neon cyber Japan',
    accentHex: '#00fff0',
    accentRgb: '0, 255, 240',
    queenGradient: 'linear-gradient(135deg, #0a1828 0%, #102030 50%, #0a1828 100%)',
    bgPattern: '%2300fff008',
    vars: {
      '--hive-bg': '#0a0f1a',
      '--hive-surface': '#0e1524',
      '--hive-panel': '#121c2e',
      '--hive-border': '#1a2840',
      '--hive-accent': '#00fff0',
      '--hive-accent-dim': '#00c8c0',
      '--hive-accent-glow': '#80fffa',
      '--hive-accent-text': '#b0fffc',
      '--hive-accent-muted': 'rgba(0,255,240,0.1)',
      '--hive-hex-fill': 'rgba(0,255,240,0.04)',
      '--hive-scrollbar': '#00fff044',
    },
  },

  persian: {
    id: 'persian',
    name: 'Persian / \u0641\u0627\u0631\u0633\u06CC',
    description: '\u06A9\u0646\u062F\u0648\u06CC \u0632\u0646\u0628\u0648\u0631 \u0639\u0633\u0644 \u2014 Persian hive command',
    accentHex: '#00fff0',
    accentRgb: '0, 255, 240',
    queenGradient: 'linear-gradient(135deg, #0a1828 0%, #102030 50%, #0a1828 100%)',
    bgPattern: '%2300fff008',
    vars: {
      '--hive-bg': '#0a0f1a',
      '--hive-surface': '#0e1524',
      '--hive-panel': '#121c2e',
      '--hive-border': '#1a2840',
      '--hive-accent': '#00fff0',
      '--hive-accent-dim': '#00c8c0',
      '--hive-accent-glow': '#80fffa',
      '--hive-accent-text': '#b0fffc',
      '--hive-accent-muted': 'rgba(0,255,240,0.1)',
      '--hive-hex-fill': 'rgba(0,255,240,0.04)',
      '--hive-scrollbar': '#00fff044',
    },
  },
};

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  document.body.style.background = theme.vars['--hive-bg'];
  document.body.style.color = theme.id === 'arctic' ? '#1e293b' : '#e2e8f0';
  // RTL for Persian theme
  document.documentElement.dir = theme.id === 'persian' ? 'rtl' : 'ltr';
  localStorage.setItem('hexacore-theme', theme.id);
}

export function loadSavedTheme(): Theme {
  const saved = localStorage.getItem('hexacore-theme') as ThemeId | null;
  return THEMES[saved ?? 'amber'] ?? THEMES.amber;
}
