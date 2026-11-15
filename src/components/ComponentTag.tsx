import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useLayout } from '../context/LayoutContext';

export interface ComponentTagProps {
  id: string; // e.g. "CARD-KPI-SUBS"
  name?: string; // Optional human descriptive label e.g. "Subscribers KPI Metric"
  category?: 'card' | 'section' | 'menu' | 'toolbar' | 'button' | 'modal' | 'metric';
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const ComponentTag: React.FC<ComponentTagProps> = ({
  id,
  name,
  category = 'card',
  className = '',
  size = 'sm'
}) => {
  const { showComponentTags, copyTag, copiedTag, registerComponent } = useLayout();

  // Register in directory on render
  React.useEffect(() => {
    registerComponent({
      id,
      name: name || id,
      category,
      description: name || `Component element [${id}]`
    });
  }, [id, name, category, registerComponent]);

  if (!showComponentTags) return null;

  const isCopied = copiedTag === id;

  // Visual category styling
  const categoryStyles = {
    card: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border-amber-500/35 hover:border-amber-500/60',
    section: 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 hover:text-cyan-200 border-cyan-500/35 hover:border-cyan-500/60',
    menu: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border-emerald-500/35 hover:border-emerald-500/60',
    toolbar: 'bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 hover:text-violet-200 border-violet-500/35 hover:border-violet-500/60',
    button: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border-rose-500/35 hover:border-rose-500/60',
    modal: 'bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 hover:text-fuchsia-200 border-fuchsia-500/35 hover:border-fuchsia-500/60',
    metric: 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 hover:text-teal-200 border-teal-500/35 hover:border-teal-500/60'
  }[category];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        copyTag(id);
      }}
      title={`Temporary Name: [${id}]${name ? ` - ${name}` : ''}. Click to copy name for feedback.`}
      className={`group/tag inline-flex items-center gap-1 font-mono font-bold tracking-tight rounded-md border transition-all cursor-pointer select-all shrink-0 ${
        isCopied
          ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400'
          : categoryStyles
      } ${
        size === 'xs'
          ? 'text-[8.5px] px-1 py-0.2 leading-tight'
          : size === 'sm'
          ? 'text-[9.5px] px-1.5 py-0.5 leading-tight'
          : 'text-[11px] px-2 py-0.5'
      } ${className}`}
    >
      <span className="opacity-60">[</span>
      <span>{id}</span>
      <span className="opacity-60">]</span>
      {isCopied ? (
        <Check className="h-2.5 w-2.5 text-emerald-300 shrink-0" />
      ) : (
        <Copy className="h-2.5 w-2.5 opacity-60 group-hover/tag:opacity-100 shrink-0 transition-opacity" />
      )}
    </button>
  );
};
