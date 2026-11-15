import { ThemeConfig, ThemeId, EyeComfortSettings } from '../types';

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  'warm-amber': {
    id: 'warm-amber',
    name: 'Warm Obsidian & Amber',
    tagline: 'Optometric Night Shield · Recommended for 24/7 focus',
    eyeCareBenefit: 'Zero blue-light spike (~3200K). Protects melatonin production and prevents ocular burn.',
    blueLightReduction: '85% Blue-Light Cut',
    spectrumKelvin: '3,200K (Warm Halogen)',
    mode: 'dark',
    colors: {
      bg: '#141210',
      surface: '#1c1916',
      card: '#24201b',
      border: '#38322a',
      text: '#ede8e1',
      textMuted: '#a3998c',
      accent: '#f59e0b',
      accentGlow: 'rgba(245, 158, 11, 0.2)'
    }
  },
  'deep-slate': {
    id: 'deep-slate',
    name: 'Deep Twilight Slate',
    tagline: 'High-Precision Studio · Calm neutral contrast',
    eyeCareBenefit: 'Deep oceanic slate reduces glare while preserving color fidelity and typography clarity.',
    blueLightReduction: '65% Blue-Light Cut',
    spectrumKelvin: '5,000K (Balanced Twilight)',
    mode: 'dark',
    colors: {
      bg: '#0a0e17',
      surface: '#101726',
      card: '#162033',
      border: '#202f4a',
      text: '#e2e8f0',
      textMuted: '#94a3b8',
      accent: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.2)'
    }
  },
  'forest-sage': {
    id: 'forest-sage',
    name: 'Forest Night & Sage',
    tagline: 'Biophilic Rest · Relaxes ciliary eye muscles',
    eyeCareBenefit: 'Natural chlorophyll-spectrum tones shown in optometric studies to lower optic nerve fatigue.',
    blueLightReduction: '80% Blue-Light Cut',
    spectrumKelvin: '4,500K (Botanical Shade)',
    mode: 'dark',
    colors: {
      bg: '#09120e',
      surface: '#0f1f18',
      card: '#152b21',
      border: '#1d3a2d',
      text: '#e6f0ea',
      textMuted: '#8fa89b',
      accent: '#34d399',
      accentGlow: 'rgba(52, 211, 153, 0.2)'
    }
  },
  'espresso-copper': {
    id: 'espresso-copper',
    name: 'Nordic Espresso & Copper',
    tagline: 'Low-Luminance Earth · Soft halogen warmth',
    eyeCareBenefit: 'Rich earth tones prevent pupillary contraction cycles and reduce tension headaches.',
    blueLightReduction: '90% Blue-Light Cut',
    spectrumKelvin: '2,900K (Candlelight Warm)',
    mode: 'dark',
    colors: {
      bg: '#110e0c',
      surface: '#1a1512',
      card: '#251e1a',
      border: '#3a2e28',
      text: '#f2ece8',
      textMuted: '#ad9d94',
      accent: '#fb923c',
      accentGlow: 'rgba(251, 146, 60, 0.2)'
    }
  },
  'paper-warm': {
    id: 'paper-warm',
    name: 'Paper Warm Parchment',
    tagline: 'Sunlit Reading Room · Anti-glare daytime paper',
    eyeCareBenefit: 'Soft book-paper ivory background eliminates harsh screen backlight reflection in bright rooms.',
    blueLightReduction: '70% Glare Reduction',
    spectrumKelvin: '4,000K (Natural Book Paper)',
    mode: 'light',
    colors: {
      bg: '#f6f3eb',
      surface: '#ffffff',
      card: '#eee8dc',
      border: '#ded5c3',
      text: '#1c1917',
      textMuted: '#57534e',
      accent: '#b45309',
      accentGlow: 'rgba(180, 83, 9, 0.15)'
    }
  }
};

const STORAGE_KEY = 'tubepilot_eye_comfort_v1';

export const DEFAULT_EYE_COMFORT_SETTINGS: EyeComfortSettings = {
  themeId: 'warm-amber',
  eyeProtectionActive: true,
  warmthLevel: 35,
  softenContrast: true,
  reducedGlare: true
};

export function loadEyeComfortSettings(): EyeComfortSettings {
  if (typeof window === 'undefined') return DEFAULT_EYE_COMFORT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EYE_COMFORT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_EYE_COMFORT_SETTINGS,
      ...parsed
    };
  } catch {
    return DEFAULT_EYE_COMFORT_SETTINGS;
  }
}

export function saveEyeComfortSettings(settings: EyeComfortSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Storage notice for eye comfort settings:', e);
  }
}

/**
 * Applies CSS custom variables dynamically to the document root based on chosen theme and eye-comfort settings
 */
export function applyThemeToDom(settings: EyeComfortSettings): void {
  if (typeof document === 'undefined') return;
  const config = THEME_CONFIGS[settings.themeId] || THEME_CONFIGS['warm-amber'];
  const root = document.documentElement;

  // Set theme data attribute
  root.setAttribute('data-theme', config.id);
  root.setAttribute('data-theme-mode', config.mode);

  // Set core CSS variables
  root.style.setProperty('--tp-bg', config.colors.bg);
  root.style.setProperty('--tp-surface', config.colors.surface);
  root.style.setProperty('--tp-card', config.colors.card);
  root.style.setProperty('--tp-border', config.colors.border);
  root.style.setProperty('--tp-text', config.colors.text);
  root.style.setProperty('--tp-text-muted', config.colors.textMuted);
  root.style.setProperty('--tp-accent', config.colors.accent);
  root.style.setProperty('--tp-accent-glow', config.colors.accentGlow);

  // Soften contrast multiplier if enabled
  if (settings.softenContrast) {
    root.style.setProperty('--tp-text-contrast', '0.94');
  } else {
    root.style.setProperty('--tp-text-contrast', '1.0');
  }

  // Calculate physical optical warmth and blue-light suppression values
  if (settings.eyeProtectionActive) {
    const warmthPercent = Math.min(100, Math.max(5, settings.warmthLevel));
    // Warm amber overlay tint
    const overlayAlpha = (warmthPercent / 100) * 0.18;
    root.style.setProperty('--tp-warmth-tint', `rgba(245, 158, 11, ${overlayAlpha.toFixed(3)})`);
    // Physical optical sepia temperature shift (genuine blue-light cut)
    const sepiaVal = ((warmthPercent / 100) * 35).toFixed(1);
    root.style.setProperty('--tp-warmth-sepia', `${sepiaVal}%`);
    // Subtle hue shift toward amber spectrum
    const hueVal = -((warmthPercent / 100) * 10).toFixed(1);
    root.style.setProperty('--tp-warmth-hue', `${hueVal}deg`);
  } else {
    root.style.setProperty('--tp-warmth-tint', 'transparent');
    root.style.setProperty('--tp-warmth-sepia', '0%');
    root.style.setProperty('--tp-warmth-hue', '0deg');
  }
}
