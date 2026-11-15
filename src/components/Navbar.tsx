import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Table, 
  Calendar as CalendarIcon,
  Cpu, 
  HardDrive, 
  CreditCard, 
  Youtube, 
  ShieldCheck, 
  Eye,
  Menu,
  X,
  Check,
  ChevronDown,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  BarChart3,
  FileText,
  Download,
  RotateCcw,
  Sliders,
  Tag
} from 'lucide-react';
import { BillingState, YouTubeChannel, EyeComfortSettings, NavigationTab } from '../types';
import { THEME_CONFIGS } from '../utils/themeManager';
import { useLayout } from '../context/LayoutContext';
import { ComponentTag } from './ComponentTag';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  autopilotActive: boolean;
  setAutopilotActive: (active: boolean) => void;
  billing: BillingState | null;
  channels: YouTubeChannel[];
  selectedChannel: YouTubeChannel;
  setSelectedChannel: (channel: YouTubeChannel) => void;
  eyeComfortSettings: EyeComfortSettings;
  onOpenEyeComfort: () => void;
  onOpenChannelManager?: (tab?: 'clone' | 'upload') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  autopilotActive,
  setAutopilotActive,
  billing,
  channels,
  selectedChannel,
  setSelectedChannel,
  eyeComfortSettings,
  onOpenEyeComfort,
  onOpenChannelManager
}) => {
  const { 
    showComponentTags, 
    toggleComponentTags, 
    isCustomizing, 
    toggleCustomizing, 
    resetLayout,
    setShowDirectoryModal
  } = useLayout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentTheme = THEME_CONFIGS[eyeComfortSettings.themeId] || THEME_CONFIGS['warm-amber'];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Network Dashboard',
      desc: 'High-level multi-channel analytics, subscriber growth & video metrics',
      icon: <BarChart3 className="h-4 w-4 text-emerald-400" />,
      accent: 'border-emerald-500/30 text-emerald-400'
    },
    {
      id: 'studio' as const,
      label: 'Autopilot Pipeline',
      desc: 'Wan 2.1 free open-source video AI, trend radar & thumbnail engine',
      icon: <Sparkles className="h-4 w-4 text-amber-400" />,
      accent: 'border-amber-500/30 text-amber-400'
    },
    {
      id: 'calendar' as const,
      label: 'Schedule Calendar',
      desc: '7-day peak YouTube time slots & dispatch queue',
      icon: <CalendarIcon className="h-4 w-4 text-rose-400" />,
      accent: 'border-rose-500/30 text-rose-400'
    },
    {
      id: 'sheets' as const,
      label: 'Google Sheets Database',
      desc: 'Two-way live spreadsheet queue & metadata vault',
      icon: <Table className="h-4 w-4 text-emerald-400" />,
      accent: 'border-emerald-500/30 text-emerald-400'
    },
    {
      id: 'workers' as const,
      label: 'Worker GPU Cluster',
      desc: `Distributed nodes & queue (${billing?.concurrentLimit || 4} slots)`,
      icon: <Cpu className="h-4 w-4 text-cyan-400" />,
      accent: 'border-cyan-500/30 text-cyan-400'
    },
    {
      id: 's3' as const,
      label: 'AWS S3 Storage Vault',
      desc: 'KMS-encrypted master MP4s & asset bucket',
      icon: <HardDrive className="h-4 w-4 text-violet-400" />,
      accent: 'border-violet-500/30 text-violet-400'
    },
    {
      id: 'billing' as const,
      label: 'Pioneer Billing & Quota',
      desc: 'Tier limits, concurrency & merchant billing',
      icon: <CreditCard className="h-4 w-4 text-pink-400" />,
      accent: 'border-pink-500/30 text-pink-400'
    }
  ];

  const currentNav = navItems.find((item) => item.id === activeTab) || navItems[0];

  const handleSelectNav = (id: NavigationTab) => {
    setActiveTab(id);
    setIsDropdownOpen(false);
  };

  return (
    <header 
      id="SEC-NAVBAR-MAIN" 
      data-component="SEC-NAVBAR-MAIN"
      className="sticky top-0 z-40 w-full h-12 xs:h-13 sm:h-14 shrink-0 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md transition-all"
    >
      <div className="h-full px-2 xs:px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-1 xs:gap-2 sm:gap-4 max-w-7xl mx-auto w-full">
        
        {/* Left Section: Logo & Quick Status (Relatively Responsive) */}
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 min-w-0 shrink">
          {/* Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 xs:gap-2 cursor-pointer group shrink-0"
            title="TubePilot Dashboard"
          >
            <div className="flex h-7 w-7 xs:h-8 xs:w-8 items-center justify-center rounded-lg xs:rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-sm xs:shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <Youtube className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-white" />
            </div>
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
              <span className="font-bold tracking-tight text-white text-xs xs:text-sm sm:text-base">TubePilot</span>
              <span className="hidden md:inline text-xs text-zinc-500">·</span>
              <span className="hidden md:inline text-[11px] font-mono text-zinc-400">Creator Studio</span>
            </div>
          </div>

          {/* Top Component Tag (Fluid relative sizing) */}
          <ComponentTag 
            id="SEC-NAVBAR-MAIN" 
            name="Top Navbar Header" 
            category="section" 
            size="xs" 
            className="shrink-0 max-w-[85px] xs:max-w-none text-[7.5px] xs:text-[8.5px] sm:text-[9.5px]" 
          />

          {/* Quick UI Customization & Component Tag Controls (Adaptive: Icons on mobile, labeled on desktop) */}
          <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 rounded-lg xs:rounded-xl bg-zinc-900/80 border border-zinc-800 p-0.5 text-xs shrink-0">
            {/* Toggle Component Names */}
            <button
              onClick={toggleComponentTags}
              title="Toggle Component Names/Labels on cards and sections for feedback"
              className={`flex items-center gap-1 p-1 xs:p-1.5 sm:px-2 sm:py-0.5 rounded-md xs:rounded-lg text-[10px] xs:text-[11px] font-mono transition ${
                showComponentTags
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Tag className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3 sm:w-3 shrink-0" />
              <span className="hidden sm:inline">IDs: {showComponentTags ? 'ON' : 'OFF'}</span>
            </button>

            {/* Open Component Directory Modal */}
            <button
              onClick={() => setShowDirectoryModal(true)}
              title="Browse All Temporary Component Names & Descriptions"
              className="flex items-center gap-1 p-1 xs:p-1.5 sm:px-2 sm:py-0.5 rounded-md xs:rounded-lg text-[10px] xs:text-[11px] font-mono text-zinc-300 hover:text-amber-300 hover:bg-zinc-800 transition"
            >
              <FileText className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-amber-400 shrink-0 sm:hidden" />
              <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="hidden sm:inline">Names Guide</span>
            </button>

            {/* Toggle Custom Drag & Resize Mode */}
            <button
              onClick={toggleCustomizing}
              title="Toggle Draggable & Resizable Interface mode"
              className={`flex items-center gap-1 p-1 xs:p-1.5 sm:px-2 sm:py-0.5 rounded-md xs:rounded-lg text-[10px] xs:text-[11px] font-semibold transition ${
                isCustomizing
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3 sm:w-3 text-cyan-400 shrink-0" />
              <span className="hidden lg:inline">Customize UI</span>
              <span className="hidden sm:inline lg:hidden">Layout</span>
            </button>

            {/* Reset Layouts button */}
            <button
              onClick={() => resetLayout()}
              title="Reset all card widths and positions to default"
              className="p-1 xs:p-1.5 sm:px-1.5 sm:py-0.5 rounded-md xs:rounded-lg text-[10px] xs:text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
            >
              <RotateCcw className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-3 sm:w-3 shrink-0" />
            </button>
          </div>

          {/* Autopilot Status Indicator (Icon in mobile view, responsive text on larger screens) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setAutopilotActive(!autopilotActive)}
              title={autopilotActive ? '24/7 Autopilot: Active' : '24/7 Autopilot: Paused'}
              className="flex items-center gap-1 xs:gap-1.5 rounded-md xs:rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 xs:p-1.5 sm:px-2.5 sm:py-1 text-[10px] xs:text-xs text-zinc-300 hover:text-white transition"
            >
              <span className="relative flex h-1.5 w-1.5 xs:h-2 xs:w-2 shrink-0">
                {autopilotActive && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex h-full w-full rounded-full ${autopilotActive ? 'bg-emerald-500' : 'bg-zinc-500'}`}></span>
              </span>
              <Zap className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-emerald-400 sm:hidden shrink-0" />
              <span className="hidden xl:inline font-mono">{autopilotActive ? '24/7 Autopilot' : 'Autopilot Paused'}</span>
              <span className="hidden lg:inline xl:hidden font-mono">{autopilotActive ? 'Autopilot' : 'Paused'}</span>
            </button>
          </div>
        </div>

        {/* Right Section: Eye Comfort, Plan & The Three Lines Menu Dropdown (Relatively Responsive) */}
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5 shrink-0" ref={dropdownRef}>
          
          {/* Eye Protection & Professional Theme Quick Button (Icon on mobile, labeled on md) */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenEyeComfort}
              title="Eye-Protective Color Schemes (Night Shift Shield)"
              className="flex items-center gap-1 xs:gap-1.5 rounded-md xs:rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 p-1 xs:p-1.5 sm:px-2.5 sm:py-1 text-[10px] xs:text-xs font-medium text-zinc-300 hover:text-white transition group"
            >
              <Eye className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden md:inline font-sans text-xs">Eye Comfort</span>
              <span 
                className="h-1.5 w-1.5 xs:h-2 xs:w-2 rounded-full border border-black/40 shrink-0"
                style={{ backgroundColor: currentTheme.colors.accent }}
                title={currentTheme.name}
              />
            </button>
          </div>

          {/* Pioneer Subscription Tier Badge (Icon on mobile, badge text on sm+) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('billing')}
              title={`${billing?.currentTier || 'Pro'} Plan`}
              className="flex items-center gap-1 xs:gap-1.5 rounded-md xs:rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 p-1 xs:p-1.5 sm:px-2.5 sm:py-1 text-[10px] xs:text-xs font-medium text-zinc-300 hover:text-white transition"
            >
              <ShieldCheck className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-zinc-400 shrink-0" />
              <span className="hidden sm:inline capitalize text-xs">
                {billing?.currentTier || 'Pro'} Plan
              </span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* THREE LINES DROP DOWN LIST IN THE TOP RIGHT CORNER (HAMBURGER MENU) */}
          {/* ========================================================================= */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="Toggle Navigation Menu"
              className={`flex items-center justify-center h-7.5 w-7.5 xs:h-8 xs:w-8 sm:h-9 sm:w-9 rounded-lg xs:rounded-xl border transition-all ${
                isDropdownOpen
                  ? 'border-amber-500 bg-amber-500/20 text-white shadow-lg shadow-amber-500/20'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white hover:border-zinc-500'
              }`}
            >
              {isDropdownOpen ? (
                <X className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-5 sm:w-5 text-amber-400 transition-transform duration-200" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-0.5 xs:gap-1 w-3.5 xs:w-4 h-3.5 xs:h-4">
                  {/* Three distinct horizontal lines */}
                  <span className="block h-0.5 w-full rounded-full bg-current transition-all"></span>
                  <span className="block h-0.5 w-full rounded-full bg-current transition-all"></span>
                  <span className="block h-0.5 w-full rounded-full bg-current transition-all"></span>
                </div>
              )}
            </button>

            {/* Mobile Backdrop for safe dismissal */}
            {isDropdownOpen && (
              <div 
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] sm:hidden"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}

            {/* Dropdown Menu Panel (Right Aligned to the top right corner, responsive width) */}
            {isDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-[calc(100vw-1rem)] xs:w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 rounded-xl xs:rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2.5 xs:p-3 shadow-2xl backdrop-blur-xl z-50 max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150"
                style={{
                  backgroundColor: currentTheme.mode === 'light' ? '#ffffff' : '#141210',
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.mode === 'light' ? '#1c1917' : '#ede8e1'
                }}
              >
                {/* Dropdown Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 mb-2">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Command Navigator
                    </span>
                  </div>
                  <span className="text-[10px] font-mono rounded bg-zinc-900 px-2 py-0.5 text-zinc-400 border border-zinc-800">
                    ESC to close
                  </span>
                </div>

                {/* Primary Nav List */}
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectNav(item.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                          isActive
                            ? 'bg-amber-500/15 border border-amber-500/40 text-white shadow-sm'
                            : 'hover:bg-zinc-900/80 text-zinc-300 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-zinc-900 border ${isActive ? item.accent : 'border-zinc-800'}`}>
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                              <span>{item.label}</span>
                              {isActive && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-1">{item.desc}</p>
                          </div>
                        </div>

                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'text-amber-400 translate-x-0.5' : 'text-zinc-600'}`} />
                      </button>
                    );
                  })}
                </div>

                {/* Quick Preferences & Tools Footer */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-1.5">
                  
                  {/* Download Roadmap & Pipelines DOCX */}
                  <a
                    href="/api/download-roadmap-docx"
                    download="TubePilot_Roadmap_and_Pipelines_Presentation.docx"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 hover:from-blue-900/60 hover:to-indigo-900/60 text-xs font-semibold text-blue-200 border border-blue-500/30 transition shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span>Roadmap & Pipelines (.DOCX)</span>
                    </div>
                    <Download className="h-3.5 w-3.5 text-blue-300" />
                  </a>

                  {/* Eye-Protective Schemes */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenEyeComfort();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 text-xs font-medium text-amber-300 border border-amber-500/20 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-amber-400" />
                      <span>Eye-Protective Color Schemes</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {currentTheme.name.split(' ')[0]}
                    </span>
                  </button>

                  {/* 24/7 Autopilot Toggle */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-xs">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      <span>Autopilot 24/7 Engine</span>
                    </div>
                    <button
                      onClick={() => setAutopilotActive(!autopilotActive)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        autopilotActive ? 'bg-emerald-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          autopilotActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Channel Quick Switcher */}
                  <div className="px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Active Channel</span>
                      <span className="text-zinc-500">{selectedChannel.niche}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedChannel.avatar}
                        alt={selectedChannel.name}
                        className="h-6 w-6 rounded-full object-cover border border-zinc-700 shrink-0"
                      />
                      <select
                        value={selectedChannel.id}
                        onChange={(e) => {
                          const found = channels.find((c) => c.id === e.target.value);
                          if (found) setSelectedChannel(found);
                        }}
                        className="flex-1 cursor-pointer bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 rounded-lg py-1 px-2 focus:outline-none"
                      >
                        {channels.map((chan) => (
                          <option key={chan.id} value={chan.id} className="bg-zinc-900 text-white">
                            {chan.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Channel Management Actions */}
                  {onOpenChannelManager && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenChannelManager('clone');
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 py-1.5 text-[11px] font-semibold transition"
                      >
                        <span>🎯 Clone Target</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenChannelManager('upload');
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 py-1.5 text-[11px] font-semibold transition"
                      >
                        <span>➕ Add Channel</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
