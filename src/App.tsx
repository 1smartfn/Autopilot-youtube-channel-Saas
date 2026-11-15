/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AutopilotStudio } from './components/AutopilotStudio';
import { GoogleSheetsViewer } from './components/GoogleSheetsViewer';
import { WorkerClusterView } from './components/WorkerClusterView';
import { S3StorageVault } from './components/S3StorageVault';
import { BillingPioneer } from './components/BillingPioneer';
import { SchedulingCalendar } from './components/SchedulingCalendar';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PromptModal } from './components/PromptModal';
import { EyeComfortModal } from './components/EyeComfortModal';
import { ChannelManagerModal } from './components/ChannelManagerModal';
import { Dashboard } from './components/Dashboard';
import { BottomNavMenu } from './components/BottomNavMenu';
import { ComponentDirectoryModal } from './components/ComponentDirectoryModal';
import { LayoutProvider, useLayout } from './context/LayoutContext';
import { PipelineItem, WorkerNode, BillingState, S3File, YouTubeChannel, EyeComfortSettings, TrendItem, NavigationTab } from './types';
import { loadEyeComfortSettings, saveEyeComfortSettings, applyThemeToDom } from './utils/themeManager';

function AppContent() {
  const { menuPosition } = useLayout();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [autopilotActive, setAutopilotActive] = useState<boolean>(true);

  // Eye Comfort & Professional Theme State
  const [eyeComfortSettings, setEyeComfortSettings] = useState<EyeComfortSettings>(() => loadEyeComfortSettings());
  const [showEyeComfortModal, setShowEyeComfortModal] = useState<boolean>(false);

  // Apply theme & eye protection to DOM on settings change
  useEffect(() => {
    applyThemeToDom(eyeComfortSettings);
    saveEyeComfortSettings(eyeComfortSettings);
  }, [eyeComfortSettings]);

  // Core Data States
  const [rows, setRows] = useState<PipelineItem[]>([]);
  const [cluster, setCluster] = useState<WorkerNode[]>([]);
  const [billing, setBilling] = useState<BillingState>({
    currentTier: 'pro',
    pioneerMerchantId: 'pnr_mch_99214_live',
    pioneerCustomerId: 'pnr_cus_alex_742',
    status: 'active',
    currentPeriodEnd: '2026-10-27T00:00:00Z',
    quotaTotal: 60,
    quotaUsed: 14,
    concurrentLimit: 4,
    invoices: [
      {
        id: 'inv_pnr_88192',
        amount: '$49.00',
        date: '2026-09-01',
        status: 'paid',
        plan: 'Pro Autopilot (Monthly)',
        processor: 'Pioneer Gateway'
      }
    ]
  });
  const [s3Files, setS3Files] = useState<S3File[]>([]);

  // YouTube Channels
  const [channels, setChannels] = useState<YouTubeChannel[]>([
    {
      id: 'chan_tech_future',
      name: 'Future Pulse Tech',
      handle: '@futurepulsetech',
      subscribers: '142K',
      niche: 'AI & Robotics',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      autopilotEnabled: true,
      frequencyPerDay: 2
    },
    {
      id: 'chan_cosmos_deep',
      name: 'Cosmos Horizon',
      handle: '@cosmoshorizon',
      subscribers: '89K',
      niche: 'Space & Astronomy',
      avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80',
      autopilotEnabled: true,
      frequencyPerDay: 1
    },
    {
      id: 'chan_stoic_mind',
      name: 'Stoic Modernist',
      handle: '@stoicmodernist',
      subscribers: '215K',
      niche: 'Philosophy & Stoicism',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
      autopilotEnabled: false,
      frequencyPerDay: 3
    }
  ]);

  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel>(channels[0]);

  // Channel Manager Modal State
  const [showChannelManagerModal, setShowChannelManagerModal] = useState<boolean>(false);
  const [channelManagerTab, setChannelManagerTab] = useState<'clone' | 'upload'>('clone');
  const [incomingClonedTrend, setIncomingClonedTrend] = useState<TrendItem | null>(null);

  // Modals
  const [activeVideoModal, setActiveVideoModal] = useState<PipelineItem | null>(null);
  const [activePromptModal, setActivePromptModal] = useState<{ prompt: string; title: string } | null>(null);

  // Fetch initial data
  useEffect(() => {
    // 0. Fetch Channels
    fetch('/api/channels')
      .then((res) => res.json())
      .then((data) => {
        if (data.channels && data.channels.length > 0) {
          setChannels(data.channels);
          setSelectedChannel(data.channels[0]);
        }
      })
      .catch((err) => console.warn('Channel fetch notice:', err));

    // 1. Fetch Google Sheets rows
    fetch('/api/sheets/rows')
      .then((res) => res.json())
      .then((data) => {
        if (data.rows) setRows(data.rows);
      })
      .catch((err) => console.warn('Sheets fetch notice:', err));

    // 2. Fetch Worker Cluster
    fetch('/api/workers/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.cluster) setCluster(data.cluster);
      })
      .catch((err) => console.warn('Workers fetch notice:', err));

    // 3. Fetch Pioneer Billing
    fetch('/api/billing/pioneer')
      .then((res) => res.json())
      .then((data) => {
        if (data.billing) setBilling(data.billing);
      })
      .catch((err) => console.warn('Billing fetch notice:', err));

    // 4. Fetch S3 Vault
    fetch('/api/s3/vault')
      .then((res) => res.json())
      .then((data) => {
        if (data.files) setS3Files(data.files);
      })
      .catch((err) => console.warn('S3 vault fetch notice:', err));
  }, []);

  // Add a newly created upload channel
  const handleAddChannel = (newChannel: YouTubeChannel) => {
    setChannels((prev) => [newChannel, ...prev]);
    setSelectedChannel(newChannel);

    fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChannel)
    }).catch((e) => console.warn('Persist channel notice:', e));
  };

  // Deploy cloned idea from target channel
  const handleDeployClonedIdea = (trend: TrendItem) => {
    setIncomingClonedTrend(trend);
    setActiveTab('studio');
  };

  // Reorder queued video tasks (e.g. from SchedulingCalendar drag-and-drop prioritization)
  const handleReorderRows = (reorderedRows: PipelineItem[]) => {
    setRows(reorderedRows);
    const itemIds = reorderedRows.map((r) => r.id);
    fetch('/api/sheets/rows/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds })
    }).catch((err) => console.warn('Sync reordered rows notice:', err));
  };

  // Batch delete videos
  const handleBatchDeleteRows = async (rowIds: string[]) => {
    setRows((prev) => prev.filter((r) => !rowIds.includes(r.id)));
    try {
      await fetch('/api/sheets/rows/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: rowIds })
      });
    } catch (err) {
      console.warn('Batch delete notice:', err);
    }
  };

  // Batch re-render videos on Wan 2.1 GPU cluster
  const handleBatchRerenderRows = async (rowIds: string[]) => {
    setRows((prev) =>
      prev.map((r) =>
        rowIds.includes(r.id)
          ? { ...r, status: 'veo_queued' as const, renderProgress: 0, s3VideoUrl: undefined }
          : r
      )
    );
    try {
      await fetch('/api/sheets/rows/batch-rerender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: rowIds })
      });
    } catch (err) {
      console.warn('Batch re-render notice:', err);
    }
  };

  // Batch reassign videos to target channel
  const handleBatchReassignChannel = async (rowIds: string[], targetChannelId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        rowIds.includes(r.id) ? { ...r, channelId: targetChannelId } : r
      )
    );
    try {
      await fetch('/api/sheets/rows/batch-reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: rowIds, channelId: targetChannelId })
      });
    } catch (err) {
      console.warn('Batch reassign notice:', err);
    }
  };

  // Handle new item created in pipeline
  const handleItemGenerated = (newItem: PipelineItem) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === newItem.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newItem;
        return copy;
      }
      return [newItem, ...prev];
    });

    // Add to S3 file list if S3 url exists
    if (newItem.s3VideoUrl) {
      const newS3File: S3File = {
        key: `usr_premium_01/master_1080p/${newItem.id}_veo_master.mp4`,
        sizeBytes: 48920110,
        type: 'video/mp4',
        uploadedAt: new Date().toISOString(),
        presignedUrl: newItem.s3VideoUrl,
        encryption: 'AES-256 (SSE-S3)'
      };
      setS3Files((prev) => [newS3File, ...prev]);
    }
  };

  const handleUpdateRow = (rowId: string, updates: Partial<PipelineItem>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, ...updates } : r))
    );
  };

  const handleUpgradeTier = async (targetTier: 'free' | 'pro' | 'agency') => {
    try {
      const res = await fetch('/api/billing/pioneer/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier })
      });
      const data = await res.json();
      if (data.billing) {
        setBilling(data.billing);
      }
    } catch (e) {
      console.warn('Upgrade tier notice:', e);
    }
  };

  return (
    <div className="theme-container h-screen h-[100dvh] max-h-screen overflow-hidden flex flex-col font-sans relative selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Global Optical Eye Comfort Shield (Physical Blue-Light Suppression Filter) */}
      <div id="eye-comfort-shield" aria-hidden="true" />

      {/* Top Main Navigation (Line 1) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        autopilotActive={autopilotActive}
        setAutopilotActive={setAutopilotActive}
        billing={billing}
        channels={channels}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
        eyeComfortSettings={eyeComfortSettings}
        onOpenEyeComfort={() => setShowEyeComfortModal(true)}
        onOpenChannelManager={(tab) => {
          setChannelManagerTab(tab || 'clone');
          setShowChannelManagerModal(true);
        }}
      />

      {/* When in Second Line Mode: The 7-module menu is rendered directly below Navbar in full view */}
      {menuPosition === 'second-line' && (
        <BottomNavMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          billing={billing}
          unscheduledQueueCount={rows.filter((r) => !r.isScheduled).length}
        />
      )}

      {/* Main Tab Content (Viewport-contained workspace, non-vertical scroll on page) */}
      <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col relative">
        {activeTab === 'dashboard' && (
          <Dashboard
            channels={channels}
            activeChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
            rows={rows}
            billing={billing}
            onNavigateToStudio={() => setActiveTab('studio')}
            onNavigateToSheets={() => setActiveTab('sheets')}
            onNavigateToCalendar={() => setActiveTab('calendar')}
            onNavigateToWorkers={() => setActiveTab('workers')}
            onOpenVideo={(item) => setActiveVideoModal(item)}
            onOpenPrompt={(prompt, title) => setActivePromptModal({ prompt, title })}
            onOpenChannelManager={(tab) => {
              setChannelManagerTab(tab || 'clone');
              setShowChannelManagerModal(true);
            }}
          />
        )}

        {activeTab === 'studio' && (
          <AutopilotStudio
            channel={selectedChannel}
            billing={billing}
            onItemGenerated={handleItemGenerated}
            onOpenVideo={(item) => setActiveVideoModal(item)}
            onOpenPrompt={(prompt, title) => setActivePromptModal({ prompt, title })}
            onViewSheets={() => setActiveTab('sheets')}
            onViewCalendar={() => setActiveTab('calendar')}
            onOpenChannelManager={(tab) => {
              setChannelManagerTab(tab || 'clone');
              setShowChannelManagerModal(true);
            }}
            incomingClonedTrend={incomingClonedTrend}
            onClearIncomingClonedTrend={() => setIncomingClonedTrend(null)}
          />
        )}

        {activeTab === 'calendar' && (
          <SchedulingCalendar
            channel={selectedChannel}
            channels={channels}
            rows={rows}
            onUpdateRow={handleUpdateRow}
            onReorderRows={handleReorderRows}
            onBatchDelete={handleBatchDeleteRows}
            onBatchRerender={handleBatchRerenderRows}
            onBatchReassign={handleBatchReassignChannel}
            onOpenVideo={(item) => setActiveVideoModal(item)}
            onOpenPrompt={(prompt, title) => setActivePromptModal({ prompt, title })}
            onNavigateToStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsViewer
            rows={rows}
            channels={channels}
            onOpenVideo={(item) => setActiveVideoModal(item)}
            onOpenPrompt={(prompt, title) => setActivePromptModal({ prompt, title })}
            onSyncRow={(rowId) => console.log('Syncing row', rowId)}
            onBatchDelete={handleBatchDeleteRows}
            onBatchRerender={handleBatchRerenderRows}
            onBatchReassign={handleBatchReassignChannel}
          />
        )}

        {activeTab === 'workers' && (
          <WorkerClusterView
            cluster={cluster}
            activeQueue={rows.filter((r) => r.status === 'veo_queued' || r.status === 'rendering')}
            concurrencyLimit={billing?.concurrentLimit || 4}
          />
        )}

        {activeTab === 's3' && (
          <S3StorageVault
            userId="usr_premium_01"
            files={s3Files}
            onPreviewFile={(file) => {
              const matchedRow = rows.find((r) => file.key.includes(r.id));
              if (matchedRow) {
                setActiveVideoModal(matchedRow);
              } else if (rows.length > 0) {
                setActiveVideoModal(rows[0]);
              }
            }}
          />
        )}

        {activeTab === 'billing' && (
          <BillingPioneer
            billing={billing}
            onUpgradeTier={handleUpgradeTier}
          />
        )}
      </main>

      {/* Bottom Full-View 7-Section Menu Bar (Full View when docked at bottom) */}
      {menuPosition === 'bottom' && (
        <BottomNavMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          billing={billing}
          unscheduledQueueCount={rows.filter((r) => !r.isScheduled).length}
        />
      )}

      {/* Video Player Modal */}
      {activeVideoModal && (
        <VideoPlayerModal
          item={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
        />
      )}

      {/* Google Veo / Wan 2.1 Cinematic Prompt Modal */}
      {activePromptModal && (
        <PromptModal
          prompt={activePromptModal.prompt}
          title={activePromptModal.title}
          onClose={() => setActivePromptModal(null)}
        />
      )}

      {/* Eye-Protective Color Schemes & Professional Theme Modal */}
      {showEyeComfortModal && (
        <EyeComfortModal
          settings={eyeComfortSettings}
          onUpdateSettings={(newSettings) => setEyeComfortSettings(newSettings)}
          onClose={() => setShowEyeComfortModal(false)}
        />
      )}

      {/* Target Channel Cloner & Channel Creator Modal */}
      {showChannelManagerModal && (
        <ChannelManagerModal
          initialTab={channelManagerTab}
          channels={channels}
          activeChannel={selectedChannel}
          onSelectChannel={(c) => setSelectedChannel(c)}
          onAddChannel={handleAddChannel}
          onDeployClonedIdea={handleDeployClonedIdea}
          onClose={() => setShowChannelManagerModal(false)}
        />
      )}

      {/* Comprehensive Temporary Component Names Directory Inspector */}
      <ComponentDirectoryModal />

    </div>
  );
}

export default function App() {
  return (
    <LayoutProvider>
      <AppContent />
    </LayoutProvider>
  );
}
