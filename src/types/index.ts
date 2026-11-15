export interface ScriptScene {
  sceneNumber: number;
  visual: string;
  narration: string;
  durationSec: number;
}

export interface VideoScript {
  hook: string;
  scenes: ScriptScene[];
  callToAction: string;
}

export interface YouTubeMetadata {
  title: string;
  altTitles?: string[];
  description: string;
  tags: string[];
  category: string;
  thumbnailVisualPrompt?: string;
}

export interface PipelineItem {
  id: string;
  userId: string;
  channelId: string;
  niche: string;
  topic: string;
  viralScore: number;
  hook: string;
  veoPrompt: string; // backwards compatibility
  videoPrompt?: string; // Wan 2.1 Free Open Video AI prompt
  script: VideoScript;
  youtubeMetadata: YouTubeMetadata;
  s3VideoUrl?: string;
  thumbnailUrl: string;
  status: 'idea_logged' | 'veo_queued' | 'rendering' | 's3_uploaded' | 'youtube_uploaded';
  youtubeVideoId: string;
  renderProgress: number;
  workerId?: string;
  createdAt: string;
  uploadedAt?: string;
  scheduledPublishTime?: string; // ISO date string e.g. 2026-09-28T14:00:00.000Z
  isScheduled?: boolean;
}

export interface TrendItem {
  topic: string;
  hook: string;
  viralScore: number;
  reason: string;
  angle: string;
  suggestedVeoPrompt: string; // backwards compatibility
  suggestedVideoPrompt?: string; // Wan 2.1 prompt
}

export interface WorkerNode {
  id: string;
  region: string;
  specs: string;
  status: 'online' | 'busy' | 'offline';
  currentLoadPercent: number;
  activeJobs: number;
  maxSlots: number;
  completedToday: number;
  avgRenderSpeed: string;
}

export interface S3File {
  key: string;
  sizeBytes: number;
  type: string;
  uploadedAt: string;
  presignedUrl: string;
  encryption: string;
}

export interface Invoice {
  id: string;
  amount: string;
  date: string;
  status: string;
  plan: string;
  processor: string;
}

export interface BillingState {
  currentTier: 'free' | 'pro' | 'agency';
  pioneerMerchantId: string;
  pioneerCustomerId: string;
  status: string;
  currentPeriodEnd: string;
  quotaTotal: number;
  quotaUsed: number;
  concurrentLimit: number;
  invoices: Invoice[];
}

export interface TargetChannelAnalysis {
  channelName: string;
  handle: string;
  niche: string;
  subscribers: string;
  avatarUrl: string;
  targetUrl: string;
  analyzedAt: string;
  viralFormula: string;
  pacingStyle: string;
  visualDna: string;
  wan21PromptRecipe: string;
  contentPillars: string[];
  clonedVideoIdeas: TrendItem[];
}

export type NavigationTab = 'dashboard' | 'studio' | 'calendar' | 'sheets' | 'workers' | 's3' | 'billing';

export type ActivityEventType = 
  | 'render_complete'
  | 'channel_upload'
  | 'worker_failure'
  | 'worker_recovery'
  | 'trend_discovered'
  | 's3_archived'
  | 'schedule_dispatch';

export interface ActivityLogEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string; // ISO string
  channelId?: string;
  channelName?: string;
  channelAvatar?: string;
  videoId?: string;
  videoTopic?: string;
  workerId?: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  metadata?: {
    durationSec?: number;
    viralScore?: number;
    youtubeUrl?: string;
    youtubeId?: string;
    s3Url?: string;
    errorReason?: string;
    workerNode?: string;
    renderTimeSec?: number;
    retryCount?: number;
    failoverNode?: string;
    viewsVelocity?: string;
  };
}

export interface YouTubeChannel {
  id: string;
  name: string;
  handle: string;
  subscribers: string;
  niche: string;
  avatar: string;
  autopilotEnabled: boolean;
  frequencyPerDay: number;
  targetChannelUrl?: string;
  targetAnalysis?: TargetChannelAnalysis;
  uploadStatus?: 'connected' | 'pending_auth' | 'live';
  totalUploadedVideos?: number;
}

export type ThemeId = 'warm-amber' | 'deep-slate' | 'forest-sage' | 'espresso-copper' | 'paper-warm';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  eyeCareBenefit: string;
  blueLightReduction: string;
  spectrumKelvin: string;
  mode: 'dark' | 'light';
  colors: {
    bg: string;
    surface: string;
    card: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
    accentGlow: string;
  };
}

export interface EyeComfortSettings {
  themeId: ThemeId;
  eyeProtectionActive: boolean;
  warmthLevel: number; // 0 - 100%
  softenContrast: boolean;
  reducedGlare: boolean;
}
