import React from 'react';
import { 
  Eye, 
  Moon, 
  Sun, 
  Sparkles, 
  Check, 
  X, 
  ShieldCheck, 
  Sliders, 
  Flame, 
  Leaf, 
  Coffee, 
  BookOpen, 
  Monitor,
  HeartPulse,
  Info
} from 'lucide-react';
import { EyeComfortSettings, ThemeId } from '../types';
import { THEME_CONFIGS } from '../utils/themeManager';

interface EyeComfortModalProps {
  settings: EyeComfortSettings;
  onUpdateSettings: (newSettings: EyeComfortSettings) => void;
  onClose: () => void;
}

export const EyeComfortModal: React.FC<EyeComfortModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const currentConfig = THEME_CONFIGS[settings.themeId] || THEME_CONFIGS['warm-amber'];

  const themeIcons: Record<ThemeId, React.ReactNode> = {
    'warm-amber': <Flame className="h-4 w-4 text-amber-400" />,
    'deep-slate': <Monitor className="h-4 w-4 text-sky-400" />,
    'forest-sage': <Leaf className="h-4 w-4 text-emerald-400" />,
    'espresso-copper': <Coffee className="h-4 w-4 text-orange-400" />,
    'paper-warm': <BookOpen className="h-4 w-4 text-amber-700" />
  };

  const handleSelectTheme = (id: ThemeId) => {
    onUpdateSettings({
      ...settings,
      themeId: id
    });
  };

  const handleToggleEyeProtection = () => {
    onUpdateSettings({
      ...settings,
      eyeProtectionActive: !settings.eyeProtectionActive
    });
  };

  const handleWarmthChange = (val: number) => {
    onUpdateSettings({
      ...settings,
      warmthLevel: val
    });
  };

  const handleToggleSoftContrast = () => {
    onUpdateSettings({
      ...settings,
      softenContrast: !settings.softenContrast
    });
  };

  const applyQuickPreset = (preset: 'night' | 'studio' | 'reading') => {
    if (preset === 'night') {
      onUpdateSettings({
        themeId: 'warm-amber',
        eyeProtectionActive: true,
        warmthLevel: 65,
        softenContrast: true,
        reducedGlare: true
      });
    } else if (preset === 'studio') {
      onUpdateSettings({
        themeId: 'deep-slate',
        eyeProtectionActive: true,
        warmthLevel: 25,
        softenContrast: true,
        reducedGlare: true
      });
    } else if (preset === 'reading') {
      onUpdateSettings({
        themeId: 'paper-warm',
        eyeProtectionActive: true,
        warmthLevel: 40,
        softenContrast: true,
        reducedGlare: true
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 text-zinc-100 shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: currentConfig.mode === 'light' ? '#ffffff' : '#121110',
          borderColor: currentConfig.colors.border,
          color: currentConfig.mode === 'light' ? '#1c1917' : '#ede8e1'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: currentConfig.colors.border }}>
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ 
                backgroundColor: currentConfig.mode === 'light' ? '#fef3c7' : '#29231b',
                color: currentConfig.colors.accent 
              }}
            >
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
                <span>Eye-Protective Color Schemes</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Optometric Comfort
                </span>
              </h2>
              <p className="text-xs text-zinc-400" style={{ color: currentConfig.colors.textMuted }}>
                Scientific color palettes designed to eliminate blue-light spike, astigmatic glare, and digital eye strain.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white transition-colors"
            style={{ color: currentConfig.colors.textMuted }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Ambient Ergonomics Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium mr-1 text-zinc-400" style={{ color: currentConfig.colors.textMuted }}>
            1-Click Ergonomic Presets:
          </span>
          <button
            onClick={() => applyQuickPreset('night')}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
          >
            <Moon className="h-3 w-3" />
            <span>Night Owl (3,200K Amber)</span>
          </button>
          <button
            onClick={() => applyQuickPreset('studio')}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30"
          >
            <Monitor className="h-3 w-3" />
            <span>Studio Precision (Slate)</span>
          </button>
          <button
            onClick={() => applyQuickPreset('reading')}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          >
            <Sun className="h-3 w-3" />
            <span>Daylight Paper (Ivory)</span>
          </button>
        </div>

        {/* Theme Grid Selection */}
        <div className="mt-5 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400" style={{ color: currentConfig.colors.textMuted }}>
            Select Curated Eye-Comfort Theme ({Object.keys(THEME_CONFIGS).length} Options)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.values(THEME_CONFIGS) as any[]).map((theme) => {
              const isSelected = settings.themeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all ${
                    isSelected
                      ? 'ring-2 ring-amber-500/60 shadow-lg'
                      : 'hover:border-zinc-600 opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: isSelected ? theme.colors.accent : theme.colors.border
                  }}
                >
                  {/* Top Bar with Icon & Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-black/40">
                        {themeIcons[theme.id as ThemeId]}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                        {theme.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span 
                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: theme.mode === 'light' ? '#e2d9ca' : 'rgba(0,0,0,0.5)',
                          color: theme.colors.accent
                        }}
                      >
                        {theme.blueLightReduction}
                      </span>
                      {isSelected && (
                        <div 
                          className="flex h-5 w-5 items-center justify-center rounded-full text-white text-xs"
                          style={{ backgroundColor: theme.colors.accent }}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Benefit Description */}
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: theme.colors.textMuted }}>
                    {theme.eyeCareBenefit}
                  </p>

                  {/* Swatches & Spectrum Info */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t" style={{ borderColor: theme.colors.border }}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono opacity-70" style={{ color: theme.colors.textMuted }}>
                        Palette:
                      </span>
                      <div className="flex items-center -space-x-1">
                        <div className="h-4 w-4 rounded-full border border-black/30" style={{ backgroundColor: theme.colors.bg }} title="Background" />
                        <div className="h-4 w-4 rounded-full border border-black/30" style={{ backgroundColor: theme.colors.surface }} title="Surface" />
                        <div className="h-4 w-4 rounded-full border border-black/30" style={{ backgroundColor: theme.colors.accent }} title="Accent" />
                        <div className="h-4 w-4 rounded-full border border-black/30" style={{ backgroundColor: theme.colors.text }} title="Text" />
                      </div>
                    </div>

                    <span className="text-[10px] font-mono opacity-80" style={{ color: theme.colors.textMuted }}>
                      {theme.spectrumKelvin}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Eye Protection Controls */}
        <div 
          className="mt-5 rounded-xl border p-4 space-y-4"
          style={{
            backgroundColor: currentConfig.mode === 'light' ? '#f5f0e6' : '#191714',
            borderColor: currentConfig.colors.border
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  Night Shift Blue-Light Shield
                </span>
                <span className="text-[11px] opacity-75" style={{ color: currentConfig.colors.textMuted }}>
                  Injects warm amber optical tint to suppress 415-455nm blue-light spikes
                </span>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={handleToggleEyeProtection}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.eyeProtectionActive ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.eyeProtectionActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Warmth Level Slider */}
          {settings.eyeProtectionActive && (
            <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: currentConfig.colors.border }}>
              <div className="flex justify-between text-xs">
                <span className="font-medium" style={{ color: currentConfig.colors.textMuted }}>
                  Optical Warmth Level (Night Shift Intensity):
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {settings.warmthLevel}% Warmth
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                value={settings.warmthLevel}
                onChange={(e) => handleWarmthChange(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Subtle (Natural Daylight)</span>
                <span>Balanced (Screen Work)</span>
                <span>Deep Amber (Late Night)</span>
              </div>
            </div>
          )}

          {/* Contrast Softening */}
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: currentConfig.colors.border }}>
            <div>
              <span className="text-xs font-medium block">
                Softened Contrast (Anti-Glare / Astigmatism Relief)
              </span>
              <span className="text-[11px] opacity-75" style={{ color: currentConfig.colors.textMuted }}>
                Softens pure stark white into warm ivory to prevent edge haloing in low ambient light.
              </span>
            </div>
            <button
              onClick={handleToggleSoftContrast}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors border ${
                settings.softenContrast
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {settings.softenContrast ? 'Active' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Optometric Info Footer */}
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: currentConfig.colors.border }}>
          <div className="flex items-center gap-1.5 opacity-70" style={{ color: currentConfig.colors.textMuted }}>
            <HeartPulse className="h-3.5 w-3.5 text-emerald-400" />
            <span>20-20-20 Rule: Every 20 mins, look 20 ft away for 20 seconds.</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
            style={{ 
              backgroundColor: currentConfig.colors.accent,
              color: currentConfig.mode === 'light' ? '#ffffff' : '#000000'
            }}
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
