import React, { useState, useRef, useEffect } from 'react';
import { 
  GripVertical, 
  Minimize2, 
  Maximize2, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw,
  Sliders,
  Expand,
  ArrowUpDown
} from 'lucide-react';
import { useLayout, CardLayout, CardWidth, CardHeightPreset } from '../context/LayoutContext';
import { ComponentTag } from './ComponentTag';

interface CustomizableCardProps {
  id: string; // e.g. "CARD-KPI-SUBS"
  title?: string;
  name?: string;
  category?: 'card' | 'section' | 'toolbar' | 'metric';
  viewId: string; // e.g. "dashboard", "studio", "calendar", "sheets", "workers", "s3", "billing"
  defaultWidth?: CardWidth;
  defaultHeightPreset?: CardHeightPreset;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  noCardWrapper?: boolean; // if child already has card styling
}

export const CustomizableCard: React.FC<CustomizableCardProps> = ({
  id,
  title,
  name,
  category = 'card',
  viewId,
  defaultWidth = 'full',
  defaultHeightPreset = 'auto',
  children,
  className = '',
  headerRight,
  noCardWrapper = false
}) => {
  const { 
    cardLayouts, 
    updateCardLayout, 
    reorderCards, 
    moveCardStep,
    isCustomizing 
  } = useLayout();

  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const resizeStartYRef = useRef<number>(0);
  const initialHeightRef = useRef<number>(0);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const cardConfig: CardLayout = cardLayouts[viewId]?.[id] || {
    id,
    order: 0,
    width: defaultWidth,
    heightPreset: defaultHeightPreset,
    customHeight: undefined,
    isCollapsed: false,
    isMaximized: false
  };

  const currentWidth: CardWidth = cardConfig.width || defaultWidth;
  const currentHeightPreset: CardHeightPreset = cardConfig.heightPreset || defaultHeightPreset;
  const isCollapsed = Boolean(cardConfig.isCollapsed);
  const isMaximized = Boolean(cardConfig.isMaximized);

  // Map width to Tailwind grid col spans
  const colSpanClass = {
    'quarter': 'col-span-12 sm:col-span-6 lg:col-span-3',
    'third': 'col-span-12 sm:col-span-6 lg:col-span-4',
    'half': 'col-span-12 lg:col-span-6',
    'two-thirds': 'col-span-12 lg:col-span-8',
    'full': 'col-span-12'
  }[currentWidth];

  // Map height presets
  const heightPresetClass = {
    'auto': '',
    'compact': 'max-h-[280px] overflow-y-auto no-scrollbar',
    'normal': 'max-h-[460px] overflow-y-auto no-scrollbar',
    'tall': 'max-h-[680px] overflow-y-auto no-scrollbar'
  }[currentHeightPreset];

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ viewId, id }));
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.viewId === viewId && data.id !== id) {
        reorderCards(viewId, data.id, id);
      }
    } catch {}
  };

  // Resizing Width
  const setWidth = (w: CardWidth) => {
    updateCardLayout(viewId, id, { width: w });
  };

  // Resizing Height Preset
  const setHeightPreset = (h: CardHeightPreset) => {
    updateCardLayout(viewId, id, { heightPreset: h, customHeight: undefined });
  };

  // Collapse toggle
  const toggleCollapse = () => {
    updateCardLayout(viewId, id, { isCollapsed: !isCollapsed });
  };

  // Maximize toggle
  const toggleMaximize = () => {
    updateCardLayout(viewId, id, { isMaximized: !isMaximized });
  };

  // Mouse Drag Height Resize logic
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingHeight(true);
    resizeStartYRef.current = e.clientY;
    initialHeightRef.current = cardContainerRef.current?.getBoundingClientRect().height || 300;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - resizeStartYRef.current;
      const newHeight = Math.max(160, Math.min(1200, initialHeightRef.current + deltaY));
      updateCardLayout(viewId, id, { customHeight: newHeight, heightPreset: undefined });
    };

    const onMouseUp = () => {
      setIsResizingHeight(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      <div
        ref={cardContainerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={
          cardConfig.customHeight && !isCollapsed && !isMaximized
            ? { height: `${cardConfig.customHeight}px` }
            : undefined
        }
        className={`relative transition-all duration-200 flex flex-col ${colSpanClass} ${
          isDragging ? 'opacity-35 scale-[0.99] border-dashed border-2 border-amber-500' : 'opacity-100'
        } ${
          isDragOver ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950 scale-[1.01]' : ''
        } ${className}`}
      >
        {/* Card Header & Customization Ribbon */}
        <div className="flex items-center justify-between pb-1.5 text-xs shrink-0 select-none">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {/* Component exact Tag ID (Click to copy) */}
            <ComponentTag id={id} name={name || title} category={category} size="sm" />

            {title && (
              <span className="text-[11px] font-bold text-zinc-300 truncate max-w-[200px]" title={title}>
                {title}
              </span>
            )}
          </div>

          {/* Draggable & Resizable Controls Strip */}
          <div className="flex items-center gap-1 shrink-0">
            {headerRight}

            {/* Quick Width Selector */}
            <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 text-[9px] font-mono">
              {(['third', 'half', 'full'] as const).map((w) => {
                const label = w === 'third' ? '1/3' : w === 'half' ? '1/2' : 'Full';
                const isActive = currentWidth === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWidth(w)}
                    title={`Set width: ${w}`}
                    className={`px-1.5 py-0.5 rounded transition ${
                      isActive
                        ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Quick Height Preset Selector */}
            <div className="hidden sm:flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 text-[9px] font-mono">
              {(['auto', 'compact', 'normal'] as const).map((h) => {
                const label = h === 'auto' ? 'Auto' : h === 'compact' ? 'Sm' : 'Md';
                const isActive = currentHeightPreset === h && !cardConfig.customHeight;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHeightPreset(h)}
                    title={`Set height: ${h}`}
                    className={`px-1.5 py-0.5 rounded transition ${
                      isActive
                        ? 'bg-cyan-500/25 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Step Up / Down Reorder Arrows */}
            <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
              <button
                type="button"
                onClick={() => moveCardStep(viewId, id, 'up')}
                title="Move Card Up / Before"
                className="p-0.5 text-zinc-500 hover:text-amber-400 transition"
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => moveCardStep(viewId, id, 'down')}
                title="Move Card Down / After"
                className="p-0.5 text-zinc-500 hover:text-amber-400 transition"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            {/* Full Screen Focus Maximize */}
            <button
              type="button"
              onClick={toggleMaximize}
              title={isMaximized ? 'Restore View' : 'Focus Maximize Card'}
              className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <Expand className="h-3 w-3" />
            </button>

            {/* Minimize / Collapse Toggle */}
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expand Card' : 'Minimize Card'}
              className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              {isCollapsed ? (
                <Maximize2 className="h-3 w-3 text-amber-400" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </button>

            {/* Responsive Drag Handle */}
            <div
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              title={`Drag [${id}] to reorder card position`}
              className="cursor-grab active:cursor-grabbing rounded p-1 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition group/drag"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Card Main Body */}
        {!isCollapsed && (
          <div 
            className={`w-full flex-1 flex flex-col relative ${heightPresetClass} ${
              cardConfig.customHeight ? 'overflow-y-auto no-scrollbar' : ''
            } ${noCardWrapper ? '' : 'rounded-2xl border border-zinc-800/90 bg-zinc-900/60 shadow-lg'}`}
          >
            {children}

            {/* Interactive Mouse Drag Height Resize Handle on Bottom Right Corner */}
            <div
              onMouseDown={handleResizeMouseDown}
              title="Click and drag up/down to responsively resize card height"
              className={`absolute bottom-0 right-0 w-4 h-4 cursor-ns-resize flex items-center justify-center text-zinc-600 hover:text-amber-400 select-none z-10 transition-colors ${
                isResizingHeight ? 'text-amber-400' : ''
              }`}
            >
              <svg className="w-2.5 h-2.5" viewBox="0 0 6 6" fill="currentColor">
                <circle cx="5" cy="5" r="1" />
                <circle cx="5" cy="2" r="1" />
                <circle cx="2" cy="5" r="1" />
              </svg>
            </div>
          </div>
        )}

        {/* Minimized Strip State */}
        {isCollapsed && (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-2.5 text-xs text-zinc-400 italic flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-amber-300">[{id}]</span>
              <span>Card is minimized</span>
            </div>
            <button
              onClick={toggleCollapse}
              className="text-[11px] text-amber-400 hover:underline font-bold"
            >
              Click to Expand
            </button>
          </div>
        )}
      </div>

      {/* Maximized Modal Focus View */}
      {isMaximized && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={toggleMaximize}
        >
          <div 
            className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl border border-zinc-700 bg-zinc-950 p-5 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <ComponentTag id={id} name={name || title} size="md" />
                <h3 className="text-base font-bold text-white">{title || name || id}</h3>
                <span className="text-xs text-zinc-400">(Focus Maximized View)</span>
              </div>
              <button
                onClick={toggleMaximize}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
