import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Youtube,
  Film,
  Cpu,
  RefreshCw,
  HardDrive,
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  Sparkles,
  Zap,
  Info,
  Layers,
  Flame
} from 'lucide-react';
import { ActivityLogEvent, ActivityEventType, PipelineItem, YouTubeChannel } from '../types';

interface ActivityLogProps {
  channels: YouTubeChannel[];
  activeChannel: YouTubeChannel;
  onOpenVideo?: (item: PipelineItem) => void;
  onOpenPrompt?: (prompt: string, title: string) => void;
  onNavigateToWorkers?: () => void;
}

const DEFAULT_EVENTS: ActivityLogEvent[] = [
  {
    id: 'evt-101',
    type: 'channel_upload',
    title: 'YouTube Short Uploaded & Published',
    description: 'Autonomous dispatch to @futurepulsetech: "Bioengineered Trees Glowing In Cities #Shorts" published with 12 SEO tags.',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    channelId: 'chan_tech_future',
    channelName: 'Future Pulse Tech',
    channelAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    videoId: 'row-101',
    videoTopic: 'Bioengineered Trees That Glow Bright Enough to Replace Streetlights',
    severity: 'success',
    metadata: {
      youtubeUrl: 'https://youtube.com/shorts/dQw4w9WgXcQ',
      youtubeId: 'dQw4w9WgXcQ',
      viralScore: 94,
      viewsVelocity: '+1,420 views/hr'
    }
  },
  {
    id: 'evt-102',
    type: 'render_complete',
    title: 'Wan 2.1 1080p Video Render Completed',
    description: 'Worker node worker-us-east-1 rendered 15s HD video for "Autonomous Drone Swarms Repairing Power Grids" in 38.4s.',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    channelId: 'chan_tech_future',
    channelName: 'Future Pulse Tech',
    workerId: 'worker-us-east-1',
    videoId: 'row-105',
    videoTopic: 'Autonomous Drone Swarms Repairing High-Voltage Power Lines',
    severity: 'success',
    metadata: {
      renderTimeSec: 38.4,
      workerNode: 'worker-us-east-1 (4x NVIDIA H100)',
      durationSec: 15,
      s3Url: 'https://s3.us-east-1.amazonaws.com/tubepilot-vault/usr_premium_01/master_1080p/drone_swarms_power.mp4'
    }
  },
  {
    id: 'evt-103',
    type: 'worker_recovery',
    title: 'Auto-Failover Task Migrated & Recovered',
    description: 'Task migrated to worker-us-west-2 (8x NVIDIA L40S Farm). Diffusion pipeline resumed at frame 142/360 with 0 latency penalty.',
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    workerId: 'worker-us-west-2',
    severity: 'info',
    metadata: {
      failoverNode: 'worker-us-west-2',
      retryCount: 1
    }
  },
  {
    id: 'evt-104',
    type: 'worker_failure',
    title: 'Worker GPU Node VRAM Surge / OOM Warning',
    description: 'worker-eu-central-1 reported CUDA out-of-memory during high-concurrency diffusion pass (allocation spike to 23.8GB / 24GB).',
    timestamp: new Date(Date.now() - 1000 * 60 * 67).toISOString(),
    workerId: 'worker-eu-central-1',
    severity: 'error',
    metadata: {
      errorReason: 'CUDA_OUT_OF_MEMORY: PyTorch allocated 24320MB exceeds RTX 4090 capacity',
      workerNode: 'worker-eu-central-1 (Frankfurt)',
      retryCount: 1
    }
  },
  {
    id: 'evt-105',
    type: 's3_archived',
    title: 'Master 1080p MP4 Encrypted to AWS S3',
    description: 'Object key "usr_premium_01/master_1080p/trees_glow.mp4" (48.9MB) saved with AES-256 KMS server-side encryption.',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    severity: 'info',
    metadata: {
      s3Url: 'https://s3.us-east-1.amazonaws.com/tubepilot-vault/usr_premium_01/master_1080p/trees_glow.mp4'
    }
  },
  {
    id: 'evt-106',
    type: 'trend_discovered',
    title: 'Viral Surge Discovered by Radar',
    description: 'Algorithm detected 98% virality momentum for "The Next-Gen Solid State Battery That Charges in 3 Minutes".',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    channelId: 'chan_tech_future',
    channelName: 'Future Pulse Tech',
    severity: 'info',
    metadata: {
      viralScore: 98,
      viewsVelocity: '124K searches/hr'
    }
  }
];

