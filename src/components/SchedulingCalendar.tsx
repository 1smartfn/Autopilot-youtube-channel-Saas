import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  GripVertical, 
  Sparkles, 
  Youtube, 
  Film, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  AlertCircle,
  Eye,
  ArrowUpRight,
  TrendingUp,
  RotateCw,
  HardDrive,
  Shuffle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Zap,
  Flame,
  RotateCcw
} from 'lucide-react';
import { PipelineItem, YouTubeChannel } from '../types';
import { BatchProcessingToolbar } from './BatchProcessingToolbar';
import { ComponentTag } from './ComponentTag';

interface SchedulingCalendarProps {
  channel: YouTubeChannel;
  channels?: YouTubeChannel[];
  rows: PipelineItem[];
  onUpdateRow: (rowId: string, updates: Partial<PipelineItem>) => void;
  onReorderRows?: (reorderedRows: PipelineItem[]) => void;
  onBatchDelete?: (rowIds: string[]) => void;
  onBatchRerender?: (rowIds: string[]) => void;
  onBatchReassign?: (rowIds: string[], targetChannelId: string) => void;
  onOpenVideo: (item: PipelineItem) => void;
  onOpenPrompt: (prompt: string, title: string) => void;
  onNavigateToStudio: () => void;
}

export const SchedulingCalendar: React.FC<SchedulingCalendarProps> = ({
  channel,
  channels = [],
  rows,
  onUpdateRow,
  onReorderRows,
  onBatchDelete,
  onBatchRerender,
  onBatchReassign,
  onOpenVideo,
  onOpenPrompt,
  onNavigateToStudio
}) => {
  // Current calendar week reference (local time is 2026-09-27 Sunday)
  // Let's create a 7-day view starting from Monday 2026-09-28 to Sunday 2026-10-04, with ability to shift weeks
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);
  const [filterUnscheduled, setFilterUnscheduled] = useState<string>('all'); // 'all', 'ready', 'ideas'

  // Batch Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mobileActiveView, setMobileActiveView] = useState<'calendar' | 'queue'>('calendar');

  // Queue Drag & Drop Prioritization States
  const [draggedQueueIndex, setDraggedQueueIndex] = useState<number | null>(null);
  const [dragOverQueueIndex, setDragOverQueueIndex] = useState<number | null>(null);
  const [dragOverSidebar, setDragOverSidebar] = useState<boolean>(false);
  const [queueToast, setQueueToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Time slot definition for each day
  const timeSlots = [
    { id: '09:00', label: '9:00 AM (Morning Surge)' },
    { id: '14:00', label: '2:00 PM (Afternoon Lunch)' },
    { id: '18:00', label: '6:00 PM (Prime Evening Peak)' },
    { id: '21:00', label: '9:00 PM (Late Night Scroll)' }
  ];

  // Base date calculation: Current local date 2026-09-27 is Sunday.
  // Monday of current week is 2026-09-28 (or 2026-09-28 to 2026-10-04)
  const getWeekDates = (offset: number) => {
    const baseMonday = new Date(2026, 8, 28); // Month is 0-indexed: 8 is September
    baseMonday.setDate(baseMonday.getDate() + offset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0]; // '2026-09-28'
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      days.push({
        dateStr,
        dayName,
        dayNumber,
        monthName,
        fullDate: d
      });
    }
    return days;
  };

  const weekDays = getWeekDates(currentWeekOffset);
  const weekStartStr = `${weekDays[0].monthName} ${weekDays[0].dayNumber}`;
  const weekEndStr = `${weekDays[6].monthName} ${weekDays[6].dayNumber}, 2026`;

  // Filter items in the unscheduled backlog sidebar
  const unscheduledItems = rows.filter((r) => {
    // Unscheduled if not scheduled or scheduledPublishTime is missing
    const isScheduled = r.isScheduled && r.scheduledPublishTime;
    if (isScheduled) return false;

    if (filterUnscheduled === 'ready') {
      return r.status === 's3_uploaded' || r.status === 'youtube_uploaded';
    }
    if (filterUnscheduled === 'ideas') {
      return r.status === 'idea_logged' || r.status === 'veo_queued';
    }
    return true;
  });

  // Scheduled items mapped by "YYYY-MM-DD_HH:mm"
  const getSlotItems = (dateStr: string, slotTime: string) => {
    return rows.filter((r) => {
      if (!r.scheduledPublishTime) return false;
      const [itemDate, itemTimePart] = r.scheduledPublishTime.split('T');
      if (itemDate !== dateStr) return false;
      // Match hour
      const hourPart = itemTimePart?.substring(0, 2);
      const slotHour = slotTime.substring(0, 2);
      return hourPart === slotHour;
    });
  };

  // Reorder pipeline helper: updates parent state & syncs to backend
  const reorderPipeline = (reorderedUnscheduled: PipelineItem[], feedbackMessage?: string) => {
    const scheduledItems = rows.filter((r) => r.isScheduled && r.scheduledPublishTime);
    const newFullRows = [...reorderedUnscheduled, ...scheduledItems];

    if (onReorderRows) {
      onReorderRows(newFullRows);
    }

    // Call backend API to persist reordered pipeline
    const itemIds = newFullRows.map((r) => r.id);
    fetch('/api/sheets/rows/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds })
    }).catch((err) => console.warn('Sync reordered queue notice:', err));

    if (feedbackMessage) {
      setQueueToast({ message: feedbackMessage, type: 'success' });
      setTimeout(() => setQueueToast(null), 3500);
    }
  };

  // Queue item drag start
  const handleQueueDragStart = (e: React.DragEvent, item: PipelineItem, index: number) => {
    setDraggedItemId(item.id);
    setDraggedQueueIndex(index);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, source: 'queue', index }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Queue drag over card
  const handleQueueDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverQueueIndex !== index) {
      setDragOverQueueIndex(index);
    }
  };

  // Queue drop to reorder
  const handleQueueDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverQueueIndex(null);
    setDragOverSidebar(false);

    let fromIndex = draggedQueueIndex;

    try {
      const json = e.dataTransfer.getData('application/json');
      if (json) {
        const parsed = JSON.parse(json);
        if (parsed.source === 'queue' && typeof parsed.index === 'number') {
          fromIndex = parsed.index;
        }
        if (parsed.source === 'calendar') {
          // Dragged from calendar slot back into queue at specific position!
          const item = rows.find((r) => r.id === parsed.id);
          if (item) {
            onUpdateRow(item.id, { isScheduled: false, scheduledPublishTime: undefined });
            const copy = [...unscheduledItems];
            copy.splice(targetIndex, 0, { ...item, isScheduled: false, scheduledPublishTime: undefined });
            reorderPipeline(copy, `⚡ Returned "${item.topic.slice(0, 28)}..." to Queue #${targetIndex + 1}`);
            setDraggedItemId(null);
            setDraggedQueueIndex(null);
            return;
          }
        }
      }
    } catch (err) {
      // Fallback
    }

    if (fromIndex === null || fromIndex === targetIndex) {
      setDraggedItemId(null);
      setDraggedQueueIndex(null);
      return;
    }

    const copy = [...unscheduledItems];
    const [movedItem] = copy.splice(fromIndex, 1);
    copy.splice(targetIndex, 0, movedItem);

    const posNumber = targetIndex + 1;
    reorderPipeline(
      copy,
      `⚡ Priority #${posNumber} Assigned: "${movedItem.topic.slice(0, 28)}..." in Wan 2.1 GPU Queue`
    );

    setDraggedItemId(null);
    setDraggedQueueIndex(null);
  };

  // Quick Queue Shuffle Controls
  const handleSortByViralScore = () => {
    const copy = [...unscheduledItems].sort((a, b) => (b.viralScore || 0) - (a.viralScore || 0));
    reorderPipeline(copy, '🔥 Render Queue Prioritized: Highest Viral Score & CTR First');
  };

  const handleRandomShuffle = () => {
    const copy = [...unscheduledItems];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    reorderPipeline(copy, '🎲 Queued Video Tasks Randomly Shuffled');
  };

  const handleReverseQueue = () => {
    const copy = [...unscheduledItems].reverse();
    reorderPipeline(copy, '🔄 Video Render Queue Inverted');
  };

  const handleNudgeQueue = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= unscheduledItems.length) return;

    const copy = [...unscheduledItems];
    const [movedItem] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, movedItem);

    reorderPipeline(copy, `Priority #${targetIndex + 1}: "${movedItem.topic.slice(0, 25)}..."`);
  };

  // Calendar Card Drag Start (allows dragging between slots or back to queue)
  const handleCalendarCardDragStart = (e: React.DragEvent, item: PipelineItem, dateStr: string, slotId: string) => {
    setDraggedItemId(item.id);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, source: 'calendar', dateStr, slotId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Drop on sidebar zone (unschedules card from calendar)
  const handleSidebarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverSidebar) setDragOverSidebar(true);
  };

  const handleSidebarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSidebar(false);
    try {
      const json = e.dataTransfer.getData('application/json');
      if (json) {
        const parsed = JSON.parse(json);
        if (parsed.source === 'calendar') {
          const item = rows.find((r) => r.id === parsed.id);
          if (item) {
            onUpdateRow(item.id, { isScheduled: false, scheduledPublishTime: undefined });
            const copy = [item, ...unscheduledItems.filter(u => u.id !== item.id)];
            reorderPipeline(copy, `Returned "${item.topic.slice(0, 28)}..." to Unscheduled Queue`);
          }
        }
      }
    } catch (err) {
      // Fallback
    }
  };

  // Standard Calendar Slot Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent, slotKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlot !== slotKey) {
      setDragOverSlot(slotKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, dateStr: string, slotTime: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!itemId) return;

    // Build ISO timestamp: e.g. "2026-09-28T14:00:00.000Z"
    const scheduledPublishTime = `${dateStr}T${slotTime}:00.000Z`;

    onUpdateRow(itemId, {
      isScheduled: true,
      scheduledPublishTime
    });

    // Sync to backend API
    try {
      await fetch(`/api/sheets/rows/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isScheduled: true,
          scheduledPublishTime
        })
      });
      setQueueToast({ message: `Scheduled video for ${dateStr} at ${slotTime}`, type: 'success' });
      setTimeout(() => setQueueToast(null), 3000);
    } catch (err) {
      console.warn('Schedule update notice:', err);
    }

    setDraggedItemId(null);
  };

  const handleRemoveFromSchedule = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateRow(itemId, {
      isScheduled: false,
      scheduledPublishTime: undefined
    });

    try {
      await fetch(`/api/sheets/rows/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isScheduled: false,
          scheduledPublishTime: null
        })
      });
      setQueueToast({ message: `Unscheduled item and moved to backlog queue`, type: 'info' });
      setTimeout(() => setQueueToast(null), 3000);
    } catch (err) {
      console.warn('Remove schedule notice:', err);
    }
  };

  // Quick auto-queue: Automatically schedule all unscheduled ready items evenly across the week
  const handleAutoScheduleWeek = async () => {
    const readyItems = rows.filter((r) => !r.scheduledPublishTime);
    if (readyItems.length === 0) return;

    let dayIdx = 0;
    let slotIdx = 0;

    for (const item of readyItems) {
      const targetDay = weekDays[dayIdx % weekDays.length];
      const targetSlot = timeSlots[slotIdx % timeSlots.length];
      const scheduledPublishTime = `${targetDay.dateStr}T${targetSlot.id}:00.000Z`;

      onUpdateRow(item.id, {
        isScheduled: true,
        scheduledPublishTime
      });

      await fetch(`/api/sheets/rows/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isScheduled: true,
          scheduledPublishTime
        })
      });

      slotIdx++;
      if (slotIdx >= timeSlots.length) {
        slotIdx = 0;
        dayIdx++;
      }
    }
  };

  // Batch selection handlers
  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(rows.map((r) => r.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    setIsProcessing(true);
    try {
      onBatchDelete?.(ids);
      setSelectedIds(new Set());
      setQueueToast({ message: `Bulk deleted ${ids.length} videos from calendar & queue`, type: 'info' });
      setTimeout(() => setQueueToast(null), 3500);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchRerender = async () => {
    const ids = Array.from(selectedIds);
    setIsProcessing(true);
    try {
      onBatchRerender?.(ids);
      setSelectedIds(new Set());
      setQueueToast({ message: `Queued ${ids.length} videos for GPU re-render`, type: 'success' });
      setTimeout(() => setQueueToast(null), 3500);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchReassign = async (targetChannelId: string) => {
    const ids = Array.from(selectedIds);
    setIsProcessing(true);
    try {
      onBatchReassign?.(ids, targetChannelId);
      setSelectedIds(new Set());
      const chanName = channels.find(c => c.id === targetChannelId)?.name || 'target channel';
      setQueueToast({ message: `Reassigned ${ids.length} videos to ${chanName}`, type: 'success' });
      setTimeout(() => setQueueToast(null), 3500);
    } finally {
      setIsProcessing(false);
    }
  };

  const isAllSelected = rows.length > 0 && selectedIds.size === rows.length;

  const totalScheduledCount = rows.filter((r) => r.isScheduled && r.scheduledPublishTime).length;

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-hidden p-2 sm:p-2.5 gap-2">
      
      {/* Calendar Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500/20 to-red-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <ComponentTag id="SEC-CALENDAR-HEADER" name="Calendar Header Controls" category="section" size="xs" />
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Autopilot Content Calendar
              </h1>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 border border-amber-500/20">
                Weekly Planner
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-zinc-400">
              Drag ideas and Wan 2.1 renders onto YouTube time slots to automate the entire week.
            </p>
          </div>
        </div>

        {/* Week navigation & action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl bg-zinc-950 border border-zinc-800 p-1 text-xs">
            <button
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Previous Week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 font-semibold text-zinc-200 text-xs">
              {weekStartStr} – {weekEndStr}
            </span>
            <button
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Next Week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setCurrentWeekOffset(0)}
            className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
          >
            Current Week
          </button>

          <button
            onClick={handleAutoScheduleWeek}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition shadow-sm shadow-amber-500/10"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Auto-Queue Backlog</span>
          </button>
        </div>
      </div>

      {/* Batch Processing Toolbar (Appears when videos are selected in Calendar or Queue) */}
      <BatchProcessingToolbar
        selectedCount={selectedIds.size}
        totalCount={rows.length}
        allSelected={isAllSelected}
        channels={channels}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBatchDelete={handleBatchDelete}
        onBatchRerender={handleBatchRerender}
        onBatchReassign={handleBatchReassign}
        isProcessing={isProcessing}
        itemNoun="videos"
      />

      {/* Toast Notification Banner for Queue Actions */}
      {queueToast && (
        <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-zinc-900 p-3 shadow-lg flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-cyan-300 font-medium">
            <Zap className="h-4 w-4 text-cyan-400 animate-bounce" />
            <span>{queueToast.message}</span>
          </div>
          <button 
            onClick={() => setQueueToast(null)}
            className="text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded bg-zinc-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mobile Tab Switcher (Calendar Matrix vs GPU Queue) */}
      <div className="flex lg:hidden items-center p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setMobileActiveView('calendar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            mobileActiveView === 'calendar'
              ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700/80'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-rose-400" />
          <span>7-Day Calendar ({totalScheduledCount})</span>
        </button>
        <button
          onClick={() => setMobileActiveView('queue')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            mobileActiveView === 'queue'
              ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700/80'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GripVertical className="h-3.5 w-3.5 text-cyan-400" />
          <span>GPU Queue ({unscheduledItems.length})</span>
        </button>
      </div>

      {/* Main Grid: Backlog Drawer (Left 4 cols) + Calendar Matrix (Right 8 cols) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        
        {/* Left Side: Unscheduled Ideas & Render Backlog with Drag-and-Drop Priority */}
        <div 
          onDragOver={handleSidebarDragOver}
          onDrop={handleSidebarDrop}
          className={`lg:col-span-4 flex flex-col h-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 overflow-hidden transition-all ${
            mobileActiveView === 'queue' ? 'flex' : 'hidden lg:flex'
          } ${dragOverSidebar ? 'ring-2 ring-cyan-500/80 bg-cyan-950/10' : ''}`}
        >
          <div className="flex flex-col h-full overflow-hidden space-y-2">
            
            {/* Header & Quick Shuffle Toolbar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ComponentTag id="CARD-CALENDAR-BACKLOG" name="Pipeline Render Queue Backlog" category="card" size="xs" />
                      <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                        GPU Render Queue ({unscheduledItems.length})
                      </h2>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Drag cards up or down to set worker render order
                    </p>
                  </div>
                </div>

                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
                  ⚡ Auto-Dispatch
                </span>
              </div>

              {/* Shuffle & Priority Ordering Toolbar */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800/80">
                <button
                  onClick={handleSortByViralScore}
                  title="Prioritize highest virality score first (e.g. 98% CTR)"
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 py-1.5 px-2 text-[10px] font-bold text-amber-300 transition"
                >
                  <Flame className="h-3 w-3 text-amber-400" />
                  <span>Sort by 99% CTR</span>
                </button>

                <button
                  onClick={handleRandomShuffle}
                  title="Shuffle rendering order randomly"
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 py-1.5 px-2 text-[10px] font-semibold text-zinc-200 transition"
                >
                  <Shuffle className="h-3 w-3 text-cyan-400" />
                  <span>Shuffle Queue</span>
                </button>

                <button
                  onClick={handleReverseQueue}
                  title="Reverse priority order"
                  className="rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 p-1.5 text-zinc-300 transition"
                >
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[11px]">
              <button
                onClick={() => setFilterUnscheduled('all')}
                className={`flex-1 rounded py-1 font-medium transition ${
                  filterUnscheduled === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All ({rows.filter(r => !r.scheduledPublishTime).length})
              </button>
              <button
                onClick={() => setFilterUnscheduled('ready')}
                className={`flex-1 rounded py-1 font-medium transition ${
                  filterUnscheduled === 'ready' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                MP4 Ready
              </button>
              <button
                onClick={() => setFilterUnscheduled('ideas')}
                className={`flex-1 rounded py-1 font-medium transition ${
                  filterUnscheduled === 'ideas' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Ideas Only
              </button>
            </div>

            {/* Draggable & Prioritizable Items List */}
            {dragOverSidebar && (
              <div className="rounded-xl border-2 border-dashed border-cyan-400/80 bg-cyan-950/40 p-3 text-center text-xs font-semibold text-cyan-300 animate-pulse">
                📥 Drop here to unschedule & return to GPU render queue
              </div>
            )}

            <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1">
              {unscheduledItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-medium text-white">All items are scheduled!</p>
                  <p className="text-[11px] text-zinc-500">
                    Generate new video ideas in the Studio or drag items from calendar back here to re-prioritize.
                  </p>
                  <button
                    onClick={onNavigateToStudio}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-amber-400 hover:underline font-semibold"
                  >
                    <span>Go to Autopilot Studio</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                unscheduledItems.map((item, idx) => {
                  const isReady = item.status === 's3_uploaded' || item.status === 'youtube_uploaded';
                  const isRendering = item.status === 'rendering';
                  const isTopPriority = idx === 0;
                  const isDraggingOver = dragOverQueueIndex === idx;

                  return (
                    <React.Fragment key={item.id}>
                      {/* Insertion Line Indicator when Dragging */}
                      {isDraggingOver && (
                        <div className="h-1 bg-cyan-400 rounded-full my-1 shadow-sm shadow-cyan-400/80 animate-pulse" />
                      )}

                      <div
                        draggable
                        onDragStart={(e) => handleQueueDragStart(e, item, idx)}
                        onDragOver={(e) => handleQueueDragOver(e, idx)}
                        onDrop={(e) => handleQueueDrop(e, idx)}
                        className={`group relative rounded-xl border p-3 transition-all cursor-grab active:cursor-grabbing hover:scale-[1.01] hover:shadow-lg ${
                          isTopPriority
                            ? 'border-cyan-500/60 bg-gradient-to-br from-cyan-950/30 via-zinc-950 to-zinc-900 ring-1 ring-cyan-500/40'
                            : isReady
                            ? 'border-emerald-500/40 bg-zinc-950/80 hover:border-emerald-500/80'
                            : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                        }`}
                      >
                        {/* Top Priority Badge Line with Nudge Controls */}
                        <div className="flex items-center justify-between text-[10px] pb-1">
                          <div className="flex items-center gap-1.5">
                            {/* Checkbox for Batch Selection */}
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => toggleSelectRow(item.id)}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select ${item.id}`}
                              className="rounded border-zinc-700 bg-zinc-900 text-cyan-400 focus:ring-cyan-400 h-3.5 w-3.5 cursor-pointer"
                            />

                            {/* Grip icon */}
                            <div 
                              className="text-zinc-500 group-hover:text-cyan-400 transition" 
                              title="Drag up or down to shuffle render order"
                            >
                              <GripVertical className="h-3.5 w-3.5" />
                            </div>

                            {/* Priority Rank Indicator */}
                            {isTopPriority ? (
                              <span className="rounded bg-cyan-500/20 text-cyan-300 font-extrabold px-1.5 py-0.5 text-[9px] border border-cyan-500/40 flex items-center gap-1 animate-pulse">
                                <Zap className="h-2.5 w-2.5 fill-cyan-300" />
                                <span>#1 NEXT TO RENDER</span>
                              </span>
                            ) : (
                              <span className="rounded bg-zinc-800 text-zinc-300 font-mono font-bold px-1.5 py-0.5 text-[9px] border border-zinc-700">
                                #{idx + 1} IN QUEUE
                              </span>
                            )}
                          </div>

                          {/* Quick Accessible Move Up / Down Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNudgeQueue(idx, 'up');
                              }}
                              disabled={idx === 0}
                              className="rounded p-0.5 text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-20 transition"
                              title="Move priority up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNudgeQueue(idx, 'down');
                              }}
                              disabled={idx === unscheduledItems.length - 1}
                              className="rounded p-0.5 text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-20 transition"
                              title="Move priority down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>

                            <span className="font-bold text-emerald-400 pl-1">{item.viralScore}%</span>
                          </div>
                        </div>

                        {/* Status chip */}
                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <span className="font-mono text-zinc-500">{item.id}</span>
                          <div>
                            {isReady ? (
                              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-semibold text-emerald-400 border border-emerald-500/30">
                                🎬 Ready in S3
                              </span>
                            ) : isRendering ? (
                              <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 font-semibold text-cyan-400 border border-cyan-500/30 animate-pulse">
                                ⚙️ Rendering
                              </span>
                            ) : (
                              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-semibold text-amber-400 border border-amber-500/20">
                                💡 Idea
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Topic Title */}
                        <h4 className="mt-1.5 text-xs font-semibold text-white line-clamp-2 leading-tight">
                          {item.topic}
                        </h4>

                        {/* Hook snippet */}
                        <p className="mt-1 text-[11px] text-zinc-400 italic line-clamp-1">
                          "{item.hook}"
                        </p>

                        {/* Thumbnail preview if generated */}
                        {item.thumbnailUrl && (
                          <div className="mt-2 relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-black">
                            <img
                              src={item.thumbnailUrl}
                              alt={item.topic}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Bottom action row */}
                        <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[10px] text-zinc-400">
                          <span className="truncate max-w-[120px]">{item.niche}</span>
                          <div className="flex items-center gap-1.5">
                            {item.veoPrompt && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenPrompt(item.veoPrompt, item.topic);
                                }}
                                className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                title="Inspect Wan 2.1 Prompt"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            )}
                            {isReady && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenVideo(item);
                                }}
                                className="rounded p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                                title="Play Video"
                              >
                                <Film className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: 7-Day Calendar Dispatch Matrix */}
        <div className={`lg:col-span-8 flex flex-col h-full rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl ${mobileActiveView === 'calendar' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* Top Stats Banner */}
            <div className="p-2.5 sm:p-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <ComponentTag id="CARD-CALENDAR-MATRIX" name="7-Day Publishing Timeslot Grid" category="card" size="xs" />
                <span className="text-xs font-medium text-zinc-400">
                  Total Scheduled: <strong className="text-white">{totalScheduledCount} videos</strong>
                </span>
                <span className="text-zinc-600 hidden sm:inline">•</span>
                <span className="text-xs text-emerald-400">
                  Target: {channel.frequencyPerDay * 7} uploads/week
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                <span>Auto-publisher worker triggers at exact slot time</span>
              </div>
            </div>

            {/* Horizontal 7-Day Header & Matrix with responsive horizontal scroll */}
            <div className="flex-1 min-h-0 overflow-auto no-scrollbar w-full">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950 text-center">
              {weekDays.map((day) => {
                const isToday = day.dayNumber === 27 && day.monthName === 'Sep';
                return (
                  <div
                    key={day.dateStr}
                    className={`py-3 px-1 border-r last:border-r-0 border-zinc-800/80 transition-colors ${
                      isToday ? 'bg-red-950/20' : ''
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      {day.dayName}
                    </span>
                    <span className={`text-sm font-extrabold ${isToday ? 'text-red-400 font-black' : 'text-white'}`}>
                      {day.dayNumber} {day.monthName}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Matrix Body: Rows = Time Slots, Cols = 7 Days */}
            <div className="divide-y divide-zinc-800/80 bg-zinc-950/40">
              {timeSlots.map((slot) => (
                <div key={slot.id} className="grid grid-cols-7 min-h-[120px]">
                  {weekDays.map((day) => {
                    const slotKey = `${day.dateStr}_${slot.id}`;
                    const isOver = dragOverSlot === slotKey;
                    const itemsInSlot = getSlotItems(day.dateStr, slot.id);

                    return (
                      <div
                        key={slotKey}
                        onDragOver={(e) => handleDragOver(e, slotKey)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day.dateStr, slot.id)}
                        className={`p-1.5 border-r last:border-r-0 border-zinc-800/60 flex flex-col justify-start relative transition-all ${
                          isOver
                            ? 'bg-amber-500/20 ring-2 ring-inset ring-amber-500/60'
                            : 'hover:bg-zinc-900/40'
                        }`}
                      >
                        {/* Time slot indicator stamp */}
                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mb-1 px-1">
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5 text-zinc-500" />
                            {slot.id}
                          </span>
                        </div>

                        {/* Slotted Cards */}
                        <div className="space-y-1.5 flex-1">
                          {itemsInSlot.map((item) => {
                            const isReady = item.status === 's3_uploaded' || item.status === 'youtube_uploaded';

                            return (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleCalendarCardDragStart(e, item, day.dateStr, slot.id)}
                                onClick={() => onOpenVideo(item)}
                                className={`group rounded-lg p-2 text-left cursor-grab active:cursor-grabbing transition-all border shadow-sm ${
                                  selectedIds.has(item.id)
                                    ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/50'
                                    : isReady
                                    ? 'bg-gradient-to-br from-emerald-950/40 to-zinc-900 border-emerald-500/50 hover:border-emerald-400'
                                    : 'bg-zinc-900 border-amber-500/40 hover:border-amber-400'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[9px]">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.has(item.id)}
                                      onChange={() => toggleSelectRow(item.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      aria-label={`Select scheduled video ${item.id}`}
                                      className="rounded border-zinc-700 bg-zinc-900 text-cyan-400 focus:ring-cyan-400 h-3 w-3 cursor-pointer"
                                    />
                                    <span className="font-bold text-white uppercase font-mono">
                                      {isReady ? 'READY' : 'QUEUED'}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => handleRemoveFromSchedule(item.id, e)}
                                    className="opacity-0 group-hover:opacity-100 rounded text-zinc-400 hover:text-red-400 p-0.5 transition"
                                    title="Unschedule item"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                </div>

                                <p className="mt-1 text-[11px] font-semibold text-white line-clamp-2 leading-tight">
                                  {item.topic}
                                </p>

                                <div className="mt-1.5 flex items-center justify-between text-[9px] text-zinc-400 border-t border-zinc-800/80 pt-1">
                                  <span className="font-bold text-emerald-400">
                                    {item.viralScore}% CTR
                                  </span>
                                  <Youtube className="h-3 w-3 text-red-500" />
                                </div>
                              </div>
                            );
                          })}

                          {/* Empty Drop Cue if drag is active over this slot */}
                          {isOver && itemsInSlot.length === 0 && (
                            <div className="h-full min-h-[60px] rounded-lg border-2 border-dashed border-amber-400/60 bg-amber-400/10 flex items-center justify-center text-[10px] font-semibold text-amber-300">
                              + Drop to schedule at {slot.id}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
              </div>
            </div>

          </div>

          {/* Publishing Strategy Guidance */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ComponentTag id="CARD-CALENDAR-SUMMARY" name="Publishing Strategy & Automation Telemetry" category="metric" size="xs" />
              <span className="text-[11px] font-mono text-zinc-400">Publishing Intelligence</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                Algorithm Priming
              </span>
              <p className="mt-1 text-[11px] text-zinc-400">
                Shorts published at 2:00 PM and 6:00 PM experience 2.4x higher initial impression velocity.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <RotateCw className="h-3.5 w-3.5 text-cyan-400" />
                Auto-Worker Pre-Render
              </span>
              <p className="mt-1 text-[11px] text-zinc-400">
                If an idea is scheduled, the worker cluster automatically renders the Veo video 45 minutes prior.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-violet-400" />
                S3 & Sheets Sync
              </span>
              <p className="mt-1 text-[11px] text-zinc-400">
                Scheduled slots write directly to Google Sheets with scheduled release times and S3 bucket pointers.
              </p>
            </div>
          </div>
          </div>

        </div>

      </div>
  );
};
