import React, { useState } from 'react';
import { 
  X, 
  Youtube, 
  Sparkles, 
  Search, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  TrendingUp, 
  Copy, 
  Check, 
  Zap, 
  Sliders, 
  ExternalLink,
  Target,
  RefreshCw,
  Eye,
  Camera,
  Layers,
  Film
} from 'lucide-react';
import { YouTubeChannel, TargetChannelAnalysis, TrendItem } from '../types';

interface ChannelManagerModalProps {
  initialTab?: 'clone' | 'upload';
  channels: YouTubeChannel[];
  activeChannel: YouTubeChannel;
  onSelectChannel: (channel: YouTubeChannel) => void;
  onAddChannel: (channel: YouTubeChannel) => void;
  onDeployClonedIdea: (trend: TrendItem) => void;
  onClose: () => void;
}

export const ChannelManagerModal: React.FC<ChannelManagerModalProps> = ({
  initialTab = 'clone',
  channels,
  activeChannel,
  onSelectChannel,
  onAddChannel,
  onDeployClonedIdea,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'clone' | 'upload'>(initialTab);

  // Target Channel Clone State
  const [targetUrl, setTargetUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TargetChannelAnalysis | null>(
    activeChannel.targetAnalysis || null
  );
  const [selectedDestinationChannelId, setSelectedDestinationChannelId] = useState<string>(activeChannel.id);
  const [copiedFormula, setCopiedFormula] = useState(false);

  // New Upload Channel Form State
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelHandle, setNewChannelHandle] = useState('');
  const [newChannelNiche, setNewChannelNiche] = useState('AI & Robotics');
  const [newFrequency, setNewFrequency] = useState<number>(2);
  const [newTargetLink, setNewTargetLink] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'
  );

  const avatarOptions = [
    { label: 'Cyber Tech', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80' },
    { label: 'Deep Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80' },
    { label: 'Mindset / Stoic', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80' },
    { label: 'Finance / Wealth', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=200&q=80' },
    { label: 'Future Science', url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=200&q=80' }
  ];

  // Analyze Target Channel
  const handleAnalyzeTarget = async (urlToAnalyze = targetUrl) => {
    if (!urlToAnalyze.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/channels/analyze-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetChannelUrl: urlToAnalyze.trim(),
          attachToChannelId: selectedDestinationChannelId
        })
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (e) {
      console.warn('Target channel analysis notice:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Create New Upload Destination Channel
  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const formattedHandle = newChannelHandle.trim()
      ? (newChannelHandle.startsWith('@') ? newChannelHandle.trim() : `@${newChannelHandle.trim()}`)
      : `@${newChannelName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const createdChannel: YouTubeChannel = {
      id: `chan_${Date.now().toString(36)}`,
      name: newChannelName.trim(),
      handle: formattedHandle,
      subscribers: '0 (New Upload Channel)',
      niche: newChannelNiche,
      avatar: selectedAvatar,
      autopilotEnabled: true,
      frequencyPerDay: Number(newFrequency),
      targetChannelUrl: newTargetLink.trim(),
      uploadStatus: 'connected',
      totalUploadedVideos: 0
    };

    onAddChannel(createdChannel);
    onSelectChannel(createdChannel);

    // If a target link was provided in the create form, kick off analysis
    if (newTargetLink.trim()) {
      setTargetUrl(newTargetLink.trim());
      setActiveTab('clone');
      handleAnalyzeTarget(newTargetLink.trim());
    } else {
      onClose();
    }
  };

  const sampleTargets = [
    { name: 'MKBHD', link: 'https://youtube.com/@mkbhd', niche: 'AI & Robotics' },
    { name: 'Veritasium', link: 'https://youtube.com/@veritasium', niche: 'Space & Astronomy' },
    { name: 'Alex Hormozi', link: 'https://youtube.com/@AlexHormozi', niche: 'Finance & Wealth' },
    { name: 'Daily Stoic', link: 'https://youtube.com/@DailyStoic', niche: 'Philosophy & Stoicism' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 text-zinc-100 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white shadow-lg shadow-red-600/20">
              <Youtube className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>YouTube Channel Command</span>
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                  Target Cloner & Uploader
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Reverse-engineer competitor viral DNA and configure destination channels for automated Wan 2.1 video uploads.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex rounded-xl bg-zinc-900/90 p-1 border border-zinc-800">
          <button
            onClick={() => setActiveTab('clone')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'clone'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Target className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">1. Clone & Analyze Target Channel</span>
            <span className="sm:hidden">1. Clone Target</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">2. Add New Upload Channel</span>
            <span className="sm:hidden">2. Add Channel</span>
          </button>
        </div>

        {/* TAB 1: CLONE & ANALYZE TARGET CHANNEL */}
        {activeTab === 'clone' && (
          <div className="mt-5 space-y-5">
            {/* Input Bar */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Enter Target YouTube Channel Link or Handle</span>
                <span className="text-[10px] text-zinc-500 font-normal font-mono">
                  e.g. https://youtube.com/@channel or @mkbhd
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://youtube.com/@AlexHormozi or @veritasium"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-2.5 pl-3 pr-10 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {targetUrl && (
                    <button
                      onClick={() => setTargetUrl('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleAnalyzeTarget(targetUrl)}
                  disabled={isAnalyzing || !targetUrl.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-zinc-950" />
                      <span>Reverse-Engineering...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-zinc-950" />
                      <span>Analyze & Prepare Clone</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Sample One-Click Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-zinc-400">Quick Test Targets:</span>
                {sampleTargets.map((samp) => (
                  <button
                    key={samp.name}
                    onClick={() => {
                      setTargetUrl(samp.link);
                      handleAnalyzeTarget(samp.link);
                    }}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-amber-500/60 hover:text-amber-300 transition"
                  >
                    📺 {samp.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Channel Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-zinc-400">
              <span>Selected Upload Channel to deploy cloned videos to:</span>
              <select
                value={selectedDestinationChannelId}
                onChange={(e) => setSelectedDestinationChannelId(e.target.value)}
                className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    Destination: {c.name} ({c.handle})
                  </option>
                ))}
              </select>
            </div>

            {/* ANALYSIS RESULT DISPLAY */}
            {analysisResult ? (
              <div className="space-y-4 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-zinc-900 p-4 sm:p-5 shadow-xl">
                
                {/* Target Channel Banner Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={analysisResult.avatarUrl}
                      alt={analysisResult.channelName}
                      className="h-12 w-12 rounded-xl object-cover border border-amber-500/40 shadow"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {analysisResult.channelName}
                        </h3>
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40">
                          {analysisResult.subscribers}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">
                        {analysisResult.handle} • Niche: <strong className="text-amber-400">{analysisResult.niche}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Viral DNA Decoded</span>
                    </span>
                  </div>
                </div>

                {/* 3 Core Reverse-Engineered Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase">
                      <Zap className="h-3.5 w-3.5" />
                      Viral Hook Formula
                    </span>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      {analysisResult.viralFormula}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-1">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-[11px] uppercase">
                      <Film className="h-3.5 w-3.5" />
                      Pacing & Retention DNA
                    </span>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      {analysisResult.pacingStyle}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-1">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5 text-[11px] uppercase">
                      <Camera className="h-3.5 w-3.5" />
                      Visual Cinematography
                    </span>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      {analysisResult.visualDna}
                    </p>
                  </div>
                </div>

                {/* Wan 2.1 Free Open AI Video Recipe Box */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
                      <Sparkles className="h-3.5 w-3.5" />
                      Wan 2.1 Free Video AI Prompt Recipe (Replicates Target Aesthetics)
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(analysisResult.wan21PromptRecipe);
                        setCopiedFormula(true);
                        setTimeout(() => setCopiedFormula(false), 2000);
                      }}
                      className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono"
                    >
                      {copiedFormula ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedFormula ? 'Copied!' : 'Copy Recipe'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs text-zinc-200 bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800">
                    {analysisResult.wan21PromptRecipe}
                  </p>
                </div>

                {/* Cloned Ready-To-Produce Video Ideas */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <span>Ready-To-Produce Cloned Outperform Concepts ({analysisResult.clonedVideoIdeas.length})</span>
                    </h4>
                    <span className="text-[11px] text-zinc-500">
                      1-Click to trigger Wan 2.1 Video Generator
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {analysisResult.clonedVideoIdeas.map((idea, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 hover:border-amber-500/60 transition group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white group-hover:text-amber-300 transition">
                              {idea.topic}
                            </span>
                            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                              {idea.viralScore}% VIRALITY
                            </span>
                          </div>
                          <p className="text-xs text-amber-200/90 italic">
                            "{idea.hook}"
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            <strong>Reason:</strong> {idea.reason}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            onDeployClonedIdea(idea);
                            onClose();
                          }}
                          className="shrink-0 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white px-3.5 py-1.5 text-xs font-bold shadow-md shadow-red-600/20 transition transform hover:scale-105"
                        >
                          <Zap className="h-3.5 w-3.5 fill-white" />
                          <span>Generate Now</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center space-y-2">
                <Target className="h-10 w-10 text-amber-400 mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-white">No Target Channel Analyzed Yet</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Paste any YouTube channel link above (e.g. MKBHD, Alex Hormozi, Veritasium) to reverse-engineer their secret retention formula, visual DNA, and generate outperforming Wan 2.1 video scripts.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD NEW UPLOAD DESTINATION CHANNEL */}
        {activeTab === 'upload' && (
          <form onSubmit={handleCreateChannel} className="mt-5 space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Channel Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Upload Destination Channel Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newChannelName}
                    onChange={(e) => {
                      setNewChannelName(e.target.value);
                      if (!newChannelHandle) {
                        setNewChannelHandle(`@${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
                      }
                    }}
                    placeholder="e.g. NextGen Robotics Daily"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Handle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Channel Handle (@...)
                  </label>
                  <input
                    type="text"
                    value={newChannelHandle}
                    onChange={(e) => setNewChannelHandle(e.target.value)}
                    placeholder="@nextgenrobotics"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Niche */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Content Niche / Category
                  </label>
                  <select
                    value={newChannelNiche}
                    onChange={(e) => setNewChannelNiche(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="AI & Robotics">AI & Robotics</option>
                    <option value="Space & Astronomy">Space & Astronomy</option>
                    <option value="Future Science">Future Science</option>
                    <option value="Philosophy & Stoicism">Philosophy & Stoicism</option>
                    <option value="Finance & Wealth">Finance & Wealth</option>
                    <option value="Tech & Gadgets">Tech & Gadgets</option>
                  </select>
                </div>

                {/* Daily Frequency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Autopilot Upload Frequency
                  </label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(Number(e.target.value))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value={1}>1 Short per day (Morning 8:00 AM)</option>
                    <option value={2}>2 Shorts per day (Peak 2:00 PM & 6:00 PM)</option>
                    <option value={3}>3 Shorts per day (Accelerated Growth)</option>
                    <option value={5}>5 Shorts per day (High-Velocity Studio)</option>
                  </select>
                </div>
              </div>

              {/* Target Channel to Clone Link (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Target Channel to Clone / Model After (Optional)</span>
                  <span className="text-[10px] text-amber-400">Auto-triggers clone analysis</span>
                </label>
                <input
                  type="text"
                  value={newTargetLink}
                  onChange={(e) => setNewTargetLink(e.target.value)}
                  placeholder="https://youtube.com/@competitor or @targetchannel"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Visual Avatar Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">
                  Select Channel Brand Avatar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {avatarOptions.map((av) => (
                    <div
                      key={av.label}
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`cursor-pointer rounded-xl border p-2 text-center transition ${
                        selectedAvatar === av.url
                          ? 'border-red-500 bg-red-950/30'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.label}
                        className="h-10 w-10 mx-auto rounded-lg object-cover mb-1"
                      />
                      <span className="text-[10px] text-zinc-300 block truncate">{av.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* YouTube Data API status banner */}
              <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-zinc-300">
                    YouTube Data API Ready (Automated Upload & Tagging Pipeline)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  OAuth Synced
                </span>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newChannelName.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-red-600/30 transition disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Save & Set Active Upload Channel</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
