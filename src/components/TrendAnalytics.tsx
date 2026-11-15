import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  ArrowUpRight, 
  Flame, 
  Sparkles, 
  Filter, 
  Activity, 
  RefreshCw,
  Search,
  Eye,
  Sliders,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { TrendItem } from '../types';

export interface KeywordTrend {
  keyword: string;
  category: string;
  searchVolume: string;
  growthPercent: number; // e.g. +340%
  competition: 'Low' | 'Medium' | 'High';
  viralityIndex: number; // 0 - 100
  color: string;
  history: number[]; // 7 data points (Mon - Sun or last 7 days)
  relatedAngles: string[];
}

interface TrendAnalyticsProps {
  niche: string;
  onSelectTopicForGeneration: (topic: string, hook: string) => void;
}

export const TrendAnalytics: React.FC<TrendAnalyticsProps> = ({
  niche,
  onSelectTopicForGeneration
}) => {
  // Preset keyword data tailored by channel niche
  const nicheKeywordData: Record<string, KeywordTrend[]> = {
    'AI & Robotics': [
      {
        keyword: 'Humanoid Robot Warehouse',
        category: 'Robotics',
        searchVolume: '840K/mo',
        growthPercent: 412,
        competition: 'Medium',
        viralityIndex: 98,
        color: '#ef4444', // Red-500
        history: [28, 35, 45, 52, 68, 85, 98],
        relatedAngles: ['14-hour night shift test', 'Battery swap latency', 'Autonomous vision neural nets']
      },
      {
        keyword: 'Photonic Optical Chips',
        category: 'Hardware',
        searchVolume: '520K/mo',
        growthPercent: 285,
        competition: 'Low',
        viralityIndex: 94,
        color: '#f59e0b', // Amber-500
        history: [15, 22, 38, 41, 55, 74, 94],
        relatedAngles: ['Room temperature operation', 'Zero electrical heat', 'End of Moore\'s law']
      },
      {
        keyword: 'Liquid Neural Networks',
        category: 'Deep Learning',
        searchVolume: '410K/mo',
        growthPercent: 340,
        competition: 'Low',
        viralityIndex: 92,
        color: '#10b981', // Emerald-500
        history: [12, 19, 29, 44, 60, 78, 92],
        relatedAngles: ['Adaptive drone navigation', '100x fewer parameters', 'Continuous-time AI']
      },
      {
        keyword: 'Open Source Robot Brain',
        category: 'Software',
        searchVolume: '690K/mo',
        growthPercent: 195,
        competition: 'High',
        viralityIndex: 88,
        color: '#06b6d4', // Cyan-500
        history: [30, 42, 50, 58, 65, 76, 88],
        relatedAngles: ['Runs on RTX 3060', 'Simulation to real world', 'Household chore mastery']
      }
    ],
    'Space & Astronomy': [
      {
        keyword: 'JWST Impossible Planet',
        category: 'Exoplanets',
        searchVolume: '960K/mo',
        growthPercent: 380,
        competition: 'Medium',
        viralityIndex: 97,
        color: '#ef4444',
        history: [32, 40, 48, 62, 75, 88, 97],
        relatedAngles: ['Defies accretion model', 'Violet plasma storms', 'M-dwarf stellar flare mystery']
      },
      {
        keyword: 'Trappist-1e Radio Pulse',
        category: 'Astrobiology',
        searchVolume: '720K/mo',
        growthPercent: 490,
        competition: 'Low',
        viralityIndex: 96,
        color: '#8b5cf6', // Violet-500
        history: [10, 18, 30, 45, 68, 84, 96],
        relatedAngles: ['11-second repeating signal', 'Atmospheric water vapor', 'Interstellar beacon hypothesis']
      },
      {
        keyword: 'Super-Earth Gliese 12b',
        category: 'Habitable Worlds',
        searchVolume: '510K/mo',
        growthPercent: 240,
        competition: 'Low',
        viralityIndex: 91,
        color: '#10b981',
        history: [25, 34, 42, 53, 67, 80, 91],
        relatedAngles: ['Temperate surface climate', '40 light years away', 'Direct transit spectroscopy']
      },
      {
        keyword: 'Nuclear Thermal Rocket',
        category: 'Propulsion',
        searchVolume: '430K/mo',
        growthPercent: 180,
        competition: 'Medium',
        viralityIndex: 86,
        color: '#06b6d4',
        history: [35, 41, 49, 56, 68, 75, 86],
        relatedAngles: ['45-day transit to Mars', 'DRACO reactor test', 'High specific impulse']
      }
    ],
    'Philosophy & Stoicism': [
      {
        keyword: 'Marcus Aurelius Strategy',
        category: 'Stoic Wisdom',
        searchVolume: '620K/mo',
        growthPercent: 310,
        competition: 'Medium',
        viralityIndex: 95,
        color: '#f59e0b',
        history: [20, 31, 42, 58, 70, 84, 95],
        relatedAngles: ['Wall Street fund managers reading Meditations', 'Controlling the uncontrollable', 'Morning mental armor']
      },
      {
        keyword: 'Amor Fati Mindset',
        category: 'Mental Models',
        searchVolume: '480K/mo',
        growthPercent: 270,
        competition: 'Low',
        viralityIndex: 93,
        color: '#ef4444',
        history: [18, 26, 38, 52, 69, 81, 93],
        relatedAngles: ['Loving your fate', 'Turning setbacks into fuel', 'Nietzsche vs Stoics']
      },
      {
        keyword: 'Memento Mori Discipline',
        category: 'Productivity',
        searchVolume: '590K/mo',
        growthPercent: 190,
        competition: 'High',
        viralityIndex: 89,
        color: '#8b5cf6',
        history: [30, 38, 49, 59, 71, 79, 89],
        relatedAngles: ['Daily reminder of mortality', 'Eliminating social anxiety', 'Prioritizing what matters']
      }
    ]
  };

  const keywords = nicheKeywordData[niche] || nicheKeywordData['AI & Robotics'];

  const [selectedKeyword, setSelectedKeyword] = useState<KeywordTrend>(keywords[0]);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  // Days labels for the X-axis
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  // SVG Chart Geometry Constants
  const chartWidth = 640;
  const chartHeight = 220;
  const paddingX = 45;
  const paddingY = 25;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Convert array of values (0-100) to SVG Polyline coordinates
  const getCoordinates = (data: number[]) => {
    return data.map((val, idx) => {
      const x = paddingX + (idx / (data.length - 1)) * innerWidth;
      const y = chartHeight - paddingY - (val / 100) * innerHeight;
      return { x, y, val };
    });
  };

  const activePoints = getCoordinates(selectedKeyword.history);

  // Generate SVG path command with smooth cubic beziers
  const generateSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const controlX1 = curr.x + (next.x - curr.x) / 2;
      const controlY1 = curr.y;
      const controlX2 = curr.x + (next.x - curr.x) / 2;
      const controlY2 = next.y;
      path += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  // Area under curve fill path
  const generateAreaPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    const linePath = generateSmoothPath(points);
    const last = points[points.length - 1];
    const first = points[0];
    const bottomY = chartHeight - paddingY;
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  };

  const mainPath = generateSmoothPath(activePoints);
  const areaPath = generateAreaPath(activePoints);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-5 backdrop-blur-md">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/20 to-red-500/20 text-amber-400 border border-amber-500/30">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Viral Topic Intelligence & Velocity Analytics
              </h3>
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                Niche: {niche}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Live trend trajectory, search volume velocity, and algorithm breakout projections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-[11px]">
            <button
              onClick={() => setTimeRange('7d')}
              className={`rounded px-2.5 py-0.5 font-semibold transition ${
                timeRange === '7d' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              7-Day Surge
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`rounded px-2.5 py-0.5 font-semibold transition ${
                timeRange === '30d' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              30-Day Trend
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Keyword Pills + Interactive Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Viral Keyword Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Trending Keywords in {niche}
            </span>
            <span className="text-[10px]">Click to map trajectory</span>
          </div>

          <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
            {keywords.map((kw) => {
              const isSelected = selectedKeyword.keyword === kw.keyword;

              return (
                <div
                  key={kw.keyword}
                  onClick={() => setSelectedKeyword(kw)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500/70 bg-gradient-to-r from-amber-950/30 to-zinc-900 shadow-md shadow-amber-500/5'
                      : 'border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2.5 w-2.5 rounded-full" 
                        style={{ backgroundColor: kw.color }}
                      />
                      <span className="text-xs font-bold text-white">{kw.keyword}</span>
                    </div>

                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                      +{kw.growthPercent}%
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Vol: <strong className="text-zinc-200">{kw.searchVolume}</strong></span>
                    <span>Comp: <strong className="text-zinc-300">{kw.competition}</strong></span>
                    <span className="text-amber-400 font-semibold font-mono">Virality: {kw.viralityIndex}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action Button for Selected Topic */}
          <div className="pt-1">
            <button
              onClick={() => {
                const topic = `${selectedKeyword.keyword}: The Viral Breakthrough Explained`;
                const hook = `Nobody expected ${selectedKeyword.keyword.toLowerCase()} to change everything this week...`;
                onSelectTopicForGeneration(topic, hook);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-500/20 transition transform hover:scale-[1.01]"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              <span>Generate Video on "{selectedKeyword.keyword}"</span>
            </button>
          </div>
        </div>

        {/* Right Column: Line Chart Visualizer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          
          {/* Top chart metrics summary */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500">
                Active Trajectory:
              </span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{selectedKeyword.keyword}</span>
                <span className="text-xs font-mono font-semibold" style={{ color: selectedKeyword.color }}>
                  ({selectedKeyword.category})
                </span>
              </h4>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-500">Peak Velocity:</span>
              <div className="text-sm font-black text-emerald-400 font-mono">
                {selectedKeyword.viralityIndex}/100 Score
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full my-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48 overflow-visible"
            >
              <defs>
                {/* Gradient under curve */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedKeyword.color} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={selectedKeyword.color} stopOpacity="0.0" />
                </linearGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Gridlines */}
              {[25, 50, 75, 100].map((level) => {
                const y = chartHeight - paddingY - (level / 100) * innerHeight;
                return (
                  <g key={level}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.07)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      fill="rgba(255, 255, 255, 0.3)"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Area fill under curve */}
              <path d={areaPath} fill="url(#areaGradient)" />

              {/* Smooth Trend Line */}
              <path
                d={mainPath}
                fill="none"
                stroke={selectedKeyword.color}
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Comparison baseline for other keywords (subtle background paths) */}
              {keywords
                .filter((k) => k.keyword !== selectedKeyword.keyword)
                .map((otherKw) => {
                  const pts = getCoordinates(otherKw.history);
                  const p = generateSmoothPath(pts);
                  return (
                    <path
                      key={otherKw.keyword}
                      d={p}
                      fill="none"
                      stroke={otherKw.color}
                      strokeWidth="1.2"
                      strokeOpacity="0.25"
                    />
                  );
                })}

              {/* Interactive Data Point Dots */}
              {activePoints.map((pt, idx) => {
                const isHovered = hoveredPointIdx === idx;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIdx(idx)}
                    onMouseLeave={() => setHoveredPointIdx(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill={selectedKeyword.color}
                      stroke="#09090b"
                      strokeWidth="2"
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={pt.x - 24}
                          y={pt.y - 30}
                          width="48"
                          height="20"
                          rx="4"
                          fill="#18181b"
                          stroke={selectedKeyword.color}
                          strokeWidth="1"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 16}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {pt.val}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* X Axis Day Labels */}
              {dayLabels.map((day, idx) => {
                const x = paddingX + (idx / (dayLabels.length - 1)) * innerWidth;
                return (
                  <text
                    key={idx}
                    x={x}
                    y={chartHeight - 6}
                    fill="rgba(255, 255, 255, 0.4)"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {day}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Related Angles Badges */}
          <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-zinc-500 font-semibold text-[10px] uppercase">
              Trending Angles:
            </span>
            {selectedKeyword.relatedAngles.map((angle, i) => (
              <span
                key={i}
                className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-zinc-300 font-mono text-[10px]"
              >
                #{angle}
              </span>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
