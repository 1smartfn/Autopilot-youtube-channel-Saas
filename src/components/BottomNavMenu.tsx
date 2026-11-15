import React, { useState, useRef } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Table, 
  Cpu, 
  HardDrive, 
  CreditCard,
  GripHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Tag,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sliders,
  PanelBottom,
  PanelTop
} from 'lucide-react';
import { NavigationTab, BillingState } from '../types';
import { ComponentTag } from './ComponentTag';
import { useLayout, MenuPosition, MenuSize } from '../context/LayoutContext';

interface BottomNavMenuProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  billing: BillingState | null;
  unscheduledQueueCount?: number;
}

interface NavItemDef {
  id: NavigationTab;
  tag: string;
  name: string;
  fullComponent: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  accentColor: string;
  shortcut: string;
}

const NAV_ITEMS_MAP: Record<NavigationTab, NavItemDef> = {
  dashboard: {
    id: 'dashboard',
    tag: 'NAV-01-DASHBOARD',
    name: 'Dashboard',
    fullComponent: 'Dashboard',
    label: 'Dashboard',
    sub: 'Analytics Cockpit',
    icon: <BarChart3 className="h-4 w-4 shrink-0" />,
    accentColor: 'from-emerald-500 to-teal-500 text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-emerald-500/20',
    shortcut: '1'
  },
  studio: {
    id: 'studio',
    tag: 'NAV-02-STUDIO',
    name: 'AutopilotStudio',
    fullComponent: 'AutopilotStudio',
    label: 'Autopilot Studio',
    sub: 'Wan 2.1 AI Engine',
    icon: <Sparkles className="h-4 w-4 shrink-0" />,
    accentColor: 'from-red-500 to-amber-500 text-amber-400 border-amber-500/50 bg-amber-500/10 shadow-amber-500/20',
    shortcut: '2'
  },
  sheets: {
    id: 'sheets',
    tag: 'NAV-03-SHEETS',
    name: 'GoogleSheetsViewer',
    fullComponent: 'GoogleSheetsViewer',
    label: 'Google Sheets',
    sub: 'Live Drive Sync',
    icon: <Table className="h-4 w-4 shrink-0" />,
    accentColor: 'from-emerald-500 to-green-600 text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-emerald-500/20',
    shortcut: '3'
  },
  calendar: {
    id: 'calendar',
    tag: 'NAV-04-CALENDAR',
    name: 'SchedulingCalendar',
    fullComponent: 'SchedulingCalendar',
    label: 'Scheduling Calendar',
    sub: '7-Day Matrix',
    icon: <CalendarIcon className="h-4 w-4 shrink-0" />,
    accentColor: 'from-amber-500 to-rose-500 text-rose-400 border-rose-500/50 bg-rose-500/10 shadow-rose-500/20',
    shortcut: '4'
  },
  workers: {
    id: 'workers',
    tag: 'NAV-05-WORKERS',
    name: 'WorkerClusterView',
    fullComponent: 'WorkerClusterView',
    label: 'Worker Cluster',
    sub: 'GPU Farm (RTX/H100)',
    icon: <Cpu className="h-4 w-4 shrink-0" />,
    accentColor: 'from-cyan-500 to-blue-500 text-cyan-400 border-cyan-500/50 bg-cyan-500/10 shadow-cyan-500/20',
    shortcut: '5'
  },
  s3: {
    id: 's3',
    tag: 'NAV-06-S3VAULT',
    name: 'S3StorageVault',
    fullComponent: 'S3StorageVault',
    label: 'S3 Storage Vault',
    sub: 'KMS MP4 Bucket',
    icon: <HardDrive className="h-4 w-4 shrink-0" />,
    accentColor: 'from-purple-500 to-indigo-500 text-violet-400 border-violet-500/50 bg-violet-500/10 shadow-violet-500/20',
    shortcut: '6'
  },
  billing: {
    id: 'billing',
    tag: 'NAV-07-BILLING',
    name: 'BillingPioneer',
    fullComponent: 'BillingPioneer',
    label: 'Billing Pioneer',
    sub: 'Pioneer Gateway',
    icon: <CreditCard className="h-4 w-4 shrink-0" />,
    accentColor: 'from-pink-500 to-rose-500 text-pink-400 border-pink-500/50 bg-pink-500/10 shadow-pink-500/20',
    shortcut: '7'
  }
};

