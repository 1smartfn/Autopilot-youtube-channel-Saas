import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Copy, 
  Check, 
  Tag, 
  Layers, 
  Grid, 
  Download,
  Info,
  Maximize2
} from 'lucide-react';
import { useLayout, ComponentMeta } from '../context/LayoutContext';

interface DirectoryGroup {
  category: string;
  badge: string;
  items: { id: string; name: string; desc: string }[];
}

const MASTER_COMPONENT_CATALOG: DirectoryGroup[] = [
  {
    category: 'Navigation & Bottom Menu Bar',
    badge: 'MENU & DOCK',
    items: [
      { id: 'MENU-BOTTOM-DOCK', name: 'Bottom Full-View Navigation Menu Bar', desc: 'Docked at bottom containing all 7 workspace modules in full view' },
      { id: 'MENU-TOP-SECOND-LINE', name: 'Second Line Navigation Menu Bar', desc: 'Docked as second line below navbar containing all 7 modules' },
      { id: 'NAV-01-DASHBOARD', name: 'Dashboard Module Nav Tab', desc: 'Primary analytics cockpit and multi-channel metrics switch' },
      { id: 'NAV-02-STUDIO', name: 'AutopilotStudio Module Nav Tab', desc: 'Wan 2.1 video generator, prompt synthesis & radar studio' },
      { id: 'NAV-03-SHEETS', name: 'GoogleSheetsViewer Module Nav Tab', desc: 'Live Google Drive synced spreadsheet matrix' },
      { id: 'NAV-04-CALENDAR', name: 'SchedulingCalendar Module Nav Tab', desc: '7-day visual publishing timeline & timeslot scheduler' },
      { id: 'NAV-05-WORKERS', name: 'WorkerClusterView Module Nav Tab', desc: 'GPU cluster farm, thermal nodes & render queue manager' },
      { id: 'NAV-06-S3VAULT', name: 'S3StorageVault Module Nav Tab', desc: 'AWS S3 encrypted video storage, presigned URLs & assets' },
      { id: 'NAV-07-BILLING', name: 'BillingPioneer Module Nav Tab', desc: 'Pioneer Gateway billing, quota management & merchant plans' }
    ]
  },
  {
    category: 'Top Navbar & App Header',
    badge: 'HEADER',
    items: [
      { id: 'SEC-NAVBAR-MAIN', name: 'Top Navbar Ribbon', desc: 'Brand logo, adaptive mobile icons, quick actions & system status' },
      { id: 'CARD-CHANNEL-SELECTOR', name: 'Active YouTube Channel Selector (Drawer Menu)', desc: 'Dropdown inside the 3-line navigation menu to switch managed automation channels' },
      { id: 'BTN-ADD-CLONE-CHANNEL', name: 'Channel Cloner & Creator Button', desc: 'Opens target channel cloner & YouTube upload account creator' },
      { id: 'TOGGLE-AUTOPILOT', name: '24/7 Autopilot Automation Toggle', desc: 'Engages/pauses the automatic video generation loop' },
      { id: 'BTN-EYE-COMFORT', name: 'Optical Eye Comfort Shield Button', desc: 'Opens night shift warmth, OLED dark & blue-light suppression' },
      { id: 'BTN-DIRECTORY-MODAL', name: 'Temporary Component Names Inspector', desc: 'Opens this directory modal to browse and copy all temporary names' },
      { id: 'BTN-RESET-LAYOUTS', name: 'Reset Layouts to Default Button', desc: 'Restores default sizes, widths and positions across all views' }
    ]
  },
  {
    category: 'Dashboard View (Cockpit & Analytics)',
    badge: 'DASHBOARD',
    items: [
      { id: 'SEC-DASH-HEADER', name: 'Dashboard Header Bar', desc: 'Channel snapshot title, channel avatar & sub-tab switcher' },
      { id: 'SEC-DASH-TABS', name: 'Dashboard View Switcher', desc: 'Sub-tabs: Overview, Channels, Top Videos, Activity Stream, All' },
      { id: 'STRIP-KPI-METRICS', name: 'Realtime KPI Metrics Strip', desc: 'Grid of key performance metrics across managed channels' },
      { id: 'CARD-KPI-SUBS', name: 'Total Subscribers Metric Card', desc: 'Shows network subscriber count and daily growth rate' },
      { id: 'CARD-KPI-VIEWS', name: 'Total Views Metric Card', desc: 'Shows 30-day views with viral momentum indicators' },
      { id: 'CARD-KPI-OUTPUT', name: 'Automated Output Metric Card', desc: 'Shows generated shorts volume and pipeline velocity' },
      { id: 'CARD-KPI-RETENTION', name: 'Audience Retention Metric Card', desc: 'Shows average percentage viewed across shorts' },
      { id: 'CARD-KPI-CTR', name: 'Click Through Rate Metric Card', desc: 'Shows thumbnail click-through percentage across feed' },
      { id: 'CARD-KPI-REVENUE', name: 'Estimated Revenue Metric Card', desc: 'Shows estimated YouTube AdSense revenue earnings' },
      { id: 'CARD-DASH-CHART', name: 'Channel Growth Velocity & Retention Chart', desc: 'Interactive curve of views, subscriber surge & audience hold' },
      { id: 'CARD-DASH-QUICK-SUMMARY', name: 'Automated Pipeline Snapshot Card', desc: 'Counts for queued, rendering, uploaded and scheduled videos' },
      { id: 'CARD-DASH-NICHE-BREAKDOWN', name: 'Niche Portfolio Distribution Matrix', desc: 'Breakdown of videos & views by niche (AI, Space, Stoic)' },
      { id: 'CARD-DASH-CHANNEL-CARDS', name: 'Managed Channels Portfolio Cards', desc: 'Status and autopilot cadence per connected YouTube channel' },
      { id: 'CARD-DASH-VIRAL-FEED', name: 'Top Performing Viral Shorts Leaderboard', desc: 'Ranked video reel with play button, CTR & views' },
      { id: 'CARD-DASH-DISPATCH-ACTIONS', name: 'Workspace Quick Dispatch Ribbon', desc: 'One-click launch buttons for Studio, Calendar, Sheets, Workers' },
      { id: 'CARD-DASH-ACTIVITY-LOG', name: 'Live Cluster Activity Stream Card', desc: 'Realtime feed of render dispatches, upload events & warnings' }
    ]
  },
  {
    category: 'Autopilot Studio (Wan 2.1 AI Engine)',
    badge: 'STUDIO',
    items: [
      { id: 'SEC-STUDIO-HEADER', name: 'Autopilot Studio Header Ribbon', desc: 'Mode switcher (Cloner, Pipeline, Radar, Alerts, All) and Launch' },
      { id: 'CARD-STUDIO-ALERT', name: 'Realtime Viral Alert Toast Banner', desc: 'Flash notification when a viral surge is detected on YouTube' },
      { id: 'CARD-STUDIO-CLONER', name: 'Target Channel Cloner & Idea Extractor', desc: 'Inspects top competitor channels and extracts viral video formulas' },
      { id: 'CARD-STUDIO-PIPELINE', name: 'Active 5-Stage Video Pipeline Runner', desc: 'Visual 5-stage stepper (Radar -> Script -> Wan 2.1 -> S3 -> Publish)' },
      { id: 'CARD-STUDIO-RADAR', name: 'Real-Time Trend Intelligence Radar', desc: 'Live score table of viral angles with suggested Wan 2.1 prompts' },
      { id: 'CARD-STUDIO-PROMPT-ENGINE', name: 'Cinematic Prompt & Script Generator Card', desc: 'Wan 2.1 physics prompt builder, 3-scene script & YouTube SEO tags' },
      { id: 'CARD-STUDIO-CANVAS', name: 'Master Video Canvas & Synthesis Player Card', desc: 'Live video playback, MP4 download, aspect ratio preview' }
    ]
  },
  {
    category: 'Scheduling Calendar (7-Day Matrix)',
    badge: 'CALENDAR',
    items: [
      { id: 'SEC-CALENDAR-HEADER', name: 'Scheduling Calendar Controls Header', desc: 'Weekly date switcher, publishing cadence & filter triggers' },
      { id: 'CARD-CALENDAR-BACKLOG', name: 'Unscheduled Pipeline Backlog Queue', desc: 'Draggable video cards ready to be dropped into publishing timeslots' },
      { id: 'CARD-CALENDAR-MATRIX', name: '7-Day Publishing Timeslot Grid', desc: 'Matrix columns for Monday-Sunday with drop targets and scheduled cards' },
      { id: 'CARD-CALENDAR-SUMMARY', name: 'Calendar Cadence Telemetry Cards', desc: 'Cards showing total scheduled, daily frequency, and auto-dispatch status' }
    ]
  },
  {
    category: 'Google Sheets Viewer (Drive Synced)',
    badge: 'SHEETS',
    items: [
      { id: 'SEC-SHEETS-HEADER', name: 'Google Sheets Viewer Controls Ribbon', desc: 'Spreadsheet connection status, Drive sync button & search input' },
      { id: 'CARD-SHEETS-TOOLBAR', name: 'Batch Action & Selection Toolbar', desc: 'Select all, batch delete, batch re-render, batch reassign channel' },
      { id: 'CARD-SHEETS-TABLE', name: 'Interactive Video Data Grid Table', desc: 'Full editable table of IDs, status, niche, topics, prompts & URLs' },
      { id: 'CARD-SHEETS-PAGINATION', name: 'Sheets Pagination & Row Counter Strip', desc: 'Row count, export CSV, and page navigation controls' }
    ]
  },
  {
    category: 'Worker Cluster View (GPU Render Farm)',
    badge: 'WORKERS',
    items: [
      { id: 'SEC-WORKERS-HEADER', name: 'Worker Cluster Telemetry Header', desc: 'GPU farm overall health, VRAM utilization & active queue counter' },
      { id: 'CARD-WORKERS-METRICS', name: 'GPU Cluster Performance Metrics Grid', desc: 'Cluster nodes count, average render time, thermal status, total VRAM' },
      { id: 'CARD-WORKERS-NODES-GRID', name: 'Individual Worker GPU Node Cards', desc: 'Realtime cards for RTX 4090 / H100 instances with temps & workloads' },
      { id: 'CARD-WORKERS-JOB-STREAM', name: 'Active GPU Render Jobs Table', desc: 'Live list of videos actively being synthesized with progress bars' }
    ]
  },
  {
    category: 'S3 Storage Vault (Asset Repository)',
    badge: 'S3 VAULT',
    items: [
      { id: 'SEC-S3-HEADER', name: 'S3 Storage Vault Controls Header', desc: 'KMS encryption badge, bucket region & presigned link generator' },
      { id: 'CARD-S3-METRICS', name: 'S3 Storage Quota & Capacity Cards', desc: 'Total GB stored, master MP4 count, audio stems & thumbnail assets' },
      { id: 'CARD-S3-TABLE', name: 'S3 Bucket Asset Files Table', desc: 'Listing of master video MP4s, byte sizes, upload dates & direct links' }
    ]
  },
  {
    category: 'Billing Pioneer (Merchant Gateway)',
    badge: 'BILLING',
    items: [
      { id: 'SEC-BILLING-HEADER', name: 'Pioneer Gateway Status Header', desc: 'Active merchant ID, customer account ID & current plan badge' },
      { id: 'CARD-BILLING-METRICS', name: 'Subscription Quota & Concurrency Cards', desc: 'Videos generated this billing cycle, remaining quota, concurrency limits' },
      { id: 'CARD-BILLING-TIERS', name: 'Pioneer Subscription Tier Selector Cards', desc: 'Free, Pro Autopilot, Agency Fleet plan cards with upgrade buttons' },
      { id: 'CARD-BILLING-INVOICES', name: 'Pioneer Invoices & Billing History Table', desc: 'Past paid receipts, billing dates, amounts and PDF invoice links' }
    ]
  },
  {
    category: 'Modals & Floating Panels',
    badge: 'MODALS',
    items: [
      { id: 'MODAL-VIDEO-PLAYER', name: 'Master Video Player Modal', desc: 'Popup for viewing rendered MP4 video with full metadata & copy URL' },
      { id: 'MODAL-PROMPT-INSPECTOR', name: 'Wan 2.1 Prompt Inspector Modal', desc: 'Popup displaying full cinematic prompt recipe and scene breakdowns' },
      { id: 'MODAL-EYE-COMFORT', name: 'Optical Eye Comfort Shield Modal', desc: 'Slider for color warmth, OLED true dark, contrast & blue-light filter' },
      { id: 'MODAL-CHANNEL-CLONER', name: 'Target Channel Cloner & Uploader Modal', desc: 'Interface to enter target channel URL or register new upload accounts' }
    ]
  }
];

