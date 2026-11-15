import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Youtube, 
  HardDrive, 
  Sparkles, 
  CheckCircle2, 
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { PipelineItem } from '../types';

interface VideoPlayerModalProps {
  item: PipelineItem | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [progressSec, setProgressSec] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const scenes = item.script?.scenes || [
    { sceneNumber: 1, visual: 'Dramatic wide cinematic camera shot', narration: item.hook, durationSec: 5 },
    { sceneNumber: 2, visual: 'Deep analysis of the breakthrough and mechanics', narration: item.topic, durationSec: 5 },
    { sceneNumber: 3, visual: 'Call to action and futuristic closing sequence', narration: item.script?.callToAction || 'Subscribe for more daily autopilot breakthroughs!', durationSec: 4 }
  ];

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSec, 0);

  // Web Speech API Voiceover Synthesizer
  const speakCurrentScene = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis warning:', e);
    }
  };

  // Canvas visual rendering loop for the simulated Veo neural video
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = Date.now();

    const renderFrame = () => {
      const now = Date.now();
      const elapsedSec = (now - startTime) / 1000;
      
      const width = canvas.width;
      const height = canvas.height;

      // Draw rich dynamic background simulating cinematic camera motion
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      const hueShift = (elapsedSec * 15) % 360;
      gradient.addColorStop(0, `hsl(${hueShift}, 50%, 8%)`);
      gradient.addColorStop(0.5, `hsl(${(hueShift + 40) % 360}, 60%, 14%)`);
      gradient.addColorStop(1, `hsl(${(hueShift + 80) % 360}, 70%, 6%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw futuristic grid & particle dust motes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      const offsetY = (elapsedSec * 20) % gridSize;
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw floating glowing orbs (Veo neural synthesis visualization)
      for (let i = 0; i < 6; i++) {
        const angle = elapsedSec * 0.8 + i * (Math.PI / 3);
        const radius = 90 + Math.sin(elapsedSec * 2 + i) * 30;
        const cx = width / 2 + Math.cos(angle) * radius;
        const cy = height / 2 - 40 + Math.sin(angle) * radius;

        const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
        orbGrad.addColorStop(0, `hsla(${(hueShift + i * 50) % 360}, 80%, 60%, 0.4)`);
        orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw cinematic 3D focal circle
      ctx.save();
      ctx.translate(width / 2, height / 2 - 40);
      ctx.rotate(elapsedSec * 0.2);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Top Header: Niche & Quality Badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.niche.toUpperCase(), 30, 45);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('GOOGLE VEO 3.1 • 4K 60FPS', width - 30, 45);

      // Active Scene visual description
      const activeScene = scenes[currentSceneIdx] || scenes[0];
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`SCENE ${activeScene.sceneNumber} / ${scenes.length}`, width / 2, height / 2 - 130);

      // Subtitles & Narration Karaoke Bar at the bottom
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.roundRect(24, height - 160, width - 48, 100, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      // Subtitle text (wrapped)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';

      const words = activeScene.narration.split(' ');
      let line = '';
      let lineY = height - 120;
      for (let w of words) {
        const testLine = line + w + ' ';
        if (ctx.measureText(testLine).width > width - 80) {
          ctx.fillText(line, width / 2, lineY);
          line = w + ' ';
          lineY += 24;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, lineY);

      // Soundwave visualizer bar
      ctx.fillStyle = '#10b981';
      for (let b = 0; b < 24; b++) {
        const barH = 5 + Math.abs(Math.sin(elapsedSec * 6 + b)) * 18;
        ctx.fillRect(width / 2 - 100 + b * 9, height - 45, 5, -barH);
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentSceneIdx, item]);

  // Scene auto-advance timer
  useEffect(() => {
    if (!isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const currentDuration = scenes[currentSceneIdx]?.durationSec || 5;
    speakCurrentScene(scenes[currentSceneIdx]?.narration || '');

    const timer = setInterval(() => {
      setProgressSec((prev) => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          setCurrentSceneIdx(0);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    const sceneTimer = setTimeout(() => {
      if (currentSceneIdx < scenes.length - 1) {
        setCurrentSceneIdx((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentSceneIdx(0);
        setProgressSec(0);
      }
    }, currentDuration * 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(sceneTimer);
    };
  }, [isPlaying, currentSceneIdx]);

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      speakCurrentScene(scenes[currentSceneIdx]?.narration || '');
    } else {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://youtu.be/${item.youtubeVideoId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
              <Youtube className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                {item.topic}
              </h2>
              <p className="text-[11px] text-zinc-400">
                Generated via Google Veo 3.1 & Synced to AWS S3 / YouTube
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video Canvas & Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Canvas Video Output Column (9:16 Shorts aspect) */}
          <div className="md:col-span-6 bg-zinc-900 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-zinc-800">
            <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 bg-black">
              <canvas
                ref={canvasRef}
                width={360}
                height={640}
                className="w-full h-full object-cover"
              />

              {/* Play Overlay Button if paused */}
              {!isPlaying && (
                <div 
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 cursor-pointer transition"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/40 hover:scale-105 transition">
                    <Play className="h-8 w-8 ml-1" />
                  </div>
                </div>
              )}

              {/* Controls bar overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-lg bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs text-white">
                <button onClick={togglePlay} className="hover:text-red-400">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                <span className="text-[11px] font-mono text-zinc-300">
                  {progressSec}s / {totalDuration}s
                </span>

                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="hover:text-amber-400"
                  title={isMuted ? 'Unmute AI Voiceover' : 'Mute Voiceover'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
                </button>
              </div>
            </div>

            <p className="mt-2 text-[10px] text-zinc-500 text-center">
              Rendered on cluster worker node • AI voiceover synthesized live
            </p>
          </div>

          {/* YouTube & Storage Metadata Column */}
          <div className="md:col-span-6 p-5 space-y-4 overflow-y-auto max-h-[550px]">
            
            {/* YouTube Live Status Card */}
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                  <Youtube className="h-4 w-4" /> YouTube Autopilot Status
                </span>
                <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  UPLOADED & LOGGED
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white">
                {item.youtubeMetadata?.title || item.topic}
              </h3>

              <div className="flex items-center gap-3 pt-1 text-xs">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-zinc-400 hover:text-white"
                >
                  {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>Copy Video Link</span>
                </button>
                <a
                  href={`https://youtu.be/${item.youtubeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-red-400 hover:underline"
                >
                  <Share2 className="h-3 w-3" />
                  <span>Open Watch Page</span>
                </a>
              </div>
            </div>

            {/* Script & Storyboard Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Scene Storyboard & Narration
              </h4>
              <div className="space-y-2">
                {scenes.map((scene, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentSceneIdx(idx);
                      speakCurrentScene(scene.narration);
                    }}
                    className={`rounded-lg border p-3 cursor-pointer transition ${
                      currentSceneIdx === idx
                        ? 'border-amber-500/60 bg-amber-950/20'
                        : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                      <span>Scene {scene.sceneNumber} ({scene.durationSec}s)</span>
                      <span className="text-amber-400 font-mono">Veo Camera Keyframe</span>
                    </div>
                    <p className="text-xs text-zinc-200">
                      <strong>Visual: </strong>{scene.visual}
                    </p>
                    <p className="mt-1 text-xs italic text-amber-200/90">
                      "{scene.narration}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AWS S3 Object Details */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-1.5 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <HardDrive className="h-3.5 w-3.5 text-violet-400" />
                <span className="font-semibold text-zinc-300">AWS S3 Master Asset:</span>
              </div>
              <div className="text-[11px] text-zinc-400 break-all bg-zinc-950 p-2 rounded border border-zinc-800">
                {item.s3VideoUrl}
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
                <span>Encryption: AES-256 (KMS)</span>
                <span>Size: 48.9 MB</span>
              </div>
            </div>

            {/* YouTube Tags */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Automated SEO Hashtags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(item.youtubeMetadata?.tags || ['#shorts', '#ai', '#trending']).map((tag, i) => (
                  <span
                    key={i}
                    className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-300 border border-zinc-700/60"
                  >
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
