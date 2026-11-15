import React, { useState } from 'react';
import {
  RotateCw,
  Trash2,
  Share2,
  CheckSquare,
  Square,
  X,
  Youtube,
  ChevronDown,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { YouTubeChannel } from '../types';

export interface BatchProcessingToolbarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  channels: YouTubeChannel[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchDelete: () => void;
  onBatchRerender: () => void;
  onBatchReassign: (targetChannelId: string) => void;
  isProcessing?: boolean;
  itemNoun?: string; // 'videos' | 'rows'
}

export const BatchProcessingToolbar: React.FC<BatchProcessingToolbarProps> = ({
  selectedCount,
  totalCount,
  allSelected,
  channels,
  onSelectAll,
  onDeselectAll,
  onBatchDelete,
  onBatchRerender,
  onBatchReassign,
  isProcessing = false,
  itemNoun = 'videos'
}) => {
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-2 z-30 mb-4 rounded-xl border border-zinc-700/90 bg-zinc-950/95 p-2 sm:p-2.5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        
        {/* Left: Selection Counter & Toggle All */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-white transition shrink-0"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-emerald-400" />
            ) : (
              <Square className="h-4 w-4 text-zinc-400" />
            )}
            <span className="hidden sm:inline">{allSelected ? 'Deselect All' : `Select All (${totalCount})`}</span>
            <span className="sm:hidden">{allSelected ? 'Deselect' : `All (${totalCount})`}</span>
          </button>

          <div className="flex items-center gap-1 text-xs text-zinc-300 font-mono">
            <span className="font-bold text-white font-mono">{selectedCount}</span>
            <span className="text-[11px] text-zinc-400">{itemNoun}</span>
          </div>
        </div>

        {/* Right: Actions (Re-render, Reassign Channel, Delete) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 ml-auto">
          
          {/* Action 1: Bulk Re-render */}
          <button
            onClick={onBatchRerender}
            disabled={isProcessing}
            title="Re-queue selected videos on Wan 2.1 GPU nodes"
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 px-2 sm:px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white transition disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 text-cyan-400 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Re-render</span>
            <span className="hidden md:inline">on GPU</span>
          </button>

          {/* Action 2: Bulk Channel Reassignment Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowChannelDropdown(!showChannelDropdown)}
              disabled={isProcessing}
              className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 px-2 sm:px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white transition disabled:opacity-50"
            >
              <Youtube className="h-3.5 w-3.5 text-red-400" />
              <span>Reassign</span>
              <span className="hidden md:inline">Channel</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {showChannelDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl z-40 space-y-1">
                <span className="block px-2.5 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Target Destination Channel
                </span>
                {channels.map((chan) => (
                  <button
                    key={chan.id}
                    onClick={() => {
                      onBatchReassign(chan.id);
                      setShowChannelDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-lg p-2 text-left text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition"
                  >
                    <img
                      src={chan.avatar}
                      alt={chan.name}
                      className="h-4 w-4 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold truncate">{chan.name}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{chan.handle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action 3: Bulk Delete */}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 px-2 py-1 text-xs">
              <span className="text-[11px] text-rose-300 font-medium">Delete {selectedCount}?</span>
              <button
                onClick={() => {
                  onBatchDelete();
                  setShowDeleteConfirm(false);
                }}
                className="rounded bg-rose-600 hover:bg-rose-500 px-2 py-0.5 font-bold text-white text-[11px] transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded text-zinc-400 hover:text-white text-[11px] px-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              title="Delete selected items from queue"
              className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-rose-950/40 hover:border-rose-500/40 hover:text-rose-300 px-2 sm:px-3 py-1.5 text-xs font-medium text-zinc-400 transition disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          )}

          {/* Close / Deselect button */}
          <button
            onClick={onDeselectAll}
            className="rounded-lg p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 transition"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
