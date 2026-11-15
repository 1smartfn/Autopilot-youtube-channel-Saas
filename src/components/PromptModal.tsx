import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Film, Camera, ShieldCheck } from 'lucide-react';

interface PromptModalProps {
  prompt: string;
  title: string;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ prompt, title, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Wan 2.1 Free AI Video Prompt</h3>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                  100% Free • Open Source
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-1">{title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="my-4 space-y-3">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 font-mono text-xs text-zinc-200 leading-relaxed max-h-80 overflow-y-auto selection:bg-amber-500/30">
            {prompt}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-zinc-400">
            <div className="rounded bg-zinc-900 p-2 border border-zinc-800/80">
              <span className="text-zinc-500 block text-[9px] uppercase">Model</span>
              <span className="text-emerald-400 font-semibold">wan-2.1-t2v-14b</span>
            </div>
            <div className="rounded bg-zinc-900 p-2 border border-zinc-800/80">
              <span className="text-zinc-500 block text-[9px] uppercase">License / Cost</span>
              <span className="text-white font-semibold">Apache 2.0 ($0.00)</span>
            </div>
            <div className="rounded bg-zinc-900 p-2 border border-zinc-800/80">
              <span className="text-zinc-500 block text-[9px] uppercase">Resolution</span>
              <span className="text-cyan-400 font-semibold">1080p / 4K UHD</span>
            </div>
            <div className="rounded bg-zinc-900 p-2 border border-zinc-800/80">
              <span className="text-zinc-500 block text-[9px] uppercase">Frame Rate</span>
              <span className="text-amber-400 font-semibold">60 fps Cinema</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Zero API fees • Deployed on open GPU cluster</span>
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Prompt!' : 'Copy Prompt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
