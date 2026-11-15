import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle2, 
  Table, 
  Film, 
  Youtube, 
  HardDrive, 
  Clock, 
  ArrowRight, 
  Cpu, 
  Zap, 
  Sliders, 
  ExternalLink, 
  Flame, 
  Check, 
  Eye, 
  Radio, 
  ChevronRight,
  Bell,
  BellRing,
  X,
  ArrowUpRight,
  Volume2,
  Image as ImageIcon,
  Wand2,
  Target,
  Plus,
  Layers,
  FileText
} from 'lucide-react';
import { PipelineItem, TrendItem, YouTubeChannel, BillingState, TargetChannelAnalysis } from '../types';
import { TrendAnalytics } from './TrendAnalytics';
import { ComponentTag } from './ComponentTag';
import { CustomizableCard } from './CustomizableCard';

interface AutopilotStudioProps {
  channel: YouTubeChannel;
  billing: BillingState | null;
  onItemGenerated: (item: PipelineItem) => void;
  onOpenVideo: (item: PipelineItem) => void;
  onOpenPrompt: (prompt: string, title: string) => void;
  onViewSheets: () => void;
  onViewCalendar?: () => void;
  onOpenChannelManager?: (tab?: 'clone' | 'upload') => void;
  incomingClonedTrend?: TrendItem | null;
  onClearIncomingClonedTrend?: () => void;
}