export const ActivityLog: React.FC<ActivityLogProps> = ({
  channels,
  activeChannel,
  onOpenVideo,
  onOpenPrompt,
  onNavigateToWorkers
}) => {
  const [events, setEvents] = useState<ActivityLogEvent[]>(DEFAULT_EVENTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [isSimulatingFailure, setIsSimulatingFailure] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch events from API with silent fallback
  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/activity/events');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.warn('Activity events update notice, retaining cached stream:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simulate a live worker failure and automatic failover recovery
  const handleSimulateWorkerFailure = async () => {
    setIsSimulatingFailure(true);
    try {
      const res = await fetch('/api/activity/simulate-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node: 'worker-eu-central-1',
          reason: 'CUDA Out Of Memory (24320MB/24576MB) during 1080p Wan 2.1 upscaling'
        })
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage('⚠️ Worker Failure & Auto-Recovery events injected into live stream');
        setTimeout(() => setToastMessage(null), 4000);
        await fetchEvents();
      }
    } catch (err) {
      console.warn('Simulate failure notice:', err);
    } finally {
      setIsSimulatingFailure(false);
    }
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Type filter
      if (selectedType !== 'all') {
        if (selectedType === 'failures') {
          if (evt.type !== 'worker_failure' && evt.severity !== 'error') return false;
        } else if (selectedType === 'renders') {
          if (evt.type !== 'render_complete') return false;
        } else if (selectedType === 'uploads') {
          if (evt.type !== 'channel_upload') return false;
        } else if (selectedType === 'recoveries') {
          if (evt.type !== 'worker_recovery') return false;
        } else if (evt.type !== selectedType) {
          return false;
        }
      }

      // Channel filter
      if (selectedChannelId !== 'all') {
        if (evt.channelId && evt.channelId !== selectedChannelId) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(query);
        const matchDesc = evt.description.toLowerCase().includes(query);
        const matchWorker = evt.workerId?.toLowerCase().includes(query);
        const matchTopic = evt.videoTopic?.toLowerCase().includes(query);
        const matchError = evt.metadata?.errorReason?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchWorker && !matchTopic && !matchError) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedType, selectedChannelId, searchQuery]);

  // Compute summary stats
  const stats = useMemo(() => {
    const totalRenders = events.filter((e) => e.type === 'render_complete').length;
    const totalUploads = events.filter((e) => e.type === 'channel_upload').length;
    const totalFailures = events.filter((e) => e.type === 'worker_failure').length;
    const totalRecoveries = events.filter((e) => e.type === 'worker_recovery').length;

    return {
      total: events.length,
      renders: totalRenders,
      uploads: totalUploads,
      failures: totalFailures,
      recoveries: totalRecoveries,
      recoveryRate: totalFailures > 0 ? Math.round((totalRecoveries / totalFailures) * 100) : 100
    };
  }, [events]);

  const formatTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getEventBadge = (type: ActivityEventType, severity: string) => {
    switch (type) {
      case 'render_complete':
        return {
          icon: <Film className="h-4 w-4 text-emerald-400" />,
          label: 'Render Completed',
          bgColor: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
        };
      case 'channel_upload':
        return {
          icon: <Youtube className="h-4 w-4 text-red-400" />,
          label: 'YouTube Upload',
          bgColor: 'bg-red-950/40 border-red-500/30 text-red-300'
        };
      case 'worker_failure':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-rose-400" />,
          label: 'Worker Failure',
          bgColor: 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        };
      case 'worker_recovery':
        return {
          icon: <ShieldCheck className="h-4 w-4 text-cyan-400" />,
          label: 'Auto-Recovery',
          bgColor: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
        };
      case 's3_archived':
        return {
          icon: <HardDrive className="h-4 w-4 text-purple-400" />,
          label: 'S3 Encrypted',
          bgColor: 'bg-purple-950/40 border-purple-500/30 text-purple-300'
        };
      case 'trend_discovered':
        return {
          icon: <Flame className="h-4 w-4 text-amber-400" />,
          label: 'Viral Trend',
          bgColor: 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        };
      default:
        return {
          icon: <Activity className="h-4 w-4 text-zinc-400" />,
          label: 'System Event',
          bgColor: 'bg-zinc-900 border-zinc-700 text-zinc-300'
        };
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl space-y-5">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/80 via-zinc-900 to-zinc-900 p-3 shadow-lg flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-rose-300 font-medium">
            <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded bg-zinc-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Live Stream Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white tracking-tight">
                System Activity & Cluster Events
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live stream</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Audit trail of Wan 2.1 video rendering, automated YouTube uploads, and worker node health.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Test Worker Failure Button */}
          <button
            onClick={handleSimulateWorkerFailure}
            disabled={isSimulatingFailure}
            title="Simulate a live GPU VRAM surge and automated watchdog failover"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-rose-300 transition disabled:opacity-50"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>Simulate Worker Failure</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 p-2 text-zinc-300 transition"
            title="Refresh Events"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Summary Telemetry Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3 space-y-1">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Render Completions</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-white font-mono">{stats.renders}</span>
            <Film className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-[11px] text-zinc-400 font-sans">100% Free Wan 2.1</span>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3 space-y-1">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Channel Uploads</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-white font-mono">{stats.uploads}</span>
            <Youtube className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-[11px] text-zinc-400 font-sans">YouTube Data API</span>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3 space-y-1">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Worker Failures</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-white font-mono">{stats.failures}</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <span className="text-[11px] text-zinc-400 font-sans">Watched & Handled</span>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3 space-y-1">
          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Failover Recovery</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-white font-mono">{stats.recoveryRate}%</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="text-[11px] text-zinc-400 font-sans">Zero Queue Drops</span>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-zinc-950 border border-zinc-800/80 p-1 text-xs">
          {[
            { id: 'all', label: `All (${events.length})` },
            { id: 'renders', label: `Renders (${stats.renders})` },
            { id: 'uploads', label: `Uploads (${stats.uploads})` },
            { id: 'failures', label: `Failures (${stats.failures})` },
            { id: 'recoveries', label: `Failovers (${stats.recoveries})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                selectedType === tab.id
                  ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Channel Filter */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
            />
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          </div>

          {/* Channel Filter */}
          <select
            value={selectedChannelId}
            onChange={(e) => setSelectedChannelId(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Channels</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center space-y-2">
            <Info className="h-7 w-7 text-zinc-500 mx-auto" />
            <h4 className="text-xs font-bold text-white">No System Events Match Filters</h4>
            <p className="text-[11px] text-zinc-400">
              Clear search or type filters to view historical cluster logs.
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const badge = getEventBadge(evt.type, evt.severity);
            const isExpanded = expandedEventId === evt.id;

            return (
              <div
                key={evt.id}
                className={`rounded-xl border transition-all ${
                  evt.severity === 'error'
                    ? 'border-rose-500/40 bg-rose-950/10 hover:border-rose-500/70'
                    : evt.type === 'render_complete'
                    ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/60'
                    : evt.type === 'channel_upload'
                    ? 'border-red-500/30 bg-red-950/10 hover:border-red-500/60'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                {/* Event Summary Bar */}
                <div 
                  onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    {/* Badge Icon */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm ${badge.bgColor}`}>
                      {badge.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-tight">
                          {evt.title}
                        </span>
                        <span className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold border ${badge.bgColor}`}>
                          {badge.label}
                        </span>
                        {evt.workerId && (
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 px-1.5 py-0.2 rounded border border-cyan-500/30">
                            {evt.workerId}
                          </span>
                        )}
                        {evt.channelName && (
                          <span className="text-[10px] text-zinc-400 font-sans flex items-center gap-1">
                            <span>•</span>
                            <span>{evt.channelName}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp & Expand indicator */}
                  <div className="flex items-center gap-3 ml-auto sm:ml-0 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(evt.timestamp)}</span>
                    </span>

                    <button 
                      className="text-zinc-500 hover:text-zinc-300 p-1"
                      title={isExpanded ? 'Collapse' : 'Expand metadata'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Metadata Drawer */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-800/80 space-y-3 font-mono text-[11px] text-zinc-300 bg-zinc-950/60 rounded-b-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {/* Left Column: Technical Metadata */}
                      <div className="space-y-1.5 rounded-lg bg-zinc-900/80 p-2.5 border border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Technical Telemetry
                        </span>
                        <div className="space-y-1 text-zinc-300">
                          <div>Event ID: <strong className="text-white">{evt.id}</strong></div>
                          <div>Timestamp: <span className="text-zinc-400">{evt.timestamp}</span></div>
                          {evt.workerId && (
                            <div>Cluster Node: <span className="text-cyan-400">{evt.workerId}</span></div>
                          )}
                          {evt.metadata?.renderTimeSec && (
                            <div>Render Elapsed: <span className="text-emerald-400">{evt.metadata.renderTimeSec}s</span> (1080p Wan 2.1)</div>
                          )}
                          {evt.metadata?.viewsVelocity && (
                            <div>Velocity Rate: <span className="text-amber-400">{evt.metadata.viewsVelocity}</span></div>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Error or Output Details */}
                      <div className="space-y-1.5 rounded-lg bg-zinc-900/80 p-2.5 border border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Pipeline Attribution
                        </span>
                        
                        {evt.metadata?.errorReason ? (
                          <div className="space-y-1">
                            <span className="text-rose-400 font-bold block">Exception Stack:</span>
                            <p className="text-rose-200/90 text-[10px] bg-rose-950/40 p-2 rounded border border-rose-500/30">
                              {evt.metadata.errorReason}
                            </p>
                          </div>
                        ) : evt.metadata?.youtubeUrl ? (
                          <div className="space-y-1">
                            <div>YouTube ID: <span className="text-white">{evt.metadata.youtubeId}</span></div>
                            <div className="flex items-center gap-2 pt-1">
                              <a
                                href={evt.metadata.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-semibold"
                              >
                                <Youtube className="h-3.5 w-3.5" />
                                <span>Watch on YouTube</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          </div>
                        ) : evt.metadata?.s3Url ? (
                          <div className="space-y-1">
                            <div>S3 Vault: <span className="text-purple-400 truncate block">AES-256 KMS Encrypted</span></div>
                            <div className="text-[10px] text-zinc-400 truncate">master_1080p/trees_glow.mp4</div>
                          </div>
                        ) : (
                          <div className="text-zinc-400">
                            <div>Channel: {evt.channelName || 'Network Multi-Channel'}</div>
                            <div>Severity: <strong className="uppercase text-white">{evt.severity}</strong></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {onNavigateToWorkers && (
                        <button
                          onClick={onNavigateToWorkers}
                          className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-200 transition"
                        >
                          <Cpu className="h-3 w-3 text-cyan-400" />
                          <span>Inspect Worker Node</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