export const BottomNavMenu: React.FC<BottomNavMenuProps> = ({
  activeTab,
  setActiveTab,
  billing,
  unscheduledQueueCount = 0
}) => {
  const { 
    showComponentTags, 
    toggleComponentTags,
    setShowDirectoryModal, 
    menuPosition, 
    setMenuPosition,
    menuSize,
    setMenuSize,
    menuHeight,
    setMenuHeight,
    menuOrder,
    setMenuOrder,
    reorderMenuItems,
    resetLayout
  } = useLayout();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isResizingMenuHeight, setIsResizingMenuHeight] = useState(false);
  const resizeStartYRef = useRef<number>(0);
  const initialMenuHeightRef = useRef<number>(0);

  // Ordered list of items
  const items: NavItemDef[] = menuOrder
    .map((id) => NAV_ITEMS_MAP[id as NavigationTab])
    .filter(Boolean);

  // Keyboard shortcut listener for 1-7
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= items.length) {
        setActiveTab(items[num - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, setActiveTab]);

  // Drag and drop reordering of menu tabs
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    reorderMenuItems(draggedId, targetId);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // Reorder left/right via button
  const shiftItem = (id: string, direction: 'left' | 'right') => {
    const idx = menuOrder.indexOf(id);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= menuOrder.length) return;
    const targetId = menuOrder[targetIdx];
    reorderMenuItems(id, targetId);
  };

  // Interactive mouse drag to resize menu height
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingMenuHeight(true);
    resizeStartYRef.current = e.clientY;
    initialMenuHeightRef.current = menuHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      // In bottom mode, moving up increases height; in second-line mode, moving down increases height
      const deltaY = menuPosition === 'bottom'
        ? resizeStartYRef.current - moveEvent.clientY
        : moveEvent.clientY - resizeStartYRef.current;
      const newHeight = Math.max(42, Math.min(100, initialMenuHeightRef.current + deltaY));
      setMenuHeight(newHeight);
    };

    const onMouseUp = () => {
      setIsResizingMenuHeight(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const menuTagId = menuPosition === 'bottom' ? 'MENU-BOTTOM-DOCK' : 'MENU-TOP-SECOND-LINE';
  const menuTagName = menuPosition === 'bottom' ? 'Bottom Full-View Navigation Menu' : 'Second Line Navigation Menu';

  return (
    <footer 
      className={`shrink-0 w-full select-none backdrop-blur-xl z-40 transition-colors ${
        menuPosition === 'bottom'
          ? 'border-t border-zinc-800/90 bg-zinc-950/95 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]'
          : 'border-b border-zinc-800/90 bg-zinc-950/95 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
      }`}
      title="Navigation Menu: Responsively draggable & resizable. Drag tabs to reorder. Click to switch module."
    >
      {/* Top Resize Handle Bar (when docked at bottom) */}
      {menuPosition === 'bottom' && (
        <div
          onMouseDown={handleResizeMouseDown}
          title="Click and drag up/down to responsively resize menu height"
          className={`h-1.5 w-full cursor-ns-resize flex items-center justify-center bg-zinc-900/60 hover:bg-amber-500/40 transition-colors group ${
            isResizingMenuHeight ? 'bg-amber-500' : ''
          }`}
        >
          <div className="h-0.5 w-12 rounded-full bg-zinc-600 group-hover:bg-amber-400 transition" />
        </div>
      )}

      <div className="w-full px-2 sm:px-4 py-1 flex flex-col gap-1">
        
        {/* Menu Identity & Customization Ribbon */}
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono px-1 flex-wrap gap-1">
          {/* Left: Component Tag & Position Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ComponentTag id={menuTagId} name={menuTagName} category="menu" size="xs" />
            
            <span className="hidden sm:inline font-sans text-zinc-300 font-bold text-[11px]">
              Workspace Modules (Full View)
            </span>

            {/* Position Dock Toggle (Bottom Menu vs Second Line) */}
            <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 text-[9px]">
              <button
                type="button"
                onClick={() => setMenuPosition('bottom')}
                title="Dock in Bottom as Menu"
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition ${
                  menuPosition === 'bottom'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <PanelBottom className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">Bottom Menu</span>
              </button>
              <button
                type="button"
                onClick={() => setMenuPosition('second-line')}
                title="Dock in Second Line under Navbar"
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition ${
                  menuPosition === 'second-line'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <PanelTop className="h-2.5 w-2.5" />
                <span className="hidden sm:inline">2nd Line Top</span>
              </button>
            </div>
          </div>

          {/* Right: Menu Height Presets & Component Directory Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] text-zinc-400">
            {/* Height presets */}
            <div className="hidden md:flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 text-[9px]">
              <span className="text-zinc-500 px-1 font-mono">Height:</span>
              {[
                { size: 'compact' as MenuSize, h: 44, label: 'Sm' },
                { size: 'comfortable' as MenuSize, h: 56, label: 'Md' },
                { size: 'expanded' as MenuSize, h: 68, label: 'Lg' }
              ].map(({ size, h, label }) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setMenuSize(size);
                    setMenuHeight(h);
                  }}
                  className={`px-1.5 py-0.5 rounded transition ${
                    menuHeight === h
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Toggle all component IDs on/off */}
            <button
              onClick={toggleComponentTags}
              title={showComponentTags ? 'Hide component temporary name badges' : 'Show component temporary name badges'}
              className={`flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[9px] font-mono border transition ${
                showComponentTags
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
              }`}
            >
              <Tag className="h-2.5 w-2.5" />
              <span className="hidden sm:inline">IDs: {showComponentTags ? 'ON' : 'OFF'}</span>
            </button>

            {/* Open Component Directory Modal */}
            <button
              onClick={() => setShowDirectoryModal(true)}
              title="Open Directory of all Temporary Names to report improvements"
              className="flex items-center gap-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 px-2 py-0.5 text-[10px] font-semibold text-zinc-200 hover:text-amber-300 transition"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="hidden sm:inline">Names Guide</span>
            </button>

            <span className="hidden xl:inline text-zinc-500">•</span>
            <span className="hidden xl:inline text-zinc-500">Drag tabs to customize order</span>
          </div>
        </div>

        {/* 7 Section Menu Items in Full View (Grid of 7) */}
        <nav 
          style={{ minHeight: menuPosition === 'second-line' ? undefined : `${menuHeight}px` }}
          className={`grid grid-cols-7 gap-1 sm:gap-1.5 w-full items-stretch ${
            menuPosition === 'second-line' ? 'h-9 sm:h-auto' : ''
          }`}
        >
          {items.map((item, idx) => {
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveTab(item.id)}
                className={`relative group flex flex-col items-center justify-center ${
                  menuPosition === 'second-line' ? 'py-1 sm:py-1.5' : 'py-1'
                } px-1 sm:px-1.5 rounded-xl transition-all cursor-pointer border select-none ${
                  isActive
                    ? `bg-zinc-900 border-zinc-700 shadow-lg ring-1 ring-zinc-600/90 ${item.accentColor}`
                    : 'bg-zinc-950/70 hover:bg-zinc-900/70 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                } ${draggedId === item.id ? 'opacity-30 scale-95 border-dashed border-amber-500' : 'opacity-100'}`}
              >
                {/* Active Indicator Glowing Accent Bar */}
                {isActive && (
                  <div className={`absolute left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 shadow-[0_0_10px_rgba(245,158,11,0.8)] ${
                    menuPosition === 'bottom' ? '-top-1' : '-bottom-1'
                  }`} />
                )}

                {/* Top Row: Icon + Number Shortcut */}
                <div className="flex items-center justify-center gap-1 shrink-0">
                  <span className={`transition-transform group-hover:scale-110 ${isActive ? 'scale-105' : 'opacity-80'}`}>
                    {item.icon}
                  </span>
                  <span className="hidden xl:inline text-[9px] font-mono text-zinc-400 bg-zinc-900 px-1 rounded border border-zinc-800">
                    {idx + 1}
                  </span>
                </div>

                {/* Center: Full Component Title (Invisible in mobile view when MENU-TOP-SECOND-LINE) */}
                <span className={`text-[10px] sm:text-xs font-bold tracking-tight text-center truncate max-w-full mt-0.5 ${
                  menuPosition === 'second-line' ? 'hidden sm:block' : 'block'
                } ${
                  isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                }`}>
                  {item.label}
                </span>

                {/* Subtitle / Telemetry Badge (shown if height permits) */}
                {menuHeight >= 52 && (
                  <span className="hidden md:inline text-[9px] text-zinc-500 truncate max-w-full">
                    {item.id === 'calendar' && unscheduledQueueCount > 0
                      ? `${unscheduledQueueCount} in queue`
                      : item.id === 'billing' && billing
                      ? `${billing.quotaTotal - billing.quotaUsed} left`
                      : item.sub}
                  </span>
                )}

                {/* Bottom: Exact Temporary Component Tag (Click to copy) */}
                {showComponentTags && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className={`mt-0.5 shrink-0 max-w-full ${
                      menuPosition === 'second-line' ? 'hidden sm:block' : ''
                    }`}
                  >
                    <ComponentTag 
                      id={item.tag} 
                      name={`${item.label} Module Tab`} 
                      category="menu"
                      size="xs" 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

      </div>

      {/* Bottom Resize Handle Bar (when docked at top) */}
      {menuPosition === 'second-line' && (
        <div
          onMouseDown={handleResizeMouseDown}
          title="Click and drag up/down to responsively resize menu height"
          className={`h-1.5 w-full cursor-ns-resize flex items-center justify-center bg-zinc-900/60 hover:bg-amber-500/40 transition-colors group ${
            isResizingMenuHeight ? 'bg-amber-500' : ''
          }`}
        >
          <div className="h-0.5 w-12 rounded-full bg-zinc-600 group-hover:bg-amber-400 transition" />
        </div>
      )}
    </footer>
  );
};