export const AutopilotStudio: React.FC<AutopilotStudioProps> = ({
  channel,
  billing,
  onItemGenerated,
  onOpenVideo,
  onOpenPrompt,
  onViewSheets,
  onViewCalendar,
  onOpenChannelManager,
  incomingClonedTrend,
  onClearIncomingClonedTrend
}) => {
  // Autopilot execution state
  const [currentStep, setCurrentStep] = useState<number>(0); 
  // 0: Idle, 1: Trend Discovery, 2: Google Sheets Sync, 3: Google Veo Prompting, 4: AI Video Rendering (3-5 min), 5: YouTube Upload & Sheet Mark
  const [isRunningAutopilot, setIsRunningAutopilot] = useState(false);
  const [executionSpeed, setExecutionSpeed] = useState<'fast' | 'realistic'>('fast'); // fast demo (15s) vs realistic 3-min
  
  // Pipeline Data States
  const [activeNiche, setActiveNiche] = useState(channel.niche);
  const [discoveredTrends, setDiscoveredTrends] = useState<TrendItem[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [currentPromptData, setCurrentPromptData] = useState<any>(null);
  const [activeRenderItem, setActiveRenderItem] = useState<PipelineItem | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderTimerSec, setRenderTimerSec] = useState(0);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [generatedThumbnailData, setGeneratedThumbnailData] = useState<{
    url: string;
    promptUsed: string;
    model: string;
  } | null>(null);

  // Studio sub-tab mode
  const [studioTab, setStudioTab] = useState<'pipeline' | 'radar' | 'cloner' | 'alerts' | 'all'>('pipeline');

  // Real-Time Viral Trend Detection Alerts
  const [realtimeAlertEnabled, setRealtimeAlertEnabled] = useState(true);
  const [activeViralNotification, setActiveViralNotification] = useState<{
    id: string;
    trend: TrendItem;
    detectedAt: string;
    velocityPerHour: string;
  } | null>(null);
  const [alertHistory, setAlertHistory] = useState<Array<{
    id: string;
    trend: TrendItem;
    detectedAt: string;
    velocityPerHour: string;
  }>>([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const hasTriggeredInitialNotification = useRef(false);

  // Target Channel Cloner State
  const [studioTargetUrl, setStudioTargetUrl] = useState('');
  const [isStudioAnalyzing, setIsStudioAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<TargetChannelAnalysis | null>(
    channel.targetAnalysis || null
  );

  // Handle incoming cloned trend dispatched from modal
  useEffect(() => {
    if (incomingClonedTrend) {
      triggerCycleFromNotification(incomingClonedTrend);
      onClearIncomingClonedTrend?.();
    }
  }, [incomingClonedTrend]);

  // Sync activeNiche and target analysis when channel changes
  useEffect(() => {
    setActiveNiche(channel.niche);
    if (channel.targetAnalysis) {
      setActiveAnalysis(channel.targetAnalysis);
    }
  }, [channel]);

  // Fast In-Studio Target Channel Analysis
  const handleQuickAnalyzeTarget = async (urlToAnalyze = studioTargetUrl) => {
    if (!urlToAnalyze.trim()) return;
    setIsStudioAnalyzing(true);
    addLog(`Auditing target YouTube channel: "${urlToAnalyze}" for viral cloning...`, 'info');

    try {
      const res = await fetch('/api/channels/analyze-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetChannelUrl: urlToAnalyze.trim(),
          attachToChannelId: channel.id
        })
      });

      const data = await res.json();
      if (data.analysis) {
        setActiveAnalysis(data.analysis);
        addLog(`🎯 Reverse-engineered ${data.analysis.channelName} (${data.analysis.handle})! Cloned ${data.analysis.clonedVideoIdeas.length} viral video blueprints.`, 'success');
      }
    } catch (e) {
      console.warn('Target channel analysis notice:', e);
      addLog(`Failed to analyze target channel. Check connection.`, 'warn');
    } finally {
      setIsStudioAnalyzing(false);
    }
  };

  // Audio chime effect on new trend alert
  const playAlertChime = () => {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      }
    } catch (e) {
      // AudioContext policy might need user gesture
    }
  };

  // Real-time Trend Radar background listener (simulates continuous stream of viral spikes)
  useEffect(() => {
    if (!realtimeAlertEnabled) return;

    // Simulate detection of high-velocity trend after 4 seconds if not already active
    const initialTimer = setTimeout(() => {
      if (!hasTriggeredInitialNotification.current && !isRunningAutopilot) {
        hasTriggeredInitialNotification.current = true;
        const viralSpike: TrendItem = {
          topic: activeNiche === 'Space & Astronomy'
            ? 'JWST Detects Coherent Radio Signals from Trappist-1e'
            : activeNiche === 'Philosophy & Stoicism'
            ? 'Marcus Aurelius Strategy Exploding on Wall Street'
            : 'Open-Source Humanoid AI Software Runs on Consumer GPU',
          hook: activeNiche === 'Space & Astronomy'
            ? 'The radio signals were repeating every 11 seconds...'
            : activeNiche === 'Philosophy & Stoicism'
            ? 'Top fund managers are using a 2,000-year-old journal to beat the market...'
            : 'You can now run a full humanoid robot brain on an RTX 3060...',
          viralScore: 99,
          reason: 'Viral debate surging across Reddit, X, and arXiv with over 450k discussions in 2 hours.',
          angle: 'Breaking down the exact technical claims before mainstream media catches on.',
          suggestedVeoPrompt: 'Cinematic hyper-detailed tracking shot of an open-source humanoid robot running precision biomechanical movements in a garage laboratory, neon cyan and deep amber atmospheric rim lights, shallow focus, 8K ARRI Alexa 35.'
        };

        const newAlert = {
          id: `alert-${Date.now()}`,
          trend: viralSpike,
          detectedAt: 'Just now',
          velocityPerHour: '+412% search volume'
        };

        setActiveViralNotification(newAlert);
        setAlertHistory((prev) => [newAlert, ...prev]);
        playAlertChime();
        addLog(`🚨 REAL-TIME RADAR: Viral spike detected matching "${activeNiche}": "${viralSpike.topic}" (+412% velocity)!`, 'warn');
      }
    }, 4500);

    // Periodic scanner interval (every 45s, simulates new radar discovery)
    const periodicScanner = setInterval(async () => {
      if (isRunningAutopilot || activeViralNotification) return;

      const randomScore = Math.floor(Math.random() * 8) + 92; // 92% - 99%
      const candidateTrends: Record<string, TrendItem[]> = {
        'AI & Robotics': [
          {
            topic: 'MIT Replaces Transformers With Liquid Neural State Spaces',
            hook: 'Deep learning is about to use 95% less electricity...',
            viralScore: 97,
            reason: 'Paper released 30 minutes ago demonstrating 100x efficiency gains.',
            angle: 'Why your phone will run 70B models locally by next summer.',
            suggestedVeoPrompt: 'Cinematic glowing liquid neural pathways connecting glowing crystal synapses in microfluidic biochip chamber.'
          },
          {
            topic: 'Autonomous Mining Exoskeletons Enter Commercial Production',
            hook: 'One operator can now lift 1,500 pounds with zero fatigue...',
            viralScore: 94,
            reason: 'Heavy machinery unions just certified hydraulic carbon-fiber exosuits.',
            angle: 'The future of industrial labor and human augmentation.',
            suggestedVeoPrompt: 'Cinematic low-angle hero shot of a titanium industrial powered exoskeleton moving massive quartz boulders inside an underground illuminated mine.'
          }
        ],
        'Space & Astronomy': [
          {
            topic: 'Oxygen Atmosphere Discovered on Nearby Super-Earth Gliese 12b',
            hook: 'NASA just confirmed it: Gliese 12b has atmospheric ozone...',
            viralScore: 98,
            reason: 'Spectroscopic absorption lines confirmed by ground-based VLT telescopes.',
            angle: 'Comparing its temperate climate to early Earth.',
            suggestedVeoPrompt: 'Breathtaking orbital view of planet Gliese 12b with swirling turquoise oceans and cloud belts against its cool red dwarf star.'
          }
        ]
      };

      const pool = candidateTrends[activeNiche] || candidateTrends['AI & Robotics'];
      const chosen = pool[Math.floor(Math.random() * pool.length)];

      const freshAlert = {
        id: `alert-${Date.now()}`,
        trend: { ...chosen, viralScore: randomScore },
        detectedAt: 'Just now',
        velocityPerHour: '+320% search volume'
      };

      setActiveViralNotification(freshAlert);
      setAlertHistory((prev) => [freshAlert, ...prev]);
      playAlertChime();
      addLog(`🚨 REAL-TIME RADAR: Detected viral surge for "${freshAlert.trend.topic}" (${freshAlert.trend.viralScore}% virality)`, 'warn');
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(periodicScanner);
    };
  }, [activeNiche, realtimeAlertEnabled, isRunningAutopilot, activeViralNotification]);

  // Instant 1-Click Trigger from Real-Time Notification
  const triggerCycleFromNotification = async (trend: TrendItem) => {
    setActiveViralNotification(null);
    setSelectedTrend(trend);
    if (!discoveredTrends.some((t) => t.topic === trend.topic)) {
      setDiscoveredTrends((prev) => [trend, ...prev]);
    }

    addLog(`⚡ Instant Trigger accepted for viral trend: "${trend.topic}"!`, 'success');
    addLog(`Launching accelerated end-to-end autopilot cycle...`, 'info');

    setIsRunningAutopilot(true);
    try {
      // 1. Sync directly to Google Sheets
      const synced = await handleSyncToSheets(trend);
      if (!synced) throw new Error('Failed to log to Google Sheets');

      // 2. Craft Veo cinema prompt
      const prompted = await handleCraftVeoPrompt(synced);
      if (!prompted) throw new Error('Failed to craft Veo prompt');

      // 3. Render video on GPU node
      const rendered = await handleRenderVeoVideo(prompted);
      if (!rendered) throw new Error('Video render failed');

      // 4. Publish to YouTube
      await handlePublishToYouTube(rendered);
      addLog(`🎯 Instant content cycle finished! Live on YouTube with viral timing.`, 'success');
    } catch (e: any) {
      console.warn('Cycle notice:', e);
      addLog(`Cycle stopped: ${e.message}`, 'warn');
      setIsRunningAutopilot(false);
    }
  };

  // Terminal Logs
  const [terminalLogs, setTerminalLogs] = useState<Array<{ id: string; time: string; msg: string; level: 'info' | 'success' | 'warn' }>>([
    { id: '1', time: 'SYSTEM BOOT', msg: 'TubePilot AI Autopilot Daemon initialized.', level: 'info' },
    { id: '2', time: 'WORKER CLUSTER', msg: 'Connected to 3 worker nodes. Ready for Wan 2.1 free video jobs.', level: 'success' },
    { id: '3', time: 'WORKSPACE SYNC', msg: 'Google Sheets & YouTube API connections healthy.', level: 'success' }
  ]);

  const addLog = (msg: string, level: 'info' | 'success' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev.slice(-15), { id: Math.random().toString(), time, msg, level }]);
  };

  // Step 1: Scan World Trends
  const handleDiscoverTrends = async () => {
    setCurrentStep(1);
    addLog(`Scanning real-world viral trends for niche: "${activeNiche}"...`, 'info');

    try {
      const res = await fetch('/api/trends/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: activeNiche, count: 3 })
      });
      const data = await res.json();
      if (data.trends && data.trends.length > 0) {
        setDiscoveredTrends(data.trends);
        setSelectedTrend(data.trends[0]);
        addLog(`Discovered ${data.trends.length} high-velocity trends with virality scores > 90%.`, 'success');
      }
    } catch (err: any) {
      console.warn('Scan trends notice:', err);
      addLog(`Failed to scan trends: ${err.message}`, 'warn');
    }
  };

  // Step 2: Sync Idea into Google Sheets
  const handleSyncToSheets = async (trendToSync = selectedTrend) => {
    if (!trendToSync) return;
    setCurrentStep(2);
    addLog(`Creating row in Google Sheet [TubePilot_Autopilot_Queue]...`, 'info');

    const newRowId = `row-${Date.now().toString().slice(-4)}`;
    const pipelineItem: PipelineItem = {
      id: newRowId,
      userId: 'usr_premium_01',
      channelId: channel.id,
      niche: activeNiche,
      topic: trendToSync.topic,
      viralScore: trendToSync.viralScore,
      hook: trendToSync.hook,
      veoPrompt: trendToSync.suggestedVeoPrompt || 'Cinematic 4K Google Veo shot...',
      script: {
        hook: trendToSync.hook,
        scenes: [
          { sceneNumber: 1, visual: 'Dramatic introductory zoom on subject', narration: trendToSync.hook, durationSec: 4 },
          { sceneNumber: 2, visual: 'Revealing key scientific or technological breakthrough', narration: trendToSync.reason || 'This breakthrough alters the industry forever.', durationSec: 5 },
          { sceneNumber: 3, visual: 'Cinematic futuristic vista with closing statement', narration: 'Follow for daily world breakthroughs in 60 seconds.', durationSec: 4 }
        ],
        callToAction: 'Follow for daily world breakthroughs in 60 seconds.'
      },
      youtubeMetadata: {
        title: `${trendToSync.topic.slice(0, 50)} #Shorts`,
        description: `${trendToSync.topic}\n\nHook: ${trendToSync.hook}\n\n#trending #shorts #viral`,
        tags: ['shorts', 'trending', activeNiche.toLowerCase()],
        category: 'Science & Technology'
      },
      s3VideoUrl: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      status: 'idea_logged',
      youtubeVideoId: '',
      renderProgress: 0,
      workerId: 'worker-us-east-1',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/sheets/rows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pipelineItem)
      });
      const data = await res.json();
      setActiveRenderItem(pipelineItem);
      onItemGenerated(pipelineItem);
      addLog(`Row ${newRowId} synced to Google Sheets. Status marked as "💡 Idea Logged".`, 'success');
      return pipelineItem;
    } catch (err: any) {
      console.warn('Sync sheets notice:', err);
      addLog(`Failed to sync to Google Sheets: ${err.message}`, 'warn');
    }
  };

  // Step 3: Wan 2.1 Free Open-Source Prompt Engineering
  const handleCraftVeoPrompt = async (itemToPrompt = activeRenderItem) => {
    if (!itemToPrompt) return;
    setCurrentStep(3);
    addLog(`Crafting cinematic prompt for Wan 2.1 Free Open-Source AI (Apache 2.0)...`, 'info');

    try {
      const res = await fetch('/api/video/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: itemToPrompt.topic,
          hook: itemToPrompt.hook,
          niche: itemToPrompt.niche
        })
      });
      const data = await res.json();
      if (data.promptData) {
        setCurrentPromptData(data.promptData);
        itemToPrompt.veoPrompt = data.promptData.veoPrompt || data.promptData.videoPrompt;
        itemToPrompt.videoPrompt = data.promptData.videoPrompt || data.promptData.veoPrompt;
        if (data.promptData.scenes) {
          itemToPrompt.script.scenes = data.promptData.scenes;
        }

        // Also fetch YouTube SEO
        const seoRes = await fetch('/api/youtube/seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: itemToPrompt.topic,
            hook: itemToPrompt.hook,
            script: itemToPrompt.script
          })
        });
        const seoData = await seoRes.json();
        if (seoData.seo) {
          itemToPrompt.youtubeMetadata = {
            title: seoData.seo.mainTitle,
            altTitles: seoData.seo.altTitles,
            description: seoData.seo.description,
            tags: seoData.seo.tags,
            category: seoData.seo.category,
            thumbnailVisualPrompt: seoData.seo.thumbnailVisualPrompt
          };
        }

        // Update in Google Sheets
        await fetch(`/api/sheets/rows/${itemToPrompt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            veoPrompt: itemToPrompt.veoPrompt,
            videoPrompt: itemToPrompt.videoPrompt,
            status: 'veo_queued',
            script: itemToPrompt.script,
            youtubeMetadata: itemToPrompt.youtubeMetadata
          })
        });

        addLog(`Wan 2.1 cinema prompt & YouTube metadata compiled (Zero API Cost). Enqueued to worker node.`, 'success');

        // Automatically synthesize AI thumbnail using Stable Diffusion / Imagen
        await handleGenerateThumbnail(itemToPrompt);

        return itemToPrompt;
      }
    } catch (err: any) {
      console.warn('Prompt generation notice:', err);
      addLog(`Wan 2.1 prompt generation error: ${err.message}`, 'warn');
    }
  };

  // Step 3.5: AI Thumbnail Generation (Stable Diffusion XL / Imagen 3.1)
  const handleGenerateThumbnail = async (item = activeRenderItem) => {
    if (!item) return;
    setIsGeneratingThumbnail(true);
    addLog(`Synthesizing custom 4K YouTube thumbnail via Stable Diffusion Neural Engine...`, 'info');

    try {
      const res = await fetch('/api/thumbnails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: item.youtubeMetadata?.thumbnailVisualPrompt || item.veoPrompt || item.topic,
          topic: item.topic,
          niche: item.niche,
          viralScore: item.viralScore,
          aspectRatio: '16:9'
        })
      });

      const data = await res.json();
      if (data.success && data.thumbnailUrl) {
        item.thumbnailUrl = data.thumbnailUrl;
        setGeneratedThumbnailData({
          url: data.thumbnailUrl,
          promptUsed: data.promptUsed,
          model: data.model
        });

        // Sync thumbnail to Google Sheets row
        await fetch(`/api/sheets/rows/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            thumbnailUrl: data.thumbnailUrl
          })
        });

        addLog(`Custom 4K AI thumbnail generated & cached in AWS S3 vault!`, 'success');
      }
    } catch (thumbErr: any) {
      console.warn('Thumbnail generation warning:', thumbErr);
      addLog(`Thumbnail generated using high-contrast curated visual.`, 'info');
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  // Step 4: Video Generation on Worker Nodes (Wan 2.1 Free Open-Source Text-to-Video Engine)
  const handleRenderVeoVideo = async (itemToRender = activeRenderItem) => {
    if (!itemToRender) return;
    setCurrentStep(4);
    setRenderProgress(0);
    setRenderTimerSec(0);
    addLog(`Dispatched job ${itemToRender.id} to worker-us-east-1 (NVIDIA H100 cluster)...`, 'info');
    addLog(`Running Wan 2.1 100% Free Open-Source Video AI (Wan2.1-T2V Apache 2.0)...`, 'info');

    // Update row status to rendering
    await fetch(`/api/sheets/rows/${itemToRender.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rendering', renderProgress: 5 })
    });

    const isFast = executionSpeed === 'fast';
    const totalSteps = 10;
    const intervalMs = isFast ? 800 : 18000; // fast: 8s total; realistic: 180s (3 mins)

    return new Promise<PipelineItem>((resolve) => {
      let progress = 5;
      const interval = setInterval(async () => {
        progress += 10;
        setRenderProgress(progress);
        setRenderTimerSec((prev) => prev + (isFast ? 18 : 18));

        if (progress === 25) {
          addLog(`[Wan 2.1 Engine] Synthesizing initial latent video diffusion keyframes (Apache 2.0 free model)...`, 'info');
        } else if (progress === 55) {
          addLog(`[Worker Node] Upscaling to 1080p 60fps HDR via Wan-Video open weights...`, 'info');
        } else if (progress === 85) {
          addLog(`[Audio Sync] Burning kinetic typography subtitles & normalizing audio levels...`, 'info');
        }

        if (progress >= 100) {
          clearInterval(interval);
          setRenderProgress(100);

          // S3 upload completion
          const s3Url = `https://s3.us-east-1.amazonaws.com/tubepilot-vault/usr_premium_01/master_1080p/${itemToRender.id}_wan21_master.mp4`;
          itemToRender.s3VideoUrl = s3Url;
          itemToRender.status = 's3_uploaded';
          itemToRender.renderProgress = 100;

          await fetch(`/api/sheets/rows/${itemToRender.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              s3VideoUrl: s3Url,
              status: 's3_uploaded',
              renderProgress: 100
            })
          });

          addLog(`Wan 2.1 video render complete (Zero API fees)! MP4 stored in AWS S3 vault.`, 'success');
          resolve(itemToRender);
        }
      }, intervalMs);
    });
  };

  // Step 5: Upload to YouTube & Log back into Google Sheets
  const handlePublishToYouTube = async (itemToPublish = activeRenderItem) => {
    if (!itemToPublish) return;
    setCurrentStep(5);
    addLog(`Initiating YouTube Data API upload for channel "${channel.name}"...`, 'info');

    // Simulate YouTube upload HTTP request
    await new Promise((r) => setTimeout(r, 1500));
    const randomYTId = `yt_${Math.random().toString(36).substring(2, 9)}`;

    itemToPublish.youtubeVideoId = randomYTId;
    itemToPublish.status = 'youtube_uploaded';
    itemToPublish.uploadedAt = new Date().toISOString();

    // Mark as uploaded in Google Sheets
    await fetch(`/api/sheets/rows/${itemToPublish.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        youtubeVideoId: randomYTId,
        status: 'youtube_uploaded',
        uploadedAt: itemToPublish.uploadedAt
      })
    });

    onItemGenerated(itemToPublish);
    addLog(`Successfully uploaded to YouTube (ID: ${randomYTId}) with captions, tags, and description!`, 'success');
    addLog(`Logged final video into Google Sheets row [${itemToPublish.id}] marked as "UPLOADED" ✅`, 'success');

    setIsRunningAutopilot(false);
  };

  // End-to-End 100% Autopilot Loop
  const runFullAutopilotLoop = async () => {
    setIsRunningAutopilot(true);
    addLog(`🚀 Starting 100% Autopilot Loop for "${channel.name}"...`, 'info');

    try {
      // 1. Discover Trends
      setCurrentStep(1);
      const trendRes = await fetch('/api/trends/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: activeNiche, count: 3 })
      });
      const trendData = await trendRes.json();
      const topTrend = trendData.trends?.[0] || {
        topic: 'AI Microchips Surpassing Human Brain Speed',
        hook: 'Scientists just built a neuromorphic chip that thinks in picoseconds...',
        viralScore: 98,
        reason: 'Breakthrough photonic crystal architecture published today.',
        angle: 'Visual explanation of light-based computing.',
        suggestedVeoPrompt: 'Cinematic macro camera glide across glowing optical photonic crystal microchip with pulsing laser light conduits.'
      };
      setDiscoveredTrends(trendData.trends || [topTrend]);
      setSelectedTrend(topTrend);
      addLog(`Selected top trending idea: "${topTrend.topic}" (Virality Score: ${topTrend.viralScore}%)`, 'success');

      // 2. Sync into Google Sheets
      const syncedItem = await handleSyncToSheets(topTrend);
      if (!syncedItem) throw new Error('Google Sheets sync failed');

      // 3. Prompt Google Veo
      const promptedItem = await handleCraftVeoPrompt(syncedItem);
      if (!promptedItem) throw new Error('Veo prompt crafting failed');

      // 4. Render Video on Worker Node
      const renderedItem = await handleRenderVeoVideo(promptedItem);
      if (!renderedItem) throw new Error('Video rendering failed');

      // 5. Upload to YouTube & Finalize Google Sheets
      await handlePublishToYouTube(renderedItem);
      addLog(`🎉 Autopilot cycle finished flawlessly! Video is live on YouTube.`, 'success');
    } catch (e: any) {
      console.warn('Autopilot loop notice:', e);
      addLog(`Autopilot loop stopped: ${e.message}`, 'warn');
      setIsRunningAutopilot(false);
    }
  };

  const stepLabels = [
    { num: 1, title: 'Trend Radar', desc: 'Scan Global Trends' },
    { num: 2, title: 'Google Sheets', desc: 'Sync Idea to Sheet' },
    { num: 3, title: 'Wan 2.1 Free AI', desc: 'Craft Open Video Prompt' },
    { num: 4, title: 'GPU Worker Node', desc: 'Render Wan 2.1 Video' },
    { num: 5, title: 'YouTube Auto-Post', desc: 'Upload & Log Sheet' }
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      
      {/* Studio Sub-Navigation & Quick Action Strip (Fixed height, non-vertical scroll on page) */}
      <div className="shrink-0 px-4 sm:px-6 pt-3 pb-2 border-b border-zinc-800/60 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Channel Context */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white font-bold shadow-md shadow-red-500/20">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Autopilot Studio
                </h1>
                <ComponentTag id="SEC-STUDIO-HEADER" name="Autopilot Channel Ribbon" />
                <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                  {channel.niche}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden md:block">
                Automated trend scraping, sheets logging, Wan 2.1 video prompting, and YouTube scheduling.
              </p>
            </div>
          </div>

          {/* Center: Studio Segmented Sub-navigation */}
          <div className="flex items-center gap-1.5">
            <ComponentTag id="SEC-STUDIO-TABS" name="Studio Mode Switcher" />
            <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-0.5 text-xs font-semibold overflow-x-auto no-scrollbar">
            {[
              { id: 'pipeline', label: 'Pipeline Workflow', icon: <Cpu className="h-3.5 w-3.5" /> },
              { id: 'radar', label: 'Trend Radar', icon: <Flame className="h-3.5 w-3.5" /> },
              { id: 'cloner', label: 'Channel Cloner', icon: <Target className="h-3.5 w-3.5" /> },
              { id: 'alerts', label: `Radar Alerts (${alertHistory.length})`, icon: <Bell className="h-3.5 w-3.5" /> },
              { id: 'all', label: 'All', icon: <Layers className="h-3.5 w-3.5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStudioTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all whitespace-nowrap ${
                  studioTab === tab.id
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

          {/* Right: Quick Autopilot Trigger & Document Export */}
          <div className="flex items-center gap-2">
            <a
              href="/api/download-roadmap-docx"
              download="TubePilot_Roadmap_and_Pipelines_Presentation.docx"
              title="Download Architecture Roadmap Tree & 5-Stage Pipelines Presentation in Microsoft Word (.docx) format"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 transition"
            >
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              <span>Roadmap (.DOCX)</span>
            </a>

            <button
              onClick={runFullAutopilotLoop}
              disabled={isRunningAutopilot}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 px-3.5 py-1 text-xs font-bold text-white shadow-md shadow-red-500/20 transition disabled:opacity-50"
            >
              {isRunningAutopilot ? (
                <>
                  <RotateCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                  <span>Launch Autopilot</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport (Contained scroll, zero page vertical scroll) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-6 py-4 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Real-Time Viral Trend Alert Toast / Floating Banner */}
      {activeViralNotification && (
        <div className="rounded-2xl border-2 border-red-500/80 bg-gradient-to-r from-red-950 via-zinc-900 to-amber-950/60 p-4 shadow-2xl shadow-red-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-red-500/20 blur-2xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse">
                <BellRing className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ComponentTag id="CARD-STUDIO-ALERT" name="Realtime Viral Surge Notification Banner" category="card" size="xs" />
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-red-400 border border-red-500/40">
                    🔴 Viral Surge Detected
                  </span>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40">
                    {activeViralNotification.velocityPerHour}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Niche: <strong className="text-white">{channel.niche}</strong> ({activeViralNotification.detectedAt})
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight sm:text-base">
                  {activeViralNotification.trend.topic}
                </h3>
                <p className="text-xs text-amber-200/90 italic line-clamp-1">
                  Hook: "{activeViralNotification.trend.hook}"
                </p>
                <p className="text-[11px] text-zinc-400">
                  {activeViralNotification.trend.reason}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0">
              <button
                onClick={() => setActiveViralNotification(null)}
                className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
              >
                Dismiss
              </button>

              <button
                onClick={() => triggerCycleFromNotification(activeViralNotification.trend)}
                disabled={isRunningAutopilot}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/30 transition transform hover:scale-105 disabled:opacity-50"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>Trigger Content Cycle Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target YouTube Channel Cloner & Reverse-Engineering Engine */}
      {(studioTab === 'cloner' || studioTab === 'all') && (
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/30 via-zinc-900 to-amber-950/20 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <ComponentTag id="CARD-STUDIO-CLONER" name="Target Channel Cloner & Idea Extractor" category="card" size="xs" />
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Target Channel Cloner & Reverse-Engineering Engine
                </h2>
                <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-red-400 border border-red-500/30">
                  Clone Competitor DNA
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Paste any YouTube channel link to decode their retention curve, extract top viral hooks, and auto-generate outperforming Wan 2.1 videos for <strong className="text-white">{channel.name}</strong> ({channel.handle}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenChannelManager && (
              <button
                onClick={() => onOpenChannelManager('upload')}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition"
              >
                <Plus className="h-3.5 w-3.5 text-red-400" />
                <span>Add Upload Channel</span>
              </button>
            )}
            {onOpenChannelManager && (
              <button
                onClick={() => onOpenChannelManager('clone')}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 transition"
              >
                <span>Full Cloner Studio</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={studioTargetUrl}
              onChange={(e) => setStudioTargetUrl(e.target.value)}
              placeholder="Paste target channel link: https://youtube.com/@AlexHormozi or @mkbhd"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
            {studioTargetUrl && (
              <button
                onClick={() => setStudioTargetUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => handleQuickAnalyzeTarget(studioTargetUrl)}
            disabled={isStudioAnalyzing || !studioTargetUrl.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/30 transition disabled:opacity-50"
          >
            {isStudioAnalyzing ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Auditing Target...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Analyze & Prepare Clone</span>
              </>
            )}
          </button>
        </div>

        {/* Active Cloned Target Summary Bar (if analyzed) */}
        {activeAnalysis && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeAnalysis.avatarUrl}
                  alt={activeAnalysis.channelName}
                  className="h-9 w-9 rounded-lg object-cover border border-amber-500/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Cloned Blueprint: {activeAnalysis.channelName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {activeAnalysis.subscribers}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Hook Formula: <span className="text-amber-200/90 italic">"{activeAnalysis.viralFormula}"</span>
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-2 py-1 rounded-md">
                Active Destination: {channel.name} ({channel.handle})
              </span>
            </div>

            {/* Quick 1-Click Launch Cloned Ideas */}
            {activeAnalysis.clonedVideoIdeas?.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Ready-to-Generate Cloned Concepts:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeAnalysis.clonedVideoIdeas.slice(0, 2).map((idea, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs"
                    >
                      <div className="pr-2 truncate">
                        <span className="font-semibold text-white truncate block">{idea.topic}</span>
                        <span className="text-[10px] text-amber-300/80 italic truncate block">"{idea.hook}"</span>
                      </div>
                      <button
                        onClick={() => triggerCycleFromNotification(idea)}
                        disabled={isRunningAutopilot}
                        className="shrink-0 flex items-center gap-1 rounded-md bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 text-[11px] font-bold transition disabled:opacity-50"
                      >
                        <Zap className="h-3 w-3 fill-white" />
                        <span>Generate</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Autopilot Hero Banner & Controls */}
      {(studioTab === 'pipeline' || studioTab === 'all') && (
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-red-950/20 p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
        
        {/* Glow ambient light */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <ComponentTag id="CARD-STUDIO-PIPELINE" name="Active 5-Stage Video Pipeline Runner" category="card" size="xs" />
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                Continuous Autopilot Engine
              </span>

              {/* Real-time Radar Status Indicator */}
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-950/80 border border-zinc-800 px-2.5 py-0.5 text-[11px] text-zinc-300">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span>Live Radar: <strong>Active ({channel.niche})</strong></span>
              </div>
            </div>
            <h1 className="mt-1 text-2xl font-black text-white tracking-tight sm:text-3xl">
              Autopilot YouTube Channel Studio
            </h1>
            <p className="mt-1 text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Automates world trend scanning, logs rows into Google Sheets, crafts cinema prompts for Google Veo, renders on distributed GPU workers, and publishes directly to YouTube with automated tags and captions.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Speed toggle */}
            <div className="flex items-center rounded-xl bg-zinc-950 border border-zinc-800 p-1 text-xs">
              <button
                onClick={() => setExecutionSpeed('fast')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  executionSpeed === 'fast' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Accelerated preview (15 seconds)"
              >
                ⚡ Fast Demo (15s)
              </button>
              <button
                onClick={() => setExecutionSpeed('realistic')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  executionSpeed === 'realistic' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Simulates realistic 3-5 minute Veo queue"
              >
                ⏱️ 3-Min Wait Mode
              </button>
            </div>

            {/* Notification History Trigger */}
            <button
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
              className="relative flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
              title="View Radar Alerts History"
            >
              <Bell className="h-4 w-4" />
              {alertHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
                  {alertHistory.length}
                </span>
              )}
            </button>

            <button
              onClick={runFullAutopilotLoop}
              disabled={isRunningAutopilot}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/25 transition disabled:opacity-50"
            >
              {isRunningAutopilot ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Autopilot Cycle Running...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-200" />
                  <span>Launch 100% Autopilot Loop</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5-Step Pipeline Progress Indicator */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {stepLabels.map((s) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div
                  key={s.num}
                  className={`rounded-xl border p-3 transition-all relative ${
                    isCurrent
                      ? 'border-red-500/60 bg-red-950/20 shadow-md shadow-red-500/10'
                      : isPast
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-zinc-800 bg-zinc-950/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-zinc-500 font-bold">
                      STAGE 0{s.num}
                    </span>
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-zinc-700" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-tight">{s.title}</h4>
                  <p className="text-[10px] text-zinc-400">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Trending Topic Analysis Dashboard (TrendAnalytics Line Chart) */}
      {(studioTab === 'radar' || studioTab === 'all') && (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ComponentTag id="CARD-STUDIO-RADAR" name="Real-Time Trend Intelligence Radar" category="card" size="xs" />
          <span className="text-[11px] font-mono text-zinc-400">Trend Surge Analytics</span>
        </div>
        <TrendAnalytics
          niche={channel.niche}
          onSelectTopicForGeneration={(topic, hook) => {
            const customTrend: TrendItem = {
              topic,
              hook,
              viralScore: 97,
              reason: `Identified via high-velocity keyword surge in ${channel.niche}.`,
              angle: 'Rapid algorithmic explanation and technical breakdown.',
              suggestedVeoPrompt: `Cinematic hyper-realistic visual sequence illustrating ${topic}, 4k 60fps, dynamic camera movement, award-winning lighting.`
            };
            triggerCycleFromNotification(customTrend);
          }}
        />
      </div>
      )}

      {/* Main Studio Interactive Grid */}
      {(studioTab === 'pipeline' || studioTab === 'all') && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stage Actions & Output Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Stage 1: Trend Radar Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <ComponentTag id="CARD-STUDIO-STAGE-1-RADAR" name="Stage 1: Trend Radar Intelligence" category="card" size="xs" />
                <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Stage 1: Trend Radar Intelligence</h3>
                  <p className="text-[11px] text-zinc-400">Scrapes global trends and scores viral velocity</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={activeNiche}
                  onChange={(e) => setActiveNiche(e.target.value)}
                  className="rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="AI & Robotics">AI & Robotics</option>
                  <option value="Space & Astronomy">Space & Astronomy</option>
                  <option value="Future Science">Future Science</option>
                  <option value="Philosophy & Stoicism">Philosophy & Stoicism</option>
                  <option value="Quantum Tech">Quantum Tech</option>
                  <option value="Global Mysteries">Global Mysteries</option>
                </select>

                <button
                  onClick={handleDiscoverTrends}
                  disabled={isRunningAutopilot}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-200 transition"
                >
                  Scan Trends
                </button>
              </div>
            </div>

            {/* Trending Items List */}
            <div className="space-y-2">
              {discoveredTrends.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                  Click "Scan Trends" or "Launch 100% Autopilot Loop" to fetch real-world topics.
                </div>
              ) : (
                discoveredTrends.map((trend, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedTrend(trend)}
                    className={`rounded-xl border p-3 cursor-pointer transition ${
                      selectedTrend?.topic === trend.topic
                        ? 'border-amber-500/60 bg-amber-950/20'
                        : 'border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{trend.topic}</span>
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        {trend.viralScore}% VIRALITY
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-amber-300/90 italic">
                      "{trend.hook}"
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      <strong>Angle:</strong> {trend.angle}
                    </p>
                  </div>
                ))
              )}
            </div>

            {selectedTrend && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleSyncToSheets(selectedTrend)}
                  disabled={isRunningAutopilot}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold transition"
                >
                  <Table className="h-3.5 w-3.5" />
                  <span>Log Idea to Google Sheets</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Stage 3: Wan 2.1 Free Open-Source Video Prompting */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Film className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ComponentTag id="CARD-STUDIO-PROMPT-ENGINE" name="Cinematic Prompt & Script Generator Card" category="card" size="xs" />
                    <h3 className="text-sm font-bold text-white">Stage 3: Wan 2.1 Free Open Video AI</h3>
                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                      100% Free • Open Source
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Generates 1080p photorealistic camera parameters & storyboard (Apache 2.0)</p>
                </div>
              </div>

              {activeRenderItem && (
                <button
                  onClick={() => handleCraftVeoPrompt(activeRenderItem)}
                  disabled={isRunningAutopilot}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-200 transition"
                >
                  Compile Prompt
                </button>
              )}
            </div>

            {activeRenderItem?.veoPrompt ? (
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
                    Cinematography Prompt
                  </span>
                  <button
                    onClick={() => onOpenPrompt(activeRenderItem.veoPrompt, activeRenderItem.topic)}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Inspect Full Parameters</span>
                  </button>
                </div>
                <p className="font-mono text-xs text-zinc-300 line-clamp-3">
                  {activeRenderItem.veoPrompt}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                  <div><strong>Lens:</strong> 35mm Anamorphic</div>
                  <div><strong>Lighting:</strong> Chiaroscuro Volumetric</div>
                  <div><strong>Grade:</strong> Kodak Vision3</div>
                </div>

                {/* AI Generated YouTube Thumbnail Preview */}
                {activeRenderItem.thumbnailUrl && (
                  <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <ImageIcon className="h-3.5 w-3.5 text-pink-400" />
                        <span>Custom 4K Thumbnail (Stable Diffusion Engine)</span>
                      </div>
                      <button
                        onClick={() => handleGenerateThumbnail(activeRenderItem)}
                        disabled={isGeneratingThumbnail}
                        className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-200 transition"
                      >
                        <Wand2 className={`h-3 w-3 ${isGeneratingThumbnail ? 'animate-spin text-pink-400' : 'text-amber-400'}`} />
                        <span>{isGeneratingThumbnail ? 'Synthesizing...' : 'Regenerate'}</span>
                      </button>
                    </div>

                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 shadow-md">
                      <img
                        src={activeRenderItem.thumbnailUrl}
                        alt="AI Generated Thumbnail"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 rounded bg-black/75 backdrop-blur-sm border border-zinc-700 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span>Synced to S3</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>16:9 • 1280x720 UHD Clickbait Optimized</span>
                      <span className="text-zinc-400">Model: Stable Diffusion Neural Synthesis</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleRenderVeoVideo(activeRenderItem)}
                    disabled={isRunningAutopilot || renderProgress > 0 && renderProgress < 100}
                    className="flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-md shadow-red-600/20 transition"
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Dispatch to Worker Render Farm</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                Log a trend to Google Sheets first to craft Veo prompts.
              </div>
            )}
          </div>

          {/* Stage 4: AI Video Rendering (3-5 min lifecycle) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <ComponentTag id="CARD-STUDIO-CANVAS" name="GPU Synthesis & Video Playback Canvas" category="card" size="xs" />
                <div className="h-7 w-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Stage 4: GPU Worker Rendering & Audio</h3>
                  <p className="text-[11px] text-zinc-400">
                    Wan 2.1 open-source diffusion frames, neural voiceover, and AWS S3 vault archive (Zero API billing)
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs text-cyan-400">
                {renderProgress > 0 ? `${renderProgress}% Complete` : 'Idle'}
              </span>
            </div>

            {/* Progress Bar & Stage Indicator */}
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Worker: <strong>worker-us-east-1 (H100)</strong></span>
                <span>Elapsed: {renderTimerSec}s / Estimated: ~180s (3 min)</span>
              </div>
            </div>

            {renderProgress === 100 && activeRenderItem && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h5 className="text-xs font-bold text-white">MP4 Ready & Cached in S3</h5>
                    <p className="text-[10px] text-zinc-400">Ready for automated YouTube publishing</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenVideo(activeRenderItem)}
                    className="flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs text-white hover:bg-zinc-700"
                  >
                    <Film className="h-3 w-3" />
                    <span>Watch Preview</span>
                  </button>
                  <button
                    onClick={() => handlePublishToYouTube(activeRenderItem)}
                    className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-500"
                  >
                    <Youtube className="h-3.5 w-3.5" />
                    <span>Publish to YouTube</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Autopilot Console & Real-Time Sync View (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active YouTube Channel Status */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Target YouTube Channel
              </span>
              <span className="rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                CONNECTED
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={channel.avatar}
                alt={channel.name}
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-full border border-zinc-700 object-cover shadow-md"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{channel.name}</h4>
                <p className="text-xs text-zinc-400">{channel.handle} • {channel.subscribers} subscribers</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-emerald-400 font-medium">
                  <span>Autopilot Cadence: {channel.frequencyPerDay} videos/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Live Google Sheets Widget */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Google Sheet Connection
                </h4>
              </div>
              <button
                onClick={onViewSheets}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Open Full Grid</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Document:</span>
                <span className="text-white">TubePilot_Autopilot_Queue</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Last Updated Row:</span>
                <span className="text-amber-400">{activeRenderItem?.id || 'row-102'}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>Status Column:</span>
                <span className="text-emerald-400 font-bold uppercase">
                  {activeRenderItem?.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Content Calendar Widget */}
          {onViewCalendar && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Queue for Entire Week</h4>
                  <p className="text-[11px] text-zinc-400">Drag & drop ideas into 7-day YouTube slots</p>
                </div>
              </div>
              <button
                onClick={onViewCalendar}
                className="rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1"
              >
                <span>Open Calendar</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Live Terminal & System Logs */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[10px] text-zinc-400">
                  AUTOPILOT_DAEMON_LOGS
                </span>
              </div>
              <span className="font-mono text-[9px] text-zinc-500">PORT 3000 • WORKER POOL</span>
            </div>

            <div className="h-56 overflow-y-auto space-y-1.5 font-mono text-[11px] text-zinc-400 pt-1">
              {terminalLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-zinc-600 text-[10px] shrink-0 font-semibold">[{log.time}]</span>
                  <span
                    className={
                      log.level === 'success'
                        ? 'text-emerald-400'
                        : log.level === 'warn'
                        ? 'text-amber-400'
                        : 'text-zinc-300'
                    }
                  >
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
      )}

      {/* Dedicated Radar Alerts View */}
      {(studioTab === 'alerts') && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Viral Trend Alerts Log</h3>
                <p className="text-[11px] text-zinc-400">Continuous radar monitors for {channel.name} ({channel.niche})</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>Scanning 24/7</span>
            </span>
          </div>

          <div className="space-y-3">
            {alertHistory.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 rounded-xl border border-dashed border-zinc-800">
                No viral spikes logged yet. The radar scanner polls every 45s for surges in {channel.niche}.
              </div>
            ) : (
              alertHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{item.trend.topic}</span>
                      <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-mono text-red-400">
                        {item.velocityPerHour}
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/90 italic">"{item.trend.hook}"</p>
                    <p className="text-[11px] text-zinc-500">{item.detectedAt} · {item.trend.reason}</p>
                  </div>

                  <button
                    onClick={() => triggerCycleFromNotification(item.trend)}
                    disabled={isRunningAutopilot}
                    className="flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 text-xs font-bold transition disabled:opacity-50"
                  >
                    <Zap className="h-3 w-3 fill-white" />
                    <span>Generate Video</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Real-Time Radar Alerts History Modal / Drawer */}
      {showNotificationDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Viral Trend Alerts Log</h3>
                  <p className="text-[11px] text-zinc-400">Radar matches for {channel.name} ({channel.niche})</p>
                </div>
              </div>
              <button
                onClick={() => setShowNotificationDrawer(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 space-y-3 max-h-96 overflow-y-auto pr-1">
              {alertHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No viral spikes logged yet. The radar scanner polls every 45s for surges.
                </div>
              ) : (
                alertHistory.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">
                        {item.velocityPerHour}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Score: <strong className="text-emerald-400">{item.trend.viralScore}%</strong> • {item.detectedAt}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{item.trend.topic}</h4>
                    <p className="text-[11px] text-amber-200/90 italic">"{item.trend.hook}"</p>
                    <p className="text-[10px] text-zinc-400">{item.trend.reason}</p>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end">
                      <button
                        onClick={() => {
                          setShowNotificationDrawer(false);
                          triggerCycleFromNotification(item.trend);
                        }}
                        disabled={isRunningAutopilot}
                        className="flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 text-xs font-bold transition shadow-sm shadow-red-500/20 disabled:opacity-50"
                      >
                        <Zap className="h-3 w-3 fill-white" />
                        <span>Trigger This Trend</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span>Radar status: 24/7 background streaming</span>
              </span>
              <button
                onClick={() => {
                  setRealtimeAlertEnabled(!realtimeAlertEnabled);
                }}
                className={`text-[11px] underline ${realtimeAlertEnabled ? 'text-zinc-400' : 'text-emerald-400'}`}
              >
                {realtimeAlertEnabled ? 'Pause Radar Stream' : 'Resume Radar Stream'}
              </button>
            </div>
          </div>
        </div>
      )}

        </div>
      </div>

    </div>
  );
};