export const ComponentDirectoryModal: React.FC = () => {
  const { showDirectoryModal, setShowDirectoryModal, copyTag, copiedTag } = useLayout();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedAll, setCopiedAll] = useState(false);

  if (!showDirectoryModal) return null;

  const filteredGroups = MASTER_COMPONENT_CATALOG.map((group) => {
    if (selectedCategory !== 'ALL' && group.category !== selectedCategory) {
      return null;
    }
    const filteredItems = group.items.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      );
    });
    if (filteredItems.length === 0) return null;
    return { ...group, items: filteredItems };
  }).filter(Boolean) as DirectoryGroup[];

  const totalItemCount = MASTER_COMPONENT_CATALOG.reduce((acc, g) => acc + g.items.length, 0);

  const handleCopyAllAsMarkdown = () => {
    let md = '# TubePilot Component Names Reference Catalog\n\n';
    MASTER_COMPONENT_CATALOG.forEach((group) => {
      md += `## ${group.category}\n`;
      group.items.forEach((item) => {
        md += `- **[${item.id}]** - ${item.name}: ${item.desc}\n`;
      });
      md += '\n';
    });
    navigator.clipboard?.writeText(md).catch(() => {});
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-700 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Temporary Component Names Directory
                </h2>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-300 border border-amber-500/30">
                  {totalItemCount} Items
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Exact temporary names to tell what needs improvement. Click any tag to copy it instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllAsMarkdown}
              title="Copy entire reference catalog as formatted Markdown"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition"
            >
              {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Download className="h-3.5 w-3.5 text-amber-400" />}
              <span className="hidden sm:inline">{copiedAll ? 'Copied All!' : 'Copy All (MD)'}</span>
            </button>

            <button
              onClick={() => setShowDirectoryModal(false)}
              className="rounded-xl p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="border-b border-zinc-800/80 bg-zinc-900/40 px-5 py-3 shrink-0 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components by ID, name or function..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">All Categories ({MASTER_COMPONENT_CATALOG.length})</option>
              {MASTER_COMPONENT_CATALOG.map((g) => (
                <option key={g.category} value={g.category}>
                  {g.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List of Components Grouped */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <Info className="h-8 w-8 mx-auto text-zinc-600" />
              <p className="text-sm">No components found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category} className="space-y-2.5">
                {/* Group Heading */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-zinc-400">
                      {group.badge}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-200">
                      {group.category}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {group.items.length} items
                  </span>
                </div>

                {/* Items in Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {group.items.map((item) => {
                    const isCopied = copiedTag === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => copyTag(item.id)}
                        className={`group relative flex items-start justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-500/20'
                            : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          {/* Exact Tag ID */}
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                              [{item.id}]
                            </span>
                            {isCopied && (
                              <span className="text-[10px] font-bold text-emerald-400 animate-in fade-in">
                                Copied!
                              </span>
                            )}
                          </div>

                          {/* Component Descriptive Name */}
                          <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                            {item.name}
                          </div>

                          {/* Function description */}
                          <p className="text-[11px] text-zinc-400 line-clamp-2">
                            {item.desc}
                          </p>
                        </div>

                        {/* Copy button */}
                        <button
                          type="button"
                          className={`shrink-0 rounded-lg p-1.5 transition ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-zinc-800 text-zinc-400 group-hover:text-amber-300 group-hover:bg-amber-500/20'
                          }`}
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer Help Strip */}
        <div className="border-t border-zinc-800 bg-zinc-900/60 px-5 py-3 text-xs text-zinc-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>
              Tip: Paste any component name like <strong>[CARD-KPI-VIEWS]</strong> directly in your prompt to specify what to improve.
            </span>
          </div>
          <button
            onClick={() => setShowDirectoryModal(false)}
            className="font-semibold text-amber-400 hover:underline"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
