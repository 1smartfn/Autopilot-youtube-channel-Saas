import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  Film,
  Zap,
  DollarSign,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Target,
  Plus,
  Play,
  Share2,
  RefreshCw,
  Award,
  BarChart3,
  Clock,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { YouTubeChannel, PipelineItem, BillingState, TrendItem } from '../types';
import { ActivityLog } from './ActivityLog';
import { ComponentTag } from './ComponentTag';
import { CustomizableCard } from './CustomizableCard';

interface DashboardProps {
  channels: YouTubeChannel[];
  activeChannel: YouTubeChannel;
  onSelectChannel: (channel: YouTubeChannel) => void;
  rows: PipelineItem[];
  billing: BillingState | null;
  onNavigateToStudio: () => void;
  onNavigateToSheets: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToWorkers?: () => void;
  onOpenVideo: (item: PipelineItem) => void;
  onOpenPrompt: (prompt: string, title: string) => void;
  onOpenChannelManager: (tab?: 'clone' | 'upload') => void;
}

type Timeframe = '7D' | '30D' | '90D' | '1Y';

export const Dashboard: React.FC<DashboardProps> = ({
  channels,
  activeChannel,
  onSelectChannel,
  rows,
  billing,
  onNavigateToStudio,
  onNavigateToSheets,
  onNavigateToCalendar,
  onNavigateToWorkers,
  onOpenVideo,
  onOpenPrompt,
  onOpenChannelManager
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');
  const [subscriberMetricMode, setSubscriberMetricMode] = useState<'cumulative' | 'daily' | 'views'>('cumulative');
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'channels' | 'videos' | 'activity' | 'all'>('overview');

  // Convert raw subscriber strings to integers for analytics
  const parseSubscribers = (subStr: string): number => {
    if (!subStr) return 0;
    const clean = subStr.trim().toUpperCase();
    if (clean.includes('M')) {
      return parseFloat(clean.replace('M', '')) * 1000000;
    }
    if (clean.includes('K')) {
      return parseFloat(clean.replace('K', '')) * 1000;
    }
    const num = parseInt(clean.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Color palette for channels in Recharts
  const CHANNEL_COLORS: Record<string, { stroke: string; fill: string; name: string }> = {
    chan_tech_future: { stroke: '#06b6d4', fill: '#0891b2', name: 'Future Pulse Tech' },
    chan_cosmos_deep: { stroke: '#a855f7', fill: '#7c3aed', name: 'Cosmos Horizon' },
    chan_stoic_mind: { stroke: '#f59e0b', fill: '#d97706', name: 'Stoic Modernist' }
  };

  const getChannelColor = (id: string, index: number) => {
    if (CHANNEL_COLORS[id]) return CHANNEL_COLORS[id];
    const fallbackPalette = [
      { stroke: '#ec4899', fill: '#db2777', name: 'Channel' },
      { stroke: '#10b981', fill: '#059669', name: 'Channel' },
      { stroke: '#3b82f6', fill: '#2563eb', name: 'Channel' },
      { stroke: '#f97316', fill: '#ea580c', name: 'Channel' }
    ];
    return fallbackPalette[index % fallbackPalette.length];
  };

  // 1. High-Level Aggregated KPI Metrics
  const kpiMetrics = useMemo(() => {
    const totalSubs = channels.reduce((acc, c) => acc + parseSubscribers(c.subscribers), 0);
    const uploadedVideosCount = rows.filter((r) => r.status === 'youtube_uploaded').length;
    const totalVideosPipeline = rows.length;

    // Derived baseline view count based on subscriber bases & uploaded videos
    const totalViewsEst = Math.round(totalSubs * 19.4) + (uploadedVideosCount * 142000);
    const totalWatchHoursEst = Math.round(totalViewsEst * 0.016);
    const avgRetention = 79.4; // % retention across high-retention Shorts
    const avgCtr = 11.8; // % click-through rate
    const estRevenue = Math.round((totalViewsEst / 1000) * 2.15); // $2.15 RPM

    return {
      totalSubs,
      uploadedVideosCount,
      totalVideosPipeline,
      totalViewsEst,
      totalWatchHoursEst,
      avgRetention,
      avgCtr,
      estRevenue,
      subGrowth7D: 8420,
      subGrowth30D: 29400,
      viewsGrowthPct: 24.6
    };
  }, [channels, rows]);

  // 2. Timeseries: Cumulative & Daily Subscriber Growth Data
  const subscriberGrowthData = useMemo(() => {
    const pointsCount = timeframe === '7D' ? 7 : timeframe === '30D' ? 15 : timeframe === '90D' ? 18 : 24;
    const data = [];
    const now = new Date();

    const baseSubsByChannel: Record<string, number> = {};
    channels.forEach((c) => {
      const current = parseSubscribers(c.subscribers);
      baseSubsByChannel[c.id] = Math.max(1000, Math.round(current * 0.82));
    });

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(now);
      const dayOffset = timeframe === '7D' ? i : timeframe === '30D' ? i * 2 : timeframe === '90D' ? i * 5 : i * 15;
      d.setDate(d.getDate() - dayOffset);

      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const progressRatio = (pointsCount - 1 - i) / (pointsCount - 1 || 1);

      const entry: Record<string, any> = {
        date: dateLabel,
        totalCumulative: 0,
        dailyNetGain: 0
      };

      let currentPointTotal = 0;
      let currentPointGain = 0;

      channels.forEach((c, idx) => {
        const fullCurrent = parseSubscribers(c.subscribers);
        const base = baseSubsByChannel[c.id] || 5000;
        const growthCurve = Math.pow(progressRatio, 1.25);
        const val = Math.round(base + (fullCurrent - base) * growthCurve);
        
        // Random daily net gain fluctuation
        const dailyGain = Math.round((fullCurrent * 0.008) * (0.8 + Math.sin(idx + i) * 0.4));

        entry[c.id] = val;
        entry[`${c.id}_gain`] = dailyGain;
        currentPointTotal += val;
        currentPointGain += dailyGain;
      });

      entry.totalCumulative = currentPointTotal;
      entry.dailyNetGain = currentPointGain;
      data.push(entry);
    }

    return data;
  }, [channels, timeframe]);

  // 3. Video Performance & Views Velocity Data
  const videoPerformanceData = useMemo(() => {
    const pointsCount = 10;
    const data = [];
    const now = new Date();

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 3);
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Daily views count
      const dailyViews = Math.round(180000 + Math.sin(i * 1.5) * 60000 + (10 - i) * 14000);
      // Daily automated Wan 2.1 video renders uploaded
      const publishedCount = Math.round(2 + Math.cos(i) * 1.5 + (i % 2 === 0 ? 1 : 0));
      // Average viral score
      const avgViralScore = Math.round(92 + (Math.sin(i) * 5));

      data.push({
        date: dateLabel,
        views: dailyViews,
        videosUploaded: publishedCount,
        viralScore: avgViralScore
      });
    }

    return data;
  }, []);

  // 4. Content Distribution by Niche
  const nicheDistributionData = useMemo(() => {
    const nicheMap: Record<string, { name: string; count: number; views: number }> = {};

    channels.forEach((c) => {
      if (!nicheMap[c.niche]) {
        nicheMap[c.niche] = { name: c.niche, count: 0, views: 0 };
      }
      nicheMap[c.niche].count += 1;
      nicheMap[c.niche].views += parseSubscribers(c.subscribers) * 22;
    });

    const palette = ['#06b6d4', '#a855f7', '#f59e0b', '#ec4899', '#10b981', '#3b82f6'];
    return Object.values(nicheMap).map((item, idx) => ({
      ...item,
      color: palette[idx % palette.length]
    }));
  }, [channels]);

  // 5. Channel Comparative Metrics Table Data
  const channelTableData = useMemo(() => {
    return channels.map((c, idx) => {
      const subsNum = parseSubscribers(c.subscribers);
      const channelRows = rows.filter((r) => r.channelId === c.id || idx === 0);
      const publishedCount = channelRows.filter((r) => r.status === 'youtube_uploaded').length || (idx + 1) * 6;
      const totalViews = Math.round(subsNum * 18.5) + publishedCount * 45000;
      const ctr = (10.5 + (idx % 3) * 1.2).toFixed(1);
      const retention = (76 + (idx % 4) * 2.5).toFixed(1);
      const growthRate = (12.4 + (idx % 3) * 4.2).toFixed(1);

      return {
        ...c,
        subsNum,
        publishedCount,
        totalViews,
        ctr,
        retention,
        growthRate,
        color: getChannelColor(c.id, idx).stroke
      };
    });
  }, [channels, rows]);

  // 6. Top Viral Videos Across All Managed Channels
  const topVideos = useMemo(() => {
    return rows
      .filter((r) => r.status === 'youtube_uploaded' || r.s3VideoUrl)
      .slice(0, 3)
      .map((item, i) => {
        const matchingChannel = channels.find((c) => c.id === item.channelId) || channels[0];
        return {
          ...item,
          channelName: matchingChannel?.name || 'TubePilot Channel',
          channelAvatar: matchingChannel?.avatar || '',
          views: 320000 + (3 - i) * 180000,
          likes: 24000 + (3 - i) * 12000,
          retentionPct: 84 - i * 3
        };
      });
  }, [rows, channels]);

  // Custom Recharts Tooltip for high-contrast legible analytics
  const CustomSubscriberTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-zinc-700 bg-zinc-950/95 p-3 text-xs shadow-2xl backdrop-blur-md min-w-[180px] space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-400 font-mono text-[10px]">
            <span>{label}</span>
            <span className="text-zinc-500">Subscribers</span>
          </div>
          <div className="space-y-1">
            {payload.map((entry: any, idx: number) => {
              const isTotal = entry.dataKey === 'totalCumulative';
              const channelObj = channels.find((c) => c.id === entry.dataKey);
              const labelName = isTotal ? 'Total Network' : channelObj?.name || entry.dataKey;

              return (
                <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.stroke }} />
                    <span className={`truncate ${isTotal ? 'font-bold text-white' : 'text-zinc-300'}`}>
                      {labelName}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${isTotal ? 'text-cyan-400' : 'text-zinc-200'}`}>
                    {formatNumber(Number(entry.value))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      
      {/* Top Header & Context Control Strip (Fixed height, non-vertical scroll on page) */}
      <div className="shrink-0 px-4 sm:px-6 pt-3 pb-2 border-b border-zinc-800/60 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
          
          {/* Top Row: Title & Right Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Title */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Multi-Channel Network Analytics
                  </h1>
                  <ComponentTag id="SEC-DASH-HEADER" name="Dashboard Header Controls" />
                </div>
                <p className="text-[11px] text-zinc-400 hidden md:block">
                  Audience growth, views velocity, and automated output across {channels.length} managed channels.
                </p>
              </div>
            </div>

            {/* Right: Timeframe + Actions */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-0.5 text-xs font-semibold">
                {(['7D', '30D', '90D', '1Y'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                      timeframe === tf
                        ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700/80'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <select
                value={selectedChannelFilter}
                onChange={(e) => setSelectedChannelFilter(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 focus:outline-none focus:border-emerald-500 max-w-[130px] truncate"
              >
                <option value="all">All Channels ({channels.length})</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onOpenChannelManager('clone')}
                className="hidden lg:flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300 transition"
              >
                <Target className="h-3 w-3" />
                <span>Clone Target</span>
              </button>
            </div>
          </div>

          {/* SEC-DASH-TABS: Width 100% across the full layout */}
          <div className="w-full flex items-center gap-2">
            <ComponentTag id="SEC-DASH-TABS" name="Dashboard Sub-Tabs Switcher" />
            <div className="w-full flex-1 flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 p-0.5 text-xs font-semibold overflow-x-auto no-scrollbar shadow-inner">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-3.5 w-3.5" /> },
              { id: 'channels', label: `Channels (${channels.length})`, icon: <Target className="h-3.5 w-3.5" /> },
              { id: 'videos', label: `Top Videos (${topVideos.length})`, icon: <Film className="h-3.5 w-3.5" /> },
              { id: 'activity', label: 'Activity Log', icon: <Clock className="h-3.5 w-3.5" /> },
              { id: 'all', label: 'All Views', icon: <Layers className="h-3.5 w-3.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDashboardTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                  dashboardTab === tab.id
                    ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700/80 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Tab Panels (Strict Zero-Scroll Viewport for All Devices) */}
      <div className={`flex-1 min-h-0 ${dashboardTab === 'all' ? 'overflow-y-auto no-scrollbar space-y-4' : 'overflow-hidden flex flex-col'} p-2 sm:p-2.5 w-full max-w-7xl mx-auto`}>
        
        {/* TAB 1: OVERVIEW & KEY PERFORMANCE METRICS (Non-Scrolling Viewport Cockpit) */}
        {(dashboardTab === 'overview' || dashboardTab === 'all') && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden gap-1.5 animate-in fade-in duration-200">
            {/* 6 Key Performance Metric Badges - Compact Single Strip with Fluid Relative Responsiveness */}
            <div className="shrink-0 flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 font-mono px-0.5">
              <ComponentTag id="STRIP-KPI-METRICS" name="Network Performance Metrics Strip" size="xs" />
              <span className="text-[8px] sm:text-[9px] text-zinc-500 hidden xs:inline">30-Day Aggregates across Channels</span>
            </div>
            <div className="shrink-0 grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5 min-h-[3.6rem] sm:h-13 overflow-hidden">
              
              {/* Subscribers */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 xs:p-1.5 sm:px-2 sm:py-1 flex flex-col justify-center overflow-hidden">
                <div className="flex items-center justify-between text-[7.5px] xs:text-[8.5px] sm:text-[9px] font-mono uppercase text-zinc-400 font-semibold tracking-tight">
                  <span className="truncate">Subscribers</span>
                  <ComponentTag id="CARD-KPI-SUBS" name="Total Subscribers" size="xs" className="hidden sm:inline-flex" />
                </div>
                <div className="flex items-baseline justify-between mt-0.5 gap-1 flex-wrap xs:flex-nowrap overflow-hidden">
                  <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-white font-mono leading-none tracking-tight truncate">
                    {formatNumber(kpiMetrics.totalSubs)}
                  </span>
                  <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] text-emerald-400 font-medium font-mono leading-none shrink-0">
                    +{formatNumber(kpiMetrics.subGrowth30D)}
                  </span>
                </div>
              </div>

              {/* Total Views */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 xs:p-1.5 sm:px-2 sm:py-1 flex flex-col justify-center overflow-hidden">
                <div className="flex items-center justify-between text-[7.5px] xs:text-[8.5px] sm:text-[9px] font-mono uppercase text-zinc-400 font-semibold tracking-tight">
                  <span className="truncate">Views</span>
                  <ComponentTag id="CARD-KPI-VIEWS" name="Total Views" size="xs" className="hidden sm:inline-flex" />
                </div>
                <div className="flex items-baseline justify-between mt-0.5 gap-1 flex-wrap xs:flex-nowrap overflow-hidden">
                  <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-white font-mono leading-none tracking-tight truncate">
                    {formatNumber(kpiMetrics.totalViewsEst)}
                  </span>
                  <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] text-emerald-400 font-medium font-mono leading-none shrink-0">
                    +{kpiMetrics.viewsGrowthPct}%
                  </span>
                </div>
              </div>

              {/* Wan 2.1 Videos */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 xs:p-1.5 sm:px-2 sm:py-1 flex flex-col justify-center overflow-hidden">
                <div className="flex items-center justify-between text-[7.5px] xs:text-[8.5px] sm:text-[9px] font-mono uppercase text-zinc-400 font-semibold tracking-tight">
                  <span className="truncate">Wan 2.1</span>
                  <ComponentTag id="CARD-KPI-OUTPUT" name="Automated Output" size="xs" className="hidden sm:inline-flex" />
                </div>
                <div className="flex items-baseline justify-between mt-0.5 gap-1 flex-wrap xs:flex-nowrap overflow-hidden">
                  <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-white font-mono leading-none tracking-tight truncate">
                    {kpiMetrics.uploadedVideosCount}
                  </span>
                  <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] text-zinc-400 font-mono leading-none shrink-0">
                    Autopilot
                  </span>
                </div>
              </div>

              {/* Avg Retention */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 xs:p-1.5 sm:px-2 sm:py-1 flex flex-col justify-center overflow-hidden">
                <div className="flex items-center justify-between text-[7.5px] xs:text-[8.5px] sm:text-[9px] font-mono uppercase text-zinc-400 font-semibold tracking-tight">
                  <span className="truncate">Retention</span>
                  <ComponentTag id="CARD-KPI-RETENTION" name="Audience Retention" size="xs" className="hidden sm:inline-flex" />
                </div>
                <div className="flex items-baseline justify-between mt-0.5 gap-1 flex-wrap xs:flex-nowrap overflow-hidden">
                  <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-white font-mono leading-none tracking-tight truncate">
                    {kpiMetrics.avgRetention}%
                  </span>
                  <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] text-purple-300 font-mono leading-none shrink-0">
                    Target
                  </span>
                </div>
              </div>

              {/* Avg CTR */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 xs:p-1.5 sm:px-2 sm:py-1 flex flex-col justify-center overflow-hidden">
                <div className="flex items-center justify-between text-[7.5px] xs:text-[8.5px] sm:text-[9px] font-mono uppercase text-zinc-400 font-semibold tracking-tight">
                  <span className="truncate">CTR</span>
                  <ComponentTag id="CARD-KPI-CTR" name="Click Through Rate" size="xs" className="hidden sm:inline-flex" />
                </div>
                <div className="flex items-baseline justify-between mt-0.5 gap-1 flex-wrap xs:flex-nowrap overflow-hidden">
                  <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-white font-mono leading-none tracking-tight truncate">
                    {kpiMetrics.avgCtr}%
                  </span>
                  <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] text-rose-300 font-mono leading-none shrink-0">
                    Neural
                  </span>
                </div>
              </div>

              {/* Est Revenue */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 xs:p-1.5 sm:px-2 sm:py-1 flex flex-col justify-center overflow-hidden">
                <div className="flex items-center justify-between text-[7.5px] xs:text-[8.5px] sm:text-[9px] font-mono uppercase text-zinc-400 font-semibold tracking-tight">
                  <span className="truncate">Est. Revenue</span>
                  <ComponentTag id="CARD-KPI-REVENUE" name="Estimated Revenue" size="xs" className="hidden sm:inline-flex" />
                </div>
                <div className="flex items-baseline justify-between mt-0.5 gap-1 flex-wrap xs:flex-nowrap overflow-hidden">
                  <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-white font-mono leading-none tracking-tight truncate">
                    ${kpiMetrics.estRevenue.toLocaleString()}
                  </span>
                  <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9px] text-zinc-400 font-mono leading-none shrink-0">
                    RPM $2.15
                  </span>
                </div>
              </div>

            </div>

            {/* Main Charts Section (Row 1: Draggable & Resizable Charts) */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 overflow-hidden">
              
              {/* Chart 1: Cumulative Subscriber Growth AreaChart */}
              <CustomizableCard
                id="CHART-TRAJECTORY"
                title="Audience Growth Trajectory"
                name="Audience Growth Trajectory Chart"
                viewId="dashboard"
                defaultWidth="half"
                noCardWrapper
                className="flex flex-col h-full overflow-hidden"
                headerRight={
                  <div className="flex rounded-md bg-zinc-950 border border-zinc-800 p-0.5 text-[10px] shrink-0">
                    <button
                      onClick={() => setSubscriberMetricMode('cumulative')}
                      className={`px-1.5 py-0.5 rounded transition ${
                        subscriberMetricMode === 'cumulative'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Cumulative
                    </button>
                    <button
                      onClick={() => setSubscriberMetricMode('daily')}
                      className={`px-1.5 py-0.5 rounded transition ${
                        subscriberMetricMode === 'daily'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Daily Net
                    </button>
                  </div>
                }
              >
                <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 sm:p-2.5 overflow-hidden">
                  <div className="flex-1 min-h-0 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {subscriberMetricMode === 'cumulative' ? (
                      <AreaChart data={subscriberGrowthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="totalCumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                          </linearGradient>
                          {channels.map((c, i) => {
                            const color = getChannelColor(c.id, i).stroke;
                            return (
                              <linearGradient key={c.id} id={`grad_${c.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                              </linearGradient>
                            );
                          })}
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#71717a" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={{ stroke: '#3f3f46' }} 
                        />
                        <YAxis 
                          stroke="#71717a" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(v) => formatNumber(v)} 
                        />
                        <Tooltip content={<CustomSubscriberTooltip />} />
                        <Legend 
                          wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} 
                          formatter={(val) => {
                            if (val === 'totalCumulative') return 'Total Network';
                            const found = channels.find((c) => c.id === val);
                            return found?.name || val;
                          }}
                        />

                        {selectedChannelFilter === 'all' ? (
                          <>
                            <Area
                              type="monotone"
                              dataKey="totalCumulative"
                              stroke="#06b6d4"
                              strokeWidth={2}
                              fill="url(#totalCumulativeGrad)"
                            />
                            {channels.map((c, i) => (
                              <Line
                                key={c.id}
                                type="monotone"
                                dataKey={c.id}
                                stroke={getChannelColor(c.id, i).stroke}
                                strokeWidth={1.5}
                                strokeDasharray="4 4"
                                dot={false}
                              />
                            ))}
                          </>
                        ) : (
                          <Area
                            type="monotone"
                            dataKey={selectedChannelFilter}
                            stroke="#06b6d4"
                            strokeWidth={2}
                            fill="url(#totalCumulativeGrad)"
                          />
                        )}
                      </AreaChart>
                    ) : (
                      <BarChart data={subscriberGrowthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={(v) => `+${v}`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#09090b',
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            fontSize: '11px'
                          }}
                          formatter={(val: any) => [`+${val} subscribers`, 'Daily Net']}
                        />
                        <Bar dataKey="dailyNetGain" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </CustomizableCard>

            {/* Chart 2: Video Velocity & Daily Views ComposedChart */}
            <CustomizableCard
              id="CHART-UPLOADS"
              title="Views Velocity & Uploads"
              name="Wan 2.1 Video Uploads vs Views Chart"
              viewId="dashboard"
              defaultWidth="half"
              noCardWrapper
              className="flex flex-col h-full overflow-hidden"
            >
              <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 sm:p-2.5 overflow-hidden">
                <div className="shrink-0 flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">Views Velocity & Uploads</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    Wan 2.1 Sync
                  </span>
                </div>

                <div className="flex-1 min-h-0 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={videoPerformanceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis 
                        yAxisId="left" 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false} 
                        tickFormatter={(v) => formatNumber(v)} 
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#a855f7" 
                        fontSize={10} 
                        tickLine={false} 
                        domain={[0, 6]}
                        tickFormatter={(v) => `${v}v`} 
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#09090b',
                          border: '1px solid #27272a',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                        formatter={(val: any, name: any) => {
                          if (name === 'views') return [formatNumber(Number(val)), 'Daily Views'];
                          if (name === 'videosUploaded') return [`${val} videos`, 'Wan 2.1 Uploads'];
                          return [val, name];
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                      <Bar yAxisId="right" dataKey="videosUploaded" name="Wan 2.1 Uploads" fill="#a855f7" radius={[3, 3, 0, 0]} barSize={14} />
                      <Line yAxisId="left" type="monotone" dataKey="views" name="Daily Views" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CustomizableCard>

            </div>

            {/* Quick Jump Ribbon for Overview */}
            <div className="shrink-0 h-7 flex items-center justify-between px-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-[11px] overflow-hidden">
              <div className="flex items-center gap-1.5 text-zinc-400 truncate">
                <ComponentTag id="RIBBON-DASH-ACTIONS" name="Workspace Quick Actions Ribbon" />
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Workspace Quick Actions:</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setDashboardTab('channels')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition font-medium text-[10px]"
                >
                  <span>Channels ({channels.length})</span>
                  <ArrowRight className="h-2.5 w-2.5 text-zinc-400" />
                </button>
                <button
                  onClick={() => setDashboardTab('videos')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition font-medium text-[10px]"
                >
                  <span>Leaderboard ({topVideos.length})</span>
                  <ArrowRight className="h-2.5 w-2.5 text-zinc-400" />
                </button>
                <button
                  onClick={onNavigateToStudio}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition font-medium text-[10px]"
                >
                  <span>Studio</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={onNavigateToSheets}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition font-medium text-[10px]"
                >
                  <span>Sheets</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          </div>
        )}

  {/* TAB 2: MANAGED CHANNELS & NICHE BREAKDOWN */}
  {(dashboardTab === 'channels' || dashboardTab === 'all') && (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4 animate-in fade-in duration-200">
      {/* Row 2: Content Breakdown by Niche & Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Niche Share Donut Chart (4 cols) */}
        <CustomizableCard
          id="CHART-NICHE-DONUT"
          title="Audience by Niche"
          name="Niche Share Donut Chart"
          viewId="dashboard"
          defaultWidth="third"
          noCardWrapper
        >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-400" />
                <span>Audience by Niche</span>
              </h2>
              <p className="text-[11px] text-zinc-400">Distribution across content verticals</p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {nicheDistributionData.length} Verticals
            </span>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nicheDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="views"
                >
                  {nicheDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${formatNumber(Number(val))} views (${item.payload.count} channels)`,
                    item.payload.name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Aggregate Pill */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-zinc-500 font-medium">Total</span>
              <span className="text-sm font-bold text-white font-mono">
                {formatNumber(kpiMetrics.totalSubs)}
              </span>
            </div>
          </div>

          {/* Custom Legend Chips */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {nicheDistributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 rounded-lg bg-zinc-950 p-2 border border-zinc-800/80">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <div className="truncate">
                  <span className="text-[11px] font-medium text-white truncate block">{item.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{formatNumber(item.views)} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </CustomizableCard>

        {/* Channel Comparative Table & Deep-Dive (8 cols) */}
        <CustomizableCard
          id="TABLE-CHANNELS-PERF"
          title="Managed Channels Directory"
          name="Managed Channels Performance Table"
          viewId="dashboard"
          defaultWidth="two-thirds"
          noCardWrapper
        >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-400" />
                <span>Managed YouTube Channels Performance</span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Real-time subscriber counts, upload cadences, and competitor clone attachments
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenChannelManager('clone')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                <span>Clone Target Engine</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Interactive Channels Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Channel / Handle</th>
                  <th className="py-2.5 px-3">Subscribers</th>
                  <th className="py-2.5 px-3">Growth (30D)</th>
                  <th className="py-2.5 px-3">Wan 2.1 Videos</th>
                  <th className="py-2.5 px-3">Retention / CTR</th>
                  <th className="py-2.5 px-3">Target Model</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 bg-zinc-900/40 font-mono text-[11px]">
                {channelTableData.map((chan) => {
                  const isCurrentActive = activeChannel.id === chan.id;

                  return (
                    <tr 
                      key={chan.id} 
                      className={`hover:bg-zinc-800/40 transition cursor-pointer ${
                        isCurrentActive ? 'bg-zinc-800/30' : ''
                      }`}
                      onClick={() => onSelectChannel(chan)}
                    >
                      {/* Channel Info */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={chan.avatar}
                            alt={chan.name}
                            className="h-7 w-7 rounded-lg object-cover border border-zinc-700"
                          />
                          <div>
                            <span className="font-bold text-white font-sans block truncate max-w-[150px]">
                              {chan.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 block truncate">
                              {chan.handle} • <strong className="text-zinc-300 font-normal">{chan.niche}</strong>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subscribers */}
                      <td className="py-2.5 px-3 font-bold text-white">
                        {chan.subscribers}
                      </td>

                      {/* Growth % */}
                      <td className="py-2.5 px-3 text-emerald-400">
                        +{chan.growthRate}%
                      </td>

                      {/* Uploads Count */}
                      <td className="py-2.5 px-3 text-zinc-200">
                        {chan.publishedCount} uploads
                      </td>

                      {/* Retention & CTR */}
                      <td className="py-2.5 px-3 text-zinc-300">
                        <span>{chan.retention}% ret</span> • <span className="text-rose-400">{chan.ctr}% CTR</span>
                      </td>

                      {/* Target Competitor Cloned */}
                      <td className="py-2.5 px-3">
                        {chan.targetChannelUrl ? (
                          <span className="text-[11px] font-medium text-amber-300 truncate block max-w-[120px]" title={chan.targetChannelUrl}>
                            ⚡ {chan.targetAnalysis?.channelName?.split(' ')[0] || `@${chan.targetChannelUrl.split('@')[1] || 'Competitor'}`}
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-normal">None linked</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectChannel(chan);
                            onNavigateToStudio();
                          }}
                          className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 transition"
                        >
                          Studio
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </CustomizableCard>

      </div>
    </div>
  )}

  {/* TAB 3: VIRAL LEADERBOARD */}
  {(dashboardTab === 'videos' || dashboardTab === 'all') && (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4 animate-in fade-in duration-200">
      <CustomizableCard
        id="LIST-TOP-VIDEOS"
        title="Network Viral Leaderboard"
        name="Top Performing Wan 2.1 Videos"
        viewId="dashboard"
        defaultWidth="full"
        noCardWrapper
      >
      {/* Row 3: Top Performing Videos Across All Channels */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Network Viral Leaderboard (Top Wan 2.1 Videos)</span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Highest-converting automated videos across all managed channels
            </p>
          </div>

          <button
            onClick={onNavigateToSheets}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>View All in Google Sheets</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>

        {/* Top Video Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topVideos.map((video, idx) => (
            <div
              key={video.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-3 hover:border-zinc-700 transition group"
            >
              {/* Thumbnail with overlay badges */}
              <div 
                onClick={() => onOpenVideo(video)}
                className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer shadow-md group-hover:scale-[1.02] transition-transform"
              >
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.topic}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                    <Film className="h-8 w-8" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="h-4 w-4 fill-white ml-0.5" />
                  </div>
                </div>

                <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[9px] font-mono font-bold text-amber-400 border border-amber-500/30">
                  TOP #{idx + 1} VIRAL
                </div>

                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[9px] font-mono text-zinc-300">
                  0:15 Shorts
                </div>
              </div>

              {/* Video Title & Metadata */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
                  <img
                    src={video.channelAvatar}
                    alt={video.channelName}
                    className="h-3.5 w-3.5 rounded-full object-cover"
                  />
                  <span>{video.channelName}</span>
                </span>
                <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition">
                  {video.topic}
                </h3>
                <p className="text-[11px] text-zinc-400 italic line-clamp-1">
                  "{video.hook}"
                </p>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-400">
                <div>
                  <span className="block text-zinc-500 text-[9px]">VIEWS</span>
                  <span className="font-bold text-white">{formatNumber(video.views)}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 text-[9px]">LIKES</span>
                  <span className="font-bold text-emerald-400">{formatNumber(video.likes)}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 text-[9px]">RETENTION</span>
                  <span className="font-bold text-purple-400">{video.retentionPct}%</span>
                </div>
              </div>

              {/* Inspect Wan 2.1 Prompt button */}
              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={() => onOpenPrompt(video.veoPrompt || video.videoPrompt || '', video.topic)}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Inspect Wan 2.1 Prompt</span>
                </button>
                <button
                  onClick={() => onOpenVideo(video)}
                  className="text-[10px] text-zinc-300 hover:text-white font-semibold flex items-center gap-1"
                >
                  <span>Play</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </CustomizableCard>
    </div>
  )}

  {/* TAB 4: SYSTEM ACTIVITY STREAM */}
  {(dashboardTab === 'activity' || dashboardTab === 'all') && (
    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4 animate-in fade-in duration-200">
      <CustomizableCard
        id="PANEL-ACTIVITY-LOG"
        title="Live Cluster Activity Stream"
        name="System Activity & Audit Event Log"
        viewId="dashboard"
        defaultWidth="full"
        noCardWrapper
      >
        {/* Row 4: Live System Activity & Cluster Event Log */}
        <ActivityLog
          channels={channels}
          activeChannel={activeChannel}
          onOpenVideo={onOpenVideo}
          onOpenPrompt={onOpenPrompt}
          onNavigateToWorkers={onNavigateToWorkers}
        />
      </CustomizableCard>
    </div>
  )}

      </div>
    </div>
  );
};
