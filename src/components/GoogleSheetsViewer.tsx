import React, { useState } from 'react';
import { 
  Table, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Film,
  FileSpreadsheet,
  Share2,
  Copy,
  ChevronDown,
  CheckSquare,
  Square
} from 'lucide-react';
import { PipelineItem, YouTubeChannel } from '../types';
import { BatchProcessingToolbar } from './BatchProcessingToolbar';
import { ComponentTag } from './ComponentTag';

interface GoogleSheetsViewerProps {
  rows: PipelineItem[];
  channels?: YouTubeChannel[];
  onOpenVideo: (item: PipelineItem) => void;
  onOpenPrompt: (prompt: string, title: string) => void;
  onSyncRow: (rowId: string) => void;
  onBatchDelete?: (rowIds: string[]) => void;
  onBatchRerender?: (rowIds: string[]) => void;
  onBatchReassign?: (rowIds: string[], targetChannelId: string) => void;
}

export const GoogleSheetsViewer: React.FC<GoogleSheetsViewerProps> = ({
  rows,
  channels = [],
  onOpenVideo,
  onOpenPrompt,
  onSyncRow,
  onBatchDelete,
  onBatchRerender,
  onBatchReassign
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(rows[0]?.id || null);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [activeSheetTab, setActiveSheetTab] = useState<'pipeline' | 'analytics'>('pipeline');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const filteredRows = rows.filter((r) => {
    const matchesSearch = 
      r.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hook.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.niche.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedRow = rows.find((r) => r.id === selectedRowId) || rows[0];

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
    setSelectedIds(new Set(filteredRows.map((r) => r.id)));
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
    } finally {
      setIsProcessing(false);
    }
  };

  const isAllSelected = filteredRows.length > 0 && selectedIds.size === filteredRows.length;

  const handleCopyCell = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCell(label);
    setTimeout(() => setCopiedCell(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Row ID', 'Niche', 'Topic', 'Viral Hook', 'Veo Prompt', 'Status', 'S3 URL', 'YouTube ID', 'Viral Score', 'Logged At'];
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => [
        `"${r.id}"`,
        `"${r.niche}"`,
        `"${r.topic.replace(/"/g, '""')}"`,
        `"${r.hook.replace(/"/g, '""')}"`,
        `"${r.veoPrompt.replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${r.s3VideoUrl}"`,
        `"${r.youtubeVideoId}"`,
        `"${r.viralScore}"`,
        `"${r.createdAt}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TubePilot_Autopilot_Queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-hidden p-2 sm:p-3">
      
      {/* Google Sheets Header & Navigation */}
      <div className="rounded-t-2xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <ComponentTag id="SEC-SHEETS-HEADER" name="Google Sheets Header & Drive Sync" category="section" size="xs" />
                <h1 className="text-base font-semibold text-white tracking-tight">
                  TubePilot_Autopilot_Queue
                </h1>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  Live Synced to Google Drive
                </span>
              </div>
              <div className="hidden md:flex items-center gap-3 text-xs text-zinc-400">
                <span>File</span>
                <span>Edit</span>
                <span>View</span>
                <span>Insert</span>
                <span>Format</span>
                <span>Data</span>
                <span>Automations</span>
                <span className="text-[11px] text-zinc-500">| Last synced just now</span>
              </div>
              <div className="md:hidden text-[11px] text-zinc-500">
                Live 2-way Google Sheets Sync
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cloud Sync: Active (Auto-Writes)</span>
              <span className="sm:hidden">Sync: Active</span>
            </div>
          </div>
        </div>

        {/* Formula Bar Simulation */}
        <div className="flex items-center gap-2 pt-2 text-xs">
          <span className="font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
            fx
          </span>
          <div className="flex-1 rounded bg-zinc-950 border border-zinc-800 px-3 py-1 font-mono text-[11px] text-zinc-300 truncate">
            {selectedRow 
              ? `=[TubePilot_Autopilot_Queue]!E${rows.indexOf(selectedRow) + 2} : "${selectedRow.topic}"` 
              : '=FILTER(A2:K100, Status="Uploaded")'}
          </div>
        </div>

        {/* Toolbar: Search, Filter, Stats */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <ComponentTag id="CARD-SHEETS-TOOLBAR" name="Sheets Filter & Search Toolbar" category="toolbar" size="xs" />
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search ideas, topics, hooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 rounded-lg bg-zinc-950 border border-zinc-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-zinc-500 ml-1" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Pipeline Stages</option>
                <option value="idea_logged">Ideas Logged</option>
                <option value="rendering">Veo Rendering</option>
                <option value="youtube_uploaded">Uploaded to YouTube</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Total Logged Rows: <strong className="text-white">{rows.length}</strong></span>
            <span>•</span>
            <span className="text-emerald-400">
              Published: {rows.filter(r => r.status === 'youtube_uploaded').length}
            </span>
          </div>
        </div>
      </div>

      {/* Batch Processing Toolbar (Slides in when rows are selected) */}
      <BatchProcessingToolbar
        selectedCount={selectedIds.size}
        totalCount={filteredRows.length}
        allSelected={isAllSelected}
        channels={channels}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBatchDelete={handleBatchDelete}
        onBatchRerender={handleBatchRerender}
        onBatchReassign={handleBatchReassign}
        isProcessing={isProcessing}
        itemNoun="rows"
      />

      {/* Spreadsheet Main Grid */}
      <div className="flex-1 overflow-auto border-x border-zinc-800 bg-zinc-950">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-20 bg-zinc-900 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="w-10 px-2 py-2.5 border-r border-zinc-800 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={isAllSelected ? handleDeselectAll : handleSelectAll}
                  aria-label="Select all rows"
                  className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                />
              </th>
              <th className="w-12 px-3 py-2.5 border-r border-zinc-800 text-center font-mono">#</th>
              <th className="w-32 px-3 py-2.5 border-r border-zinc-800">Status</th>
              <th className="w-24 px-3 py-2.5 border-r border-zinc-800 text-center">Thumbnail</th>
              <th className="w-28 px-3 py-2.5 border-r border-zinc-800">Niche</th>
              <th className="min-w-[200px] px-3 py-2.5 border-r border-zinc-800">Trend Topic</th>
              <th className="min-w-[220px] px-3 py-2.5 border-r border-zinc-800">Viral Hook (First 3s)</th>
              <th className="min-w-[240px] px-3 py-2.5 border-r border-zinc-800">Wan 2.1 Free AI Prompt</th>
              <th className="w-24 px-3 py-2.5 border-r border-zinc-800 text-center">Viral Score</th>
              <th className="w-32 px-3 py-2.5 border-r border-zinc-800">AWS S3 Video</th>
              <th className="w-36 px-3 py-2.5 border-r border-zinc-800">YouTube Upload</th>
              <th className="w-32 px-3 py-2.5 border-r border-zinc-800">Scheduled Release</th>
              <th className="w-28 px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 font-mono text-[11px]">
            {filteredRows.map((row, idx) => {
              const isSelected = selectedRowId === row.id;
              const isChecked = selectedIds.has(row.id);

              return (
                <tr 
                  key={row.id}
                  onClick={() => setSelectedRowId(row.id)}
                  className={`transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-950/30 hover:bg-emerald-950/40'
                      : isSelected 
                      ? 'bg-zinc-800/40 hover:bg-zinc-800/60' 
                      : 'hover:bg-zinc-900/50'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td className="px-2 py-2.5 text-center border-r border-zinc-800/60 bg-zinc-900/30">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${row.id}`}
                      className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                    />
                  </td>

                  {/* Row Number */}
                  <td className="px-3 py-2.5 text-center font-mono text-zinc-500 border-r border-zinc-800/60 bg-zinc-900/30">
                    {idx + 1}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5 border-r border-zinc-800/60 whitespace-nowrap">
                    {row.status === 'youtube_uploaded' && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Uploaded
                      </span>
                    )}
                    {row.status === 'rendering' && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30 animate-pulse">
                        <Clock className="h-3 w-3" /> Wan 2.1 Rendering ({row.renderProgress}%)
                      </span>
                    )}
                    {row.status === 'veo_queued' && (
                      <span className="inline-flex items-center gap-1 rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/30">
                        <Clock className="h-3 w-3" /> In Wan 2.1 Queue
                      </span>
                    )}
                    {row.status === 'idea_logged' && (
                      <span className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-zinc-700">
                        💡 Idea Logged
                      </span>
                    )}
                  </td>

                  {/* Thumbnail */}
                  <td className="px-2 py-1.5 border-r border-zinc-800/60 text-center">
                    {row.thumbnailUrl ? (
                      <div className="relative aspect-video w-14 mx-auto rounded overflow-hidden border border-zinc-700/80 bg-zinc-900 shadow-sm">
                        <img
                          src={row.thumbnailUrl}
                          alt="Thumbnail"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-600">—</span>
                    )}
                  </td>

                  {/* Niche */}
                  <td className="px-3 py-2.5 border-r border-zinc-800/60 text-zinc-300 font-sans truncate">
                    {row.niche}
                  </td>

                  {/* Topic */}
                  <td className="px-3 py-2.5 border-r border-zinc-800/60 font-sans font-medium text-white">
                    <div className="line-clamp-2">{row.topic}</div>
                  </td>

                  {/* Hook */}
                  <td className="px-3 py-2.5 border-r border-zinc-800/60 font-sans text-zinc-300">
                    <div className="line-clamp-2 italic text-amber-300/90">"{row.hook}"</div>
                  </td>

                  {/* Veo Prompt */}
                  <td className="px-3 py-2.5 border-r border-zinc-800/60 text-zinc-400">
                    <div className="flex items-center justify-between gap-2">
                      <div className="line-clamp-2 text-[10px] text-zinc-400">
                        {row.veoPrompt}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPrompt(row.veoPrompt, row.topic);
                        }}
                        className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300 hover:text-white hover:bg-zinc-700"
                        title="View Full Cinematic Prompt"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                    </div>
                  </td>

                  {/* Virality Score */}
                  <td className="px-3 py-2.5 border-r border-zinc-800/60 text-center font-bold">
                    <span className="text-emerald-400">{row.viralScore}%</span>
                  </td>

                  {/* S3 URL */}
                  <td className="px-3 py-2.5 border-r border-zinc-800/60 text-zinc-400">
                    {row.s3VideoUrl ? (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCell(row.s3VideoUrl || '', `s3-${row.id}`);
                        }}
                        className="flex items-center gap-1 text-[10px] text-violet-400 hover:underline cursor-pointer"
                        title="Click to copy S3 Presigned URL"
                      >
                        <Copy className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[100px]">s3://...{row.id}.mp4</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>

                  {/* YouTube Upload */}
                  <td className="px-3 py-2.5 border-r border-zinc-800/60 text-zinc-300">
                    {row.youtubeVideoId ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenVideo(row);
                        }}
                        className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 font-semibold"
                      >
                        <Film className="h-3 w-3" />
                        <span>youtu.be/{row.youtubeVideoId}</span>
                      </button>
                    ) : (
                      <span className="text-zinc-600">Pending render</span>
                    )}
                  </td>

                  {/* Scheduled Release */}
                  <td className="px-3 py-2.5 border-r border-zinc-800/60 text-zinc-300">
                    {row.scheduledPublishTime ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(row.scheduledPublishTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    ) : (
                      <span className="text-zinc-600">Unscheduled</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenVideo(row);
                        }}
                        className="flex items-center gap-1 rounded bg-red-600/20 px-2 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-600/30 border border-red-500/30"
                      >
                        <Film className="h-3 w-3" />
                        <span>Watch</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Google Sheets Bottom Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-2xl border-x border-b border-zinc-800 bg-zinc-900/90 px-4 py-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <ComponentTag id="CARD-SHEETS-PAGINATION" name="Sheets Tab Navigation & Pagination" category="card" size="xs" />
          <button
            onClick={() => setActiveSheetTab('pipeline')}
            className={`flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs font-medium border-b-2 transition ${
              activeSheetTab === 'pipeline'
                ? 'border-emerald-500 bg-zinc-800 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Table className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sheet1: Autopilot Video Pipeline</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('analytics')}
            className={`flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs font-medium border-b-2 transition ${
              activeSheetTab === 'analytics'
                ? 'border-emerald-500 bg-zinc-800 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Table className="h-3.5 w-3.5 text-zinc-400" />
            <span>Sheet2: Channel Performance Log</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span>Auto-calculating virality index</span>
          <span>•</span>
          <span className="font-mono text-zinc-500">ROWS: {rows.length} / COLS: 10</span>
        </div>
      </div>

    </div>
  );
};
